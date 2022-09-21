Reporter = {

    run() {
        if (!Util.getConfigValue("enableReporter")) {
            return
        }
        try {
            Meteor.users.find({"profile.dateRetired":{$exists: false}}).forEach(user => {
                Reporter.createScheduledReports(user)
            })
            return
        }
        catch (error) {
            OLog.error(`reporter.js (vx) run unexpected error=${error}`)
            return
        }
    },

    /**
     * For a given user, iterate through the reports array finding scheduled reports that
     * need to be created.
     *
     * @param {object} user User record.
     */
    async createScheduledReports(user) {
        try {
            if (user.profile && user.profile.domains) {
                for (let domainIndex = 0; domainIndex < user.profile.domains.length; domainIndex++) {
                    const userProfileDomain = user.profile.domains[domainIndex]
                    if (userProfileDomain.reports) {
                        for (let reportIndex = 0; reportIndex < userProfileDomain.reports.length; reportIndex++) {
                            const userProfileReport = userProfileDomain.reports[reportIndex]
                            if (!(userProfileReport.reportId && userProfileReport.reportFrequency &&
                                userProfileReport.timeUnit && userProfileReport.timeOption &&
                                (userProfileReport.recipients || userProfileReport.distributionFunctionId))) {
                                OLog.warn(`reporter.js createScheduledReports ${Util.fetchFullName(user._id)} ` +
                                    "incomplete user profile report ignored")
                                continue
                            }
                            if (userProfileReport.nextDate > new Date()) {
                                continue
                            }
                            OLog.debug(`reporter.js createScheduledReports ${Util.fetchFullName(user)} ` +
                                `reportId=${userProfileReport.reportId} recipients=${OLog.debugString(userProfileReport.recipients)} ` +
                                `distributionFunctionId=${userProfileReport.distributionFunctionId}`)
                            const result = !userProfileReport.distributionFunctionId ?
                                await VXApp.sendReportEmail(userProfileReport.reportId,
                                    userProfileReport.recipients, userProfileReport.attachments) :
                                await VXApp.sendReportEmailCustom(userProfileReport.reportId,
                                    userProfileReport.distributionFunctionId, userProfileReport.attachments)
                            if (!result.success) {
                                OLog.error(`reporter.js createScheduledReports sendReportEmail result=${OLog.errorString(result)}`)
                            }
                            const nextDate = Util.computeNextDate(userProfileReport.reportFrequency, userProfileReport.timeUnit,
                                userProfileReport.timeOption, user.profile.timezone, userProfileReport.nextDate)
                            const modifier = {}
                            modifier.$set = {}
                            modifier.$set[`profile.domains.${domainIndex}.reports.${reportIndex}.lastDate`] = userProfileReport.nextDate
                            modifier.$set[`profile.domains.${domainIndex}.reports.${reportIndex}.nextDate`] = nextDate
                            OLog.debug("reporter.js createScheduledReports send completed, updating profile " +
                                `email=${Util.getUserEmail(user._id)} modifier=${OLog.debugString(modifier)}`)
                            Meteor.users.direct.update(user._id, modifier)
                        }
                    }
                }
            }
        }
        catch (error) {
            OLog.error(`reporter.js createScheduledReports unexpected error=${error}`)
            return
        }
    }
}
