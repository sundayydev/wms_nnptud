let mongoose = require('mongoose');
let auditlogSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    action: {
        type: String,
        required: true
    },
    collectionName: {
        type: String,
        required: true
    },
    documentId: {
        type: mongoose.Types.ObjectId
    },
    changes: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
module.exports = new mongoose.model('auditlog', auditlogSchema)
