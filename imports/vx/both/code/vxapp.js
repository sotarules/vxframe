import {cloneDeep, get} from "lodash"
import Handlebars from "handlebars"

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
            OLog.error(`vxapp.js getSubscriptionParameters unexpected error=${OLog.errorError(error)}`)
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
        if (Util.isRoutePath("log") || Util.isRoutePath("events")) {
            return subscriptionParameters.superAdmin && subscriptionParameters.preferenceLogsDefeatTenantFilters ? "DEFEAT" : "TEXAS"
        }
        if (UX.iosIsRoutePathOnStack("users-domains") || UX.iosIsRoutePathOnStack("domains-users") || Util.isRoutePath("user") || Util.isRoutePath("domain")) {
            return subscriptionParameters.superAdmin && subscriptionParameters.preferenceAllMembersAndDomains ? "DEFEAT" : "TEAM"
        }
        if (UX.iosIsRoutePathOnStack("tenants") || Util.isRoutePath("tenant") || Util.isRoutePath("domains")) {
            return subscriptionParameters.superAdmin ? "DEFEAT" : "TEXAS"
        }
        if (Util.isRoutePath("tenants") || Util.isRoutePath("tenant") || Util.isRoutePath("domains")) {
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
     * Apply filters to a standard publishing object. There are two types of filters: criteria or text.
     * Criteria filters are simply additional properties added to the criteria. Text filters leverage
     * Regex expressions to search text fields within the collection, and the caller must supply an
     * object such as { searchPhrase: "Aetna", propertyNames: [ "name", "description" ] }.
     *
     * @param {object} publish Standard publishing object.
     * @param {object} criteria Standard criteria filter is an object merged with publishing criteria.
     * @param {object} regexFilter Object representing regex filtering criteria { searchPhrase, propertyNames }.
     * @param {boolean} includeRetired True to include retired records.
     * @return {object} Standard publishing object adjusted with filters.
     */
    applyFilters(publish, criteria, regexFilter, includeRetired) {
        const publishAdjusted = cloneDeep(publish)
        if (criteria) {
            publishAdjusted.criteria = { ...publishAdjusted.criteria, ...criteria }
        }
        if (regexFilter) {
            const cleanSearchPhrase = regexFilter.searchPhrase.replace(/[^a-zA-Z0-9 ]/g, "")
            const searchRegex = new RegExp(cleanSearchPhrase, "i")
            publishAdjusted.criteria.$or = []
            regexFilter.propertyNames.forEach(propertyName => {
                publishAdjusted.criteria.$or.push({ [propertyName]: searchRegex })
            })
        }
        if (!includeRetired) {
            publishAdjusted.criteria = { ...publishAdjusted.criteria, dateRetired: { $exists: false } }
        }
        return publishAdjusted
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
            OLog.error(`vxapp.js setSubsystemStatus unexpected error=${OLog.errorError(error)}`)
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
     * Return name of a specified function.
     *
     * @param {?} functionOrId Function record or ID.
     * @return {string} Name of the function.
     */
    fetchFunctionName(functionOrId) {
        return VXApp.fetchFunctionField(functionOrId, "name")
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
    uploadInProgress(uploadType, domainId) {
        const uploadStats = VXApp.findUploadStats(uploadType, domainId)
        if (!uploadStats) {
            return false
        }
        return _.contains( [ "ACTIVE", "TRANSMITTING", "WAITING", "PROCESSING", "UPDATING" ], uploadStats.status)
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
            return false
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
        case "PROCESSING" :
            return "progress-bar-info"
        case "UPDATING" :
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
        case "PROCESSING" : {
            return Util.i18n("common.label_upload_status_processing", { percentComplete: percentComplete })
        }
        case "UPDATING" : {
            return Util.i18n("common.label_upload_status_updating", { percentComplete: percentComplete })
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
        domainId = domainId || Util.getCurrentDomainId()
        if (!domainId) {
            OLog.error(`vxapp.js findUploadStats unable to infer domainId from userId=${Meteor.userId()}`)
            return;
        }
        return UploadStats.findOne( { domain : domainId, uploadType : uploadType } )
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
     * For definitions that have the lookup attribute, lookup and return the effective value
     * from another record. In such instances, the spreadsheet cell contains a key used to
     * refer another collection. This is akin to a foreign-key lookup.
     *
     * @param {object} uploadStats Upload stats record.
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
        const selector = {}
        if (definition.collection === "users") {
            selector["profile.domains.domainId"] = uploadStats.domain
        }
        else {
            selector.domain = uploadStats.domain
        }
        if (definition.retiredDatePath) {
            selector[definition.retiredDatePath] = { $exists: false }
        }
        selector[definition.keyPropertyName] = value
        const record = coll.findOne(selector)
        if (record) {
            return record[definition.returnProperty]
        }
        const result = { success : false, icon : "TRIANGLE", key : "common.invalid_key" }
        VXApp.validateCreateMessage(result, index, messages, fieldIdKey, fieldIdVariables, value)
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
            if (codeElement.localized === value) {
                return codeElement.code
            }
        }
        const result = { success : false, icon : "TRIANGLE", key : "common.invalid_code_value" }
        VXApp.validateCreateMessage(result, index, messages, fieldIdKey, fieldIdVariables, value)
    },

    /**
     * Add a validation message indicating that the record specified by the keyPath was not found
     * in an update operation.
     *
     * @param {number} index Index of row.
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
     * Given a metadata path return the localized field name.
     *
     * @param {array} metadataPath Metadata path name array.
     * @return {string} Comma-separated list of property names.
     */
    formatPropertyName(metadataRoot, metadataPath) {
        const metadataPathArray = metadataPath.split(".")
        const headerArray = []
        for (let segmentIndex = 0; segmentIndex < metadataPathArray.length; segmentIndex++) {
            const metaDataPathTemp = Util.tokens(metadataPath, ".", segmentIndex)
            const definition = VXApp.findDefinition(metadataRoot, metaDataPathTemp)
            headerArray.push(Util.i18nLocalize(definition.localized))
        }
        return headerArray.join(", ")
    },

    /**
     * Return the name field of a recently-cloned record.
     *
     * @param {string} originalName Original name of cloned record.
     */
    cloneName(originalName) {
        return Util.i18n("common.template_clone_name", { originalName })
    },

    /**
     * Given an entity type, return the corresponding collection.
     *
     * @param {string} entityType Entity type (e.g., CLIENT).
     * @return {object} Meteor collection.
     */
    entityCollection(entityType) {
        const entityTypeObject = Util.getCodeObject("entityType", entityType)
        return Util.getCollection(entityTypeObject.collection)
    },

    /**
     * Return Handlebars template for reports.
     *
     * @param {boolean} showHeading True to include headings in template.
     * @return {string} Handlebars template.
     */
    reportTemplate(showHeading) {
        return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
            '<html xmlns="http://www.w3.org/1999/xhtml">' +
                "<head>" +
                    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
                    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
                    "<title>{{name}}</title>" +
                    '<style type="text/css">' +
                        ".nolinkcolor > a {" +
                        " color: inherit !important;" +
                        " text-decoration: none !important;" +
                        "}" +
                    "</style>" +
                "</head>" +
                '<body leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0">' +
                    '<table cellSpacing="0" cellPadding="0" border="0" height="100%" width="100%">' +
                        "<tr>" +
                            '<td className="body" align="center" valign="top">' +
                                VXApp.reportBodyTemplate(showHeading) +
                            "</td>" +
                        "</tr>" +
                    "</table>" +
                "</body>" +
            "</html>"
    },

    /**
     * Return Handlebars body template for reports.
     *
     * @param {boolean} showHeading True to include headings in template.
     * @return {string} Handlebars template.
     */
    reportBodyTemplate(showHeading) {
        const reportHeadingTemplate = showHeading ? VXApp.reportHeadingTemplate() : ""
        return '<table cellspacing="0" cellpadding="0" border="0" height="100%" width="100%" ' +
            'style="border: none; border-collapse: collapse; ' +
            "color: #333333; display: block; font-family: verdana, arial, sans-serif; margin-bottom: 0px; margin-left: 0px; " +
            'margin-right: 0px; margin-top: 0px; table-layout: fixed; width: 100%; min-width: 100%;">' +
                "<thead>" +
                    reportHeadingTemplate +
                    '<tr style="font-size: 14px;">' +
                        "{{#each headings}}" +
                            '<th style="background-color: #F0F0F0 !important; border: 1px solid #DDDDDD; -webkit-print-color-adjust: exact !important; ' +
                            "font-weight: normal; padding: {{padding}}; text-align: {{alignment}}; " +
                            'width: {{width}}; min-width: {{width}}; max-width: {{width}}; {{overflowStyle}}">' +
                            "{{{text}}}" +
                            "</th>" +
                        "{{/each}}" +
                    "</tr>" +
                "</thead>" +
                "<tbody>" +
                    "{{#each rows}}" +
                        '<tr style="font-size: 14px;">' +
                            "{{#each columns}}" +
                                '<td style="border: 1px solid #DDDDDD; color: #333333; ' +
                                "font-family: verdana, arial, sans-serif; padding: {{padding}}; " +
                                "width: {{width}}; min-width: {{width}}; max-width: {{width}}; {{overflowStyle}}" +
                                'text-align: {{alignment}}; background-color: #FFFFFF;">' +
                                '<span class="nolinkcolor">{{{text}}}</span></td>' +
                            "{{/each}}" +
                        "</tr>" +
                    "{{/each}}" +
                "</tbody>" +
            "</table>"
    },

    /**
     * Return Handlebars heading template for reports.
     *
     * @return {string} Handlebars template.
     */
    reportHeadingTemplate() {
        return  "<tr>" +
                    '<th colspan="100%">' +
                        '<div style="padding: 0px; height: 70px; margin-bottom: 10px;">' +
                            '<table style="width: 100%; table-layout: fixed; min-height: 70px; max-height: 70px; height: 70px;">' +
                                "<tbody>" +
                                "<tr>" +
                                    '<td style="width: 100%; vertical-align: middle; text-align: left">' +
                                        '<div style="padding-left: 0px; padding-right: 0px">' +
                                            '<div style="font-family: verdana, arial, sans-serif; font-size: 16px; font-weight: normal; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' +
                                            "{{name}}" +
                                            "</div>" +
                                            '<div style="font-family: verdana, arial, sans-serif; font-size: 13px; font-weight: normal; line-height: 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' +
                                            "{{description}}" +
                                            "</div>" +
                                        "</div>" +
                                    "</td>" +
                                "</tr>" +
                                "</tbody>" +
                            "</table>" +
                        "</div>" +
                    "</th>" +
                "</tr>"
    },

    /**
     * Return the value of the specified field in a report record.
     *
     * @param {?} reportOrId Report record or ID.
     * @param {string} fieldName Field name (e.g., "name").
     * @param {string} defaultValue Optional default value.
     * @return {string} Field value.
     */
    fetchReportField(reportOrId, fieldName, defaultValue) {
        let report
        if (!reportOrId) {
            return
        }
        if (_.isObject(reportOrId)) {
            report = reportOrId
        }
        else {
            const fieldList = {}
            fieldList.fields = {}
            fieldList.fields[fieldName] = 1
            report = Reports.findOne(reportOrId, fieldList)
            if (!report) {
                OLog.error(`vxapp.js fetchReportField unable to find reportOrId=${reportOrId}`)
                return
            }
        }
        return report[fieldName] ? report[fieldName] : defaultValue
    },

    /**
     * Given report record, create and return a data object bearing the information
     * necessary to render that report.
     *
     * @param {object} report Report object.
     * @return {object} Report data object.
     */
    makeReportData(report) {
        if (!report.entityType) {
            return
        }
        const sortFields = _.sortBy(_.filter(report.fields, (field => field.sort)), "sort")
        const reportData = {}
        reportData.name = report.name
        reportData.description = report.description
        reportData.userCreated = Util.fetchFullName(report.userCreated)
        reportData.dateCreated = new Date()
        const rootProperties = VXApp.makeRootProperties(report)
        reportData.headings = VXApp.makeReportHeadings(report, rootProperties, sortFields)
        const records = VXApp.fetchReportRecords(report)
        reportData.rows = VXApp.makeReportRows(report, records, rootProperties, sortFields)
        return reportData
    },

    /**
     * Given a report record and root properties return an array of heading cells.
     *
     * @param {object} report Report record.
     * @param {object} rootProperties Root properties to be merged into each cell.
     * @param {object} sortFields Array of sort fields.
     * @return {array} Array of heading cells.
     */
    makeReportHeadings(report, rootProperties, sortFields) {
        const headings = []
        const metadataPaths = VXApp.sortedMetadataPaths(report.checked, sortFields)
        metadataPaths.forEach(metadataPath => {
            const text = VXApp.formatPropertyName(Meta[report.entityType], metadataPath)
            const columnProperties = VXApp.makeColumnProperties(report, metadataPath)
            const cell = { text, ...rootProperties, ...columnProperties }
            headings.push(cell)
        })
        return headings
    },

    /**
     * Given a report and an array of records, return an array of row objects.
     *
     * @param {object} report Report record.
     * @param {object} records Array of records.
     * @param {object} rootProperties Root properties to be merged into each cell.
     * @param {object} sortFields Array of sort fields.
     * @return {array} Array of row objects.
     */
    makeReportRows(report, records, rootProperties, sortFields) {
        const rows = []
        const metadataPaths = VXApp.sortedMetadataPaths(report.checked, sortFields)
        const metadataNode = Meta[report.entityType]
        records.forEach(record => {
            const row = {}
            row.columns = []
            row.subrowCount = 0
            metadataPaths.forEach((metadataPath, index) => {
                const definition = VXApp.findDefinition(Meta[report.entityType], metadataPath)
                const columnProperties = VXApp.makeColumnProperties(report, metadataPath)
                const pathArray = VXApp.makePathArray(metadataNode, metadataPath, record)
                const cellArray = VXApp.buildCellArray(metadataNode, metadataPath, record, pathArray, report)
                const text = VXApp.buildCellText(cellArray)
                row.subrowCount = Math.max(cellArray.length, row.subrowCount)
                const cell = { text, cellArray, pathArray, metadataPath, definition, ...rootProperties, ...columnProperties }
                if (_.findWhere(sortFields, { metadataPath }) || index === 0) {
                    cell.sort = VXApp.buildCellSort(metadataNode, metadataPath, record, pathArray, report)
                }
                row.columns.push(cell)
            })
            rows.push(row)
        })
        const sortFieldsWithDefault = sortFields
        if (sortFields.length === 0 && metadataPaths.length > 0) {
            sortFieldsWithDefault.push({ metadataPath: metadataPaths[0], sort : 1 })
        }
        OLog.debug(`vxapp.js makeReportRows preparing to sort rows for report ${report.name} ` +
            `sortFieldsWithDefault=${OLog.debugString(sortFieldsWithDefault)}`)
        VXApp.sortReportRows(rows, sortFieldsWithDefault)
        return rows
    },

    /**
     * Given a set of rows, sort the rows based on the sort fields in the cells.
     *
     * @param {array} array Array of rows.
     * @param {object} sortFields Array of sort fields.
     * @return {array} Array of row objects sorted.
     */
    sortReportRows(rows, sortFields) {
        rows.sort((rowA, rowB) => {
            for (let index = 0; index < sortFields.length; index++) {
                const sortObject = sortFields[index]
                const cellA = _.findWhere(rowA.columns, { metadataPath: sortObject.metadataPath })
                const cellB = _.findWhere(rowB.columns, { metadataPath: sortObject.metadataPath })
                const result = VXApp.sortReportRowsCompare(cellA.sort, cellB.sort)
                if (result !== 0) {
                    return result
                }
            }
            return 0
        })
    },

    /**
     * Compare two values of unknown type.
     *
     * @param {?} valueA Value A.
     * @param {?} valueB Value B.
     * @return {number} Either -1, 0, 1.
     */
    sortReportRowsCompare(valueA, valueB) {
        if (Util.isNullish(valueA) && Util.isNullish(valueB)) return 0
        if (Util.isNullish(valueA) && !Util.isNullish(valueB)) return -1
        if (!Util.isNullish(valueA) && Util.isNullish(valueB)) return +1
        if (_.isString(valueA) && _.isString(valueB)) {
            return Util.safeCompare(valueA, valueB)
        }
        if (_.isNumber(valueA) && _.isNumber(valueB)) {
            const moneyA = Math.floor(valueA * 100)
            const moneyB = Math.floor(valueB * 100)
            if (moneyA < moneyB) return -1
            if (moneyA > moneyB) return +1
            return 0
        }
        if (_.isDate(valueA) && _.isDate(valueB)) {
            const timeA = valueA.getTime()
            const timeB = valueB.getTime()
            if (timeA < timeB) return -1
            if (timeA > timeB) return +1
            return 0
        }
        if (_.isBoolean(valueA) && _.isBoolean(valueB)) {
            if (valueA === valueB) return 0
            if (valueA && !valueB) return -1
            if (!valueA && valueB) return 1
            return 0
        }
        return 0
    },

    /**
     * Return a list of metadata paths sorted in order such that any checked columns used as sort criteria
     * appear in the leftmost columns.  This makes the sort order more intuitive. Note that sorted columns
     * must appear in the report.
     *
     * @param {array} checked Array of metadata paths of checked properties in report tree.
     * @param {array} sortFields Array of field objects that user chose as sort criteria.
     * @return {array} Metadata paths in order for report.
     */
    sortedMetadataPaths(checked, sortFields) {
        const metadataPaths = []
        sortFields.forEach(field => {
            metadataPaths.push(field.metadataPath)
        })
        checked?.forEach(metadataPath => {
            if (!metadataPaths.includes(metadataPath)) {
                metadataPaths.push(metadataPath)
            }
        })
        return metadataPaths
    },

    /**
     * Given a report record, return root properties.
     *
     * @param {object} report Report record.
     * @return {object} Root properties.
     */
    makeRootProperties(report) {
        const rootProperties = {}
        rootProperties.padding = VXApp.findReportField(report, "ROOT", "padding") || "10px"
        rootProperties.limit = VXApp.findReportField(report, "ROOT", "limit") || 1000
        return rootProperties
    },

    /**
     * Given a report record and metadata path, return column properties.
     *
     * @param {object} report Report record.
     * @param {string} metadataPath Metadata path.
     * @return {object} Column properties.
     */
    makeColumnProperties(report, metadataPath) {
        const columnProperties = {}
        columnProperties.metadataPath = metadataPath
        columnProperties.alignment = VXApp.findReportField(report, metadataPath, "alignment")?.toLowerCase() || "left"
        columnProperties.width = VXApp.findReportField(report, metadataPath, "width") || "auto"
        columnProperties.overflow = VXApp.findReportField(report, metadataPath, "overflow") || "TRUNCATE"
        columnProperties.overflowStyle = VXApp.makeOverflowStyle(columnProperties.overflow)
        return columnProperties
    },

    /**
     * Return the style specification for given overflow setting.
     *
     * @param {string} overflow Overflow setting (e.g., WRAP, TRUNCATE).
     * @return {string} Overflow style.
     */
    makeOverflowStyle(overflow) {
        switch (overflow) {
        case "WRAP" : return "white-space: normal; word-wrap: break-word;"
        case "TRUNCATE" : return "white-space: nowrap; text-overflow:ellipsis; overflow: hidden;"
        }
        return "white-space: normal; word-wrap: break-word;"
    },

    /**
     * Fetch report rows.
     *
     * @param {object} report Report record.
     * @return {array} Array of records.
     */
    fetchReportRecords(report) {
        const fetchParameters = VXApp.makeFetchParameters(report)
        const collection = VXApp.entityCollection(report.entityType)
        OLog.debug(`vxapp.js fetchReportRecords name=${report.name} fetchParameters=${OLog.debugString(fetchParameters)}`)
        return collection.find(fetchParameters.criteria, fetchParameters.options).fetch()
    },

    /**
     * Make fetch parameters object that defines the selection parameters and sorting of records.
     * This is done by analyzing the supplied report and building a result object consisting of
     * criteria, options, regex filter and post-fetch sort.
     *
     * @param {object} report Report record.
     * @return {array} Fetch parameters object.
     */
    makeFetchParameters(report) {
        const entityTypeObject = Util.getCodeObject("entityType", report.entityType)
        const fetchParameters = {}
        fetchParameters.criteria = {}
        if (entityTypeObject.domainPath) {
            fetchParameters.criteria[entityTypeObject.domainPath] = report.domain
        }
        if (entityTypeObject.retirePath) {
            fetchParameters.criteria[entityTypeObject.retirePath] = { $exists: false }
        }
        fetchParameters.options = {}
        const limit = VXApp.findReportField(report, "ROOT", "limit")
        if (Util.isNullish(limit)) {
            fetchParameters.options.limit = 1000
        }
        else if (limit > 0) {
            fetchParameters.options.limit = limit
        }
        fetchParameters.regexFilter = {}
        report.fields?.forEach(field => {
            const definition = VXApp.findDefinition(Meta[report.entityType], field.metadataPath)
            if (!definition) {
                return
            }
            if (!(field.operator === "EXISTS" || (field.operator && field.filter))) {
                return
            }
            let expression
            if (definition.bindingType === "String") {
                if (field.operator === "EQUAL") {
                    expression = {[field.metadataPath]: { $eq : field.filter }}
                }
                if (field.operator === "LESS_THAN") {
                    expression = {[field.metadataPath]: { $lt: field.filter }}
                }
                if (field.operator === "GREATER_THAN") {
                    expression = {[field.metadataPath]: { $gt: field.filter }}
                }
                if (field.operator === "CONTAINS") {
                    const cleanSearchPhrase = field.filter?.replace(/[^a-zA-Z0-9 ]/g, "")
                    const searchRegex = new RegExp(cleanSearchPhrase, "i")
                    expression = {[field.metadataPath]: searchRegex}
                }
                if (field.operator === "EXISTS") {
                    expression = this.makeExistsExpression(field)
                }
            }
            if (definition.bindingType === "Integer") {
                if (field.operator === "EQUAL") {
                    expression = {[field.metadataPath]: { $eq : field.filter }}
                }
                if (field.operator === "LESS_THAN") {
                    expression = {[field.metadataPath]: { $lt: field.filter }}
                }
                if (field.operator === "GREATER_THAN") {
                    expression = {[field.metadataPath]: { $gt: field.filter }}
                }
                if (field.operator === "EXISTS") {
                    expression = this.makeExistsExpression(field)
                }
            }
            if (definition.bindingType === "Date") {
                if (field.operator === "EQUAL") {
                    expression = {[field.metadataPath]: { $eq : field.filter }}
                }
                if (field.operator === "LESS_THAN") {
                    expression = {[field.metadataPath]: { $lt: field.filter }}
                }
                if (field.operator === "GREATER_THAN") {
                    expression = {[field.metadataPath]: { $gt: field.filter }}
                }
                if (field.operator === "EXISTS") {
                    expression = {[field.metadataPath]: { $exists: true }}
                }
            }
            if (definition.bindingType === "Boolean") {
                if (field.operator === "EQUAL") {
                    expression = {[field.metadataPath]: { $eq : field.filter }}
                }
                if (field.operator === "EXISTS") {
                    expression = {[field.metadataPath]: { $exists: true }}
                }
            }
            if (expression) {
                if (field.negation === "NOT") {
                    expression = { $nor: [expression] }
                }
                fetchParameters.criteria.$and = fetchParameters.criteria.$and || []
                fetchParameters.criteria.$and.push(expression)
            }
        })
        return fetchParameters
    },

    makeExistsExpression(field) {
        return {[field.metadataPath]:{ $exists: true }}
        //return { $and: [ {[field.metadataPath]:{ $exists: true }}, {[field.metadataPath]: { $ne: null }} ] }
    },

    /**
     * Given a lodash get-style path specification, convert it to a path into our custom metadata.
     * This is done by removing array references.
     *
     * @param {string} path Path specification.
     * @return {string} Adjusted path specification to retrieve metadata.
     */
    metadataPath(path) {
        return path.replace(/\[\d+\]/g, "")
    },

    /**
     * Given import schema path without array references, retrieve the proper
     * metadata definition. This is done by breaking the path into segments and then
     * traversing the metadata to retrive the matching definition.
     *
     * @param {object} metadataNode Metadata node (root).
     * @param {string} metadataPath Metadata path.
     * @return {object} Metadata definition.
     */
    findDefinition(metadataNode, metadataPath) {
        const metadataPathArray = metadataPath.split(".")
        for (let segmentIndex = 0; segmentIndex < metadataPathArray.length; segmentIndex++) {
            const segmentName = metadataPathArray[segmentIndex]
            metadataNode =  metadataNode[segmentName]
            if (!metadataNode) {
                OLog.debug(`vxapp.js findDefinition cannot find metadata definition of segmentName=${segmentName}`)
                return
            }
            if (segmentIndex === metadataPathArray.length - 1) {
                return metadataNode
            }
            metadataNode = metadataNode.definition
            if (!metadataNode) {
                OLog.error(`vxapp.js findDefinition metadata structure cannot find definition for metadataPath=${metadataPath}`)
                return
            }
        }
        OLog.error(`vxap.js findDefinition metadata structure error metadataPath=${metadataPath}`)
        return
    },

    /**
     * Find report field using metadata path and field name.
     *
     * @param {object} report Report record.
     * @param {string} metadataPath Metadata path.
     * @param {string} fieldName Name of field.
     * @return {?} Field value or null.
     */
    findReportField(report, metadataPath, fieldName) {
        const fieldsObject =  _.findWhere(report.fields, { metadataPath })
        return fieldsObject ? fieldsObject[fieldName] : null
    },

    /**
     * Make a path array consisting of get-friendly paths. The path array contains all combinations
     * of nested array elements.
     *
     * @param {object} metadataNode Metadata node (root).
     * @param {string} metadataPath Metadata path.
     * @param {object} record Data record being processed.
     * @return {object} Parh array.
     */
    makePathArray(metadataNode, metadataPath, record) {
        const pathIndex = 0
        const pathStem = null
        const pathArray = []
        VXApp.mutatePathArrayRecursive(metadataNode, metadataPath, record, pathIndex, pathStem, pathArray)
        return pathArray
    },

    /**
     * Recursive part of the process to mutuate the path array in place.
     *
     * @param {object} metadataNode Metadata node (root).
     * @param {string} metadataPath Metadata path.
     * @param {object} record Data record being processed.
     * @param {number} pathIndex Index of segment being processed.
     * @param {string} pathStem Path stem.
     * @param {array} pathArray Path array.
     */
    mutatePathArrayRecursive(metadataNode, metadataPath, record,
        pathIndex, pathStem, pathArray) {
        const metadataPathArray = metadataPath.split(".")
        const metadataPathTemp = metadataPathArray.slice(0, pathIndex + 1).join(".")
        const metadataNodeTemp = VXApp.findDefinition(metadataNode, metadataPathTemp)
        if (!metadataNodeTemp) {
            OLog.error(`vxapp.js mutatePathArrayRecursive cannot find metadata definition of metadataPathTemp=${metadataPathTemp}`)
            return
        }
        const segmentPath = metadataPathArray[pathIndex]
        pathStem = Util.isNullish(pathStem) ? segmentPath : `${pathStem}.${segmentPath}`
        if (metadataNodeTemp.bindingType !== "Array") {
            if (pathIndex === metadataPathArray.length - 1) {
                pathArray.push(pathStem)
                return
            }
            pathIndex++
            VXApp.mutatePathArrayRecursive(metadataNode, metadataPath, record,
                pathIndex, pathStem, pathArray)
            return
        }
        // If at any level an array is missing, pretend like there is one element.
        // This makes a placeholder so that data "lines up" on the report.
        const recordArray = get(record, pathStem) || [ null ]
        pathIndex++
        for (let recordIndex = 0; recordIndex < recordArray.length; recordIndex++) {
            const pathStemWithIndex = `${pathStem}[${recordIndex}]`
            VXApp.mutatePathArrayRecursive(metadataNode, metadataPath, record,
                pathIndex, pathStemWithIndex, pathArray)
        }
    },

    /**
     * Build the cell array consisting of raw values.
     *
     * @param {object} metadataNode Metadata node (root).
     * @param {string} metadataPath Metadata path.
     * @param {object} record Data record being processed.
     * @param {array} pathArray Path array.
     * @param {object} report Report record.
     * @return {array} Cell array consisting of raw values.
     */
    buildCellArray(metadataNode, metadataPath, record, pathArray, report) {
        const definition = VXApp.findDefinition(metadataNode, metadataPath)
        const cellArray = []
        pathArray.forEach(path => {
            const value = VXApp.transformText(definition, report.domain, get(record, path))
            const count = VXApp.countRowsNeeded(metadataNode, metadataPath, record, path, report)
            _.times(count, ()=> {
                cellArray.push(value)
            })
        })
        return cellArray
    },

    /**
     * Build the cell text including line breaks to separate sub-rows.
     *
     * @param {object} cellArray Array of raw data.
     * @return {string} Cell text.
     */
    buildCellText(cellArray) {
        const textArray = cellArray.map(value => Util.isNullish(value) ? "&nbsp;" : value)
        return textArray.join("<br/>")
    },

    /**
     * Compute the count of sub-rows used as a repeat count for the current value.
     * This is to create a report where certain values are repeated to make a
     * "cartesian product" much like a relation. This makes "child" values line up
     * on the report and spreadsheet rows.
     *
     * @param {object} metadataNode Metadata node (root).
     * @param {string} metadataPath Metadata path.
     * @param {object} record Data record being processed.
     * @param {string} path Record path (get format).
     * @param {object} report Report record.
     * @return {number} Count of necessary rows.
     */
    countRowsNeeded(metadataNode, metadataPath, record, path, report) {
        const topLevel = !metadataPath.includes(".")
        if (topLevel) {
            return 1
        }
        const parentMetadataPath = Util.removeToken(metadataPath, ".")
        const containerPath = Util.removeToken(path, ".")
        const containerObject = get(record, containerPath)
        if (!containerObject) {
            return 1
        }
        const pathIndex = metadataPath.split(".").length - 1
        const count = VXApp.countRowsNeededRecursive(metadataNode, record, report, parentMetadataPath, containerObject, pathIndex)
        return count
    },

    countRowsNeededRecursive(metadataNode, record, report, parentMetadataPath, containerObject, pathIndex) {
        let count = 0
        const metadataPathsChildren = []
        _.each(report.checked, metadataPath => {
            if (VXApp.metadataPathStartsWith(metadataPath, parentMetadataPath)) {
                const reportCheckedArray = metadataPath.split(".")
                if (reportCheckedArray.length >= pathIndex) {
                    const metadataPathTemp = reportCheckedArray.slice(0, pathIndex + 1).join(".")
                    metadataPathsChildren.push(metadataPathTemp)
                }
            }
        })
        const metadataPathsChildrenUnique = _.uniq(metadataPathsChildren)
        let nestedArray = false
        metadataPathsChildrenUnique.forEach(metadataPath => {
            const definition = VXApp.findDefinition(metadataNode, metadataPath)
            if (definition.bindingType === "Array") {
                const segment = Util.lastToken(metadataPath, ".")
                const childMetadataPath = `${parentMetadataPath}.${segment}`
                const theArray = containerObject[segment]
                theArray?.forEach(childContainerObject => {
                    nestedArray = true
                    const result = VXApp.countRowsNeededRecursive(metadataNode, record, report, childMetadataPath,
                        childContainerObject, pathIndex + 1)
                    count += result
                })
            }
        })
        return nestedArray ? count : 1
    },

    /**
     * Compare two metadata paths consisting of period-separated segments and determine
     * whether both paths start with the same segments.
     *
     * @param {string} metadataPath Metadata path to be tested.
     * @param {string} parentMetadataPath Parent metadata path to compare.
     */
    metadataPathStartsWith(metadataPath, parentMetadataPath) {
        const metadataPathArray = metadataPath.split(".")
        const parentMetadataPathArray = parentMetadataPath.split(".")
        for (let index = 0; index < parentMetadataPathArray.length; index++) {
            if (parentMetadataPathArray[index] !== metadataPathArray[index]) {
                return false
            }
        }
        return true
    },

    /**
     * Transform a record property into cell text using metadata definition.
     *
     * @param {object} definition Metadata definition.
     * @param {string} domainId Domain ID (needed for date to get timezone).
     * @param {?} value Value to transform.
     * @param {boolean} lookupOnly True to transform lookups only.
     * @return {string} Transformed property.
     */
    transformText(definition, domainId, value, lookupOnly)   {
        if (!value) {
            return value
        }
        if (definition.renderFunction) {
            return definition.renderFunction(value)
        }
        if (definition.list) {
            return Util.localizeCode(definition.list, value)
        }
        if (definition.codeArrayFunction) {
            const codeArray = definition.codeArrayFunction(domainId)
            return Util.getCodeLocalizedFromArray(codeArray, value)
        }
        if (lookupOnly) {
            return value
        }
        if (definition.format) {
            return definition.format.render(value, "US")
        }
        if (definition.bindingType === "Date") {
            return Util.formatDate(value, Util.fetchDomainTimezone(domainId), definition.dateFormat)
        }
        return value
    },

    /**
     * Build the cell sort value.
     *
     * @param {object} metadataNode Metadata node (root).
     * @param {string} metadataPath Metadata path.
     * @param {object} record Data record being processed.
     * @param {array} pathArray Path array.
     * @param {object} report Report record.
     * @return {?} Cell sort value.
     */
    buildCellSort(metadataNode, metadataPath, record, pathArray, report) {
        const definition = VXApp.findDefinition(metadataNode, metadataPath)
        const value = get(record, pathArray[0])
        if (!value) {
            return value
        }
        return VXApp.transformText(definition, report.domain, value, true)
    },

    /**
     * Render report and data objects into HTML.
     *
     * @param {object} report Report object.
     * @param {object} reportData Data object.
     * @param {boolean} showHeading True to include heading.
     * @param {boolean} email True to make report for email.
     * @return {string} HTML rendered.
     */
    makeReportHtml(report, reportData, showHeading, email) {
        const template = email ? VXApp.reportTemplate(showHeading) : VXApp.reportBodyTemplate(showHeading)
        const bodyTemplate = Handlebars.compile(template)
        return bodyTemplate(reportData)
    },

    /**
     * Make array of reports suituable for dropdown list.
     *
     * @param {string} domainId Optional domain ID.
     * @return {array} Code array of reports.
     */
    makeReportArray(domainId) {
        domainId = domainId || Util.getCurrentDomainId()
        const codeArray = Reports.find({ dateRetired: { $exists: false }, domain : domainId}).map(report => {
            return { code : report._id, localized : report.name }
        })
        codeArray.sort((recordA, recordB) => {
            return Util.safeCompare(recordA.localized, recordB.localized)
        })
        return codeArray
    },

    /**
     * Return GUID.
     *
     * @return {string} GUID.
     */
    makeImportGuid() {
        return Util.getGuid()
    },

    /**
     * Return current date.
     *
     * @return {date} Current date.
     */
    makeImportDate() {
        return new Date()
    },

    /**
     * Return upload user ID.
     *
     * @return {string} User ID.
     */
    makeImportUser(uploadStats) {
        return uploadStats.userId
    }
}}
