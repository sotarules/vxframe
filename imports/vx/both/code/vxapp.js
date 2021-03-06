import {get} from "lodash"

VXApp = { ...VXApp, ...{

    /**
     * Get key information from the current user as necessary to establish subscriptions.
     *
     * @param {string} userId Optional user ID.
     * @return {object} Result object.
     */
    getSubscriptionParameters(userId) {
        try {
            userId = userId || Meteor.userId()
            if (!userId) {
                OLog.debug("vxapp.js getSubscriptionParameters security check failed user is not logged in")
                return { success : false, icon : "EYE", key : "common.alert_security_check_failed" }
            }
            if (Meteor.isClient) {
                if (Util.getCurrentDomainId(userId) === "UNKNOWN") {
                    return { success : false, icon : "TRIANGLE", key : "common.alert_subscriptions_not_ready" }
                }
            }
            const subscriptionParameters = {}
            subscriptionParameters.tenantId = Util.getCurrentTenantId(userId)
            subscriptionParameters.domainId = Util.getCurrentDomainId(userId)
            subscriptionParameters.userId = userId
            subscriptionParameters.email = Util.getUserEmail(userId)
            subscriptionParameters.tenantIds = Util.getTenantIds(userId)
            subscriptionParameters.domainIds = Util.getDomainIds(userId)
            subscriptionParameters.domainIdsOfCurrentTenant = Util.getDomainIdsOfCurrentTenant(userId)
            subscriptionParameters.superAdmin = Util.isUserSuperAdmin(userId)
            subscriptionParameters.preferenceLogsDefeatTenantFilters = Util.isPreference("LOGS_DEFEAT_TENANT_FILTERS", userId)
            subscriptionParameters.preferenceAllMembersAndDomains = Util.isPreference("ALL_MEMBERS_AND_DOMAINS", userId)
            subscriptionParameters.preferenceDomainSubscription = Util.isPreference("DOMAIN_SUBSCRIPTION", userId)
            return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success", subscriptionParameters : subscriptionParameters }
        }
        catch (error) {
            OLog.error(`vxapp.js getSubscriptionParameters unexpected error=${error}`)
            return { success : false, type : "ERROR", icon : "BUG", key : "common.alert_unexpected_error", variables : { error : error.toString() } }
        }
    },

    /**
     * Return a dual-mode object with search criteria.  The client criteria is used to
     * populate session variables to control Mini-MongoDB finds.  The server criteria is used to
     * control subscriptions on the server.
     *
     * @param {string} subscriptionName Subscription name (e.g., "current_cards").
     * @param {object} subscriptionParameters Subscription parameters object.
     * @param {object} criteria MongoDB criteria.
     * @param {object} options MongoDB options.
     * @return {object} Dual-mode publish request object.
     */
    makePublishingRequest(subscriptionName, subscriptionParameters, criteria, options) {
        const publishRequest = {}
        _.each(["client", "server"], side => {
            const mode = VXApp.getPublishingMode(side, subscriptionParameters)
            publishRequest[side] = {}
            publishRequest[side].criteria = $.extend(true, {}, criteria)
            publishRequest[side].options = options
            publishRequest[side].extra = {}
            publishRequest[side].extra.subscriptionName = subscriptionName
            publishRequest[side].extra.mode = mode
            VXApp.adjustPublishingRequest(publishRequest[side], subscriptionParameters.userId, subscriptionParameters)
        })
        return publishRequest
    },

    /**
     * Infer the current publishing mode based on the route.
     *
     * DEFEAT - no adjustment to tenants and domains.
     * TEXAS - user sees all tenants.
     * TEAM - user sees all domains in a single tenant.
     * DOMAIN - user sees a single domain.
     *
     * @param {string} side Side client or server.
     * @param {object} subscriptionParameters Subscription parameters object.
     * @return {string} Publishing mode.
     */
    getPublishingMode(side, subscriptionParameters) {
        if (Util.isRoutePath("/log") || Util.isRoutePath("/events")) {
            return subscriptionParameters.superAdmin && subscriptionParameters.preferenceLogsDefeatTenantFilters ? "DEFEAT" : "TEXAS"
        }
        if (UX.iosIsRoutePathOnStack("/users-domains") || UX.iosIsRoutePathOnStack("/domains-users") || Util.isRoutePath("/user/") || Util.isRoutePath("/domain/")) {
            return subscriptionParameters.superAdmin && subscriptionParameters.preferenceAllMembersAndDomains ? "DEFEAT" : "TEAM"
        }
        if (UX.iosIsRoutePathOnStack("/tenants") || Util.isRoutePath("/tenant/") || Util.isRoutePath("/domains")) {
            return subscriptionParameters.superAdmin ? "DEFEAT" : "TEAM"
        }
        if (Util.isRoutePath("/tenants") || Util.isRoutePath("/tenant/") || Util.isRoutePath("/domains")) {
            return "TEXAS"
        }
        return "DOMAIN"
    },

    /**
     * Adjust a supplied publishing request object to limit visibility based on the publishing mode.
     *
     * @param {object} request Publishing request object including criteria, options, extra.
     * @param {string} userId User ID requesting that records be published.
     * @param {object} subscriptionParameters Subscription parameters (required on client only).
     */
    adjustPublishingRequest(request, userId, subscriptionParameters) {

        if (!userId) {
            OLog.error(`vxapp.js adjustPublishingRequest no userId specified, request=${OLog.errorString(request)}`)
            return request
        }

        if (Meteor.isClient && !subscriptionParameters) {
            OLog.error(`vxapp.js adjustPublishingRequest on client subscriptionParameters are required, request=${OLog.errorString(request)}`)
            return request
        }

        if (Meteor.isServer) {
            let result = VXApp.getSubscriptionParameters(userId)
            if (!result.success) {
                OLog.error("vxapp.js adjustPublishingRequest on client unable to get subscription parameters")
                return request
            }
            subscriptionParameters = result.subscriptionParameters
        }

        if (request.extra.subscriptionName === "current_tenants") {
            if (request.extra.mode === "DEFEAT")  {
                request.criteria.dateRetired = { $exists : false }
            }
            else if (request.extra.mode === "DOMAIN") {
                request.criteria = { _id : subscriptionParameters.tenantId }
            }
            else if (request.extra.mode === "TEAM") {
                request.criteria = { _id : subscriptionParameters.tenantId }
            }
            else if (request.extra.mode === "TEXAS") {
                request.criteria = { _id : { $in: subscriptionParameters.tenantIds } }
            }
            else {
                request.criteria = { _id : subscriptionParameters.tenantId }
            }
        }
        else if (request.extra.subscriptionName === "current_domains") {
            if (request.extra.mode === "DEFEAT")  {
                request.criteria.dateRetired = { $exists : false }
            }
            else if (request.extra.mode === "DOMAIN") {
                request.criteria = { _id : subscriptionParameters.domainId }
            }
            else if (request.extra.mode === "TEAM") {
                request.criteria = { tenant : subscriptionParameters.tenantId, dateRetired : { $exists : false } }
            }
            else if (request.extra.mode === "TEXAS") {
                request.criteria = { tenant: { $in: subscriptionParameters.tenantIds }, dateRetired : { $exists : false } }
            }
            else {
                request.criteria = { _id : subscriptionParameters.domainId }
            }
        }
        else if (request.extra.subscriptionName === "current_users") {
            if (request.extra.mode === "DEFEAT")  {
                // Simply leave criteria alone.
            }
            else if (request.extra.mode === "DOMAIN") {
                request.criteria = { "profile.domains": { $elemMatch : { domainId : subscriptionParameters.domainId } } }
            }
            else if (request.extra.mode === "TEAM") {
                request.criteria = { "profile.tenants": { $elemMatch : { tenantId : subscriptionParameters.tenantId } } }
            }
            else if (request.extra.mode === "TEXAS") {
                request.criteria = { "profile.tenants": { $elemMatch : { tenantId : { $in: subscriptionParameters.tenantIds } } } }
            }
            else {
                request.criteria = { "profile.domains": { $elemMatch : { domainId : subscriptionParameters.domainId } } }
            }
        }
        // Standard is to limit based on a field "domain" which is commonly used in most record types.
        // WARNING: default behavior is really to adjust and not replace the criteria:
        else {
            request.criteria = request.criteria || {}
            if (request.extra.mode === "DEFEAT")  {
                // Simply leave criteria alone.
            }
            else if (request.extra.mode === "DOMAIN") {
                request.criteria.domain = subscriptionParameters.domainId
            }
            else if (request.extra.mode === "TEAM") {
                request.criteria.domain = { $in: subscriptionParameters.domainIdsOfCurrentTenant }
            }
            else if (request.extra.mode === "TEXAS") {
                request.criteria.domain = { $in: subscriptionParameters.domainIds }
            }
            else {
                request.criteria.domain = subscriptionParameters.domainId
            }
        }

        return request
    },

    /**
     * Get the current user domain object.
     *
     * @return {object} User domain object.
     */
    getCurrentUserDomain(userId) {
        if (!userId) {
            return
        }
        let fieldList = {}
        fieldList.fields = {}
        fieldList.fields["profile.domains"] = 1
        let user = Meteor.users.findOne(userId, fieldList)
        if (!user) {
            return
        }
        let domainId = Util.getCurrentDomainId(userId)
        return _.findWhere(user.profile.domains, { domainId: domainId } )
    },

    /**
     * Return the name of the specified field in a record.
     *
     * @param {object} coll MongoDB collection.
     * @param {string} recordId Record ID.
     * @param {string} fieldName Field name (e.g., "name").
     * @param {string} defaultValue Optional default value.
     * @return {string} Field value.
     */
    fetchRecordField(coll, recordId, fieldName, defaultValue) {
        if (!recordId) {
            return
        }
        let fieldList = {}
        fieldList.fields = {}
        fieldList.fields[fieldName] = 1
        let record = coll.findOne({ _id : recordId }, fieldList)
        if (!record) {
            OLog.error("vxapp.js fetchRecordField unable to find recordId=" + recordId)
            return
        }
        return record[fieldName] ? record[fieldName] : defaultValue
    },

    /**
     * Set the status of a subsystem and notify the user via email if the state has changed.
     *
     * @param {string} subsystem Subsystem (e.g., "MAILGUN", "TWILIO").
     * @param {string} record Record with status to be set.
     * @param {string} status Subsystem status (e.g., GREEN, RED).
     * @param {string} key i18n key of message to associate with status change.
     * @param {object} variables i18n variables.
     * @param {number} minimumMinutesBetweenChange Minimum time required before status change allowed (to "throttle" quick changes).
     */
    setSubsystemStatus(subsystem, record, status, key, variables, minimumMinutesBetweenChange) {
        try {
            if (VXApp.isSubsystemStatusChangeIgnored(subsystem, record, status, key, variables)) {
                OLog.debug(`vxapp.js setSubsystemStatus recordId=${record._id} ${subsystem} ${status} ${key} *ignored*`)
                return
            }
            if (VXApp.isSubsystemStatusEqual(subsystem, record, status, key, variables)) {
                return
            }
            OLog.debug(`vxapp.js setSubsystemStatus recordId=${record._id} ${subsystem} ${status} ${key} *changed* record=${OLog.debugString(record)}`)
            let subsystemStatus = VXApp.getSubsystemStatus(subsystem, record)
            if (subsystemStatus) {
                if (minimumMinutesBetweenChange) {
                    let dateRecent = moment().subtract(minimumMinutesBetweenChange, "minutes")
                    if (subsystemStatus.date > dateRecent) {
                        OLog.debug(`vxapp.js setSubsystemStatus recordId=${record._id} ${subsystem} ${status} ${key} was updated *recently* ${subsystemStatus.date} *wait*"`)
                        return
                    }
                }
            }
            const subsystemStatusArray = record.subsystemStatus || []
            if (!subsystemStatus) {
                subsystemStatus = {}
                subsystemStatusArray.push(subsystemStatus)
            }
            else {
                let index = _.indexOf(_.pluck(subsystemStatusArray, "subsystem"), subsystem)
                subsystemStatusArray[index] = subsystemStatus
            }
            subsystemStatus.subsystem = subsystem
            subsystemStatus.status = status
            subsystemStatus.date = new Date()
            subsystemStatus.key = key
            if (variables) {
                subsystemStatus.variables = variables
            }
            else {
                delete subsystemStatus.variables
            }
            const modifier = {}
            modifier.$set = {}
            modifier.$set.subsystemStatus = subsystemStatusArray
            OLog.debug(`vxapp.js setSubsystemStatus recordId=${record._id} ${subsystem} ${status} ${key} modifier=${JSON.stringify(modifier)}`)
            let eventData = VXApp.onSubsystemStatusChange(subsystem, record, modifier)
            let localizedIdentifier = Util.i18n(`codes.subsystemIdentifier.${subsystem}`, { key : eventData.recordIdentifier } )
            let localizedStatus = Util.i18n(`codes.subsystemStatus.${status}`)
            let subject = Util.i18n("common.mail_subsystem_subject", { subsystemIdentifier : localizedIdentifier, subsystemStatus : localizedStatus })
            let message = Util.i18n(key, variables)
            let eventType, text
            switch (status) {
            case "RED" : {
                eventType = "SUBSYSTEM_STATUS_RED"
                text = Util.i18n("common.mail_subsystem_red", { subsystemIdentifier : localizedIdentifier, subsystemStatus : localizedStatus, message : message } )
                break
            }
            case "YELLOW" : {
                eventType = "SUBSYSTEM_STATUS_YELLOW"
                text = Util.i18n("common.mail_subsystem_green", { subsystemIdentifier : localizedIdentifier, subsystemStatus : localizedStatus, message : message } )
                break
            }
            case "GREEN" : {
                eventType = "SUBSYSTEM_STATUS_GREEN"
                text = Util.i18n("common.mail_subsystem_green", { subsystemIdentifier : localizedIdentifier, subsystemStatus : localizedStatus, message : message } )
                break
            }
            }
            VXApp.createEvent(eventType, eventData.domainId, eventData, { genericSubject: subject, genericMessage : text } )
        }
        catch (error) {
            OLog.error(`vxapp.js setSubsystemStatus unexpected error=${error}`)
        }
    },

    /**
     * Template method to perform DB updates necessary to update subsystem status and return event data
     * based on subsystem.
     *
     * @param {string} subsystem Subsystem (e.g., "MAILGUN", "TWILIO").
     * @param {string} record Record with status to be set.
     * @param {object} modifier Modifier for MongoDB.
     * @return {object} Event data object.
     */
    onSubsystemStatusChange(subsystem, record, modifier) {
        OLog.debug("vxapp.js onSubsystemStatusChange subsystem=" + subsystem + " modifier=" + OLog.debugString(modifier))
        let eventData = {}
        eventData.subsystem = subsystem
        switch (subsystem) {
        case "TEMPLATE" : {
            eventData.recordIdentifier = record.name
            eventData.templateId = record._id
            eventData.domainId = record.domain
            Templates.update(record._id, modifier)
            break
        }
        case "MAILGUN" : {
            eventData.domainId = record._id
            Domains.update(record._id, modifier)
            break
        }
        case "TWILIO" : {
            eventData.domainId = record._id
            Domains.update(record._id, modifier)
            break
        }
        default : {
            eventData = {}
            OLog.error("vxapp.js onSubsystemStatusChange unrecognized subsystem=" + subsystem)
            break
        }
        }
        return eventData
    },

    /**
     * Get the status of a subsystem.
     *
     * @param {string} subsystem Subsystem (e.g., "LIME_LIGHT_INSTANCE", "GATEWAY").
     * @param {string} record Record with status to be retrieved.
     * @return {string} Subsystem status object.
     */
    getSubsystemStatus(subsystem, record) {
        return _.findWhere(record.subsystemStatus, { subsystem : subsystem })
    },

    /**
     * Convenience function to determine whether a given subsystem is green.
     *
     * @param {string} subsystem Subsystem (e.g., "LIME_LIGHT_INSTANCE", "GATEWAY").
     * @param {object} record Record with subsystemStatus.
     * @return {boolean} True if subsystem is GREEN.
     */
    isSubsystemGreen(subsystem, record) {
        return VXApp.isSubsystemStatus(subsystem, record, "GREEN")
    },

    /**
     * Convenience function to determine whether a given subsystem is yellow.
     *
     * @param {string} subsystem Subsystem (e.g., "LIME_LIGHT_INSTANCE", "GATEWAY").
     * @param {object} record Record with subsystemStatus.
     * @return {boolean} True if subsystem is YELLOW.
     */
    isSubsystemYellow(subsystem, record) {
        return VXApp.isSubsystemStatus(subsystem, record, "YELLOW")
    },

    /**
     * Convenience function to determine whether a given subsystem is red.
     *
     * @param {string} subsystem Subsystem (e.g., "LIME_LIGHT_INSTANCE", "GATEWAY").
     * @param {object} record Record with subsystemStatus.
     * @return {boolean} True if subsystem is RED.
     */
    isSubsystemRed(subsystem, record) {
        return VXApp.isSubsystemStatus(subsystem, record, "RED")
    },

    /**
     * Convenience function to determine whether a given subsystem is gray.
     *
     * @param {string} subsystem Subsystem (e.g., "SERVER").
     * @param {object} record Record with subsystemStatus.
     * @return {boolean} True if subsystem is GRAY.
     */
    isSubsystemGray(subsystem, record) {
        return VXApp.isSubsystemStatus(subsystem, record, "GRAY")
    },

    /**
     * Determine whether a given subsystem is in a particular state.
     *
     * @param {string} subsystem Subsystem (e.g., "LIME_LIGHT_INSTANCE", "GATEWAY").
     * @param {object} record Record with subsystemStatus.
     * @param {string} status Test status (e.g., "RED").
     * @return {boolean} True if subsystem status matches test status.
     */
    isSubsystemStatus(subsystem, record, status) {
        let subsystemStatus = VXApp.getSubsystemStatus(subsystem, record)
        if (!subsystemStatus) {
            return status === "GRAY"
        }
        return subsystemStatus.status === status
    },

    /**
     * Determine whether the subsystem status currently matches supplied values.
     *
     * @param {string} subsystem Subsystem (e.g., "LIME_LIGHT_INSTANCE", "GATEWAY").
     * @param {object} record Record with subsystem status to be tested.
     * @param {string} status Subsystem status (e.g., GREEN, RED).
     * @param {string} key i18n key of message to associate with status change.
     * @param {object} variables i18n variables.
     * @return {boolean} True if subsystem status is equal.
     */
    isSubsystemStatusEqual(subsystem, record, status, key, variables) {
        let subsystemStatus = VXApp.getSubsystemStatus(subsystem, record)
        if (!subsystemStatus) {
            return false
        }
        if (subsystemStatus.status !== status) {
            return false
        }
        if (subsystemStatus.key !== key) {
            return false
        }
        if (!subsystemStatus.variables && !variables) {
            return true
        }
        let v1 = JSON.stringify(subsystemStatus.variables)
        let v2 = JSON.stringify(variables)
        return v1 === v2
    },

    /**
     * Determine whether the subsystem status change should be ignored.
     *
     * @param {string} subsystem Subsystem (e.g., "LIME_LIGHT_INSTANCE", "GATEWAY").
     * @param {object} record Record with subsystem status to be tested.
     * @param {string} status Subsystem status (e.g., GREEN, RED).
     * @param {string} key i18n key of message to associate with status change.
     * @param {object} variables i18n variables.
     * @return {boolean} True if subsystem status is equal.
     */
    isSubsystemStatusChangeIgnored(subsystem, record, status, key, variables) {
        // https://github.com/nodejs/node-v0.x-archive/issues/5545, it is possible that this
        // bug may be fixed in a later version of node.js
        if (key === "common.status_limelight_error" && variables && variables.errorString) {
            if (variables.errorString.indexOf("ENOTFOUND") >= 0) {
                return true
            }
            if (variables.errorString.indexOf("ECONNRESET") >= 0) {
                return true
            }
        }
        return false
    },

    /**
     * Get the decoration icon class.
     *
     * @param {string} subsystem Subsystem (e.g., "TEMPLATE").
     * @param {object} record Record with subsystemStatus.
     * @param {string} size Size (i.e., "small", "medium").
     * @return {string} Icon decoration class.
     */
    getSubsystemStatusDecorationIconClassName(subsystem, record, size) {
        if (!record) {
            return
        }
        let subsystemStatus = VXApp.getSubsystemStatus(subsystem, record)
        let prefix = "entity-decoration-icon-" + size + " fa " + (size === "medium" ? "fa-lg " : " ")
        if (subsystemStatus && subsystemStatus.status) {
            switch(subsystemStatus.status) {
            case "GREEN" : return prefix + "fa-envelope"
            case "YELLOW" : return prefix + "fa-warning"
            case "RED" : return prefix + "fa-warning"
            }
        }
        return prefix + "fa-wrench"
    },

    /**
     * Get the subsystem color (green, yellow, red, gray).
     *
     * @param {string} subsystem Subsystem (e.g., "LIME_LIGHT_INSTANCE", "GATEWAY").
     * @param {object} record Record with subsystemStatus.
     * @return {string} Subsystem status color.
     */
    getSubsystemStatusDecorationColor(subsystem, record) {
        if (!record) {
            return
        }
        let subsystemStatus = VXApp.getSubsystemStatus(subsystem, record)
        if (subsystemStatus && subsystemStatus.status) {
            switch(subsystemStatus.status) {
            case "GREEN" : return "green"
            case "YELLOW" : return "yellow"
            case "RED" : return "red"
            }
        }
        return "gray"
    },

    /**
     * Get the decoration tooltip.
     *
     * @param {string} subsystem Subsystem (e.g., "TEMPLATE").
     * @param {object} record Record with subsystemStatus.
     * @return {string} Decoration tooltip.
     */
    getSubsystemStatusDecorationTooltip(subsystem, record) {
        if (!record) {
            return
        }
        return VXApp.subsystemStatusMessage(subsystem, record)
    },

    /**
     * Return value (body) of a specified function.
     *
     * @param {?} functionOrId Function record or ID.
     * @return {string} Value (body) of function.
     */
    fetchFunctionValue(functionOrId) {
        return VXApp.fetchFunctionField(functionOrId, "value")
    },

    /**
     * Return the value of the specified field in a function record.
     *
     * @param {?} functionOrId Function record or ID.
     * @param {string} fieldName Field name (e.g., "name").
     * @param {string} defaultValue Optional default value.
     * @return {string} Field value.
     */
    fetchFunctionField(functionOrId, fieldName, defaultValue) {
        let funktion
        if (!functionOrId) {
            return
        }
        if (_.isObject(functionOrId)) {
            funktion = functionOrId
        }
        else {
            const fieldList = {}
            fieldList.fields = {}
            fieldList.fields[fieldName] = 1
            funktion = Functions.findOne(functionOrId, fieldList)
            if (!funktion) {
                OLog.error(`vxapp.js fetchFunctionField unable to find functionOrId=${functionOrId}`)
                return
            }
        }
        return funktion[fieldName] ? funktion[fieldName] : defaultValue
    },

    /**
     * Return the function anchor from the current tenant.
     *
     * @param {string} tenantId Optional tenant ID.
     * @return {string} Function anchor or null.
     */
    functionAnchor(tenantId) {
        tenantId = tenantId || Util.getCurrentTenantId(Meteor.userId())
        return Util.fetchTenantField(tenantId, "functionAnchor")
    },

    /**
     * Given a domain ID return the tenant function anchor property.
     *
     * @param {string} domainId Domain ID.
     * @return {string} Function anchor from tenant.
     */
    functionAnchorForDomain(domainId) {
        const tenantId = Util.getTenantId(domainId)
        return VXApp.functionAnchor(tenantId)
    },

    /**
     * Given a function anchor and domain ID get form a guaranteed-unique object name
     * for this domain.
     *
     * @param {string} functionAnchor User-declared function anchor in tenant.
     * @param {string} domainId Domain ID.
     * @return {string} Guaranteed-unique object "container" for functions.
     */
    qualifiedFunctionAnchor(functionAnchor, domainId) {
        return `${functionAnchor}_${domainId}`
    },

    /**
     * Given a qualified function anchor, return fully-qualified function anchor.
     *
     * @param {string} qualifiedFunctionAnchor Qualified function anchor.
     * @return Fully-qualified function anchor.
     */
    fullyQualifiedFunctionAnchor(qualifiedFunctionAnchor) {
        return `FunctionAnchors.${qualifiedFunctionAnchor}`
    },

    /**
     * Test the upload status against a particular value or set of values.
     *
     * @param {string} uploadType Upload type.
     * @param {?} status Status to use for testing or (string or array).
     * @param {string} domainId Optional domain ID.
     * @return {boolean} True if upload status matches the specified value(s).
     */
    isUploadStatus(uploadType, status, domainId) {
        const uploadStats = VXApp.findUploadStats(uploadType, domainId)
        if (!uploadStats) {
            return false
        }
        if (_.isArray(status)) {
            return _.contains(status, uploadStats.status)
        }
        if (_.isString(status)) {
            return uploadStats.status === status
        }
        return false
    },

    /**
     * Determine whether upload is progress.
     *
     * @param {string} uploadType Upload type.
     * @param {string} domainId Optional Domain ID.
     * @return {boolean} True if upload is in progress.
     */
    isUploadInProgress(uploadType, domainId) {
        const uploadStats = VXApp.findUploadStats(uploadType, domainId)
        if (!uploadStats) {
            return false;
        }
        return _.contains( [ "ACTIVE", "TRANSMITTING", "WAITING", "INSERTING" ], uploadStats.status)
    },

    /**
     * Determine whether upload is inserting.
     *
     * @param {string} uploadType Upload type.
     * @param {string} domainId Optional Domain ID.
     * @return {boolean} True if upload is inserting.
     */
    isUploadInserting : function(uploadType, domainId) {
        const uploadStats = VXApp.findUploadStats(uploadType, domainId)
        if (!uploadStats) {
            return false
        }
        return _.contains( [ "INSERTING" ], uploadStats.status);
    },

    /**
     * Determine whether upload stats exist (i.e., have not been cleared)
     *
     * @param {string} uploadType Upload type.
     * @param {string} domainId Optional Domain ID.
     * @return {boolean} True if upload stats exist.
     */
    isUploadStats(uploadType, domainId) {
        const uploadStats = VXApp.findUploadStats(uploadType, domainId)
        if (!uploadStats) {
            return false;
        }
        return uploadStats.status !== "CLEARED"
    },

    /**
     * Determine whether upload has ended.
     *
     * @param {string} uploadType Upload type.
     * @param {string} domainId Optional Domain ID.
     * @return {boolean} True if upload has ended.
     */
    isUploadEnded(uploadType, domainId) {
        const uploadStats = VXApp.findUploadStats(uploadType, domainId)
        if (!uploadStats) {
            return false
        }
        return _.contains( ["COMPLETED", "COMPLETED_WITH_ERRORS", "STOPPED", "FAILED", "CLEARED"], uploadStats.status)
    },

    /**
     * Determine whether any upload errors exist.
     *
     * @param {string} uploadType Upload type.
     * @param {string} domainId Optional Domain ID.
     * @return {boolean} True if any messages exist.
     */
    isUploadErrors(uploadType, domainId) {
        const uploadStats = VXApp.findUploadStats(uploadType, domainId)
        if (!uploadStats) {
            return false
        }
        if (uploadStats.status === "CLEARED") {
            return false
        }
        if (!uploadStats.messages) {
            return false
        }
        return uploadStats.messages.length > 0
    },

    /**
     * Set upload status.
     *
     * @param {string} uploadType Upload type.
     * @param {string} status Upload status to set.
     * @param {string} domainId Optional Domain ID.
     */
    setUploadStatus(uploadType, status, domainId) {
        const uploadStats = VXApp.findUploadStats(uploadType, domainId)
        if (!uploadStats) {
            return
        }
        const modifier = {}
        modifier.$set = {}
        modifier.$set.status = status
        UploadStats.update(uploadStats._id, modifier)
    },

    /**
     * Get upload status.
     *
     * @param {string} uploadType Upload type.
     * @param {string} domainId Optional Domain ID.
     * @return {object} Upload stats object.
     */
    getUploadStatus(uploadType, domainId) {
        const uploadStats = VXApp.findUploadStats(uploadType, domainId)
        if (!uploadStats) {
            return
        }
        return uploadStats.status
    },

    /**
     * Get progress bar class.
     *
     * @param {string} uploadType Upload type.
     * @param {string} domainId Optional Domain ID.
     * @return {string} Progress bar class.
     */
    progressBarClass(uploadType, domainId) {
        const uploadStats = VXApp.findUploadStats(uploadType, domainId)
        if (!uploadStats) {
            return
        }
        switch (uploadStats.status) {
        case "TRANSMITTING" :
            return "progress-bar-success"
        case "WAITING" :
            return "progress-bar-success progress-bar-striped"
        case "STOPPED" :
            return "progress-bar-danger"
        case "FAILED" :
            return "progress-bar-danger"
        case "COMPLETED_WITH_ERRORS" :
            return "progress-bar-warning"
        }
        // Otherwise brand primary:
        return "progress-bar-info"
    },

    /**
     * Get progress bar active indicator.
     *
     * @param {string} uploadType Upload type.
     * @param {string} domainId Optional Domain ID.
     * @return {string} Progress bar active indicator.
     */
    progressBarActive(uploadType, domainId) {
        const uploadStats = VXApp.findUploadStats(uploadType, domainId)
        if (!uploadStats) {
            return
        }
        return uploadStats.status === "WAITING" ? "active" : ""
    },

    /**
     * Return text to be displayed on progress bar.
     *
     * @param {string} uploadType Upload type.
     * @param {string} domainId Optional Domain ID.
     * @return {string} Progress bar active indicator.
     */
    uploadProgress(uploadType, domainId) {
        const uploadStats = VXApp.findUploadStats(uploadType, domainId);
        if (!uploadStats) {
            return;
        }
        const percentComplete = VXApp.computeUploadCompletionPercentage(uploadType, domainId)
        switch (uploadStats.status) {
        case "TRANSMITTING" : {
            return Util.i18n("common.label_upload_status_sending", { percentComplete: percentComplete })
        }
        case "WAITING" : {
            return Util.i18n("common.label_upload_status_waiting")
        }
        case "INSERTING" : {
            return Util.i18n("common.label_upload_status_inserting", { percentComplete: percentComplete })
        }
        case "COMPLETED" : {
            return Util.i18n("common.label_upload_status_completed", { percentComplete: percentComplete })
        }
        case "COMPLETED_WITH_ERRORS" : {
            return Util.i18n("common.label_upload_status_completed_with_errors", { percentComplete: percentComplete })
        }
        case "STOPPED" : {
            return Util.i18n("common.label_upload_status_stopped")
        }
        case "FAILED" : {
            return Util.i18n("common.label_upload_status_failed")
        }
        }
    },

    /**
     * Return percent complete as an integer number.
     *
     * @param {string} uploadType Upload type.
     * @param {string} domainId Optional Domain ID.
     * @return {number} Percent complete.
     */
    percentComplete(uploadType, domainId) {
        return VXApp.computeUploadCompletionPercentage(uploadType, domainId)
    },

    /**
     * Compute the upload completion percentage.
     *
     * @param {string} uploadType Upload type.
     * @param {string} domainId Optional Domain ID.
     * @return {number} Completion percentage.
     */
    computeUploadCompletionPercentage(uploadType, domainId) {
        const uploadStats = VXApp.findUploadStats(uploadType, domainId)
        if (!uploadStats) {
            return;
        }
        // For these cases, return 100% so we have a full bar (looks nice):
        if (_.contains( ["WAITING", "STOPPED", "FAILED" ], uploadStats.status)) {
            return 100;
        }
        if (uploadStats.processed > 0 && uploadStats.total > 0) {
            return Math.floor(uploadStats.processed * 100 / uploadStats.total)
        }
        return 0
    },

    /**
     * Find Upload Stats object.
     *
     * @param {string} uploadType Upload type.
     * @param {string} domainId Optional Domain ID.
     * @return {object} Upload Stats object or null.
     */
    findUploadStats(uploadType, domainId) {
        domainId = domainId || Util.getCurrentDomainId(Meteor.userId())
        if (!domainId) {
            OLog.error(`vxapp.js findUploadStats unable to infer domainId from userId=${Meteor.userId()}`)
            return;
        }
        return UploadStats.findOne( { domain : domainId, uploadType : uploadType } )
    },

    /**
     * Validate all of the paths in the header row to ensure that the are properly represented in the
     * import schema.
     *
     * @param {object} importSchema Import schema.
     * @param {array} headerArray Array of columns of first row.
     * @param {array} messages Array of messages.
     * @param {string} fieldIdKey i18n bundle key of field-identifier message.
     */
    validatePaths(importSchema, headerArray, messages, fieldIdKey) {
        let valid = true
        headerArray.forEach((path) => {
            if (path === "command") {
                return
            }
            const importSchemaPath = RecordImporter.importSchemaPath(path)
            const definition = get(importSchema, importSchemaPath)
            if (!(definition && VXApp.isDefinition(definition))) {
                valid = false
                const message = {}
                message.index = 0
                message.fieldIdKey = fieldIdKey
                message.fieldIdVariables = { path: path }
                message.result = { success : false, icon : "TRIANGLE", key : "common.invalid_header_path" }
                messages.push(message)
            }
        })
        return valid
    },

    /**
     * Determine whether the given object is truly a definition, specifically that it has
     * a bindingType, a tell-tale sign that this is a definition and not a higher-level node.
     *
     * @param {object} object Object to be tested.
     * @return {boolean } True if the object is a leaf object.
     */
    isDefinition(object) {
        return Object.keys(object).includes("bindingType")
    },

    /**
     * Return the index of the command column.
     *
     * @param {array} headerArray Array of columns of first row.
     * @param {array} messages Array of messages.
     * @param {string} fieldIdKey i18n bundle key of field-identifier message.
     */
    validateCommandColumn(headerArray, messages, fieldIdKey) {
        const commandColumnIndex = headerArray.indexOf("command")
        if (commandColumnIndex < 0) {
            const message = {}
            message.index = 0
            message.fieldIdKey = fieldIdKey
            message.fieldIdVariables = { path: "error" }
            message.result = { success : false, icon : "TRIANGLE", key : "common.invalid_header_path" }
            messages.push(message)
        }
        return commandColumnIndex
    },


    /**
     * For definitions that have the lookup attribute, lookup and return the effective value
     * from another record. In such instances, the spreadsheet cell contains a key used to
     * refer another collection. This is akin to a foreign-key lookup.
     *
     * @param {string} value Value (key) from spreadsheet cell.
     * @param {object} definition Import schema definition.
     * @param {number} index Index of row containing value.
     * @param {array} messages Array of messages.
     * @param {string} fieldIdKey i18n bundle key of field-identifier message.
     * @param {object} fieldIdVariables Variables to insert into field-identifier message.
     * @return {?} Value looked up from another record.
     */
    lookupValue(uploadStats, value, definition, index, messages, fieldIdKey,
        fieldIdVariables) {
        const coll = Util.getCollection(definition.collection)
        const partialValueRegex = new RegExp(value, "i")
        const selector = {}
        if (definition.collection === "users") {
            selector["profile.domains.domainId"] = uploadStats.domain
        }
        else {
            selector.domain = uploadStats.domain
        }
        selector[definition.retiredDatePath] = { $exists: false }
        selector[definition.keyPropertyName] = partialValueRegex
        const record = coll.findOne(selector)
        if (record) {
            return record[definition.returnProperty]
        }
        const result = { success : false, icon : "TRIANGLE", key : "common.invalid_key" }
        VXApp.validateCreateMessage(result, index, messages, fieldIdKey, fieldIdVariables, value)
        return false
    },

    /**
     * Ensure required fields have values.
     *
     * @param {string} value Value to test.
     * @param {number} index Index of row containing value.
     * @param {array} messages Array of messages.
     * @param {string} fieldIdKey i18n bundle key of field-identifier message.
     * @param {object} fieldIdVariables Variables to insert into field-identifier message.
     */
    validateRequired(value, index, messages, fieldIdKey, fieldIdVariables) {
        if (!!value) {
            return true
        }
        const result = { success : false, icon : "TRIANGLE", key : "common.invalid_required_field_missing" }
        VXApp.validateCreateMessage(result, index, messages, fieldIdKey, fieldIdVariables, value)
        return false
    },

    /**
     * Generalized validation for import, conditionally adds a message
     * to the supplied messages array in place.
     *
     * @param {string} value Value to test.
     * @param {function} fn Validation function.
     * @param {number} index Index of row containing value.
     * @param {array} messages Array of messages.
     * @param {string} fieldIdKey i18n bundle key of field-identifier message.
     * @param {object} fieldIdVariables Variables to insert into field-identifier message.
     */
    validateRule(value, fn, index, messages, fieldIdKey, fieldIdVariables) {
        const result = fn(value)
        if (result.success) {
            return true
        }
        VXApp.validateCreateMessage(result, index, messages, fieldIdKey, fieldIdVariables, value)
        return false
    },

    /**
     * Lookup the code matching a supplied value.
     *
     * @param {object} definition Import schema definition.
     * @param {string} value Value to use to lookup code.
     * @param {array} codeArray Standard code array bearing codes and localizations.
     * @param {number} index Index of row containing value.
     * @param {array} messages Array of messages.
     * @param {string} fieldIdKey i18n bundle key of field-identifier message.
     * @param {object} fieldIdVariables Variables to insert into field-identifier message.
     */
    lookupCode(definition, value, codeArray, index, messages, fieldIdKey, fieldIdVariables) {
        for (const codeElement of codeArray) {
            if (codeElement.code.toUpperCase() === value.toUpperCase()) {
                return codeElement.code
            }
            if (codeElement.localized.toUpperCase() === value.toUpperCase()) {
                return codeElement.code
            }
            if (definition.partial) {
                if (codeElement.code.toUpperCase().includes(value.toUpperCase())) {
                    return codeElement.code
                }
                if (codeElement.localized.toUpperCase().includes(value.toUpperCase())) {
                    return codeElement.code
                }
            }
        }
        const result = { success : false, icon : "TRIANGLE", key : "common.invalid_code_value" }
        VXApp.validateCreateMessage(result, index, messages, fieldIdKey, fieldIdVariables, value)
        return null
    },

    /**
     * Validate the row command.
     *
     * @param {string} value Value to test.
     * @param {number} index Index of row containing command.
     * @param {array} messages Array of messages.
     * @param {string} fieldIdKey i18n bundle key of field-identifier message.
     * @param {object} fieldIdVariables Variables to insert into field-identifier message.
     */
    validateCommand(command, index, messages, fieldIdKey, fieldIdVariables) {
        if (["create", "update", "retire"].includes(command)) {
            return true
        }
        const result = { success : false, icon : "TRIANGLE", key : "common.invalid_command" }
        VXApp.validateCreateMessage(result, index, messages, fieldIdKey, fieldIdVariables, command)
        return false
    },

    /**
     * Add a validation message indicating that the record specified by the keyPath was not found
     * in an update operation.
     *
     * @param {number} index Index of row containing command.
     * @param {array} messages Array of messages.
     * @param {string} fieldIdKey i18n bundle key of field-identifier message.
     * @param {object} fieldIdVariables Variables to insert into field-identifier message.
     * @param {string} value Key value
     */
    validateRecordNotFound(index, messages, fieldIdKey, fieldIdVariables, value) {
        const result = { success : false, icon : "TRIANGLE", key : "common.invalid_key" }
        VXApp.validateCreateMessage(result, index, messages, fieldIdKey, fieldIdVariables, value)
        return false
    },

    /**
     * Generalized validation for import, conditionally mutates the array of messages to add a message.
     *
     * @param {object} result Result returned from validation function.
     * @param {number} index Index of row containing value.
     * @param {array} messages Array of messages.
     * @param {string} fieldIdKey i18n bundle key of field-identifier message.
     * @param {object} fieldIdVariables Variables to insert into field-identifier message.
     * @param {string} value Value responsible for the validation error.
     */
    validateCreateMessage(result, index, messages, fieldIdKey, fieldIdVariables, value) {
        const message = {}
        message.index = index
        message.fieldIdKey = fieldIdKey
        message.fieldIdVariables = fieldIdVariables
        message.result = result
        message.value = value
        messages.push(message)
    },

    /**
     * Return the name field of a recently-cloned record.
     *
     * @param {string} originalName Original name of cloned record.
     */
    cloneName(originalName) {
        return Util.i18n("common.template_clone_name", { originalName })
    }
}}

