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

function readTemplate(filename) {
    let filePath = path.join(__dirname, '../template', filename);
    return fs.readFileSync(filePath, 'utf8');
}
// Replace
function fillTemplate(html, data) {
    return html.replace(/\{\{(\w+)\}\}/g, function (match, key) {
        return data[key] !== undefined ? data[key] : '';
    });
}

function formatMoney(amount) {
    if (!amount && amount !== 0) return '0';
    return Number(amount).toLocaleString('vi-VN') + ' đ';
}


//  lay ngay thang năm
function getDateParts(dateStr) {
    let d;
    if (dateStr) {
        d = new Date(dateStr);
    } else {
        d = new Date();
    }

    let day = d.getDate();
    if (day < 10) {
        day = '0' + day;
    }

    let month = d.getMonth() + 1; 
    if (month < 10) {
        month = '0' + month;
    }

    let hour = d.getHours();
    if (hour < 10) {
        hour = '0' + hour;
    }

    let minute = d.getMinutes();
    if (minute < 10) {
        minute = '0' + minute;
    }

    return {
        Day: String(day),
        Month: String(month),
        Year: String(d.getFullYear()),
        Hour: String(hour),
        Minute: String(minute),
    };
}

// Thông tin công ty mặc định
const COMPANY_INFO = {
    CompanyName:process.env.COMPANY_NAME,
    TaxCode:process.env.COMPANY_TAX,
    CompanyAddress:process.env.COMPANY_ADDRESS,
    PhoneNumber:process.env.COMPANY_PHONE,
    Email:process.env.COMPANY_EMAIL,
    LogoUrl:process.env.COMPANY_LOGO,
};

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
        order.items.forEach((item, index) => {
            let { quantity = 0, unitPrice = 0, product } = item;
            totalQuantity += quantity;
            productRows += `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${product?.name || ''}</td>
                    <td class="text-center">${product?.unit || 'Cái'}</td>
                    <td class="text-center">${quantity}</td>
                    <td class="text-right">${formatMoney(unitPrice)}</td>
                    <td class="text-right">${formatMoney(quantity * unitPrice)}</td>
                </tr>`;
        });

        let data = {
            ...COMPANY_INFO,
            ...date,
            ReceiptNumber:   order.poNumber || '',
            WarehouseName:   order.warehouse?.name || '',
            WarehouseLocation: order.warehouse?.location || '',
            UserName:        order.createdBy?.fullName || order.createdBy?.username || '',
            SupplierName:    order.supplier?.name || '',
            SupplierAddress: order.supplier?.address || '',
            Notes:           order.status || 'Pending',
            ProductRows:     productRows,
            TotalQuantity:   totalQuantity,
            TotalAmount:     formatMoney(order.totalAmount),
            AmountInWords:   '',
        };

        let html = fillTemplate(readTemplate('import_receipt_template.html'), data);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

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
        order.items.forEach((item, index) => {
            let { quantity = 0, unitPrice = 0, product } = item;
            totalQuantity += quantity;
            productRows += `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${product?.name || ''}</td>
                    <td class="text-center">${product?.unit || 'Cái'}</td>
                    <td class="text-center">${quantity}</td>
                    <td class="text-right">${formatMoney(unitPrice)}</td>
                    <td class="text-right">${formatMoney(quantity * unitPrice)}</td>
                </tr>`;
        });

        let data = {
            ...COMPANY_INFO,
            ...date,
            ReceiptNumber:   order.soNumber || '',
            WarehouseName:   order.warehouse?.name || '',
            WarehouseLocation: order.warehouse?.location || '',
            UserName:        order.createdBy?.fullName || order.createdBy?.username || '',
            CustomerName:    order.customer?.name || '',
            CustomerAddress: order.customer?.address || '',
            Reason:          order.status || 'Pending',
            ProductRows:     productRows,
            TotalQuantity:   totalQuantity,
            TotalAmount:     formatMoney(order.totalAmount),
            AmountInWords:   '',
        };

        let html = fillTemplate(readTemplate('export_receipt_template.html'), data);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

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
