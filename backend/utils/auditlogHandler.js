let auditlogModel = require('../models/AuditLog')

module.exports = {
    logAction: async function (user, action, collectionName, documentId, changes, ipAddress) {
        try {
            let newLog = new auditlogModel({
                user: user,
                action: action,
                collectionName: collectionName,
                documentId: documentId,
                changes: changes,
                ipAddress: ipAddress
            })
            await newLog.save()
            return newLog
        } catch (error) {
            console.log("AuditLog error:", error.message)
        }
    }
}
