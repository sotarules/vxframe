"use strict"

/**
 * Server start-up functions
 */
let port = process.env.PORT
let environment = process.env.NODE_ENV
let nobatch = process.env.NO_BATCH

let config = Config.findOne("1")
if (!config) {
    console.log("startup.js (vx) fatal error: system configuration record (config) was not found")
    return
}

let logLevel = config.logLevel

OLog.setLogLevel(logLevel)

console.log("startup.js (vx) " + CX.SYSTEM_NAME + " " + Meteor.appVersion.version + " Node.js " + process.version + " Meteor " + Meteor.release +
    " port=" + port + " environment=" + environment + " nobatch=" + nobatch + " logLevel=" + logLevel)

Meteor.startup(() => {

    process.env.MAIL_URL = CX.MAIL_URL

    // Watch for ad-hoc changes in the system configuration:
    Config.find("1").observeChanges({

        changed : (id, fields) => {

            // Server-side log level:
            if (fields.logLevel) {
                console.log("startup.js (vx) server-side logLevel=" + fields.logLevel)
                OLog.setLogLevel(fields.logLevel)
            }
        }
    })

    // Must initialize Reporter on all node.js instances so users can create
    // reports on demand:
    Reporter.init()

    if (environment === "development" || port === "3000") {
        console.log("startup.js (vx) Server 1")
    }

    if (environment === "development" || port === "3010") {
        console.log("startup.js (vx) Server 2")
    }

    if (environment === "development" || port === "3020") {
        console.log("startup.js (vx) Server 3")
    }

    if (environment === "development" || port === "3030") {
        console.log("startup.js (vx) Server 4")
    }

    if (nobatch === "yes") {
        console.log("startup.js (vx) all batch processing will be disabled")
        return
    }

    if (environment === "development" || port === "3060") {

        let mailmanSleepInterval = Util.getConfigValue("mailmanSleepInterval")
        let reporterSleepInterval = Util.getConfigValue("reporterSleepInterval")

        console.log("startup.js (vx) Maintenance mailmanSleepInterval=" + mailmanSleepInterval +
            " reporterSleepInterval=" + reporterSleepInterval)

        Meteor.setTimeout(() => {

            Mailman.run()
            Meteor.setInterval(() => {
                Mailman.run()
            }, mailmanSleepInterval)

            Reporter.run()
            Meteor.setInterval(() => {
                Reporter.run()
            }, reporterSleepInterval)
        })

        Serv.sched("RecordRemover", RecordRemover.removeAllRecords, 0)
    }
})

