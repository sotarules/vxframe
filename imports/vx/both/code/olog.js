import safestringify from "fast-safe-stringify"

OLog = {

    logLevel : 1,

    logLevelMap : {
        FATAL : 0,
        ERROR : 1,
        WARN : 2,
        INFO : 3,
        VERBOSE : 4,
        DEBUG : 5,
        MAX : 6
    },

    setLogLevel(logLevel) {
        OLog.logLevel = logLevel
    },

    getLogLevel() {
        return OLog.logLevel
    },

    debug(message, userId) {
        if (OLog.getLogLevel() >= OLog.logLevelMap.DEBUG) {
            OLog.log("DEBUG", message, userId)
        }
    },

    info(message, userId) {
        if (OLog.getLogLevel() >= OLog.logLevelMap.INFO) {
            OLog.log("INFO", message, userId)
        }
    },

    warn(message, userId) {
        if (OLog.getLogLevel() >= OLog.logLevelMap.WARN) {
            OLog.log("WARN", message, userId)
        }
    },

    error(message, userId) {
        if (OLog.getLogLevel() >= OLog.logLevelMap.ERROR) {
            OLog.log("ERROR", message, userId)
        }
    },

    fatal(message, userId) {
        if (OLog.getLogLevel() >= OLog.logLevelMap.FATAL) {
            OLog.log("FATAL", message, userId)
        }
    },

    log(severity, message, userId) {
        let user, domainId
        try {
            userId = userId || Meteor.userId()
            user = Util.getUserEmail(userId)
            domainId = Util.getCurrentDomainId(userId)
        }
        catch (error) {
            user = "SYSTEM"
            domainId = null
        }
        const row = {}
        row.date = new Date()
        if (Meteor.isClient) {
            if (window && window.performance && window.performance.now == "function") {
                row.hrtime = window.performance.now()
            }
        }
        else {
            row.hrtime = process.hrtime()[1]
        }
        row.domain = domainId
        row.user = user
        row.severity = severity
        row.message = message
        row.server = Meteor.isServer
        Log.insert(row, (error) => {
            if (error) {
                console.log(`olog.js unable to log message=${message} error=${error}`)
            }
        })
    },

    debugString(object) {
        if (OLog.getLogLevel() >= OLog.logLevelMap.DEBUG) {
            return OLog.stringify(object)
        }
    },

    infoString(object) {
        if (OLog.getLogLevel() >= OLog.logLevelMap.INFO) {
            return OLog.stringify(object)
        }
    },

    warnString(object) {
        if (OLog.getLogLevel() >= OLog.logLevelMap.WARN) {
            return OLog.stringify(object)
        }
    },

    errorString(object) {
        if (OLog.getLogLevel() >= OLog.logLevelMap.ERROR) {
            return OLog.stringify(object)
        }
    },

    fatalString(object) {
        if (OLog.getLogLevel() >= OLog.logLevelMap.FATAL) {
            return OLog.stringify(object)
        }
    },

    debugError(object) {
        if (OLog.getLogLevel() >= OLog.logLevelMap.DEBUG) {
            return OLog.stackTrace(object)
        }
    },

    infoError(object) {
        if (OLog.getLogLevel() >= OLog.logLevelMap.INFO) {
            return OLog.stackTrace(object)
        }
    },

    warnError(object) {
        if (OLog.getLogLevel() >= OLog.logLevelMap.WARN) {
            return OLog.stackTrace(object)
        }
    },

    errorError(object) {
        if (OLog.getLogLevel() >= OLog.logLevelMap.ERROR) {
            return OLog.stackTrace(object)
        }
    },

    fatalError(object) {
        if (OLog.getLogLevel() >= OLog.logLevelMap.FATAL) {
            return OLog.stackTrace(object)
        }
    },

    stringify(object) {
        try {
            return safestringify(object)
        }
        catch (error) {
            OLog.error(`olog.js stringify error=${OLog.errorError(error)}`)
        }
    },

    stackTrace(error) {
        try {
            return `${error} ${error.stack}`
        }
        catch (error) {
            OLog.error(`olog.js stringify error=${OLog.errorError(error)}`)
        }
    }
}
