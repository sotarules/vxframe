import { UserStatus } from "meteor/mizzao:user-status"

const port = process.env.PORT
const environment = process.env.NODE_ENV
const nobatch = process.env.NO_BATCH

const config = Config.findOne("1")
if (!config) {
    console.log("startup.js (vx) fatal error: system configuration record (config) was not found")
    return
}

const logLevel = config.logLevel

OLog.setLogLevel(logLevel)

console.log(`startup.js (vx) ${CX.SYSTEM_NAME} ${Meteor.appVersion.version} Node.js ${process.version} Meteor ${Meteor.release} ` +
    `port=${port} environment=${environment} nobatch=${nobatch} logLevel=${logLevel}`)

Meteor.startup(() => {
    // Watch for ad-hoc changes in the system configuration:
    Config.find("1").observeChanges({
        changed(id, fields) {
            // Server-side log level:
            if (fields.logLevel) {
                console.log(`startup.js (vx) server-side logLevel=${fields.logLevel}`)
                OLog.setLogLevel(fields.logLevel)
            }
        }
    })
    Functions.find({}).observeChanges({
        changed(id, fields) {
            OLog.debug(`startup.js Functions observeChanges *change* id=${id} fields=${OLog.debugString(fields)}`)
            VXApp.deployFunction(id)
        }
    })
    console.log("startup.js (vx) *init* user status monitoring")
    UserStatus.events.on("connectionLogin", fields => {
        VXApp.onLogin(fields.userId)
    })
    UserStatus.events.on("connectionLogout", fields => {
        VXApp.onLogout(fields.userId)
    })
    console.log(`startup.js (vx) user sessions shall expire in ${VXApp.loginExpirationInDays()} day(s)`)
    VXApp.deployAllFunctions()
    if (VXApp.doAppServerStartup) {
        console.log("startup.js (vx) invoking doAppServerStartup")
        VXApp.doAppServerStartup()
    }
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
        const enableDaemon = !!Util.getConfigValue("enableDaemon")
        if (!enableDaemon) {
            console.log(`startup.js (vx) deamon shall not be initialized because enableDaemon=${enableDaemon}`)
            return
        }
        Daemon.initDaemonJobs()
        const daemonSleepInterval = Util.getConfigValue("daemonSleepInterval") || 1000
        console.log(`startup.js (vx) Daemon daemonSleepInterval=${daemonSleepInterval}`)
        Daemon.run()
        Meteor.setInterval(() => {
            Daemon.run()
        }, daemonSleepInterval)
    }
})
