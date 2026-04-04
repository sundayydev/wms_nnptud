let mongoose = require('mongoose');

let salesorderSchema = mongoose.Schema({
    soNumber: {
        type: String,
        required: true,
        unique: [true, "soNumber không được trùng"]
    },
    customer: {
        type: mongoose.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    warehouse: {
        type: mongoose.Types.ObjectId,
        ref: 'Warehouse',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = new mongoose.model('salesorder', salesorderSchema);
