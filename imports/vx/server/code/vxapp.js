"use strict"

VXApp = _.extend(VXApp || {}, {

    /**
     * Determine the default route for this user.
     *
     * @return {string} Default route.
     */
    getDefaultRoute() {
        return "/profile"
    },

    /**
     * Log a debug line whenever a client logs in to show the client version.
     */
    onClientLogin(userId, clientVersion) {
        try {
            OLog.debug("vxapp.js onClientLogin user " + Util.getUserEmail(userId) + " client version " + clientVersion)
            Meteor.users.update(userId, { $set: { "profile.clientVersion": Meteor.appVersion.version } })
            return { success: true, icon: "ENVELOPE", key: "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error("vxapp.js onClientLogin error=" + error)
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
                OLog.error("vxapp.js clearPNotify parameter check failed notificationId=" + notificationId)
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            let notification = Notifications.findOne(notificationId)
            if (!notification) {
                OLog.error("vxapp.js clearPNotify unable to find notificationId=" + notificationId)
                return { success: false, icon: "BUG", key: "common.alert_transaction_fail_notification_not_found", variables: { notificationId: notificationId } }
            }
            if (notification.recipientId !== Meteor.userId()) {
                // TODO: DL--lenient here no message
                return { success: false, icon: "EYE", key: "common.alert_security_check_failed" }
            }
            return VXApp.updateNotification(notificationId, "PNOTIFY", sent ? ["processed", "sent"] : ["processed"])
        }
        catch (error) {
            OLog.error("vxapp.js clearPNotify unexpected error=" + error)
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
            let modifier = {}
            modifier.$set = extra || {}
            notificationEvents.forEach(notificationEvent => {
                modifier.$set[mode + "_" + notificationEvent] = moment().toDate()
            })
            OLog.debug("vxapp.js updateNotification notificationId=" + notificationId + " modifier=" + OLog.debugString(modifier))
            Notifications.update(notificationId, modifier)
            return { success: true, icon: "ENVELOPE", key: "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error("vxapp.js updateNotification unexpected error=" + error)
            return { success: false, icon: "BUG", key: "common.alert_unexpected_error", variables: { error: error.toString() } }
        }
    },

    /**
     * Create an event (also create accompanying notification(s) if applicable).
     *
     * @param {string} Event type (e.g., ORDER_CREATED).
     * @param {string} domainId Domain ID.
     * @param {object} Event data in object form.
     * @param {object} Variables to be inserted into notifications.
     * @return {string} MongoDB ID of new event.
     */
    createEvent(eventType, domainId, eventData, variables) {
        try {
            let event = {}
            event.domain = domainId
            event.type = eventType
            event.eventData = eventData
            OLog.debug("vxapp.js createEvent eventType=" + event.type + " domain=" + event.domain + " eventData=" + OLog.debugString(event.eventData))
            let eventId = Events.insert(event)
            OLog.debug("vxapp.js createEvent *success* eventId=" + eventId)
            if (Util.isNotificationWarranted(event)) {
                VXApp.createNotifications(domainId, eventType, eventId, variables)
            }
            else {
                OLog.debug("vxapp.js createEvent notifications *not* warranted for eventId=" + eventId)
            }
            return eventId
        }
        catch (error) {
            OLog.error("vxapp.js createEvent error=" + error)
            return
        }
    },

    /**
     * Create notifications for an event to all users in the specified domain.
     *
     * @param {string} domainId Domain ID.
     * @param {string} Event type (e.g., ORDER_CREATED).
     * @param {string} Event ID.
     * @param {object} Variables to be inserted into notification.
     */
    createNotifications(domainId, eventType, eventId, variables) {
        try {
            let eventTypeObject = Meteor.i18nMessages.codes.eventType[eventType]
            let notificationObject = eventTypeObject.notification
            let selector = {}
            selector["profile.dateRetired"] = { $exists: false }
            switch (notificationObject.scope) {
            case "ALL" :
                // Do nothing
                break
            default :
                selector["profile.domains.domainId"] = domainId
                break
            }
            Meteor.users.find(selector).forEach(user => {
                let notification = {}
                notification.domain = domainId
                notification.type = notificationObject.type
                notification.icon = notificationObject.icon
                notification.eventId = eventId
                notification.eventType = eventType
                notification.recipientId = user._id
                notification.key = notificationObject.key
                notification.subjectKey = notificationObject.subjectKey
                notification.variables = variables
                Notifications.insert(notification)
            })
        }
        catch (error) {
            OLog.error("vxapp.js createNotification error=" + error)
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
     * Clone the specified user.
     *
     * @param {string} userId User ID to clone.
     * @return {object} Result object.
     */
    cloneUser(userId) {
        try {
            if (!(_.isString(userId))) {
                OLog.error("vxapp.js cloneUser parameter check failed userId=" + userId)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            if (!Meteor.userId()) {
                OLog.error("vxapp.js cloneUser security check failed invoking user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            let user = Meteor.users.findOne(userId)
            if (!user) {
                OLog.error("vxapp.js cloneUser unable to find cloned userId=" + userId)
                return
            }
            if (!Util.isUserAdmin()) {
                OLog.error("vxapp.js cloneUser security check failed invoking user is not administrator")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            let tenantId = Util.getCurrentTenantId(Meteor.userId())
            if (!_.contains(Util.getTenantIds(userId), tenantId)) {
                OLog.error("vxapp.js cloneUser security check failed cloned user " + Util.getUserEmail(userId) + " is not a member of " + Util.fetchTenantName(tenantId))
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
            OLog.debug("vxapp.js cloneUser inserting cloned user record=" + OLog.debugString(user))
            let userIdNew = Meteor.users.insert(user)
            return { success : true, icon : "CLONE", key : "common.alert_record_cloned_success", variables: { name: Util.fetchFullName(userId) }, userId: userIdNew }
        }
        catch (error) {
            OLog.error("vxapp.js cloneUser unexpected error=" + error)
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
                OLog.error("vxapp.js retireDomain parameter check failed domainId=" + domainId + " comment=" + comment)
                return { success : false, icon : "EYE", key : "common.alert_parameter_check_failed"}
            }
            let domain = Domains.findOne(domainId)
            if (!domain) {
                OLog.error("vxapp.js retireDomain unable to find domainId=" + domainId)
                return { success : false, icon : "BUG", key : "common.alert_transaction_fail_domain_not_found", variables : { domainId : domainId } }
            }
            let tenantId = Util.getTenantId(domainId)
            if (!tenantId) {
                OLog.error("vxapp.js retireDomain unable to find tenantId for domainId=" + domainId)
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
            OLog.debug("vxapp.js retireDomain domainId=" + domainId + " modifier=" + OLog.debugString(modifier))
            Domains.update(domainId, modifier)
            return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success" }
        }
        catch (error) {
            OLog.error("vxapp.js retireDomain unexpected error=" + error)
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
            let userId = Meteor.userId()
            OLog.debug("vxapp.js createTenant administrator email=" + Util.getUserEmail(userId))
            let tenantId = VXApp.createTenantRecord( { userId: userId } )
            let domainId = VXApp.createDomainRecord( { userId: userId, tenantId: tenantId } )
            VXApp.addUserToDomain(userId, domainId, false, true)
            VXApp.createEvent("TENANT_CREATE", domainId, { tenantId : tenantId, adminId: userId },
             { adminName : Util.fetchFullName(userId) } )
            return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success", tenantId: tenantId, domainId: domainId }
        }
        catch (error) {
            OLog.error("vxapp.js createTenant unexpected error=" + error)
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
        OLog.debug("vxapp.js createTenant parameters=" + OLog.debugString(parameters))
        let tenant = {}
        if (parameters.userId) {
            tenant.userCreated = parameters.userId
            tenant.userModified = parameters.userId
            tenant.pocUserId = parameters.userId
            tenant.country = Util.getProfileValue("country", parameters.userId)
            tenant.address1 = Util.getProfileValue("address1", parameters.userId)
            tenant.address2 = Util.getProfileValue("address2", parameters.userId)
            tenant.city = Util.getProfileValue("city", parameters.userId)
            tenant.state = Util.getProfileValue("state", parameters.userId)
            tenant.zip = Util.getProfileValue("zip", parameters.userId)
        }
        let tenantId = Tenants.insert(tenant)
        OLog.debug("vxapp.js createTenant created tenantId=" + tenantId + " tenant=" + OLog.debugString(tenant))
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
        // Use fetchTenantField to prevent default value:
        let tenantName = Util.fetchTenantField(parameters.tenantId, "name")
        let domain = {}
        domain.tenant = parameters.tenantId
        if (tenantName) {
            domain.name = Util.i18n("common.value_default_domain_name_with_tenant", { tenantName: tenantName })
            domain.description = Util.i18n("common.value_default_domain_description_with_tenant", { tenantName: tenantName })
        }
        else {
            domain.name = Util.i18n("common.value_default_domain_name")
            domain.description = Util.i18n("common.value_default_domain_description")
        }
        domain.base = true

        if (parameters.userId) {
            domain.userCreated = parameters.userId
            domain.userModified = parameters.userId
        }
        let domainId = Domains.insert(domain)
        OLog.debug("vxapp.js createDomainRecord created domainId=" + domainId + " tenant=" + OLog.debugString(domain))
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
        user.profile.tenantHistory = user.profile.tenantHistory || []
        user.profile.domains = user.profile.domains || []
        user.profile.domainHistory = user.profile.domainHistory || []
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
     * @param {string} functionName Name of function.
     * @param {array} validateArgs Validation arguments.
     * @return {object} Result object.
     */
    validateServerSide(functionName, validateArgs) {
        try {
            if (!(_.isString(functionName) && _.isArray(validateArgs))) {
                OLog.error("vxapp.js validateServerSide parameter check failed functionName=" + functionName + " validateArgs=" + validateArgs)
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
    sendTestEmail(templateId) {
        try {
            if (!_.isString(templateId)) {
                OLog.error("vxapp.js sendTestEmail parameter check failed templateId=" + templateId)
                return { success: false, icon: "EYE", key: "common.alert_parameter_check_failed" }
            }
            if (!Meteor.userId()) {
                OLog.error("vxapp.js sendTestEmail security check failed user is not logged in")
                return { success: false, icon: "EYE", key: "common.alert_security_check_failed" }
            }
            let template = Templates.findOne(templateId)
            if (!template) {
                OLog.error("vxapp.js sendTestEmail unable to find templateId=" + templateId)
                return { success: false, icon: "BUG", key: "common.alert_transaction_fail_template_not_found", variables: { templateId: templateId } }
            }
            let user = Util.fetchUserLimited(Meteor.userId())
            user.profile.email = Util.getUserEmail(Meteor.userId())
            let from = Util.i18n("common.label_mail_from")
            let to = Util.getUserEmail(Meteor.userId())
            let subject = Util.resolveVariables(template.subject, user.profile)
            let html = Util.resolveVariables(template.html, user.profile)
            OLog.debug("vxapp.js sendTestEmail from=" + from + " to=" + to + " subject=" + subject + " html=" + html)
            let fut = new Future()
            Service.sendEmail(template.domain, from, to, subject, html, null, function(error, response) {
                fut.return({ error: error, response: response })
            })
            let result = fut.wait()
            if (!result.response.success) {
                VXApp.setSubsystemStatus("TEMPLATE", template, "RED", "common.status_template_test_fail")
                return { success: false, icon: "TRIANGLE", key: "common.alert_send_test_email_fail", variables: { error: result.response.error.toString() } }
            }
            OLog.debug("vxapp.js sendTestEmail *success*")
            VXApp.setSubsystemStatus("TEMPLATE", template, "GREEN", "common.status_template_test_success")
            return { success: true, icon: "CHECK", key: "common.alert_send_test_email_success" }
        }
        catch (error) {
            OLog.error("vxapp.js sendTestEmail unexpected error=" + error)
            return { success: false, icon: "TRIANGLE", key: "common.alert_send_test_email_fail", variables: { error: error.toString() } }
        }
    }
})
