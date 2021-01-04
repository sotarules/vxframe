"use strict"

VXApp = _.extend(VXApp || {}, {

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

            let subscriptionParameters = {}
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
            funktion = Carriers.findOne(functionOrId, fieldList)
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
        const functionAnchor = Util.fetchTenantField(tenantId, "functionAnchor")
        if (!functionAnchor) {
            OLog.error("vxapp.js functionAnchor no function anchor defined in tenant settings")
            return
        }
        return functionAnchor
    }
})

