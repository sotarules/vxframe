"use strict"

ContextMaker = {

    profile : (iosButtonBar) => {
        if (iosButtonBar) {
            return true
        }
        let user = Util.fetchUserLimited(Meteor.userId())
        //OLog.debug("contextmaker.js profile data ready from subscription, return=" + OLog.debugString(user))
        Session.set("PUBLISH_CURRENT_USER", { criteria : { _id : Meteor.userId() } })
        return user
    },

    log : (iosButtonBar) => {
        if (iosButtonBar) {
            return true
        }
        let publishRequest = Session.get("PUBLISH_CURRENT_LOG")
        if (publishRequest.criteria.message) {
            publishRequest.criteria.message = new RegExp(publishRequest.criteria.message, "i")
        }
        let logRows = { logRow : Log.find(publishRequest.criteria, publishRequest.options) }
        return logRows
    },

    events : (iosButtonBar) => {
        if (iosButtonBar) {
            return true
        }
        let publishRequest = Session.get("PUBLISH_CURRENT_EVENTS")
        let events = { eventRow : Events.find(publishRequest.criteria, publishRequest.options) }
        return events
    },

    "users-domains" : () => {
        let buttonMembersDomains = Session.get("BUTTON_MEMBERS_DOMAINS")
        if (!buttonMembersDomains) {
            buttonMembersDomains = "button-users"
            Session.set("BUTTON_MEMBERS_DOMAINS", buttonMembersDomains)
        }
        let currentUserRequest = Session.get("PUBLISH_AUTHORING_USER")
        if (!currentUserRequest) {
            currentUserRequest = {}
            currentUserRequest.criteria = {}
            let userArray = VXApp.findUserList()
            if (userArray.length > 0) {
                currentUserRequest.criteria = { _id: userArray[0]._id }
            }
            currentUserRequest.options = { sort : { "profile.lastName" : 1, "profile.firstName" : 1, createdAt : 1 }, limit : 1 }
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] get first user, request=" + OLog.debugString(currentUserRequest))
            Session.set("PUBLISH_AUTHORING_USER", currentUserRequest)
        }
        let user = Meteor.users.findOne(currentUserRequest.criteria, currentUserRequest.options)
        if (!user) {
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] no return from findOne, subscription is not ready")
            return
        }
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] user selected, data ready=" + OLog.debugString(currentUserRequest) + " user=" + OLog.debugString(user))
        return user
    },

    "domains-users" : () => {
        let buttonMembersDomains = Session.get("BUTTON_MEMBERS_DOMAINS")
        if (!buttonMembersDomains) {
            buttonMembersDomains = "button-users"
            Session.set("BUTTON_MEMBERS_DOMAINS", buttonMembersDomains)
        }
        let currentDomainRequest = Session.get("PUBLISH_AUTHORING_DOMAIN")
        if (!currentDomainRequest) {
            currentDomainRequest = {}
            currentDomainRequest.criteria = {}
            let domainArray = VXApp.findDomainList()
            if (domainArray.length > 0) {
                currentDomainRequest.criteria = { _id: domainArray[0]._id }
            }
            currentDomainRequest.options = { sort : { "name" : 1, createdAt : 1 }, limit : 1 }
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] get first domain, request=" + OLog.debugString(currentDomainRequest))
            Session.set("PUBLISH_AUTHORING_DOMAIN", currentDomainRequest)
        }
        let domain = Domains.findOne(currentDomainRequest.criteria, currentDomainRequest.options)
        if (!domain) {
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] no return from findOne, subscription is not ready")
            return
        }
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] domain selected, data ready=" + OLog.debugString(currentDomainRequest) + " domain=" + OLog.debugString(domain))
        return domain
    },

    user : () => {
        let currentUserRequest = {}
        currentUserRequest.criteria = { _id : UX.getParam("_id") }
        Session.set("PUBLISH_AUTHORING_USER", currentUserRequest)
        let user = Meteor.users.findOne(currentUserRequest.criteria, currentUserRequest.options)
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] user selected, data ready=" + OLog.debugString(currentUserRequest) + " user=" + OLog.debugString(user))
        return user
    },

    domain : () => {
        let domainRequest = {}
        domainRequest.criteria = { _id : UX.getParam("_id") }
        Session.set("PUBLISH_AUTHORING_DOMAIN", domainRequest)
        let domain = Domains.findOne(domainRequest.criteria, domainRequest.options)
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] domain selected, data ready=" + OLog.debugString(domainRequest) + " user=" + OLog.debugString(domain))
        return domain
    },

    tenants : (iosButtonBar) => {
        if (iosButtonBar) {
            return true
        }
        // Wait for user, we need it to get the tenant IDs (see below).
        let tenantIds = Util.getTenantIds(Meteor.userId())
        let tenantRequest = Session.get("PUBLISH_CURRENT_TENANT")
        if (!tenantRequest) {
            tenantRequest = {}
            tenantRequest.criteria = { _id: { $in: tenantIds } }
            tenantRequest.options = { sort : { name : 1, dateCreated : 1 }, limit : 1 }
        }
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] tenantRequest=" + OLog.debugString(tenantRequest))
        let tenant = Tenants.findOne(tenantRequest.criteria, tenantRequest.options)
        if (!tenant) {
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] no return from findOne, subscription is not ready")
            return
        }
        if (!tenantRequest.criteria._id) {
            tenantRequest = {}
            tenantRequest.criteria = { _id : tenant._id }
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] overriding criteria=" + OLog.debugString(tenantRequest))
            Session.set("PUBLISH_CURRENT_TENANT", tenantRequest)
        }
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] selected, data ready=" + OLog.debugString(tenantRequest) + " tenant=" + OLog.debugString(tenant))
        return tenant
    },

    tenant : (iosButtonBar) => {
        if (iosButtonBar) {
            return true
        }
        let tenantRequest = {}
        tenantRequest.criteria = { _id : UX.getParam("_id") }
        tenantRequest.options = {}
        Session.set("PUBLISH_CURRENT_TENANT", tenantRequest)
        let tenant = Tenants.findOne(tenantRequest.criteria)
        //OLog.debug("contextmaker.js route [" + Util.routePath() + "] selected, data ready=" + OLog.debugString(tenantRequest) + " tenant=" + OLog.debugString(tenant))
        return tenant
    },

    domains : (iosButtonBar) => {
        if (iosButtonBar) {
            return true
        }
        let tenantIds = Util.getTenantIds(Meteor.userId())
        let tenantRequest = Session.get("PUBLISH_CURRENT_TENANT")
        if (!tenantRequest) {
            tenantRequest = {}
            tenantRequest.criteria = { _id: { $in: tenantIds } }
            tenantRequest.options = { sort : { name : 1, dateCreated : 1 }, limit : 1 }
        }
        //OLog.debug("contextmaker.js route [" + Util.routePath() + "] tenantRequest=" + OLog.debugString(tenantRequest))
        let tenant = Tenants.findOne(tenantRequest.criteria, tenantRequest.options)
        if (!tenant) {
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] no return from findOne, subscription is not ready")
            return
        }
        if (!tenantRequest.criteria._id) {
            tenantRequest = {}
            tenantRequest.criteria = { _id : tenant._id }
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] overriding criteria=" + OLog.debugString(tenantRequest))
            Session.set("PUBLISH_CURRENT_TENANT", tenantRequest)
        }
        let domainRequest = Session.get("PUBLISH_CURRENT_DOMAIN")
        if (!domainRequest) {
            domainRequest = {}
            domainRequest.criteria = { _id: { $in: Util.getDomainIds(Meteor.userId(), tenant._id) } }
            domainRequest.options = { sort : { name : 1, dateCreated : 1 }, limit : 1 }
        }
        //OLog.debug("contextmaker.js route [" + Util.routePath() + "] domainRequest=" + OLog.debugString(domainRequest))
        let domain = Domains.findOne(domainRequest.criteria, domainRequest.options)
        if (!domain) {
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] no return from findOne, subscription is not ready")
            return
        }
        if (!domainRequest.criteria._id) {
            domainRequest = {}
            domainRequest.criteria = { _id : domain._id }
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] overriding criteria=" + OLog.debugString(domainRequest))
            Session.set("PUBLISH_CURRENT_DOMAIN", domainRequest)
        }
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] selected, data ready=" + OLog.debugString(domainRequest) + " domain=" + OLog.debugString(domain))
        // Augment tenant with domain:
        tenant.domain = domain
        return tenant
    },

    "system-settings" : () => {
        return true
    },

    templates : () => {
        let currentRequest = Session.get("PUBLISH_AUTHORING_TEMPLATE")
        if (!currentRequest) {
            let templateArray = VXApp.findTemplateList()
            if (!templateArray || templateArray.length === 0) {
                return
            }
            currentRequest = {}
            currentRequest.criteria = { _id: templateArray[0]._id }
            currentRequest.options = {}
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] overriding criteria=" + OLog.debugString(currentRequest))
            Session.set("PUBLISH_AUTHORING_TEMPLATE", currentRequest)
        }
        let template = Templates.findOne(currentRequest.criteria, currentRequest.options)
        if (!template) {
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] no return from findOne, subscription is not ready")
            return
        }
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] currentRequest=" + OLog.debugString(currentRequest))
        return template
    },

    template : () => {
        let currentRequest = {}
        currentRequest.criteria = { _id : UX.getParam("_id") }
        Session.set("PUBLISH_AUTHORING_TEMPLATE", currentRequest)
        let template = Templates.findOne(currentRequest.criteria)
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] currentRequest=" + OLog.debugString(currentRequest))
        return template
    }
}
