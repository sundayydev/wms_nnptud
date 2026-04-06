var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

let PurchaseOrder = require('../models/PurchaseOrder');
let SalesOrder = require('../models/SalesOrder');
let Inventory = require('../models/Inventory');
require('../models/Customer');
require('../models/Supplier');
require('../models/User');


//  Đọc file template HTML

function readTemplate(filename) {
    let filePath = path.join(__dirname, '../template', filename);
    return fs.readFileSync(filePath, 'utf8');
}

//  Replace tất cả placeholder {{KEY}}
function fillTemplate(html, data) {
    return html.replace(/\{\{(\w+)\}\}/g, function (match, key) {
        return data[key] !== undefined ? data[key] : '';
    });
}

//  Format số tiền VNĐ
function formatMoney(amount) {
    if (!amount && amount !== 0) return '0';
    return Number(amount).toLocaleString('vi-VN') + ' đ';
}

// Đọc số thành chữ tiếng Việt
function numberToWords(num) {
    if (!num || num === 0) return 'Không đồng';
    num = Math.round(num);

    const units  = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const tens   = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi',
                    'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];

    function readHundred(n) {
        let str = '';
        let h = Math.floor(n / 100);
        let t = Math.floor((n % 100) / 10);
        let u = n % 10;
        if (h > 0) str += units[h] + ' trăm ';
        if (t === 0 && u > 0 && h > 0) str += 'lẻ ' + units[u];
        else if (t === 1) str += 'mười ' + (u > 0 ? (u === 5 ? 'lăm' : units[u]) : '');
        else if (t > 1) str += tens[t] + ' ' + (u === 1 ? 'mốt' : u === 5 ? 'lăm' : u > 0 ? units[u] : '');
        else str += (u > 0 ? units[u] : '');
        return str.trim();
    }

    function readGroup(n, suffix) {
        if (n === 0) return '';
        return readHundred(n) + ' ' + suffix + ' ';
    }

    let ty       = Math.floor(num / 1_000_000_000);
    let trieu    = Math.floor((num % 1_000_000_000) / 1_000_000);
    let nghin    = Math.floor((num % 1_000_000) / 1_000);
    let tram     = num % 1_000;

    let result = '';
    if (ty    > 0) result += readGroup(ty,    'tỷ');
    if (trieu > 0) result += readGroup(trieu, 'triệu');
    if (nghin > 0) result += readGroup(nghin, 'nghìn');
    if (tram  > 0) result += readHundred(tram);

    result = result.trim();
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result + ' đồng chẵn';
}

//  Lấy ngày tháng năm
function getDateParts(dateStr) {
    let d = dateStr ? new Date(dateStr) : new Date();
    return {
        Day:    String(d.getDate()).padStart(2, '0'),
        Month:  String(d.getMonth() + 1).padStart(2, '0'),
        Year:   String(d.getFullYear()),
        Hour:   String(d.getHours()).padStart(2, '0'),
        Minute: String(d.getMinutes()).padStart(2, '0'),
    };
}

// Thông tin công ty mặc định
const COMPANY_INFO = {
    CompanyName:    process.env.COMPANY_NAME    || 'CÔNG TY TNHH WMS DEMO',
    TaxCode:        process.env.COMPANY_TAX     || '0123456789',
    CompanyAddress: process.env.COMPANY_ADDRESS || '123 Đường ABC, Quận 1, TP.HCM',
    PhoneNumber:    process.env.COMPANY_PHONE   || '028 1234 5678',
    Email:          process.env.COMPANY_EMAIL   || 'info@wmsdemo.com',
    LogoUrl:        process.env.COMPANY_LOGO    || 'http://localhost:3000/images/logo.png',
};

// GET /api/v1/print/purchase-orders/:id
router.get('/purchase-orders/:id', async function (req, res) {
    try {
        let order = await PurchaseOrder.findById(req.params.id)
            .populate('supplier')
            .populate('warehouse')
            .populate('createdBy')
            .populate('items.product');

        if (!order) return res.status(404).send({ message: 'Không tìm thấy Purchase Order' });

        let date = getDateParts(order.createdAt);

        let productRows = '';
        let totalQuantity = 0;
        order.items.forEach(function (item, index) {
            let subtotal = (item.quantity || 0) * (item.unitPrice || 0);
            totalQuantity += item.quantity || 0;
            productRows += `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${item.product ? item.product.name : ''}</td>
                    <td class="text-center">${item.product ? (item.product.unit || 'Cái') : ''}</td>
                    <td class="text-center">${item.quantity || 0}</td>
                    <td class="text-right">${formatMoney(item.unitPrice)}</td>
                    <td class="text-right">${formatMoney(subtotal)}</td>
                </tr>`;
        });

        let data = {
            ...COMPANY_INFO,
            ...date,
            ReceiptNumber:   order.poNumber || '',
            WarehouseName:   order.warehouse ? order.warehouse.name     : '',
            WarehouseLocation: order.warehouse ? order.warehouse.location : '',
            UserName:        order.createdBy ? (order.createdBy.fullName || order.createdBy.username) : '',
            SupplierName:    order.supplier  ? order.supplier.name     : '',
            SupplierAddress: order.supplier  ? order.supplier.address  : '',
            Notes:           order.status || 'Pending',
            ProductRows:     productRows,
            TotalQuantity:   totalQuantity,
            TotalAmount:     formatMoney(order.totalAmount),
            AmountInWords:   numberToWords(order.totalAmount),
        };

        let html = fillTemplate(readTemplate('import_receipt_template.html'), data);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


// GET /api/v1/print/sales-orders/:id

router.get('/sales-orders/:id', async function (req, res) {
    try {
        let order = await SalesOrder.findById(req.params.id)
            .populate('customer')
            .populate('warehouse')
            .populate('createdBy')
            .populate('items.product');

        if (!order) return res.status(404).send({ message: 'Không tìm thấy Sales Order' });

        let date = getDateParts(order.createdAt);

        let productRows = '';
        let totalQuantity = 0;
        order.items.forEach(function (item, index) {
            let subtotal = (item.quantity || 0) * (item.unitPrice || 0);
            totalQuantity += item.quantity || 0;
            productRows += `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${item.product ? item.product.name : ''}</td>
                    <td class="text-center">${item.product ? (item.product.unit || 'Cái') : ''}</td>
                    <td class="text-center">${item.quantity || 0}</td>
                    <td class="text-right">${formatMoney(item.unitPrice)}</td>
                    <td class="text-right">${formatMoney(subtotal)}</td>
                </tr>`;
        });

        let data = {
            ...COMPANY_INFO,
            ...date,
            ReceiptNumber:   order.soNumber || '',
            WarehouseName:   order.warehouse ? order.warehouse.name     : '',
            WarehouseLocation: order.warehouse ? order.warehouse.location : '',
            UserName:        order.createdBy ? (order.createdBy.fullName || order.createdBy.username) : '',
            CustomerName:    order.customer  ? order.customer.name     : '',
            CustomerAddress: order.customer  ? order.customer.address  : '',
            Reason:          order.status || 'Pending',
            ProductRows:     productRows,
            TotalQuantity:   totalQuantity,
            TotalAmount:     formatMoney(order.totalAmount),
            AmountInWords:   numberToWords(order.totalAmount),
        };

        let html = fillTemplate(readTemplate('export_receipt_template.html'), data);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


// GET /api/v1/print/inventories?warehouse=ID

router.get('/inventories', async function (req, res) {
    try {
        let warehouseId = req.query.warehouse;
        let filter = {};
        if (warehouseId) filter.warehouse = warehouseId;

        let inventories = await Inventory.find(filter)
            .populate({ path: 'product', populate: { path: 'category' } })
            .populate('warehouse');

        if (!inventories.length) return res.status(404).send({ message: 'Không có dữ liệu tồn kho' });

        let date = getDateParts();
        let inventoryNumber = `KK-${date.Year}${date.Month}${date.Day}`;

        let inventoryRows = '';
        inventories.forEach(function (inv, index) {
            let bookQty    = inv.quantity || 0;
            let bookAmount = bookQty * (inv.product ? (inv.product.price || 0) : 0);
            inventoryRows += `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${inv.product ? inv.product.name : ''}</td>
                    <td class="text-center">${inv.product ? (inv.product.sku || '') : ''}</td>
                    <td class="text-center">${inv.product ? (inv.product.unit || 'Cái') : ''}</td>
                    <td class="text-center">${bookQty}</td>
                    <td class="text-right">${formatMoney(bookAmount)}</td>
                    <td class="text-center">${bookQty}</td>
                    <td class="text-right">${formatMoney(bookAmount)}</td>
                    <td class="text-center"></td>
                    <td class="text-right"></td>
                    <td class="text-center"></td>
                    <td class="text-right"></td>
                </tr>`;
        });

        let warehouseName = inventories[0].warehouse ? inventories[0].warehouse.name : 'Tất cả kho';

        let data = {
            ...COMPANY_INFO,
            ...date,
            InventoryNumber: inventoryNumber,
            WarehouseName:   warehouseName,
            InventoryRows:   inventoryRows,
        };

        let html = fillTemplate(readTemplate('phieu_kiem_ke.html'), data);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
