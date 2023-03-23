import { get } from "lodash"

Daemon = {

    run() {
        const enableDaemon = Util.getConfigValue("enableDaemon")
        if (!enableDaemon) {
            return
        }
        Daemon.conditionallyDispatch()
    },

    /**
     * Clobber then initialize the DaemonJobs collection. The collection is intentionally
     * initialized in a manner that will cause all jobs to fire immediately after startup
     * regardless of schedule.
     */
    initDaemonJobs() {
        DaemonJobs.remove({})
        const nowDate = new Date()
        Util.getCodes("daemonJob").forEach(jobName => {
            const daemonJobObject = Util.getCodeObject("daemonJob", jobName)
            const daemonJob = {}
            daemonJob.jobName = jobName
            daemonJob.timeInterval = daemonJobObject.timeInterval
            daemonJob.timeUnit = daemonJobObject.timeUnit
            daemonJob.timeOption = daemonJobObject.timeOption
            daemonJob.timezone = daemonJobObject.timezone
            daemonJob.nextDate = Util.computeNextDate(daemonJobObject.timeInterval, daemonJobObject.timeUnit,
                daemonJobObject.timeOption, daemonJobObject.timezone, nowDate)
            daemonJob.initFunctionName = daemonJobObject.initFunctionName
            daemonJob.execFunctionName = daemonJobObject.execFunctionName
            OLog.debug(`daemon.js initDaemonJobs daemonJob=${OLog.debugString(daemonJob)}`)
            if (daemonJob.initFunctionName) {
                try {
                    const func = get(global, daemonJob.initFunctionName)
                    func(daemonJob)
                }
                catch (error) {
                    OLog.error(`daemon.js initDaemonJobs unexpected error jobName=${daemonJob.jobName} ` +
                        `error=${OLog.errorError(error)}`)
                }
            }
            DaemonJobs.insert(daemonJob)
        })
    },

    /**
     * Dispatch any jobs whose wait interval has passed.
     */
    conditionallyDispatch() {
        try {
            DaemonJobs.find({}).forEach(daemonJob => {
                const nowDate = new Date()
                if (daemonJob.nextDate <= nowDate) {
                    if (daemonJob.running) {
                        OLog.debug(`daemon.js conditionallyDispatch jobName=${daemonJob.jobName} already running *bypass*`)
                        return
                    }
                    if (daemonJob.timeUnit !== "SECOND") {
                        OLog.debug(`daemon.js conditionallyDispatch jobName=${daemonJob.jobName} ` +
                            `nextDate=${daemonJob.nextDate} nowDate=${nowDate}`)
                    }
                    const modifier = {}
                    modifier.$set = {}
                    modifier.$set.lastDate = nowDate
                    modifier.$set.nextDate = Util.computeNextDate(daemonJob.timeInterval, daemonJob.timeUnit,
                        daemonJob.timeOption, daemonJob.timezone, nowDate)
                    modifier.$set.running = true
                    DaemonJobs.update(daemonJob._id, modifier)
                    try {
                        const func = get(global, daemonJob.execFunctionName)
                        func(daemonJob)
                    }
                    catch (error) {
                        OLog.error(`daemon.js conditionallyDispatch unexpected error jobName=${daemonJob.jobName} ` +
                            `error=${OLog.errorError(error)}`)
                    }
                    finally {
                        DaemonJobs.update(daemonJob._id, { $set: { running: false } })
                    }
                    if (daemonJob.timeUnit !== "SECOND") {
                        OLog.debug(`daemon.js conditionallyDispatch *finished* jobname=${daemonJob.jobName} ` +
                            `lastDate=${daemonJob.lastDate} nextDate=${daemonJob.nextDate}`)
                    }
                }
            })
        }
        catch (error) {
            OLog.error(`daemon.js conditionallyDispatch unexpected error=${OLog.errorError(error)}`)
        }
    }
}
