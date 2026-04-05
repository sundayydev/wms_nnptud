let mongoose = require('mongoose');

let shipmentSchema = mongoose.Schema({
    order: {
        type: mongoose.Types.ObjectId,
        ref: 'salesorder',
        required: true
    },
    trackingNumber: {
        type: String,
        default: ""
    },
    carrier: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['Preparing', 'In Transit', 'Delivered', 'Failed'],
        default: 'Preparing'
    },
    shippedDate: {
        type: Date
    },
    estimatedDelivery: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = new mongoose.model('shipment', shipmentSchema);
