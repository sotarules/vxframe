import {authenticator} from "otplib"
import crypto from "crypto"
import { unionBy } from "lodash"

VXApp = { ...VXApp, ...{

    /**
     * Return the desired login expiration time in days.
     *
     * @return {number} Login expiration time in days.
     */
    loginExpirationInDays() {
        return 7
    },

    /**
     * Determine the default route for this user.
     *
     * @return {string} Default route.
     */
    getDefaultRoute() {
        let path
        if (VXApp.getAppDefaultRoute) {
            path = VXApp.getAppDefaultRoute()
        }
        if (!path) {
            path = "/profile"
        }
        OLog.debug(`vxapp.js getDefaultRoute path=${path}`)
        return path
    },

    /**
     * Log a debug line whenever a client logs in to show the client version.
     */
    onClientLogin(userId, clientVersion, reactVersion) {
        try {
            OLog.debug(`vxapp.js onClientLogin user ${Util.getUserEmail(userId)} ${CX.SYSTEM_NAME} ${clientVersion} ` +
                `Meteor ${Meteor.release} React ${reactVersion}`)
            Meteor.users.update(userId, { $set: { "profile.clientVersion": Meteor.appVersion.version } })
            return { success: true, icon: "ENVELOPE", key: "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error(`vxapp.js onClientLogin error=${OLog.errorError(error)}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error", variables: { error: error.toString() } }
        }
    },

    /**
     * Clear the specified PNotify notification.  This will only work if the user
     * is the owner of the notification.
     *
     * @param {string} notificationId Notification ID.
     * @param {boolean} sent True to mark the record as sent.
     * @return {object} Result object.
     */
    clearPNotify(notificationId, sent) {
        try {
            if (!_.isString(notificationId)) {
                OLog.error(`vxapp.js clearPNotify parameter check failed notificationId=${notificationId}`)
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            const notification = Notifications.findOne(notificationId)
            if (!notification) {
                OLog.error(`vxapp.js clearPNotify unable to find notificationId=${notificationId}`)
                return { success: false, icon: "BUG", key: "common.alert_transaction_fail_notification_not_found", variables: { notificationId: notificationId } }
            }
            return VXApp.updateNotification(notificationId, "PNOTIFY", sent ? ["processed", "sent"] : ["processed"])
        }
        catch (error) {
            OLog.error(`vxapp.js clearPNotify unexpected error=${OLog.errorError(error)}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error", variables: { error: error.toString() } }
        }
    },

    /**
     * Update the notification with results.
     *
     * @param {string} notificationId Notification ID.
     * @param {string} mode Notification mode (e.g., "EMAIL")
     * @param {array} notificationEvents Notification event(s) that occurred (e.g., ["processed", "sent"]).
     * @param {object} extra Optional: extra properties to be set.
     */
    updateNotification(notificationId, mode, notificationEvents, extra) {
        try {
            const modifier = {}
            modifier.$set = extra || {}
            notificationEvents.forEach(notificationEvent => {
                modifier.$set[`${mode}_${notificationEvent}`] = moment().toDate()
            })
            // OLog.debug("vxapp.js updateNotification notificationId=" + notificationId + " modifier=" + OLog.debugString(modifier))
            Notifications.update(notificationId, modifier)
            return { success: true, icon: "ENVELOPE", key: "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error(`vxapp.js updateNotification unexpected error=${OLog.errorError(error)}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error", variables: { error: error.toString() } }
        }
    },

    /**
     * Create an event (also create accompanying notification(s) if applicable).
     *
     * @param {string} eventType Event type (e.g., ORDER_CREATED).
     * @param {string} domainId Domain ID.
     * @param {object} eventData Event data in object form.
     * @param {object} variables Variables to be inserted into notifications.
     * @param {string} notificationScope Scope of notification (e.g., USER, DOMAIN).
     * @return {string} MongoDB ID of new event.
     */
    createEvent(eventType, domainId, eventData, variables, notificationScope) {
        try {
            const event = {}
            event.domain = domainId || Util.getCurrentDomainId()
            event.type = eventType
            event.eventData = eventData
            OLog.debug(`vxapp.js createEvent eventType=${event.type} domain=${event.domain} ` +
                `eventData=${OLog.debugString(event.eventData)} variables=${OLog.debugString(variables)} ` +
                `notificationScope=${notificationScope}`)
            const eventId = Events.insert(event)
            OLog.debug(`vxapp.js createEvent *success* eventId=${eventId}`)
            if (Util.isNotificationWarranted(event)) {
                VXApp.createNotifications(domainId, eventType, eventId, variables, notificationScope)
            }
            else {
                OLog.debug(`vxapp.js createEvent notifications *not* warranted for eventId=${eventId}`)
            }
            return eventId
        }
        catch (error) {
            OLog.error(`vxapp.js createEvent error=${OLog.errorError(error)}`)
            return
        }
    },

    /**
     * Create notifications for an event to all users in the specified domain.
     *
     * @param {string} domainId Domain ID.
     * @param {string} Event type (e.g., ORDER_CREATED).
     * @param {string} Event ID.
     * @param {string} notificationScope Scope of notification (e.g., USER, DOMAIN).
     * @param {object} Variables to be inserted into notification.
     */
    createNotifications(domainId, eventType, eventId, variables, notificationScope) {
        try {
            const eventTypeObject = Meteor.i18nMessages.codes.eventType[eventType]
            const notificationObject = eventTypeObject.notification
            notificationScope = notificationScope || notificationObject.scope
            const selector = {}
            selector["profile.dateRetired"] = { $exists: false }
            if (notificationScope !== "SUPERADMIN") {
                selector["profile.currentDomain"] = domainId
            }
            if (notificationScope === "USER") {
                selector._id = Meteor.userId()
            }
            Meteor.users.find(selector).forEach(user => {
                if (notificationScope === "SUPERADMIN" && !Util.isUserSuperAdmin(user._id)) {
                    return
                }
                if (notificationScope === "ADMIN" && !Util.isUserAdmin(user._id)) {
                    return
                }
                const notification = {}
                notification.domain = domainId
                notification.type = notificationObject.type
                notification.icon = notificationObject.icon
                notification.eventId = eventId
                notification.eventType = eventType
                notification.recipientId = user._id
                notification.key = notificationObject.key
                notification.subjectKey = notificationObject.subjectKey
                notification.variables = variables
                OLog.debug(`vxapp.js createNotifications eventType=${eventType} scope=${notificationScope} ` +
                    ` user=${Util.fetchFullName(user._id)}`)
                Notifications.insert(notification)
            })
        }
        catch (error) {
            OLog.error(`vxapp.js createNotification error=${OLog.errorError(error)}`)
            return
        }
    },

    /**
     * Clear log file.
     */
    clearLogFile() {
        if (!Util.isUserSuperAdmin()) {
            OLog.error("vxapp.js clearLogFile security check failed invoking user is not super administrator")
            return
        }
        Log.remove({}, (error) => {
            if (error) {
                OLog.error("vxapp.js clearLogFile error=" + error)
                return
            }
            OLog.debug("vxapp.js clearLogFile log file cleared successfully")
            return
        })
    },

    /**
     * Set the current user's password.
     *
     * @param {string} newPassword New password.
     * @return {object} Result object.
     */
    setPassword(newPassword) {
        try {
            if (!_.isString(newPassword)) {
                OLog.error("vxapp.js setPassword parameter check failed newPassword=" + newPassword)
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            let userId = Meteor.userId()
            if (!userId) {
                OLog.error("vxapp.js setPassword security check failed user is not logged in")
                return { success: false, icon: "EYE", key: "common.alert_security_check_failed" }
            }
            let user = Meteor.users.findOne(userId)
            if (!user) {
                OLog.error("vxapp.js setPassword unable to find userId=" + userId)
                return { success: false, icon: "BUG", key: "common.alert_transaction_fail_user_not_found", variables: { userId: userId } }
            }
            OLog.debug("vxapp.js setPassword email=" + Util.getUserEmail(userId) + " newPassword=" + newPassword)
            Accounts.setPassword(userId, newPassword, { logout: false })
            return { success: true, icon: "BULLHORN", key: "common.alert_password_save_success" }
        }
        catch (error) {
            OLog.error("vxapp.js setPassword unexpected error=" + error)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error", variables: { error: error.toString() } }
        }
    },

    /**
     * Clone the specified domain.
     *
     * @param {string} domainId Domain ID to clone.
     * @return {object} Result object.
     */
    cloneDomain(domainId) {
        try {
            if (!(_.isString(domainId))) {
                OLog.error(`vxapp.js cloneUser parameter check failed domainId=${domainId}`)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            if (!Meteor.userId()) {
                OLog.error("vxapp.js cloneUser security check failed invoking user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            const domain = Domains.findOne(domainId)
            if (!domain) {
                OLog.error(`vxapp.js cloneDomain unable to find cloned domainId=${domainId}`)
                return
            }
            if (!Util.isUserAdmin()) {
                OLog.error("vxapp.js cloneDomain security check failed invoking user is not administrator")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            // Remove Mongo ID to prevent duplicate keys (the entire record is cloned):
            delete domain._id
            delete domain.base
            delete domain.iconUrl
            OLog.debug(`vxapp.js cloneDomain inserting cloned domain record=${OLog.debugString(domain)}`)
            const domainIdNew = Domains.insert(domain)
            return { success : true, icon : "CLONE", key : "common.alert_record_cloned_success", variables: { name: Util.fetchDomainName(domainId) }, domainId: domainIdNew }
        }
        catch (error) {
            OLog.error(`vxapp.js cloneUser unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Clone the specified user.
     *
     * @param {string} userId User ID to clone.
     * @return {object} Result object.
     */
    cloneUser(userId) {
        try {
            if (!(_.isString(userId))) {
                OLog.error(`vxapp.js cloneUser parameter check failed userId=${userId}`)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            if (!Meteor.userId()) {
                OLog.error("vxapp.js cloneUser security check failed invoking user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            let user = Meteor.users.findOne(userId)
            if (!user) {
                OLog.error(`vxapp.js cloneUser unable to find cloned userId=${userId}`)
                return
            }
            if (!Util.isUserAdmin()) {
                OLog.error("vxapp.js cloneUser security check failed invoking user is not administrator")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            let tenantId = Util.getCurrentTenantId(Meteor.userId())
            if (!_.contains(Util.getTenantIds(userId), tenantId)) {
                OLog.error(`vxapp.js cloneUser security check failed cloned user ${Util.getUserEmail(userId)} is not a member of ${Util.fetchTenantName(tenantId)}`)
                return { success: false, icon: "EYE", key: "common.alert_security_check_failed" }
            }
            // Remove Mongo ID to prevent duplicate keys (the entire record is cloned):
            // TODO: DL--probably strip out all tenants and domains except the current team:
            delete user._id
            delete user.username
            delete user.emails
            delete user.services
            delete user.profile.enrolled
            delete user.profile.dateCreated
            delete user.profile.userCreated
            user.username = Util.getGuid()
            user.createdAt = new Date()
            OLog.debug(`vxapp.js cloneUser inserting cloned user record=${OLog.debugString(user)}`)
            const userIdNew = Meteor.users.insert(user)
            return { success : true, icon : "CLONE", key : "common.alert_record_cloned_success", variables: { name: Util.fetchFullName(userId) }, userId: userIdNew }
        }
        catch (error) {
            OLog.error(`vxapp.js cloneUser unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Retire the specified user.
     *
     * @param {string} userId User ID.
     * @param {string} comment Optional comment.
     * @return {object} Result object.
     */
    retireUser(userId, comment) {
        try {
            if (!(_.isString(userId) && (!comment || _.isString(comment)))) {
                OLog.error("vxapp.js retireUser parameter check failed userId=" + userId + " comment=" + comment)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            if (!Meteor.userId()) {
                OLog.error("vxapp.js retireUser security check failed user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            if (!Util.isUserSuperAdmin()) {
                OLog.error("vxapp.js retireUser security check failed invoking user is not super administrator")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            let user = Meteor.users.findOne(userId)
            if (!user) {
                OLog.error("vxapp.js retireUser unable to find userId=" + userId)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_user_not_found", variables : { userId : userId } }
            }
            // Couple of special concerns here.  First, we're issuing the event now before we actually do the update to remove.
            // The reason for this is we're going to wipe out the user ID, so the notifications won't show the email
            // if there was no name established.  The second thing is that we're considering this event part of the current
            // domain, even though technically USER_RETIRE is a multi-domain event.
            VXApp.createEvent("USER_RETIRE", Util.getCurrentDomainId(userId), { retiredUserId : userId, userId: Meteor.userId() }, { fullName : Util.fetchFullName(userId) } )
            // We have to wipe out the username and email to allow it to be reused
            // (the name must be unique system-wide):
            let retireGuid = user.username + "-" + Util.getGuid().substring(0, 8)
            let modifier = {}
            modifier.$set = {}
            modifier.$set.username = retireGuid
            modifier.$set["emails.0.address"] = retireGuid
            modifier.$set["profile.dateRetired"] = new Date()
            modifier.$set["profile.userRetired"] = Meteor.userId()
            if (comment) {
                modifier.$set["profile.comment"] = comment
            }
            OLog.debug("vxapp.js retireUser userId=" + userId + " modifier=" + OLog.debugString(modifier))
            Meteor.users.update(userId, modifier)
            return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error("vxapp.js retireUser unexpected error=" + error)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Retire a tenant.
     *
     * @param {string} tenantId Tenant ID.
     * @param {string} comment Optional comment.
     * @return {object} Result object.
     */
    retireTenant(tenantId, comment) {
        try {
            if (!(_.isString(tenantId) && (!comment || _.isString(comment)))) {
                OLog.error("vxapp.js retireTenant parameter check failed tenantId=" + tenantId + " comment=" + comment)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            let userId = Meteor.userId()
            if (!userId) {
                OLog.error("vxapp.js retireTenant security check failed user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            let tenant = Tenants.findOne(tenantId)
            if (!tenant) {
                OLog.error("vxapp.js retireTenant unable to find tenantId=" + tenantId)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_tenant_not_found", variables : { tenantId : tenantId } }
            }
            if (!Util.isUserSuperAdmin(userId)) {
                OLog.error("vxapp.js retireTenant invoking user " + Util.getUserEmail(userId) + " is not a super administrator")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            OLog.debug("vxapp.js retireTenant user " + Util.getUserEmail(userId) + " has elected to cancel " + Util.fetchTenantName(tenantId))
            let modifier = {}
            modifier.$set = {}
            modifier.$set.dateRetired = new Date()
            modifier.$set.userRetired = userId
            if (comment) {
                modifier.$set.comment = comment
            }
            OLog.debug("vxapp.js retireTenant " + Util.fetchTenantName(tenantId) + " modifier=" + OLog.debugString(modifier))
            Tenants.update(tenantId, modifier)
            VXApp.createEvent("TENANT_RETIRE", Util.getCurrentDomainId(userId), { tenantId : tenantId, adminId: userId },
                { adminName : Util.fetchFullName(userId), tenantName: Util.fetchTenantName(tenantId) } )
            return { success : true, icon : "TRASH", key : "common.alert_tenant_retired_successfully", variables: { tenantName: Util.fetchTenantName(tenantId) } }
        }
        catch (error) {
            OLog.error("vxapp.js retireTenant unexpected error=" + error)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Retire the specified domain.
     *
     * @param {string} domainId Domain ID.
     * @param {string} comment Optional comment.
     * @return {object} Result object.
     */
    retireDomain(domainId, comment) {
        try {
            if (!(_.isString(domainId) && (!comment || _.isString(comment)))) {
                OLog.error(`vxapp.js retireDomain parameter check failed domainId=${domainId} comment=${comment}`)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            const domain = Domains.findOne(domainId)
            if (!domain) {
                OLog.error(`vxapp.js retireDomain unable to find domainId=${domainId}`)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_domain_not_found", variables : { domainId : domainId } }
            }
            const tenantId = Util.getTenantId(domain)
            if (!tenantId) {
                OLog.error(`vxapp.js retireDomain unable to find tenantId for domainId=${domainId}`)
                return { success : false, icon : "BUG", key : "common.alert_parameter_check_failed" }
            }
            if (!Meteor.userId()) {
                OLog.error("vxapp.js retireDomain security check failed user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            if (!Util.isUserAdmin(Meteor.userId(), tenantId)) {
                OLog.error("vxapp.js retireDomain security check failed invoking user is not administrator")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            VXApp.createEvent("DOMAIN_RETIRE", domainId, { domainId : domainId, userId: Meteor.userId() }, { domainName : Util.fetchDomainName(domainId) } )
            let modifier = {}
            modifier.$set = {}
            modifier.$set.dateRetired = new Date()
            modifier.$set.userRetired = Meteor.userId()
            if (comment) {
                modifier.$set.comment = comment
            }
            OLog.debug(`vxapp.js retireDomain domainId=${domainId} modifier=${OLog.debugString(modifier)}`)
            Domains.update(domainId, modifier)
            return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error(`vxapp.js retireDomain unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Retire the specified template.
     *
     * @param {string} templateId Domain ID.
     * @param {string} comment Optional comment.
     * @return {object} Result object.
     */
    retireTemplate(templateId, comment) {
        try {
            if (!(_.isString(templateId) && (!comment || _.isString(comment)))) {
                OLog.error("vxapp.js retireTemplate parameter check failed templateId=" + templateId + " comment=" + comment)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            let template = Templates.findOne(templateId)
            if (!template) {
                OLog.error("vxapp.js retireTemplate unable to find templateId=" + templateId)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_template_not_found", variables : { templateId : templateId } }
            }
            if (!Meteor.userId()) {
                OLog.error("vxapp.js retireTemplate security check failed user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            let modifier = {}
            modifier.$set = {}
            modifier.$set.dateRetired = new Date()
            modifier.$set.userRetired = Meteor.userId()
            if (comment) {
                modifier.$set.comment = comment
            }
            OLog.debug("vxapp.js retireTemplate templateId=" + templateId + " modifier=" + OLog.debugString(modifier))
            Templates.update(templateId, modifier)
            return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error("vxapp.js retireTemplate unexpected error=" + error)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Retire the specified function.
     *
     * @param {string} functionId Function ID.
     * @param {string} comment Optional comment.
     * @return {object} Result object.
     */
    retireFunction(functionId, comment) {
        try {
            if (!(_.isString(functionId) && (!comment || _.isString(comment)))) {
                OLog.error(`vxapp.js retireFunction parameter check failed functionId=${functionId} comment=${comment}`)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            let funktion = Functions.findOne(functionId)
            if (!funktion) {
                OLog.error(`vxapp.js retireFunction unable to find functionId=${functionId}`)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_function_not_found", variables : { functionId : functionId } }
            }
            if (!Meteor.userId()) {
                OLog.error("vxapp.js retireFunction security check failed user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            let modifier = {}
            modifier.$set = {}
            modifier.$set.dateRetired = new Date()
            modifier.$set.userRetired = Meteor.userId()
            if (comment) {
                modifier.$set.comment = comment
            }
            OLog.debug(`vxapp.js retireFunction functionId=${functionId} modifier=${OLog.debugString(modifier)}`)
            Functions.update(functionId, modifier)
            return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error(`vxapp.js retireFunction unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Retire the specified report.
     *
     * @param {string} reportId Report ID.
     * @param {string} comment Optional comment.
     * @return {object} Result object.
     */
    retireReport(reportId, comment) {
        try {
            if (!(_.isString(reportId) && (!comment || _.isString(comment)))) {
                OLog.error(`vxapp.js retireReport parameter check failed functionId=${reportId} comment=${comment}`)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            const report = Reports.findOne(reportId)
            if (!report) {
                OLog.error(`vxapp.js retireReport unable to find reportId=${reportId}`)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_report_not_found",
                    variables : { reportId : reportId } }
            }
            if (!Meteor.userId()) {
                OLog.error("vxapp.js retireReport security check failed user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            let modifier = {}
            modifier.$set = {}
            modifier.$set.dateRetired = new Date()
            modifier.$set.userRetired = Meteor.userId()
            if (comment) {
                modifier.$set.comment = comment
            }
            OLog.debug(`vxapp.js retireReport reportId=${reportId} modifier=${OLog.debugString(modifier)}`)
            Reports.update(reportId, modifier)
            return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error(`vxapp.js retireReport unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error",
                variables : { error : error.toString() } }
        }
    },

    /**
     * Send an enrollment email to the specified user.
     *
     * @param {string} userId User ID.
     * @return {object} Result object.
     */
    sendEnrollmentEmail(userId) {
        try {
            if (!_.isString(userId)) {
                OLog.error("vxapp.js sendEnrollmentEmail parameter check failed userId=" + userId)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            Accounts.sendEnrollmentEmail(userId)
            return { success : true, type : "INFO", icon : "BULLHORN", key : "common.alert_send_enrollment_email_success", variables : { email: Util.getUserEmail(userId) } }
        }
        catch (error) {
            OLog.error("vxapp.js sendEnrollmentEmail unexpected error=" + error)
            return { success : false, icon : "BUG", key : "common.alert_send_enrollment_email_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Send a password-reset email to the specified user.
     *
     * @param {string} userId User ID.
     * @return {object} Result object.
     */
    sendResetPasswordEmail(userId) {
        try {
            if (!_.isString(userId)) {
                OLog.error("vxapp.js sendResetPasswordEmail parameter check failed userId=" + userId)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            if (!Meteor.userId()) {
                OLog.error("vxapp.js sendResetPasswordEmail security check failed user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            let tenantId = Util.getCurrentTenantId(Meteor.userId())
            if (!Util.isUserAdmin(Meteor.userId(), tenantId)) {
                OLog.error("vxapp.js sendResetPasswordEmail security check failed invoking user " + Util.getUserEmail(Meteor.userId()) + " is not administrator of " + Util.fetchTenantName(tenantId))
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            if (!_.contains(Util.getTenantIds(userId), tenantId)) {
                OLog.error("vxapp.js sendResetPasswordEmail security check failed user " + Util.getUserEmail(userId) + " doesn't belong to current tenant " + Util.fetchTenantName(tenantId))
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            OLog.debug("vxapp.js sendResetPasswordEmail email=" + Util.getUserEmail(userId))
            Accounts.sendResetPasswordEmail(userId)
            return { success : true, type : "INFO", icon : "BULLHORN", key : "common.alert_send_reset_password_email_success", variables : { userFullName: Util.fetchFullName(userId) } }
        }
        catch (error) {
            OLog.error("vxapp.js sendResetPasswordEmail unexpected error=" + error)
            return { success : false, icon : "BUG", key : "common.alert_send_reset_password_email_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Create a new user with the default password.
     */
    createUserDefault() {
        let username = Util.getGuid()
        OLog.debug("vxapp.js methods createUserDefault username=" + username)
        let userId = Accounts.createUser({ username : username, password : CX.DEFAULT_PASSWORD, tenantId: Util.getCurrentTenantId(Meteor.userId()), source: "USER_EDITOR" })
        return userId
    },

    /**
     * Create a new tenant.
     *
     * @return {object} Result object.
     */
    createTenant() {
        try {
            const userId = Meteor.userId()
            OLog.debug(`vxapp.js createTenant administrator email=${Util.getUserEmail(userId)}`)
            const tenantId = VXApp.createTenantRecord( { userId } )
            const domainId = VXApp.createDomainRecord( { userId, tenantId } )
            VXApp.addUserToDomain(userId, domainId, false, true)
            VXApp.createEvent("TENANT_CREATE", domainId, { tenantId, adminId: userId },
                { adminName : Util.fetchFullName(userId) } )
            return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success", tenantId, domainId }
        }
        catch (error) {
            OLog.error(`vxapp.js createTenant unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Create a tenant record based on facts in a parameters object.
     *
     * @param {object} parameters Parameters object.
     * @return {string} New tenant ID.
     */
    createTenantRecord(parameters) {
        if (!parameters) {
            OLog.error("vxapp.js createTenant no parameters were supplied")
            return
        }
        OLog.debug(`vxapp.js createTenant parameters=${OLog.debugString(parameters)}`)
        const tenant = {}
        if (parameters.userId) {
            tenant.userCreated = parameters.userId
            tenant.userModified = parameters.userId
            tenant.pocUserId = parameters.userId
            tenant.functionAnchor = CX.SYSTEM_NAME.replace(/ /g, "_")
            tenant.timezone = Util.getUserTimezone(parameters.userId)
            tenant.country = Util.getProfileValue("country", parameters.userId)
        }
        const tenantId = Tenants.insert(tenant)
        OLog.debug(`vxapp.js createTenant created tenantId=${tenantId} tenant=${OLog.debugString(tenant)}`)
        return tenantId
    },

    /**
     * Create a domain record based on facts in expressed in parameters object.
     *
     * @param {object} parameters Parameters object.
     * @return {string} New domain ID.
     */
    createDomainRecord(parameters) {
        if (!parameters) {
            OLog.error("vxapp.js createDomainRecord no parameters were supplied")
            return
        }
        const tenantName = Util.fetchTenantField(parameters.tenantId, "name")
        const domain = {}
        domain.tenant = parameters.tenantId
        if (tenantName) {
            domain.name = Util.i18n("common.value_default_domain_name_with_tenant", { tenantName: tenantName })
            domain.description = Util.i18n("common.value_default_domain_description_with_tenant", { tenantName: tenantName })
        }
        else {
            domain.name = Util.i18n("common.value_default_domain_name")
            domain.description = Util.i18n("common.value_default_domain_description")
        }
        if (parameters.userId) {
            domain.userCreated = parameters.userId
            domain.userModified = parameters.userId
        }
        let domainId = Domains.insert(domain)
        OLog.debug(`vxapp.js createDomainRecord created domainId=${domainId} domain=${OLog.debugString(domain)}`)
        return domainId
    },

    /**
     * Add a user to a given domain.
     *
     * @param {string} userId User ID.
     * @param {string} domainId Domain ID.
     * @param {boolean} setCurrentDomain True to set domain as current.
     * @param {boolean} powerUser True to create powerful user in team (e.g., SYSTEMADMIN).
     */
    addUserToDomain(userId, domainId, setCurrentDomain, powerUser) {
        let user = Meteor.users.findOne(userId)
        if (!user) {
            OLog.debug("vxapp.js addUserToDomain unable to find userId=" + userId)
            return
        }
        let domain = Domains.findOne(domainId)
        if (!domain) {
            OLog.debug("vxapp.js addUserToDomain unable to find domainId=" + domainId)
            return
        }
        user.profile.tenants = user.profile.tenants || []
        user.profile.domains = user.profile.domains || []
        if (!_.findWhere(user.profile.tenants, { tenantId : domain.tenant })) {
            let tenantRoles = powerUser ? [ "TENANTADMIN" ] : []
            let tenantObject = { tenantId: domain.tenant, roles: tenantRoles }
            user.profile.tenants.push(tenantObject)
        }
        if (!_.findWhere(user.profile.domains, { domainId : domainId })) {
            let domainRoles = powerUser ? [ "DOMAINADMIN" ] : []
            let domainObject = { domainId: domainId, roles: domainRoles }
            user.profile.domains.push(domainObject)
        }
        let modifier = {}
        modifier.$set = {}
        modifier.$set["profile.tenants"] = user.profile.tenants
        modifier.$set["profile.domains"] = user.profile.domains
        if (setCurrentDomain) {
            modifier.$set["profile.currentDomain"] = domainId
        }
        OLog.debug("vxapp.js addUserToDomain administrator email=" + Util.getUserEmail(userId) + " modifier=" + OLog.debugString(modifier))
        Meteor.users.update(userId, modifier)
        return
    },

    /**
     * Set the current domain of the specified user.
     *
     * @param {string} domainId Domain ID.
     * @return {object} Result object
     */
    setCurrentDomain(domainId) {
        try {
            if (!_.isString(domainId)) {
                OLog.error("vxapp.js setCurrentDomain parameter check failed domainId=" + domainId)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            let domainIds = Util.getDomainIds(Meteor.userId())
            OLog.debug("vxapp.js setCurrentDomain user " + Util.getUserEmail(Meteor.userId()) + " should find domainId=" + domainId + " among [" + domainIds + "]")
            if (!_.contains(domainIds, domainId)) {
                OLog.error("vxapp.js setCurrentDomain security check failed user " + Util.getUserEmail(Meteor.userId()) + " is not a member of " + Util.fetchDomainName(domainId))
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            let modifier = {}
            modifier.$set = {}
            modifier.$set["profile.currentDomain"] = domainId
            Meteor.users.update(Meteor.userId(), modifier)
            return { success : true, type : "INFO", icon : "BULLHORN", key : "common.alert_domain_changed", variables : { domainName : Util.fetchDomainName(domainId) } }
        }
        catch (error) {
            OLog.error("vxapp.js setCurrentDomain unexpected error=" + error)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Server side validation.
     *
     * @param {string} functionName Fully-qualified name of function (e.g., "VX.common.zip")
     * @param {array} validateArgs Validation arguments.
     * @return {object} Result object.
     */
    validateServerSide(functionName, validateArgs) {
        try {
            if (!(_.isString(functionName) && _.isArray(validateArgs))) {
                OLog.error(`vxapp.js validateServerSide parameter check failed functionName=${functionName}`)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            if (functionName.indexOf("VX") !== 0) {
                OLog.error("vxapp.js validateServerSide parameter check failed functionName=" + functionName + " must start with VX")
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            let rule = Util.ref(global, functionName)
            let result = rule.apply(this, validateArgs)
            OLog.debug("vxapp.js validateServerSide functionName=" + functionName + " result=" + OLog.debugString(result))
            return result
        }
        catch (error) {
            OLog.debug("vxapp.js validateServerSide functionName=" + functionName + " unexpected error=" + error)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Send a test email to the current user.
     *
     * @param {string} templateId Template ID.
     * @return {object} Result object.
     */
    async sendTestEmail(templateId) {
        try {
            if (!_.isString(templateId)) {
                OLog.error(`vxapp.js sendTestEmail parameter check failed templateId=${templateId}`)
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            if (!Meteor.userId()) {
                OLog.error("vxapp.js sendTestEmail security check failed user is not logged in")
                return { success: false, icon: "EYE", key: "common.alert_security_check_failed" }
            }
            const template = Templates.findOne(templateId)
            if (!template) {
                OLog.error(`vxapp.js sendTestEmail unable to find templateId=${templateId}`)
                return { success: false, icon: "BUG", key: "common.alert_transaction_fail_template_not_found",
                    variables: { templateId: templateId } }
            }
            const user = Util.fetchUserLimited(Meteor.userId())
            user.profile.email = Util.getUserEmail(Meteor.userId())
            const from = Util.i18n("common.label_mail_from")
            const to = Util.getUserEmail(Meteor.userId())
            const subject = Util.resolveVariables(template.subject, user.profile)
            const  html = Util.resolveVariables(template.html, user.profile)
            OLog.debug(`vxapp.js sendTestEmail from=${from} to=${to} subject=${subject} html=${html}`)
            const result = await Service.sendEmail(template.domain, from, to, subject, html, null)
            if (!result.success) {
                VXApp.setSubsystemStatus("TEMPLATE", template, "RED", "common.status_template_test_fail")
                return { success: false, icon: "TRIANGLE", key: "common.alert_send_test_email_fail",
                    variables: { error: result.error.toString() } }
            }
            OLog.debug("vxapp.js sendTestEmail *success*")
            VXApp.setSubsystemStatus("TEMPLATE", template, "GREEN", "common.status_template_test_success")
            return { success: true, icon: "CHECK", key: "common.alert_send_test_email_success" }
        }
        catch (error) {
            OLog.error("vxapp.js sendTestEmail unexpected error=" + error)
            return { success: false, icon: "TRIANGLE", key: "common.alert_send_test_email_fail",
                variables: { error: error.toString() } }
        }
    },

    /**
     * Invoke server-side HTTP request.

     * @param {string} method Method (e.g., GET or POST).
     * @param {string} url URL.
     * @param {object} body Request body.
     * @return {object} Standard result object with response
     */

    /**
     * Invoke HTTP as a promise.
     *
     * @param {string} method Method name.
     * @param {string} url URL.
     * @return {object} request Request (auth, params and so on).
     */
    async http(method, url, request) {
        return new Promise((resolve, reject) => {
            OLog.debug(`vxapp.js http ${method} ${url} *executor*`)
            HTTP.call(method, url, request, (error, result) => {
                if (error) {
                    OLog.error(`vxapp.js http ${method} ${url} *reject* error=${OLog.errorError(error)}`)
                    reject(error)
                    return
                }
                OLog.debug(`vxapp.js http ${method} ${url} *resolve* result=${OLog.debugString(result)}`)
                resolve(result)
            })
        })
    },

    /**
     * Truncate HTTP string.
     *
     * @param {object) input HTTP input (error or response).
     * @return {string} HTTP string truncated to reasonable length.
     */
    httpTruncate(input) {
        const httpString = input.toString()
        if (httpString.length > 100) {
            return `${httpString.substring(0, 100)}...`
        }
        return httpString
    },

    /**
     * Handle an insert of a new record, initializing the Transactions collection as needed.
     *
     * @param {object} collection Collection.
     * @param {string} userId User ID who is inserting the record.
     * @param {object} doc Document after insert.
     */
    handleInsert(collection, userId, doc) {
        VXApp.makeTransactions(collection, Util.getCurrentDomainId(userId), userId, doc)
    },

    /**
     * Handle an update of an existing record, updating the Transactions collection as needed.
     *
     * @param {object} collection Collection.
     * @param {string} userId User ID who is inserting the record.
     * @param {object} doc Document after insert.
     * @param {object} fieldNames Field names that were updated.
     * @param {object} modifier Modifier used to perform update.
     * @param {object} options Options used to perform update.
     * @param {object} previous Document before update.
     */
    handleUpdate(collection, userId, doc, fieldNames, modifier, options, previous) {
        // No userId is supplied when Domains is updated by the system, no undo/redo is necessary.
        if (!userId) {
            return
        }
        try {
            let transactions = VXApp.findTransactions(collection, userId, doc)
            if (!transactions) {
                transactions = VXApp.makeTransactions(collection, Util.getCurrentDomainId(userId), userId, previous)
            }
            const undoStackSize = Util.getConfigValue("undoStackSize") || 100
            const selector = VXApp.makeTransactionsSelector(collection, userId, doc)
            if (transactions.history.length >= undoStackSize) {
                OLog.debug(`vxapp.js handleUpdate ${collection._name} domain=${selector.domain} userId=${userId} stack at maximum undoStackSize=${undoStackSize} index=${transactions.index} length=${transactions.history.length} *shift*`)
                transactions.history.shift()
            }
            else {
                OLog.debug(`vxapp.js handleUpdate ${collection._name} domain=${selector.domain} userId=${userId} stack at still has room undoStackSize=${undoStackSize} index=${transactions.index} length=${transactions.history.length}`)
            }
            transactions.history.push(doc)
            const modifier = {}
            modifier.$set = {}
            modifier.$set.index = transactions.history.length - 1
            modifier.$set.history = transactions.history
            const result = Transactions.update(selector, modifier)
            if (result !== 1) {
                OLog.error(`vxapp.js handleUpdate *fail* result=${result} ${collection._name} domain=${selector.domain} userId=${userId} fieldNames=${OLog.debugString(fieldNames)} selector=${OLog.debugString(selector)} modifier=${OLog.debugString(modifier)}`)
            }
        }
        catch (error) {
            OLog.error(`vxapp.js handleUpdate *fail* ${collection._name} domain=${Util.getCurrentDomainId(userId)} userId=${userId} fieldNames=${OLog.debugString(fieldNames)} error=${OLog.errorError(error)}`)
        }
    },

    /**
     * Create and return transaction selector.
     *
     * @param {object} collection Collection.
     * @param {string} userId User ID.
     * @param {object} doc Record being inserted or updated.
     */
    makeTransactionsSelector(collection, userId, doc) {
        const selector = {}
        selector.domain = Util.getCurrentDomainId(userId)
        selector.userId = userId
        selector.collectionName = collection._name
        selector.id = doc._id
        return selector
    },

    /**
     * Find a transaction set.
     *
     * @param {object} collection Collection.
     * @param {string} userId User ID.
     * @param {object} doc Record being inserted or updated.
     */
    findTransactions(collection, userId, doc) {
        const selector = VXApp.makeTransactionsSelector(collection._name, userId, doc)
        return Transactions.findOne(selector)
    },

    /**
     * Create a new transaction set.
     *
     * @param {object} collection Collection.
     * @param {string} domainId User ID.
     * @param {string} userId User ID.
     * @param {object} doc New document (for insert) or previous document (for update).
     * @return {object} Transactions object that was created.
     */
    makeTransactions(collection, domainId, userId, doc) {
        const transactions = {}
        transactions.domain = domainId
        transactions.userId = userId
        transactions.collectionName = collection._name
        transactions.id = doc._id
        transactions.index = 0
        transactions.history = [ doc ]
        OLog.debug(`vxapp.js makeTransactions transactions=${OLog.debugString(transactions)}`)
        Transactions.insert(transactions)
        return transactions
    },

    /**
     * Perform undo processing.
     *
     * @param {object} collectionName Collection name.
     * @param {object} docCurrent Record current state to undo.
     * @return {object} Result object.
     */
    undo(collectionName, docCurrent) {
        try {
            if (!(_.isString(collectionName) && _.isObject(docCurrent))) {
                OLog.error(`vxapp.js undo parameter check failed collectionName=${collectionName} docCurrent=${OLog.errorString(docCurrent)}`)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            const collection = Util.getCollection(collectionName)
            if (!collection) {
                OLog.error(`vxapp.js undo parameter check failed collectionName=${collectionName} unable to find matching Meteor collection`)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            const userId = Meteor.userId()
            if (!userId) {
                OLog.error("vxapp.js undo security check failed user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            const record = collection.findOne(docCurrent._id)
            if (!record) {
                OLog.error(`vxapp.js undo transaction failed failed record does not exist recordId=${docCurrent._id}`)
                return { success : false, icon : "TRIANGLE", key : "common.alert_transaction_fail_record_not_found",
                    variables: { recordId: docCurrent._id } }
            }
            if (record.userModified !== Meteor.userId()) {
                OLog.error(`vxapp.js undo collectionName=${collectionName} _id=${docCurrent._id} ` +
                    `was requested by  ${Util.fetchFullName(Meteor.userId())} but record was ` +
                    `last updated by ${Util.fetchFullName(record.userModified)}`)
                return { success : false, icon : "TRIANGLE", key : "common.alert_transaction_fail_undo_wrong_user",
                    variables: { fullName:Util.fetchFullName(record.userModified) } }
            }
            const transactions = VXApp.findTransactions(collection, userId, docCurrent)
            if (!transactions) {
                OLog.debug(`vxapp.js undo unable to find transaction set collectionName=${collectionName} docCurrent=${OLog.debugString(docCurrent)}`)
                return { success : false, icon : "TRIANGLE", type: "INFO", key : "common.alert_transaction_fail_undo_transactions_not_found" }
            }
            OLog.debug(`vxapp.js undo collectionName=${collectionName} *found* transactions history index=${transactions.index} length=${transactions.history.length}`)
            if (transactions.index === 0) {
                return { success : false, icon : "TRIANGLE", type: "INFO", key : "common.alert_transaction_fail_undo_no_eariler_state" }
            }
            const selector = VXApp.makeTransactionsSelector(collection, userId, docCurrent)
            const docPrevious = transactions.history[transactions.index - 1]
            OLog.debug(`vxapp.js undo attempting to reinstate previous document collectionName=${collectionName} domain=${selector.domain} userId=${userId} selector=${OLog.debugString(selector)}`)
            let result = collection.direct.update(transactions.id, docPrevious, { bypassCollection2: true })
            if (result !== 1) {
                OLog.error(`vxapp.js undo *fail* result=${result} collectionName=${collectionName} domain=${selector.domain} userId=${userId} selector=${OLog.errorString(selector)} docPrevious=${OLog.errorString(docPrevious)}`)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_unable_to_update_record_state" }
            }
            const modifier = {}
            modifier.$inc = {}
            modifier.$inc.index = -1
            result = Transactions.update(selector, modifier)
            if (result !== 1) {
                OLog.error(`vxapp.js undo *fail* result=${result} collectionName=${collectionName} domain=${selector.domain} userId=${userId} selector=${OLog.errorString(selector)} modifier=${OLog.errorString(modifier)}`)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_unable_to_update_transaction_history" }
            }
            OLog.debug(`vxapp.js undo collectionName=${collection._name} domain=${selector.domain} userId=${userId} _id=${docCurrent._id} new index=${transactions.index - 1} length=${transactions.history.length}`)
            return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error(`vxapp.js undo unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Perform redo processing.
     *
     * @param {object} collectionName Collection name
     * @param {object} docCurrent Record current state to redo.
     * @return {object} Result object.
     */
    redo(collectionName, docCurrent) {
        try {
            if (!(_.isString(collectionName) && _.isObject(docCurrent))) {
                OLog.error(`vxapp.js redo parameter check failed collection=${collectionName} docCurrent=${OLog.errorString(docCurrent)}`)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            const collection = Util.getCollection(collectionName)
            if (!collection) {
                OLog.error(`vxapp.js redo parameter check failed collectionName=${collectionName} unable to find matching Meteor collection`)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            const userId = Meteor.userId()
            if (!userId) {
                OLog.error("vxapp.js redo security check failed user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            const record = collection.findOne(docCurrent._id)
            if (!record) {
                OLog.error(`vxapp.js redo transaction failed failed record does not exist recordId=${docCurrent._id}`)
                return { success : false, icon : "TRIANGLE", key : "common.alert_transaction_fail_record_not_found",
                    variables: { recordId: docCurrent._id } }
            }
            if (record.userModified !== Meteor.userId()) {
                OLog.error(`vxapp.js redo collectionName=${collectionName} _id=${docCurrent._id} ` +
                    `was requested by  ${Util.fetchFullName(Meteor.userId())} but record was ` +
                    `last updated by ${Util.fetchFullName(record.userModified)}`)
                return { success : false, icon : "TRIANGLE", key : "common.alert_transaction_fail_redo_wrong_user",
                    variables: { fullName:Util.fetchFullName(record.userModified) } }
            }
            const transactions = VXApp.findTransactions(collection, userId, docCurrent)
            if (!transactions) {
                OLog.debug(`vxapp.js redo unable to find transaction set collectionName=${collectionName} docCurrent=${OLog.debugString(docCurrent)}`)
                return { success : false, icon : "TRIANGLE", type: "INFO", key : "common.alert_transaction_fail_redo_transactions_not_found" }
            }
            OLog.debug(`vxapp.js redo collectionName=${collectionName} *found* transactions history index=${transactions.index} length=${transactions.history.length}`)
            if (transactions.index === transactions.history.length - 1) {
                return { success : false, icon : "TRIANGLE", type: "INFO", key : "common.alert_transaction_fail_redo_no_later_state" }
            }
            const selector = VXApp.makeTransactionsSelector(collection, userId, docCurrent)
            const docNext = transactions.history[transactions.index + 1]
            OLog.debug(`vxapp.js redo attempting to reinstate next document collectionName=${collectionName} domain=${selector.domain} userId=${userId} selector=${OLog.debugString(selector)}`)
            let result = collection.direct.update(transactions.id, docNext, { bypassCollection2: true })
            if (result !== 1) {
                OLog.error(`vxapp.js redo *fail* result=${result} collectionName=${collection._name} domain=${selector.domain} userId=${userId} selector=${OLog.errorString(selector)} docNext=${OLog.errorString(docNext)}`)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_unable_to_update_record_state" }
            }
            const modifier = {}
            modifier.$inc = {}
            modifier.$inc.index = 1
            result = Transactions.update(selector, modifier)
            if (result !== 1) {
                OLog.error(`vxapp.js redo *fail* result=${result} collectionName=${collectionName} domain=${selector.domain} userId=${userId} selector=${OLog.errorString(selector)} modifier=${OLog.errorString(modifier)}`)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_unable_to_update_transaction_history" }
            }
            OLog.debug(`vxapp.js redo collectionName=${collectionName} domain=${selector.domain} userId=${userId} _id=${docCurrent._id} new index=${transactions.index + 1} length=${transactions.history.length}`)
            return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error(`vxapp.js redo unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Execute arbitrary VXApp function on server (only available to Super Administrators).
     *
     * @param {string} functionName Name of VXApp server-side function to invoke.
     * @param {array} args Additional arguments if any.
     */
    serverExecute(functionName, ...args) {
        try {
            if (!_.isString(functionName)) {
                OLog.error(`vxapp.js serverExecute parameter check failed functionName=${functionName}`)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed" }
            }
            const userId = Meteor.userId()
            if (!userId) {
                OLog.error("vxapp.js serverExecute security check failed user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            if (!Util.isUserSuperAdmin(userId)) {
                OLog.error("vxapp.js serverExecute security check failed only Super Administrators can invoke server-side functions arbitrarily")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            OLog.debug(`vxapp.js serverExecute *invoking* functionName=${functionName} args=${args}`)
            return VXApp[functionName](...args)
        }
        catch (error) {
            OLog.error(`vxapp.js serverExecute unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Execute arbitrary user-written function on server (only available to Super Administrators).
     *
     * @param {string} name Name of user-written Function to invoke.
     * @param {array} args Additional arguments if any.
     * @return {?} Return from function if any.
     */
    serverExecuteFunction(name, ...args) {
        try {
            if (!_.isString(name)) {
                OLog.error(`vxapp.js serverExecuteFunction parameter check failed name=${name}`)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed" }
            }
            const userId = Meteor.userId()
            if (!userId) {
                OLog.error("vxapp.js serverExecuteFunction security check failed user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            if (!Util.isUserSuperAdmin(userId)) {
                OLog.error("vxapp.js serverExecuteFunction security check failed only Super Administrators can invoke server-side functions arbitrarily")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            const domainId = Util.getCurrentDomainId(userId)
            OLog.debug(`vxapp.js serverExecuteFunction *invoking* domainId=${domainId} name=${name} args=${args}`)
            return VXApp.executeFunction(domainId, name, ...args)
        }
        catch (error) {
            OLog.error(`vxapp.js serverExecuteFunction unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * For RESTORE deployment action, return an array of snapshots in a
     * form used to populate the snapshot dropdown.
     *
     * @param {object} formObject Form object from deployment modal.
     * @return {object} Result object.
     */
    makeSnapshotArray(formObject) {
        try {
            const targetDomainName = Util.fetchDomainName(formObject.targetDomain)
            let history = History.findOne( { domain: formObject.targetDomain } )
            if (!history) {
                return { success : false, key : "common.alert_deployment_message_no_history", variables : { targetDomainName } }
            }
            const snapshotArray = history.snapshots.map((snapshot, index) => {
                return { code: index, localized : Util.i18n("common.alert_deployment_snapshot_option",
                    { targetDomainName, dateTime : Util.formatDateTime(snapshot.date) } ) }
            })
            snapshotArray.sort((recordA, recordB) => {
                return recordB.code - recordA.code
            })
            snapshotArray.unshift( { code: "", localized: "" } )
            return { success : true, snapshotArray }
        }
        catch (error) {
            OLog.error(`vxapp.js makeSnapshotArray unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * For RESTORE deployment action, return i18n bundle key and variables
     * used to populate a text area in the deployment modal.
     *
     * @param {object} formObject Form object from deployment modal.
     * @return {object} Result object.
     */
    deploymentMessage(formObject) {
        try {
            const targetDomainName = Util.fetchDomainName(formObject.targetDomain)
            let history = History.findOne( { domain: formObject.targetDomain } )
            if (!history) {
                return { success : false, key : "common.alert_deployment_message_no_history", variables : { targetDomainName } }
            }
            const snapshot = history.snapshots[formObject.snapshotIndex]
            const dateTime = Util.formatDateTime(snapshot.date)
            return { success : true, key: "common.alert_deployment_message_restore", variables : { targetDomainName, dateTime } }
        }
        catch (error) {
            OLog.error(`vxapp.js deploymentMessage unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Check all collections in source domain to ensure that name fields are present
     * and unique for all records.
     *
     * @param {object} formObject Form object from deployment modal.
     * @return {object} Result object.
     */
    checkSourceDomainNames(formObject) {
        try {
            const messages = []
            const deploymentCollections = VXApp.getDeploymentCollections()
            _.each(deploymentCollections, collection => {
                const alreadyReported = []
                _.each(collection.find( { domain: formObject.sourceDomain, dateRetired : { $exists : false } } ).fetch(), record => {
                    if (!record.name) {
                        messages.push( { key : "common.alert_deployment_name_missing", variables: { collectionName : collection._name } } )
                        return
                    }
                    const count = collection.find( { domain: formObject.sourceDomain, dateRetired : { $exists : false }, name : record.name } ).count()
                    if (count > 1 && !alreadyReported.includes(record.name)) {
                        alreadyReported.push(record.name)
                        messages.push( { key : "common.alert_deployment_name_duplicate", variables: { collectionName : collection._name, name : record.name } } )
                        return
                    }
                })
            })
            if (messages.length === 0) {
                return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success" }
            }
            let issues = ""
            messages.forEach(message => {
                issues += Util.i18n(message.key, message.variables) + "\n"
            })
            return { success : false, key: "common.alert_deployment_name_issues", variables : { issues } }
        }
        catch (error) {
            OLog.error(`vxapp.js deploymentMessage unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Perform deployment action.
     *
     * @param {object} formObject Form object from deployment modal.
     * @return {object} Result object.
     */
    executeDeploymentAction(formObject) {
        try {
            if (!_.isObject(formObject)) {
                OLog.error(`vxapp.js executeDeploymentAction parameter check failed formObject=${OLog.errorString(formObject)}`)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            const userId = Meteor.userId()
            if (!userId) {
                OLog.error("vxapp.js executeDeploymentAction security check failed user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            if (!Util.isUserSuperAdmin(userId)) {
                OLog.error("vxapp.js executeDeploymentAction security check failed only Super Administrators can execute deployment actions")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            switch (formObject.deploymentAction) {
            case "COPY" : return VXApp.executeDeploymentCopy(formObject, userId)
            case "RESTORE" : return VXApp.executeDeploymentRestore(formObject)
            }
        }
        catch (error) {
            OLog.error(`vxapp.js executeDeploymentAction unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Copy one domain to another.
     *
     * @param {object} formObject Form object from deployment modal.
     * @param {string} userId User ID invoking this action.
     * @return {object} Result object.
     */
    executeDeploymentCopy(formObject, userId) {
        OLog.debug(`vxapp.js executeDeploymentCopy userId=${userId} deploymentAction=${formObject.deploymentAction} ` +
            `sourceTenant=${formObject.sourceTenant} sourceDomain=${formObject.sourceDomain} ` +
            `targetTenant=${formObject.targetTenant} targetDomain=${formObject.targetDomain}`)
        let history = History.findOne( { domain: formObject.targetDomain } )
        if (!history) {
            history = {}
            history.domain = formObject.targetDomain
            history.snapshots = []
            const historyId = History.insert(history)
            history = History.findOne(historyId)
        }
        const snapshot = {}
        snapshot.userId = userId
        snapshot.date = new Date()
        snapshot.sourceDomain = formObject.sourceDomain
        snapshot.targetDomain = formObject.targetDomain
        snapshot.collections = []
        const deploymentCollections = VXApp.getDeploymentCollections()
        _.each(deploymentCollections, collection => {
            const snapshotCollection = {}
            snapshotCollection.collectionName = collection._name
            snapshotCollection.records = collection.find( { domain: formObject.targetDomain, dateRetired : { $exists : false } } ).fetch()
            OLog.debug(`vxapp.js executeDeploymentCopy *captured* collectionName=${snapshotCollection.collectionName} ` +
                ` record count=${snapshotCollection.records.length}`)
            snapshot.collections.push(snapshotCollection)
        })
        history.snapshots.push(snapshot)
        const result = History.direct.update(history._id, history, { bypassCollection2: true })
        if (result !== 1) {
            OLog.error(`vxapp.js executeDeploymentCopy deploymentAction=${formObject.deploymentAction} *fail* result=${result}`)
            return { success : false, icon : "BUG", key : "common.alert_transaction_fail_unable_to_update_deployment_history" }
        }
        OLog.debug(`vxapp.js executeDeploymentCopy snapshot created in historyId=${history._id}`)
        if (formObject.copyDeploymentCollections) {
            OLog.debug("vxapp.js executeDeploymentCopy copying deployment collections")
            _.each(deploymentCollections, collection => {
                const fields = VXApp.deploymentCopyFields(collection)
                // Fetch retired target records to get them removed from target domain (see synchronizeCollection)
                const sourceRecords = collection.find( { domain: formObject.sourceDomain, dateRetired : { $exists : false } },
                    { fields } ).fetch()
                const targetRecords = collection.find( { domain: formObject.targetDomain } ).fetch()
                VXApp.synchronizeCollection(formObject, collection, sourceRecords, targetRecords)
            })
        }
        if (formObject.copyDomainSettings) {
            OLog.debug("vxapp.js executeDeploymentCopy copying domain settings")
            VXApp.copyDomainProperties(formObject.sourceDomain, formObject.targetDomain)
        }
        OLog.debug("vxapp.js executeDeploymentCopy *finished* copy operation completed")
        return { success : true, icon : "CLONE", key : "common.alert_deployment_copy_success",
            variables : { sourceDomainName : Util.fetchDomainName(formObject.sourceDomain),
                targetDomainName : Util.fetchDomainName(formObject.targetDomain) } }
    },

    /**
     * Given a collection, locate deployment copy fields specification if any and return them.
     * This allows us to exclude fields from the copied records.
     *
     * @param {object} collection Collection being copied.
     * @return {object} MongoDB fields specification if any.
     */
    deploymentCopyFields(collection) {
        const codeObjects = Util.getCodeObjects("entityType")
        const entityTypeObject = _.findWhere(codeObjects, { collection: collection._name })
        OLog.debug(`vxapp.js deploymentCopyFields name=${collection._name} entityTypeObject=${OLog.debugString(entityTypeObject)}`)
        const fields = entityTypeObject.deploymentCopyFields
        if (fields) {
            OLog.debug(`vxapp.js deploymentCopyFields collection name ${collection._name} fields=${OLog.debugString(fields)}`)
        }
        return fields
    },

    /**
     * Copy domain properties from source domain to target domain.
     *
     * @param {string} sourceDomain Source domain ID.
     * @param {string} targetDomain Target domain ID.
     */
    copyDomainProperties(sourceDomainId, targetDomainId) {
        const sourceDomain = Domains.findOne(sourceDomainId)
        const targetDomain = Domains.findOne(targetDomainId)
        if (!(sourceDomain && targetDomain)) {
            OLog.error("vxapp.js copyDomainProperties " +
                `sourceDomainId=${sourceDomainId} ` +
                `targetDomainId=${targetDomainId} ` +
                "*failed* unable to fetch source or target domain record")
            return
        }
        const modifier = {}
        modifier.$set = { ...sourceDomain }
        delete modifier.$set._id
        delete modifier.$set.tenant
        delete modifier.$set.dateCreated
        delete modifier.$set.userCreated
        delete modifier.$set.dateModified
        delete modifier.$set.userModified
        delete modifier.$set.name
        delete modifier.$set.description
        delete modifier.$set.subsystemStatus
        delete modifier.$set.billingAddress1
        delete modifier.$set.billingCity
        delete modifier.$set.billingState
        delete modifier.$set.billingZip
        if (VXApp.doAppMutateModifierForDomainCopy) {
            VXApp.doAppMutateModifierForDomainCopy(modifier)
        }
        OLog.debug("vxapp.js copyDomainProperties " +
            `sourceDomainId=${sourceDomainId} ` +
            `targetDomainId=${targetDomainId} modifier=${OLog.debugString(modifier)}`)
        Domains.direct.update(targetDomainId, modifier)
    },

    /**
     * Restore a previously-created domain snapshot.
     *
     * @param {object} formObject Form object from deployment modal.
     * @return {object} Result object.
     */
    executeDeploymentRestore(formObject) {
        let history = History.findOne( { domain: formObject.targetDomain } )
        if (!history) {
            OLog.error(`vxapp.js executeDeploymentRestore *fail* unable to find history of targetDomainName=${Util.fetchDomainName(formObject.targetDomain)}`)
            return { success : false, icon : "BUG", key : "common.alert_transaction_fail_unable_to_find_deployment_history",
                variables: { targetDomainName : Util.fetchDomainName(formObject.targetDomain) } }
        }
        const snapshot = history.snapshots[formObject.snapshotIndex]
        const deploymentCollections = VXApp.getDeploymentCollections()
        _.each(snapshot.collections, snapshotCollection => {
            OLog.debug(`vxapp.js executeDeploymentRestore collectionName=${snapshotCollection.collectionName} record count=${snapshotCollection.records.length}`)
            const collection = _.find(deploymentCollections, deploymentCollection => deploymentCollection._name === snapshotCollection.collectionName)
            if (!collection) {
                OLog.error(`vxapp.js executeDeploymentRestore unable to find deployment collection matching collectionName=${snapshotCollection.collectionName}`)
                return
            }
            let sourceRecords = snapshotCollection.records
            let targetRecords = collection.find( { domain: formObject.targetDomain } ).fetch()
            VXApp.synchronizeCollection(formObject, collection, sourceRecords, targetRecords)
        })
        OLog.debug(`vxapp.js executeDeploymentRestore *success* historyId=${history._id} index=${formObject.snapshotIndex}`)
        return { success : true, icon : "HISTORY", key : "common.alert_deployment_restored_success",
            variables : { targetDomainName : Util.fetchDomainName(formObject.targetDomain), dateTime : Util.formatDateTime(snapshot.date) } }
    },

    /**
     * Synchronize source and target record sets making them match exactly.
     */
    synchronizeCollection(formObject, collection, sourceRecords, targetRecords) {
        OLog.debug(`vxapp.js synchronizeCollection collectionName=${collection._name} ` +
            `source count=${sourceRecords.length} target count=${targetRecords.length}`)
        _.each(sourceRecords, sourceRecord => {
            const targetRecord = _.findWhere(targetRecords, { name : sourceRecord.name })
            if (targetRecord) {
                OLog.debug(`vxapp.js synchronizeCollection collectionName=${collection._name} updating name=${sourceRecord.name} ` +
                    ` sourceRecordId=${sourceRecord._id} targetRecordId=${targetRecord._id}`)
                const sourceRecordId = sourceRecord._id
                delete sourceRecord._id
                sourceRecord.dateModified = new Date()
                sourceRecord.userModified = Meteor.userId()
                sourceRecord.domain = formObject.targetDomain
                const result = collection.direct.update(targetRecord._id, sourceRecord, { bypassCollection2: true })
                if (result !== 1) {
                    OLog.error(`vxapp.js synchronizeCollection collectionName=${collection._name} ` +
                        `sourceRecordId=${sourceRecordId} targetRecordId=${targetRecord._id} result=${result}`)
                }
                targetRecords = _.without(targetRecords, _.findWhere(targetRecords, { _id : targetRecord._id }))
            }
            else {
                OLog.debug(`vxapp.js synchronizeCollection collectionName=${collection._name} inserting name=${sourceRecord.name} ` +
                    ` sourceRecordId=${sourceRecord._id}`)
                delete sourceRecord._id
                sourceRecord.dateModified = new Date()
                sourceRecord.userModified = Meteor.userId()
                sourceRecord.domain = formObject.targetDomain
                collection.direct.insert(sourceRecord)
            }
        })
        _.each(targetRecords, targetRecord => {
            OLog.debug(`vxapp.js synchronizeCollection collectionName=${collection._name} removing name=${targetRecord.name} ` +
                ` targetRecordId=${targetRecord._id}`)
            collection.direct.remove(targetRecord._id)
        })
    },

    /**
     * Generate events and notifications when a user logs in.
     *
     * @param {string} userId User ID.
     */
    onLogin(userId) {
        if (!userId) {
            return
        }
        OLog.debug(`vxapp.js onLogin email=${Util.getUserEmail(userId)}`)
        const domainId = Util.getCurrentDomainId(userId)
        const eventData = { userId: userId, email: Util.getUserEmail(userId) }
        if (VXApp.isRecentEvent("USER_LOGIN", domainId, userId, 3600)) {
            return
        }
        VXApp.createEvent("USER_LOGIN", domainId, eventData, { userName: Util.fetchFullName(userId) } )
    },

    /**
     * Generate events and notifications when a user logs out.
     *
     * @param {string} userId User ID.
     */
    onLogout(userId) {
        if (!userId) {
            return
        }
        OLog.debug(`vxapp.js onLogout email=${Util.getUserEmail(userId)}`)
        const domainId = Util.getCurrentDomainId(userId)
        const eventData = { userId: userId, email: Util.getUserEmail(userId) };
        if (VXApp.isRecentEvent("USER_LOGOUT", domainId, userId, 3600)) {
            return
        }
        VXApp.createEvent("USER_LOGOUT", domainId, eventData, { userName: Util.fetchFullName(userId) } )
    },

    /**
     * Determine whether there is a recent event of specified type and key.
     *
     * @param {string} type Event type.
     * @param {string} domainId Domain ID.
     * @param {string} userId  User ID to match with event data.
     * @param {number} seconds Number of seconds that defines "recent".
     * @return {boolean} True if there exists a recent event of the specified type.
     */
    isRecentEvent : function(type, domainId, userId, seconds) {
        const cutoff = moment().subtract(seconds, "seconds").toDate()
        const event = Events.findOne( { type: type, domain: domainId, "eventData.userId" : userId, date: { $gte: cutoff } } );
        OLog.debug(`vxapp.js isRecentEvent=${type} domainId=${domainId} userId=${userId} seconds=${seconds} ` +
            ` after cutoff=${cutoff} event=${event}`)
        return !!event
    },

    /**
     * Execute function supplied as string.
     *
     * @param {string} functionString Function as string.
     * @param {object} data Data passed to function
     * @return {?} Return value
     */
    eval(functionString, data) {
        try {
            const func = eval(`(${functionString})`)
            return func.call(data, data)
        }
        catch (error) {
            console.log("vxapp.js eval function error", functionString)
            console.log("vxapp.js eval error", error)
        }
    },

    /**
     * Deploy all functions. Each tenant has their own function anchor, so we must
     * iterate over the tenants to create the anchors and deploy the functions.
     */
    deployAllFunctions() {
        Tenants.find( { dateRetired: { $exists: false } }).forEach(tenant => {
            if (!tenant.functionAnchor) {
                OLog.debug(`vxapp.js deployAllFunctions tenant ${tenant.name} does not have a function anchor ` +
                    "no functions will be deployed on their behalf")
                return
            }
            Domains.find( { dateRetired : { $exists: false }, tenant: tenant._id }).forEach(domain => {
                const functionAnchor = VXApp.functionAnchorForDomain(domain._id)
                const qualifiedFunctionAnchor = VXApp.qualifiedFunctionAnchor(functionAnchor, domain._id)
                const fullyQualifiedFunctionAnchor = VXApp.fullyQualifiedFunctionAnchor(qualifiedFunctionAnchor)
                OLog.debug(`vxapp.js deployAllFunctions *instantiating* ${fullyQualifiedFunctionAnchor}`)
                FunctionAnchors[qualifiedFunctionAnchor] = {}
                Functions.find({ dateRetired : { $exists: false }, domain: domain._id }).forEach(funktion => {
                    VXApp.deployFunction(funktion._id)
                })
            })
        })
    },

    /**
     * Deploy a user-written function.
     *
     * @param {string} functionId Function ID to deploy.
     */
    deployFunction(functionId) {
        let adjustedFunction
        try {
            const newFunction = Functions.findOne(functionId)
            if (!newFunction) {
                OLog.error(`vxapp.js deployFunction unable to find functionId=${functionId}`)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_function_not_found",
                    variables : { functionId : functionId } }
            }
            const functionAnchor = VXApp.functionAnchorForDomain(newFunction.domain)
            const qualifiedFunctionAnchor = VXApp.qualifiedFunctionAnchor(functionAnchor, newFunction.domain)
            const fullyQualifiedFunctionAnchor = VXApp.fullyQualifiedFunctionAnchor(qualifiedFunctionAnchor)
            if (!FunctionAnchors[qualifiedFunctionAnchor]) {
                OLog.debug(`vxapp.js deployFunction *instantiating* ${fullyQualifiedFunctionAnchor}`)
                FunctionAnchors[qualifiedFunctionAnchor] = {}
            }
            if (!newFunction.name) {
                OLog.debug(`vxapp.js deployFunction no name yet ignoring functionId=${functionId}`)
                return { success: true, icon: "ENVELOPE", key: "common.alert_transaction_success" }
            }
            if (typeof newFunction.name === "string") {
                delete FunctionAnchors[qualifiedFunctionAnchor][newFunction.name]
            }
            if (!newFunction.value) {
                OLog.debug(`vxapp.js deployFunction no value supplied implicitly deleting functionId=${functionId}`)
                return { success: true, icon: "ENVELOPE", key: "common.alert_transaction_success" }
            }
            adjustedFunction =
                VXApp.replaceFunctionAnchorReferences(newFunction.value, functionAnchor, fullyQualifiedFunctionAnchor)
            adjustedFunction = VXApp.augmentFunctionWithName(adjustedFunction, newFunction.name)
            const func = eval(`(${adjustedFunction})`)
            if (typeof newFunction.name === "string" && typeof func === "function") {
                FunctionAnchors[qualifiedFunctionAnchor][newFunction.name] = func
            }
            OLog.debug(`vxapp.js deployFunction has added ${fullyQualifiedFunctionAnchor}.${newFunction.name} ` +
                `resulting in keys=${Object.keys(FunctionAnchors[qualifiedFunctionAnchor])}`)
            return { success: true, icon: "ENVELOPE", key: "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error(`vxapp.js deployFunction unexpected error=${OLog.errorError(error)} adjustedFunction=${adjustedFunction}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Replace unqualified references to the function anchor with fully-qualified names.
     *
     * @param {string} value Raw function text from function collection.
     * @param {string} functionAnchor Function anchor from tenant.
     * @param {string} fullyQualifiedFunctionAnchor Fully-qualified function anchor.
     * @return {string} Function text with all function fully-qualified references replaced.
     */
    replaceFunctionAnchorReferences(value, functionAnchor, fullyQualifiedFunctionAnchor) {
        const regExp = new RegExp(functionAnchor, "g")
        return value.replace(regExp, fullyQualifiedFunctionAnchor)
    },

    /**
     * Augment VXApp calls with the name of the function for diagnostic support.
     *
     * @param {string} value Raw function text from function collection.
     * @param {string} functionName Function name.
     * @return {string} Function text with all makeTask calls augmented.
     */
    augmentFunctionWithName(value, functionName) {
        const replacement = `, "${functionName}"`
        let indexVXApp = value.indexOf("VXApp")
        while (indexVXApp >= 0) {
            const indexStartParen = value.indexOf("(", indexVXApp)
            const indexEndParen = value.indexOf(")", indexStartParen)
            value = `${value.substring(0, indexEndParen)}${replacement}` +
                `${value.substr(indexEndParen)}`
            indexVXApp = value.indexOf("VXApp", indexEndParen + replacement.length)
        }
        return value
    },

    /**
     * Execute arbitrary user-written function on server.
     *
     * @param {string} domainId Domain ID.
     * @param {string} name Name of user-written function.
     * @param {array} args Additional arguments if any.
     * @return {?} Return from function if any.
     */
    executeFunction(domainId, name, ...args) {
        const functionAnchor = VXApp.functionAnchorForDomain(domainId)
        const qualifiedFunctionAnchor = VXApp.qualifiedFunctionAnchor(functionAnchor, domainId)
        const funktion = FunctionAnchors[qualifiedFunctionAnchor][name]
        if (!funktion) {
            OLog.error(`vxapp.js executeFunction unable to find function name domainId=${domainId} name=${name} ` +
                `qualifiedFunctionAnchor=${qualifiedFunctionAnchor}`)
            return false
        }
        // OLog.debug(`vxapp.js executeFunction domainId=${domainId} name=${name} *execute*`)
        return FunctionAnchors[qualifiedFunctionAnchor][name](...args)
    },

    /**
     * Determine whether two-factor authentication is enabled for a given user email.
     *
     * @param {string} email Email.
     * @param {string} password Password.
     * @return {object} Standard result object bearing indicator of whether 2FA is enabled.
     */
    isTwoFactorEnabled(email, password) {
        try {
            const user = Accounts.findUserByEmail(email)
            if (!user) {
                OLog.debug(`vxapp.js isTwoFactorEnabled unable to find user associated with email=${email}`)
                return { success : false, icon : "EYE", key : "common.invalid_user_not_found" }
            }
            const result = Accounts._checkPassword(user, password)
            if (result.error) {
                OLog.debug(`vxapp.js isTwoFactorEnabled incorrect password for email=${email} error=${result.error}`)
                return { success : false, icon : "BUG", key : "common.invalid_password_incorrect", error: result.error }
            }
            const twoFactorEnabled = !!user.twoFactorEnabled
            return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success", twoFactorEnabled }
        }
        catch (error) {
            OLog.error(`vxapp.js isTwoFactorEnabled unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Generate and return a secret for 2FA.
     *
     * @return {object} Standard result object bearing secret.
     */
    generateSecret() {
        try {
            const secret = authenticator.generateSecret()
            OLog.debug("vxapp.js generateSecret successfully generated secret")
            return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success", secret }
        }
        catch (error) {
            OLog.error(`vxapp.js generateSecret unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Check a 2FA token against a secret; if valid, update the user record to enable 2FA.
     *
     * @param {string} email Email.
     * @param {string} token Token (six digits).
     * @param {string} secret Secret.
     * @return {object} Standard result object.
     */
    verifyAndEnableTwoFactor(email, token, secret) {
        try {
            const user = Accounts.findUserByEmail(email)
            if (!user) {
                OLog.debug(`vxapp.js verifyAndEnableTwoFactor unable to find user associated with email=${email}`)
                return { success : false, icon : "EYE", key : "common.invalid_user_not_found" }
            }
            const valid = authenticator.check(token, secret)
            OLog.debug(`vxapp.js verifyAndEnableTwoFactor ${Util.getUserEmail(user)} token=${token} secret=${secret} valid=${valid}`)
            if (!valid) {
                return { success: false, icon: "TRIANGLE", key: "common.alert_invalid_2fa_token" }
            }
            const modifier = {}
            modifier.$set = {}
            modifier.$set.twoFactorEnabled = true
            modifier.$set["services.twoFactorSecret"] = secret
            Meteor.users.update(user._id, modifier)
            OLog.debug(`vxapp.js verifyAndEnableTwoFactor ${Util.getUserEmail(user)} *enabled*`)
            return { success : true, icon : "CHECK", key : "common.alert_valid_2fa_token" }
        }
        catch (error) {
            OLog.error(`vxapp.js generateSecret unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Disable 2FA on behalf of either the current user or a specified user.
     *
     * @param {string} userId Optional user ID.
     * @return {object} Standard result object.
     */
    disableTwoFactor(userId) {
        try {
            if (userId && !Util.isUserAdmin(Meteor.userId())) {
                OLog.error(`vxapp.js disableTwoFactor security check failed userId supplied but invoking user ${Util.fetchFullName(Meteor.userId())} is not an administrator`)
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            userId = userId || Meteor.userId()
            const user = Util.fetchUserLimited(Meteor.userId())
            if (!user) {
                OLog.error(`vxapp.js disableTwoFactor unable to find userId=${userId}`)
                return { success: false, icon: "BUG", key: "common.alert_transaction_fail_user_not_found", variables: { userId: userId } }
            }
            const modifier = {}
            modifier.$unset = {}
            modifier.$unset.twoFactorEnabled = ""
            modifier.$unset["services.twoFactorSecret"] = ""
            Meteor.users.update(userId, modifier)
            OLog.debug(`vxapp.js disableTwoFactor ${Util.getUserEmail(user)} *disabled*`)
            return { success : true, type : "INFO", icon : "RETIRE", key : "common.alert_2fa_disabled" }
        }
        catch (error) {
            OLog.error(`vxapp.js disableTwoFactor unexpected error=${OLog.errorError(error)}`)
            return { success : false, icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Compute two-factor secret hash (base-64).
     *
     * @param {object} user User record.
     * @return {string} Two-factor secret hash.
     */
    computeTwoFactorSecretHash(user) {
        if (!(user.twoFactorEnabled && user.services.twoFactorSecret)) {
            return
        }
        return crypto.createHash("sha256").update(user.services.twoFactorSecret).digest("base64")
    },

    /**
     * Convert a given image at the end of a URL to data URL format.
     *
     * @param {string} url Web URL pointing to image.
     * @return {string} Data URL.
     */
    async toDataUrl(url) {
        try {
            if (!_.isString(url)) {
                OLog.error(`vxapp.js toDataUrl parameter check failed url=${url}`)
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            if (!Meteor.userId()) {
                OLog.error("vxapp.js toDataUrl security check failed user is not logged in")
                return { success: false, icon: "EYE", key: "common.alert_security_check_failed" }
            }
            const response = await fetch(url)
            const arrayBuffer = await response.arrayBuffer()
            const dataUrl = `data:image/jpeg;base64,${VXApp.arrayBufferToBase64(arrayBuffer)}`
            return { success: true, icon: "CHECK", key: "common.alert_transaction_success", dataUrl: dataUrl }
        }
        catch (error) {
            OLog.error(`vxapp.js toDataUrl unexpected error=${OLog.errorError(error)}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() } }
        }
    },

    /**
     * Convert the supplied buffer into Base64 form.
     *
     * @param {object} buffer Array buffer.
     * @return {sting} Base64-encoded string.
     */
    arrayBufferToBase64(buffer) {
        let binary = ""
        const bytes = new Uint8Array(buffer)
        const len = bytes.byteLength
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[ i ])
        }
        return new Buffer(binary, "binary").toString("base64")
    },

    /**
     * Return an array of all domain-partitioned collections.
     *
     * @return {array} Array of domain-partitioned collections.
     */
    getDomainCollections() {
        let collections = [ Events, Functions, Transactions, Notifications, Reports, Templates ]
        if (VXApp.getAppDomainCollections) {
            collections = [ ...collections, ...VXApp.getAppDomainCollections() ]
        }
        return collections
    },

    /**
     * Return the deployment collections.
     *
     * @return {array} Array of deployment collections.
     */
    getDeploymentCollections() {
        let collections = [ Functions ]
        if (VXApp.getAppDeploymentCollections) {
            collections = [ ...collections, ...VXApp.getAppDeploymentCollections() ]
        }
        return collections
    },

    /**
     * Send a report in HTML format to a distribution list of recipients.
     *
     * @param {string} reportId ID of report to send.
     * @param {string} recipients List of recipients.
     * @param {boolean} attachments True to attach complementary Excel spreadsheets to each email.
     * @return {object} Standard result object.
     */
    async sendReportEmail(reportId, recipients, attachments) {
        try {
            if (!(_.isString(reportId) && _.isString(recipients) && (Util.isNullish(attachments) || _.isBoolean(attachments)))) {
                OLog.error(`vxapp.js sendReportEmail parameter check failed reportId=${reportId} recipients=${recipients}`)
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            const report  = Reports.findOne(reportId)
            if (!report) {
                OLog.error(`vxapp.js sendReportEmail unable to find reportId=${reportId}`)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_report_not_found",
                    variables : { reportId : reportId } }
            }
            const reportData = VXApp.makeReportData(report)
            const from = Util.i18n("common.label_mail_from")
            const subject = report.name
            const html = VXApp.makeReportHtml(report, reportData, true, true)
            const fileName = attachments ? reportData.name || Util.i18n("common.label_date_undefined") : null
            const data = attachments ? VXApp.makeReportSpreadsheet(report, reportData) : null
            const recipientArray = recipients.split(";")
            for (let index = 0; index < recipientArray.length; index++) {
                const recipient = recipientArray[index]?.trim()
                const result = await Service.sendEmail(report.domain, from, recipient, subject, html, null, fileName, data)
                if (!result.success) {
                    return { success: false, icon: "TRIANGLE", key: "common.alert_send_report_email_fail",
                        variables: { error: result.error.toString() } }
                }
            }
            return { success: true, icon: "PLANE", key: "common.alert_send_report_email_success" }
        }
        catch (error) {
            OLog.error(`vxapp.js sendReportEmail unexpected error=${OLog.errorError(error)} stack=${error.stack}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString(), stack: error.stack } }
        }
    },

    /**
     * Send a report in HTML format to a custom distribution list via a distribution function.
     *
     * @param {string} reportId ID of report to send.
     * @param {string} distributionFunctionId Distribution function ID.
     * @param {boolean} attachments True to attach Excel spreadsheets to each email.
     * @return {object} Standard result object.
     */
    async sendReportEmailCustom(reportId, distributionFunctionId, attachments) {
        try {
            if (!(_.isString(reportId) && _.isString(distributionFunctionId) &&
                (Util.isNullish(attachments) || _.isBoolean(attachments)))) {
                OLog.error(`vxapp.js sendReportEmailCustom parameter check failed reportId=${reportId} ` +
                    `distributionFunctionId=${distributionFunctionId}`)
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            const report  = Reports.findOne(reportId)
            if (!report) {
                OLog.error(`vxapp.js sendReportEmailCustom unable to find reportId=${reportId}`)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_report_not_found",
                    variables : { reportId : reportId } }
            }
            const distroArray = VXApp.makeDistroArray(report, distributionFunctionId)
            if (!distroArray) {
                OLog.error(`vxapp.js sendReportEmailCustom unable to make distro array for reportId=${reportId} ` +
                    `distributionFunctionId=${distributionFunctionId}`)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_unable_to_make_report_distro",
                    variables : { distributionFunctionId } }
            }
            for (let distroIndex = 0; distroIndex < distroArray.length; distroIndex++) {
                const distro = distroArray[distroIndex]
                if (!(distro.fieldsOverlay && distro.recipients)) {
                    OLog.error(`vxapp.js sendReportEmailCustom invalid distro for reportId=${reportId} ` +
                        `distributionFunctionId=${distributionFunctionId} distro=${OLog.errorString(distro)}`)
                    return
                }
                const reportPrime = Util.clone(report)
                reportPrime.fields = reportPrime.fields || []
                reportPrime.fields = unionBy(distro.fieldsOverlay, reportPrime.fields, "metadataPath")
                const reportData = VXApp.makeReportData(reportPrime)
                const from = Util.i18n("common.label_mail_from")
                const subject = report.name
                const html = VXApp.makeReportHtml(report, reportData, true, true)
                const fileName = attachments ? reportData.name || Util.i18n("common.label_date_undefined") : null
                const data = attachments ? VXApp.makeReportSpreadsheet(report, reportData) : null
                const recipientArray = distro.recipients.split(";")
                for (let index = 0; index < recipientArray.length; index++) {
                    const recipient = recipientArray[index]?.trim()
                    OLog.debug(`vxapp.js sendReportEmailCustom reportId=${reportId} ` +
                        `distributionFunctionId=${distributionFunctionId} sending reportPrime=${OLog.debugString(reportPrime)}`)
                    const result = await Service.sendEmail(report.domain, from, recipient, subject, html, null, fileName, data)
                    if (!result.success) {
                        OLog.error(`vxapp.js sendReportEmailCustom invalid distro for reportId=${reportId} ` +
                            `distributionFunctionId=${distributionFunctionId} result=${OLog.errorString(result)}`)
                    }
                }
            }
            return { success: true, icon: "PLANE", key: "common.alert_send_report_email_success" }
        }
        catch (error) {
            OLog.error(`vxapp.js sendReportEmail unexpected error=${OLog.errorError(error)} stack=${error.stack}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString(), stack: error.stack } }
        }
    },

    /**
     * Create a distribution array for a report via a user-defined function.
     *
     * @param {object} report Report object.
     * @param {string} distributionFunctionId Distribution function ID.
     * @return {array} Distribution array of objects.
     */
    makeDistroArray(report, distributionFunctionId) {
        try {
            const name = VXApp.fetchFunctionField(distributionFunctionId, "name")
            if (!name) {
                OLog.error("vxapp.js makeDistroArray unable to fetch function name of " +
                    `distributionFunctionId=${distributionFunctionId})`)
                return
            }
            const data = {}
            data.report = report
            const distroArray = VXApp.executeFunction(report.domain, name, data)
            OLog.debug(`vxapp.js makeDistroArray functionName=${name} reportName=${report.name} returned distroArray=${OLog.debugString(distroArray)}`)
            return distroArray
        }
        catch (error) {
            OLog.error(`vxapp.js makeDistroArray unexpected error=${error.toString()}`)
            return
        }
    },

    /**
     * Fetch report data server-side.
     *
     * @param {string} reportId ID of report to send.
     * @return {object} Standard result object.
     */
    fetchReportData(reportId) {
        try {
            if (!_.isString(reportId)) {
                OLog.error(`vxapp.js fetchReportData parameter check failed reportId=${reportId}`)
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            if (!Meteor.userId()) {
                OLog.error("vxapp.js fetchReportData security check failed user is not logged in")
                return { success: false, icon: "EYE", key: "common.alert_security_check_failed" }
            }
            const report  = Reports.findOne(reportId)
            if (!report) {
                OLog.error(`vxapp.js fetchReportData unable to find reportId=${reportId}`)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_report_not_found",
                    variables : { reportId : reportId } }
            }
            const reportData = VXApp.makeReportData(report)
            return { success: true, icon: "PLANE", key: "common.alert_transaction_success", reportData }
        }
        catch (error) {
            OLog.error(`vxapp.js fetchReportData unexpected error=${OLog.errorError(error)}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() } }
        }
    },

    /**
     * Fetch report spreadsheet as string.
     *
     * @param {string} reportId ID of report to send.
     * @return {object} Standard result object bearing spreadsheet.
     */
    fetchReportSpreadsheet(reportId) {
        try {
            if (!_.isString(reportId)) {
                OLog.error(`vxapp.js fetchReportSpreadsheet parameter check failed reportId=${reportId}`)
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            if (!Meteor.userId()) {
                OLog.error("vxapp.js fetchReportSpreadsheet security check failed user is not logged in")
                return { success: false, icon: "EYE", key: "common.alert_security_check_failed" }
            }
            const report  = Reports.findOne(reportId)
            if (!report) {
                OLog.error(`vxapp.js fetchReportSpreadsheet unable to find reportId=${reportId}`)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_report_not_found",
                    variables : { reportId : reportId } }
            }
            const reportData = VXApp.makeReportData(report)
            const data = VXApp.makeReportSpreadsheet(report, reportData)
            const array = new Uint8Array(data)
            return { success: true, icon: "PLANE", key: "common.alert_transaction_success", array }
        }
        catch (error) {
            OLog.error(`vxapp.js fetchReportSpreadsheet unexpected error=${OLog.errorError(error)}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() } }
        }
    },

    /**
     * Make and return report spreadsheet (type Buffer).
     *
     * @param {object} report Report record
     * @param {object} reportData Report data.
     * @return {object} Spreadsheet data (Buffer).
     */
    makeReportSpreadsheet(report, reportData) {
        OLog.debug(`vxapp.js makeReportSpreadsheet name=${reportData.name}`)
        const spreadsheetParameters = VXApp.makeSpreadsheetParameters(report, reportData)
        const workbook = VXApp.makeWorkbook(report, spreadsheetParameters, reportData)
        return VXApp.convertWorkbookToBuffer(workbook)
    },

    makeSpreadsheetParameters(report, reportData) {
        const spreadsheetParameters = {}
        spreadsheetParameters.columns = []
        reportData.headings?.forEach(heading => {
            const definition = VXApp.findDefinition(Meta[report.entityType], heading.metadataPath)
            const column = {}
            column.metadataPath =  heading.metadataPath
            column.text = heading.text
            if (definition.key) {
                column.key = definition.key
            }
            column.alignment = { horizontal: heading.alignment }
            column.numFmt = VXApp.spreadsheetFormat(definition)
            spreadsheetParameters.columns.push(column)
        })
        spreadsheetParameters.zoomScale = 100
        return spreadsheetParameters
    },

    /**
     * Given spreadsheet parameters and report data, return an exceljs workbook.
     *
     * @param {object} report Report record.
     * @param {array} spreadsheetParameters Attachment parameters object.
     * @param {object} reportData Report data object.
     * @return {object} Workbook object (exceljs).
     */
    makeWorkbook(report, spreadsheetParameters, reportData) {
        OLog.debug(`vxapp.js makeWorkbook spreadsheetParameters.columns=${OLog.debugString(spreadsheetParameters.columns)}`)
        const workbook = new Excel.Workbook()
        workbook.creator = reportData.userCreated
        workbook.lastModifiedBy = reportData.userCreated
        workbook.created = new Date()
        workbook.modified = new Date()
        workbook.views = [
            {
                x: 0,
                y: 0,
                width: 10000,
                height: 20000,
                firstSheet: 0,
                activeTab: 0,
                visibility: "visible",
            }
        ]
        const worksheetName = reportData.name
        OLog.debug(`vxapp.js makeWorkbook worksheetName=${worksheetName}`)
        const worksheet = workbook.addWorksheet(VXApp.formatWorksheetName(worksheetName))
        worksheet.columns = spreadsheetParameters.columns.map(column => {
            return { header: column.text, key: column.metadataPath,
                style : { alignment : column.alignment, numFmt: column.numFmt } }
        })
        worksheet.views = [ { zoomScale : spreadsheetParameters.zoomScale, state: "frozen", ySplit: 1 } ]
        for (let columnIndex = 0; columnIndex < spreadsheetParameters.columns.length; columnIndex++) {
            const column = spreadsheetParameters.columns[columnIndex]
            const cellName = `${Util.columnToLetter(columnIndex + 1)}1`
            const font = {}
            font.bold = true
            if (column.key) {
                font.color = { argb: "FFD9534F" }
            }
            worksheet.getCell(cellName).font = font
        }
        for (let rowIndex = 0; rowIndex < reportData.rows.length; rowIndex++) {
            const row = reportData.rows[rowIndex]
            for (let subrowIndex = 0; subrowIndex < row.subrowCount; subrowIndex++) {
                const columns = reportData.rows[rowIndex].columns
                const worksheetObject = {}
                columns.map(column => {
                    // If there is only a single row in the path array, replicate that row data
                    // for all subrows to make a cartesian product.
                    const textIndex = column.pathArray.length === 1 && subrowIndex > 0 ? 0 : subrowIndex
                    const text = column.cellArray[textIndex]
                    if (!Util.isNullish(text)) {
                        worksheetObject[column.metadataPath] = VXApp.convertToOptimalType(column.definition, text)
                    }
                })
                const row = worksheet.addRow(worksheetObject)
                row.commit()
            }
        }
        VXApp.adjustColumnWidths(worksheet)
        return workbook
    },

    convertToOptimalType(definition, text) {
        if (definition.bindingType === "String") {
            return text
        }
        if (definition.bindingType === "Integer") {
            return Util.getInteger(text)
        }
        if (definition.bindingType === "Money") {
            return Util.getFloat(text)
        }
        if (definition.bindingType === "Boolean") {
            return text
        }
        if (definition.bindingType === "Date") {
            return text
        }
        return text
    },

    adjustColumnWidths(worksheet) {
        worksheet.columns.forEach(column => {
            const values = column.values
            column.width = values.reduce((memo, value) => {
                const length = !Util.isNullish(value) ? value.toString().length : 0
                return Math.max(memo, length)
            }, 0) + 2
        })
    },

    /**
     * Worksheet name cannot have slashes and is limited to 30 characters
     *
     * @param {string} worksheetName Raw heading.
     * @return {string} Worksheet name converted and stripped as needed.
     */
    formatWorksheetName(worksheetName) {
        const adjustedWorksheetName = worksheetName.replace(/\//g, ", ")
        return adjustedWorksheetName.substring(0, 30)
    },

    /**
     * Convert a workbook object to buffer.
     *
     * @param {object} workbook Workbook object.
     */
    convertWorkbookToBuffer(workbook) {
        let buffer = new Buffer.alloc(0)
        class EchoStream extends stream.Writable {
            _write(chunk, enc, next) {
                buffer = Buffer.concat([ buffer, chunk ])
                next()
            }
        }
        const fut = new Future()
        workbook.xlsx.write(new EchoStream()).then(function() {
            fut.return()
        })
        fut.wait()
        OLog.debug(`vxapp.js convertWorkbookToBuffer buffer length=${buffer.length}`)
        return buffer
    },

    /**
     * Given a definition object, return a special spreadsheet format mask if applicable.
     *
     * @param {object} definition Metadata definition.
     * @return {string} Format mask for spreadsheet.
     */
    spreadsheetFormat(definition) {
        if (definition.format) {
            return definition.format.spreadsheetFormat()
        }
        if (definition.bindingType === "String") {
            return "@"
        }
        if (definition.bindingType === "Date") {
            return definition.dateFormat.toLowerCase()
        }
        return null
    },

    /**
     * Completely delete a tenant and all of its domains and records.
     *
     * @param {object} tenantId Tenant ID to delete.
     */
    deleteTenant(tenantId) {
        try {
            if (!_.isString(tenantId)) {
                OLog.error(`vxapp.js deleteTenant parameter check failed tenantId=${tenantId}`)
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            if (!Meteor.userId()) {
                OLog.error("vxapp.js deleteTenant security check failed user is not logged in")
                return { success: false, icon: "EYE", key: "common.alert_security_check_failed" }
            }
            if (!Util.isUserSuperAdmin()) {
                OLog.error("vxapp.js deleteTenant security check failed invoking user is not super administrator")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            Domains.find({ tenant: tenantId }).forEach(domain => {
                const collections = VXApp.getDomainCollections()
                collections.forEach(collection => {
                    OLog.warn(`vxapp.js deleteTenant tenantId=${tenantId} domainId=${domain._id} ${collection._name} *remove*`)
                    collection.remove({domain: domain._id})
                })
                Domains.remove(domain._id)
            })
            Tenants.remove(tenantId)
            return { success: true, icon: "PLANE", key: "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error(`vxapp.js deleteTenant unexpected error=${OLog.errorError(error)}`)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() } }
        }
    },

    fixUserTenants() {
        Meteor.users.find({"profile.dateRetired":{$exists: false}}).forEach(user => {
            const tenants = []
            user.profile.domains.forEach(userDomainObject => {
                const domain = Domains.findOne(userDomainObject.domainId)
                const userTenantObject = _.findWhere(tenants, { tenantId : domain.tenant })
                if (!userTenantObject) {
                    const userTenantObjectNew = {}
                    userTenantObjectNew.tenantId = domain.tenant
                    userTenantObjectNew.roles = []
                    tenants.push(userTenantObjectNew)
                }
            })
            const modifier = {}
            modifier.$set = {}
            modifier.$set["profile.tenants"] = tenants
            OLog.debug(`vxapp.js fixUserTenants for user ${Util.fetchFullName(user._id)} modifier=${OLog.debugString(modifier)}`)
            Meteor.users.update(user._id, modifier, error => {
                if (error) {
                    OLog.error(`vxapp.js fixUserTenants error returned from MongoDB update=${OLog.errorError(error)}`)
                    return
                }
            })
        })
    }
}}
