var express = require("express");
var router = express.Router();
let { uploadExcel, uploadImage } = require('../utils/uploadHandler');
let path = require('path');
let excelJs = require('exceljs');
let categoriesModel = require('../models/Category');
let productsModel = require('../models/Product');
let inventoriesModel = require('../models/Inventory');
let warehousesModel = require('../models/Warehouse');
let mongoose = require('mongoose');

// API Upload hình lẻ
router.post('/one_file', uploadImage.single('file'), function (req, res, next) {
    res.send({
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
    });
});

// API Upload nhiều hình
router.post('/multiple_file', uploadImage.array('files', 5), function (req, res, next) {
    console.log(req.body);
    res.send(req.files.map(f => {
        return {
            filename: f.filename,
            path: f.path,
            size: f.size
        };
    }));
});

// Lấy file
router.get('/:filename', function (req, res, next) {
    let pathFile = path.join(__dirname, '../uploads', req.params.filename);
    res.sendFile(pathFile);
});

// API Này dùng để Import File Excel
router.post('/excel', uploadExcel.single('file'), async function (req, res, next) {
    try {
        // Lấy ID kho bãi từ Request Body (người dùng chọn trên giao diện)
        let targetWarehouseId = req.body.warehouse;
        if (!targetWarehouseId) {
            return res.status(400).send({ message: "Vui lòng truyền id kho (warehouse) trong body request." });
        }

        // Bước 1: Đọc file Excel bằng thư viện excelJs
        let workBook = new excelJs.Workbook();
        let pathFile = path.join(__dirname, '../uploads', req.file.filename);
        await workBook.xlsx.readFile(pathFile);
        let worksheet = workBook.worksheets[0];

        // Lấy sẵn toàn bộ categories trong Database để đối chiếu
        let categories = await categoriesModel.find({});
        let categoriesMap = new Map();
        for (const category of categories) {
            if (category.name) {
                let normalizedDbName = category.name.toString().normalize('NFC').trim().toLowerCase();
                categoriesMap.set(normalizedDbName, category.id);
            }
        }

        // Kiểm tra xem ID kho truyền vào có tồn tại không
        let isWarehouseValid = await warehousesModel.exists({ _id: targetWarehouseId });
        if (!isWarehouseValid) {
            return res.status(400).send({ message: "ID kho không tồn tại trong hệ thống." });
        }

        let getProducts = await productsModel.find({});
        let getSKU = getProducts.map(p => p.sku);

        // Hàm hỗ trợ đọc an toàn giá trị ô Excel
        const getCellValue = (cell) => {
            if (!cell || cell.value === null || cell.value === undefined) return '';
            if (typeof cell.value === 'object') {
                if (cell.value.result !== undefined) return cell.value.result;
                if (cell.value.richText) return cell.value.richText.map(t => t.text).join('');
            }
            return cell.value.toString();
        };

        let result = [];
        // Lặp từ dòng thứ 2 (dòng 1 là tiêu đề)
        for (let index = 2; index <= worksheet.rowCount; index++) {
            let rowError = [];
            const row = worksheet.getRow(index);
            
            // Đọc an toàn các cột
            let sku = getCellValue(row.getCell(1)).trim();
            if (!sku) continue; // Bỏ qua dòng trống

            let name = getCellValue(row.getCell(2)).trim();
            let rawCat = getCellValue(row.getCell(3)).trim();
            // CHUẨN HOÁ UNICODE tiếng Việt (NFC) tránh lỗi khác bộ gõ (VD: unikey vs window default)
            let category = rawCat.normalize('NFC').toLowerCase();
            let price = Number(getCellValue(row.getCell(4)).replace(/,/g, ''));
            let unit = getCellValue(row.getCell(5)).trim();
            let stock = Number(getCellValue(row.getCell(6)).replace(/,/g, ''));

            // Áp dụng linh hoạt: nếu người dùng bỏ trống Tên, Đơn Vị, Giá -> ta vẫn ưu tiên cho phép NẾU SKU đó ĐÃ TỒN TẠI ở bước dưới
            if (isNaN(stock) || stock < 0) {
                rowError.push("Số lượng tồn kho (quantity) phải là số >= 0");
            }
            if (rawCat && !categoriesMap.has(category)) {
                rowError.push(`Danh mục '${rawCat}' không tồn tại trong hệ thống`);
            }

            if (rowError.length > 0) {
                result.push({ success: false, data: `SKU ${sku}: ` + rowError.join(", ") });
                continue;
            }

            // Bắt đầu xử lý Lưu Data
            let session = await mongoose.startSession();
            session.startTransaction();
            try {
                let existingProduct = await productsModel.findOne({ sku: sku }).session(session);
                let productId;

                if (existingProduct) {
                    // Nếu Sản Phẩm đã tồn tại: Cập nhật thông tin cơ bản nếu có nhập mới
                    if (name) existingProduct.name = name;
                    if (price && price >= 0) existingProduct.price = price;
                    if (categoriesMap.has(category)) existingProduct.category = categoriesMap.get(category);
                    if (unit) existingProduct.unit = unit;
                    
                    await existingProduct.save({ session });
                    productId = existingProduct._id;
                } else {
                    // Nếu là Sản Phẩm MỚI: Bắt buộc phải có đủ Tên, Giá, Category
                    if (!name || isNaN(price) || price < 0 || !categoriesMap.has(category)) {
                        throw new Error(`Sản phẩm mới (SKU ${sku}) bắt buộc phải nhập đầy đủ: Tên, Phân Giá >=0 và Danh Mục hợp lệ.`);
                    }
                    let newProduct = new productsModel({
                        sku: sku,
                        name: name,
                        category: categoriesMap.get(category),
                        price: price,
                        unit: unit || 'Cái', 
                        description: name
                    });
                    await newProduct.save({ session });
                    productId = newProduct._id;
                }

                // Xử lý Tồn Kho (Inventory) tại Kho (Warehouse)
                let existingInventory = await inventoriesModel.findOne({
                    product: productId,
                    warehouse: targetWarehouseId
                }).session(session);

                if (existingInventory) {
                    // Cập nhật CỘNG DỒN số lượng nếu kho đã có sẵn SP này
                    existingInventory.quantity += stock;
                    await existingInventory.save({ session });
                } else {
                    // Nếu kho chưa có SP này, tạo mới
                    let newInventory = new inventoriesModel({
                        product: productId,
                        warehouse: targetWarehouseId,
                        quantity: stock 
                    });
                    await newInventory.save({ session });
                }
                
                await session.commitTransaction();
                await session.endSession();
                
                result.push({ success: true, data: `SKU ${sku} cập nhật thành công!` });
            } catch (error) {
                await session.abortTransaction();
                await session.endSession();
                result.push({ success: false, data: error.message });
            }
        }
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// API Export dữ liệu Tồn Kho theo Kho
router.get('/export/:warehouseId', async function (req, res, next) {
    try {
        let warehouseId = req.params.warehouseId;
        
        // Lấy dữ liệu tồn kho từ DB
        let inventories = await inventoriesModel.find({ warehouse: warehouseId })
            .populate({ path: 'product', populate: { path: 'category' } });
            
        let workBook = new excelJs.Workbook();
        let worksheet = workBook.addWorksheet('TonKho');
        
        worksheet.columns = [
            { header: 'Mã Sản Phẩm (SKU)', key: 'sku', width: 20 },
            { header: 'Tên Sản Phẩm', key: 'name', width: 40 },
            { header: 'Danh Mục', key: 'category', width: 25 },
            { header: 'Đơn Giá', key: 'price', width: 15 },
            { header: 'Đơn Vị', key: 'unit', width: 15 },
            { header: 'Số Lượng Tồn', key: 'quantity', width: 15 }
        ];

        // Format header
        worksheet.getRow(1).font = { bold: true };

        inventories.forEach(inv => {
            if (inv.product) {
                worksheet.addRow({
                    sku: inv.product.sku,
                    name: inv.product.name,
                    category: inv.product.category?.name || '',
                    price: inv.product.price,
                    unit: inv.product.unit,
                    quantity: inv.quantity
                });
            }
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + `TonKho_Export.xlsx`);

        await workBook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;