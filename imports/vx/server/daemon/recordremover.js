RecordRemover = {

    removeAllRecords() {
        if (!Util.getConfigValue("enableRecordRemover")) {
            return
        }
        try {
            RecordRemover.removeRecordsLog()
            RecordRemover.removeRecordsNotifications()
            RecordRemover.removeRecordsTransactions()
            RecordRemover.removeRecordsTenants()
        }
        catch (error) {
            OLog.error(`recordremover.js (vx) removeAllRecords unexpected error=${OLog.errorError(error)}`)
            return
        }
    },

    removeRecordsLog() {
        const purgeBeforeDate = moment().subtract(2, "days").toDate()
        const selector = { "date": { "$lte": purgeBeforeDate } }
        const count = Log.find(selector).count()
        OLog.debug(`recordremover.js (vx) removeRecordsLog *fire* purgeBeforeDate=${purgeBeforeDate} ` +
            ` selector=${JSON.stringify(selector)} remove count=${count}`)
        Log.remove(selector)
    },

    removeRecordsNotifications() {
        const purgeBeforeDate = moment().subtract(1, "days").toDate()
        const selector = { "date": { "$lte": purgeBeforeDate } }
        const count = Notifications.find(selector).count()
        OLog.debug(`recordremover.js (vx) removeRecordsNotifications *fire* purgeBeforeDate=${purgeBeforeDate} ` +
            ` selector=${JSON.stringify(selector)} remove count=${count}`)
        Notifications.remove(selector)
    },

    removeRecordsTransactions() {
        const purgeBeforeMoment = moment().subtract(30, "days")
        OLog.debug(`recordremover.js (vx) removeRecordsTransactions *fire* purgeBeforeMoment=${purgeBeforeMoment}`)
        VXApp.removeRecordsTransactions(purgeBeforeMoment)
    },

    removeRecordsTenants() {
        const purgeBeforeDate = moment().subtract(30, "days").toDate()
        OLog.debug(`recordremover.js (vx) removeRecordsTenants *fire* purgeBeforeDate=${purgeBeforeDate}`)
        Tenants.find( { dateRetired: { "$lte": purgeBeforeDate } }).forEach(tenant => {
            VXApp.removeTenant(tenant._id)
        })
    }
}
