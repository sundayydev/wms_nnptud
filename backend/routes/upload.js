var express = require("express");
var router = express.Router();
let { uploadExcel, uploadImage } = require('../utils/uploadHandler');
let { uploadBufferToCloudinary } = require('../utils/cloudinaryHandler');
let path = require('path');
let excelJs = require('exceljs');
let categoriesModel = require('../models/Category');
let productsModel = require('../models/Product');
let inventoriesModel = require('../models/Inventory');
let warehousesModel = require('../models/Warehouse');
let mongoose = require('mongoose');

// API Upload hình lẻ
router.post('/one_file', uploadImage.single('file'), async function (req, res, next) {
    try {
        let result = await uploadBufferToCloudinary(req.file);
        res.send({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            size: result.bytes
        });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// API Upload nhiều hình
router.post('/multiple_file', uploadImage.array('files', 5), async function (req, res, next) {
    try {
        let uploadResults = await Promise.all(req.files.map(file => uploadBufferToCloudinary(file)));
        res.send(uploadResults.map(result => {
            return {
                url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                size: result.bytes
            };
        }));
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.get('/:filename', function (req, res, next) {
    let pathFile = path.join(__dirname, '../uploads', req.params.filename);
    res.sendFile(pathFile);
});

router.post(
    '/excel', 
    uploadExcel.single('file'), 
    async function (req, res, next) {
    try {
        let targetWarehouseId = req.body.warehouse;
        if (!targetWarehouseId) {
            return res.status(400).send({ message: "Vui lòng truyền id kho (warehouse) trong body request." });
        }

        let workBook = new excelJs.Workbook();
        let pathFile = path.join(__dirname, '../uploads', req.file.filename);
        await workBook.xlsx.readFile(pathFile);
        let worksheet = workBook.worksheets[0];

        let categories = await categoriesModel.find({});
        let categoriesMap = new Map();
        for (const category of categories) {
            if (category.name) {
                let normalizedDbName = category.name.toString().normalize('NFC').trim().toLowerCase();
                categoriesMap.set(normalizedDbName, category.id);
            }
        }

        let isWarehouseValid = await warehousesModel.exists({ _id: targetWarehouseId });
        if (!isWarehouseValid) {
            return res.status(400).send({ message: "ID kho không tồn tại trong hệ thống." });
        }

        let getProducts = await productsModel.find({});
        let getSKU = getProducts.map(p => p.sku);

        const getCellValue = (cell) => {
            if (!cell || cell.value === null || cell.value === undefined) return '';
            if (typeof cell.value === 'object') {
                if (cell.value.result !== undefined) return cell.value.result;
                if (cell.value.richText) return cell.value.richText.map(t => t.text).join('');
            }
            return cell.value.toString();
        };

        let result = [];
        for (let index = 2; index <= worksheet.rowCount; index++) {
            let rowError = [];
            const row = worksheet.getRow(index);
            
            let sku = getCellValue(row.getCell(1)).trim();
            if (!sku) continue; 

            let name = getCellValue(row.getCell(2)).trim();
            let rawCat = getCellValue(row.getCell(3)).trim();
            let category = rawCat.normalize('NFC').toLowerCase();
            let price = Number(getCellValue(row.getCell(4)).replace(/,/g, ''));
            let unit = getCellValue(row.getCell(5)).trim();
            let stock = Number(getCellValue(row.getCell(6)).replace(/,/g, ''));

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

            let session = await mongoose.startSession();
            session.startTransaction();
            try {
                let existingProduct = await productsModel.findOne({ sku: sku }).session(session);
                let productId;

                if (!existingProduct) {
                    throw new Error(`Sản phẩm với mã SKU [${sku}] chưa được tạo trước trong danh mục. Vui lòng tạo sản phẩm trước khi nhập kho!`);
                }

                if (name) existingProduct.name = name;
                if (price && price >= 0) existingProduct.price = price;
                if (categoriesMap.has(category)) existingProduct.category = categoriesMap.get(category);
                if (unit) existingProduct.unit = unit;
                
                await existingProduct.save({ session });
                productId = existingProduct._id;

                let existingInventory = await inventoriesModel.findOne({
                    product: productId,
                    warehouse: targetWarehouseId
                }).session(session);

                if (existingInventory) {
                    existingInventory.quantity += stock;
                    await existingInventory.save({ session });
                } else {
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

router.get('/export/:warehouseId', async function (req, res, next) {
    try {
        let warehouseId = req.params.warehouseId;
        
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