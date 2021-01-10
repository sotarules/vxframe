Reporter = {

    init() {
        try {
            const config = {}
            config.from = Util.i18n("reporter.label_mail_from")
            config.replyTo = Util.i18n("reporter.label_mail_reply_to")
            config.routePrefix = "reports"
            config.baseUrl = process.env.ROOT_URL
            config.testEmail = "david@sotaenterprises.com"
            config.logger = console
            config.addRoutes = false
            Mailer.config(config)
            const init = {}
            init.templates = EmailTemplates
            init.helpers = Reporter.helpers
            init.layout = {}
            init.layout.name = "layout"
            init.layout.path = "reporter/layout.html"
            init.layout.scss = "reporter/layout.scss"
            Mailer.init(init)
        }
        catch (error) {
            OLog.error(`reporter.js init unexpected error=${error}`)
        }
        return
    },

    run() {
        if (!Util.getConfigValue("enableReporter")) {
            return
        }
        Reporter.findUsersWithScheduledReports()
        return
    },

    /**
     * Find all users that have one or more reports that need to be generated.
     */
    findUsersWithScheduledReports() {
        Meteor.users.find( { "profile.reportPreferences.nextDate" : { $lte: new Date() } } ).forEach(user => {
            Reporter.createScheduledReports(user)
        })
    },

    /**
     * For a given user, iterate through the reportPreferences collection finding scheduled reports that
     * need to be created.  Based on the previous search, there should be at least one.
     *
     * @param {object} user User record.
     */
    createScheduledReports(user) {
        user.profile.reportPreferences.forEach((reportPreference, index) => {
            try {
                if (reportPreference.nextDate > new Date()) {
                    return
                }
                const reportParameterDefaults = Util.reportParameterDefaults(reportPreference.reportType, user._id)
                const result = Reporter.sendReport(user._id, reportPreference.reportType, reportParameterDefaults)
                if (!result.success) {
                    return
                }
                const nextDate = Util.computeNextDate(reportPreference.reportFrequency, reportPreference.timeUnit,
                    reportPreference.timeOption, user.profile.timezone, reportPreference.nextDate)
                const $set = {}
                $set[`profile.reportPreferences.${index}.lastDate`] = reportPreference.nextDate
                $set[`profile.reportPreferences.${index}.nextDate`] = nextDate
                OLog.debug("reporter.js createScheduledReports send completed, updating profile " +
                    `email=${Util.getUserEmail(user._id)} $set=${OLog.debugString($set)}`)
                Meteor.users.update( { _id: user._id }, { $set: $set } )
            }
            catch (error) {
                OLog.error("reporter.js createScheduledReports unexpected error=" + error)
                return
            }
        })
    },

    /**
     * Send a report to a user.
     *
     * @param {string} recipientId Recipient ID.
     * @param {string} reportType Report type.
     * @param {string} reportParameters Optional report parameters.
     * @return {object} Result object.
     */
    sendReport(recipientId, reportType, reportParameters) {
        try {
            if (!(_.isString(recipientId) && _.isString(reportType) && (!reportParameters || _.isObject(reportParameters)))) {
                OLog.error(`reporter.js sendReport parameter check failed recipientId=${recipientId} ` +
                    `reportType=${reportType} reportParameters=${reportParameters}`)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            const recipient = Meteor.users.findOne(recipientId)
            if (!recipient) {
                OLog.error("reporter.js sendReport unable to find userId=" + recipientId)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_user_not_found", variables : { userId : recipientId } }
            }
            if (!_.contains(Util.getCodes("reportType"), reportType)) {
                OLog.error("reporter.js sendReport parameter check failed unknown reportType=" + reportType)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            const reportName = Util.i18n("codes.reportType." + reportType)
            const reportTypeObject = Meteor.i18nMessages.codes.reportType[reportType]
            const templateName = reportTypeObject.template_name
            const data = Reporter.getDataReal(reportType, recipient, reportParameters)
            const send = {}
            send.to = Util.getUserEmail(recipientId)
            send.subject = Util.i18n("reporter.label_mail_subject",
                { reportName: reportName, adminName : Util.fetchFullName(recipientId),
                    reportDate: moment.tz(data.reportDate, data.timezone).format("D MMM YYYY h:mm A"),
                    timezone : Util.getUserTimezone(recipientId).replace("_", " ") })
            send.template = templateName
            send.data = data
            OLog.debug(`reporter.js sendReport recipientId=${recipientId} reportType=${reportType} templateName=${templateName} send=${OLog.debugString(send)} MAIL_URL=${process.env.MAIL_URL}`)
            // Send report asynchronously to improve perceived performance:
            Meteor.setTimeout(() => {
                Mailer.send(send)
            }, 0)
            return { success : true, icon : "PLANE", key : "common.alert_report_send_success",
                variables: { reportName: Util.i18n("codes.reportType." + reportType), email: send.to } }
        }
        catch (error) {
            OLog.error("reporter.js sendReport unexpected error=" + error)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Determine whether a given configuration value is set.
     *
     * @param {object} data Data object, or object augmented with data.
     * @param {string} name Name.
     * @param {string} value Value to test.
     * @return {boolean} True if configuration value is set.
     */
    isConfig(data, name, value) {
        data = data.data ? data.data : data
        return data.config[name] === value
    },

    /**
     * Get the specified configuration value.
     *
     * @param {object} data Data object, or object augmented with data.
     * @param {string} name Name.
     * @return {string} Value.
     */
    getConfig(data, name) {
        data = data.data ? data.data : data
        return data.config[name]
    },

    /**
     * Global helpers.
     */
    helpers : {
        i18n(template, key, variables) {
            return Util.i18n(template + "." + key, variables)
        },
        isConfig(name, value) {
            return Reporter.isConfig(this, name, value)
        },
        getConfig(name) {
            return Reporter.getConfig(this, name)
        },
        isAdvanced() {
            Util.isPreference("ADVANCED_MAIL_CLIENT", this.data.recipient._id)
        },
        formatNumberWithCommas(number) {
            return Util.formatNumberWithCommas(number)
        },
        formatMoney(money) {
            return Util.formatMoney(money)
        }
    },

    /**
     * Construct and return context object for actual send using supplied report parameters.
     *
     * @return {string} reportType.
     * @param {object} recipient Recipient user record.
     * @param {string} reportParameters Report parameters.
     * @return {object} Data object.
     */
    getDataReal(reportType, recipient, reportParameters) {
        const data = {}
        data.recipient = recipient
        data.config = Util.reportConfig(reportType)
        data.timezone = Util.reportTimezone(reportType, recipient._id)
        data.reportDate = new Date()
        data.reportParameters = reportParameters
        OLog.debug(`reporter.js getDataReal reportType=${reportType} data=${OLog.debugString(data)}`)
        return data
    },

    /**
     * Construct and return context object for test preview using default report parameters.
     *
     * @return {string} reportType.
     * @return {object} params Parameters object from Lookback Emails.
     * @return {object} Data object.
     */
    getDataTest(reportType, params) {
        const data = {}
        data.recipient = Meteor.users.findOne(params.userId)
        data.config = Util.reportConfig(reportType)
        data.timezone = Util.reportTimezone(reportType, params.userId)
        data.reportDate = new Date()
        data.reportParameters = Util.reportParameterDefaults(reportType, params.userId)
        OLog.debug(`reporter.js getDataTest reportType=${reportType} data=${OLog.debugString(data)}`)
        return data
    }
}

