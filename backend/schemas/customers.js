let mongoose = require('mongoose');
let customerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    customerType: {
        type: String,
        enum: ['Retail', 'Wholesale'],
        default: 'Retail'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
module.exports = new mongoose.model('customer', customerSchema)
