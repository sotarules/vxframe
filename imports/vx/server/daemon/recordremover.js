RecordRemover = {

    removeAllRecords() {
        if (!Util.getConfigValue("enableRecordRemover")) {
            return
        }
        try {
            RecordRemover.removeRecordsLog()
            RecordRemover.removeRecordsNotifications()
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
    }
}
