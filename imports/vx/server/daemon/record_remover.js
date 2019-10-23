"use strict"

RecordRemover = {

    removeAllRecords : () => {

        try {
            RecordRemover.removeRecordsLog()
            RecordRemover.removeRecordsNotifications()
        }
        catch (error) {
            OLog.error("record_remover.js (vx) removeAllRecords unexpected error=" + error)
            return
        }
    },

    removeRecordsLog : () => {

        let purgeBeforeDate = moment().subtract(2, "days").toDate()
        let selector = { "date": { "$lte": purgeBeforeDate } }

        let count = Log.find(selector).count()
        OLog.debug("record_remover.js (vx) removeRecordsLog *fire* purgeBeforeDate=" + purgeBeforeDate +
            " selector=" + JSON.stringify(selector) + " remove count=" + count)

        Log.remove(selector)
    },

    removeRecordsNotifications : () => {

        let purgeBeforeDate = moment().subtract(1, "days").toDate()
        let selector = { "date": { "$lte": purgeBeforeDate } }

        let count = Notifications.find(selector).count()
        OLog.debug("record_remover.js (vx) removeRecordsNotifications *fire* purgeBeforeDate=" + purgeBeforeDate +
            " selector=" + JSON.stringify(selector) + " remove count=" + count)

        Notifications.remove(selector)
    }
}
