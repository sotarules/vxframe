"use strict"

import {
    setPublishAuthoringDomain,
    setPublishAuthoringTemplate,
    setPublishAuthoringUser,
    setPublishCurrentDomain
} from "/imports/vx/client/code/actions"

ContextMaker = {

    "users-domains"() {
        let publishAuthoringUser = Store.getState().publishAuthoringUser
        if (!publishAuthoringUser) {
            publishAuthoringUser = {}
            publishAuthoringUser.criteria = {}
            let userArray = VXApp.findUserList()
            if (userArray.length > 0) {
                publishAuthoringUser.criteria = { _id: userArray[0]._id }
            }
            publishAuthoringUser.options = { sort : { "profile.lastName" : 1, "profile.firstName" : 1, createdAt : 1 }, limit : 1 }
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] overriding publishAuthoringUser=" + OLog.debugString(publishAuthoringUser))
            Store.dispatch(setPublishAuthoringUser(publishAuthoringUser))
        }
        let user = Meteor.users.findOne(publishAuthoringUser.criteria, publishAuthoringUser.options)
        if (!user) {
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] no return from findOne, subscription is not ready")
            return
        }
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] user selected, data ready=" + OLog.debugString(publishAuthoringUser) + " user=" + OLog.debugString(user))
        return user
    },

    "domains-users"() {
        let publishAuthoringDomain = Store.getState().publishAuthoringDomain
        if (!publishAuthoringDomain) {
            publishAuthoringDomain = {}
            publishAuthoringDomain.criteria = {}
            let domainArray = VXApp.findDomainList()
            if (domainArray.length > 0) {
                publishAuthoringDomain.criteria = { _id: domainArray[0]._id }
            }
            publishAuthoringDomain.options = { sort : { "name" : 1, createdAt : 1 }, limit : 1 }
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] overriding publishAuthoringDomain=" + OLog.debugString(publishAuthoringDomain))
            Store.dispatch(setPublishAuthoringDomain(publishAuthoringDomain))
        }
        let domain = Domains.findOne(publishAuthoringDomain.criteria, publishAuthoringDomain.options)
        if (!domain) {
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] no return from findOne, subscription is not ready")
            return
        }
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] domain selected, data ready=" + OLog.debugString(publishAuthoringDomain) + " domain=" + OLog.debugString(domain))
        return domain
    },

    user() {
        const criteria = { _id : UX.lastSegment() }
        OLog.debug(`contextmaker.js route [user] criteria=${OLog.debugString(criteria)}`)
        return  Meteor.users.findOne(criteria)
    },

    domain() {
        const criteria = { _id : UX.lastSegment() }
        OLog.debug(`contextmaker.js route [domain] criteria=${OLog.debugString(criteria)}`)
        return Domains.findOne(criteria)
    },

    tenants() {
        let tenantIds = Util.getTenantIds(Meteor.userId())
        let publishCurrentTenant = Store.getState().publishCurrentTenant
        if (!publishCurrentTenant) {
            publishCurrentTenant = {}
            publishCurrentTenant.criteria = { _id: { $in: tenantIds } }
            publishCurrentTenant.options = { sort : { name : 1, dateCreated : 1 }, limit : 1 }
        }
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] publishCurrentTenant=" + OLog.debugString(publishCurrentTenant))
        let tenant = Tenants.findOne(publishCurrentTenant.criteria, publishCurrentTenant.options)
        if (!tenant) {
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] no return from findOne, subscription is not ready")
            return
        }
        if (!publishCurrentTenant.criteria._id) {
            publishCurrentTenant = {}
            publishCurrentTenant.criteria = { _id : tenant._id }
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] overriding criteria=" + OLog.debugString(publishCurrentTenant))
            Store.dispatch(setPublishAuthoringTemplate(publishCurrentTenant))
        }
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] selected, data ready=" + OLog.debugString(publishCurrentTenant) + " tenant=" + OLog.debugString(tenant))
        return tenant
    },

    tenant() {
        const criteria = { _id : UX.lastSegment() }
        OLog.debug(`contextmaker.js route [tenant] criteria=${OLog.debugString(criteria)}`)
        return Tenants.findOne(criteria)
    },

    domains() {
        let tenantIds = Util.getTenantIds(Meteor.userId())
        let publishCurrentTenant = Store.getState().publishCurrentTenant
        if (!publishCurrentTenant) {
            publishCurrentTenant = {}
            publishCurrentTenant.criteria = { _id: { $in: tenantIds } }
            publishCurrentTenant.options = { sort : { name : 1, dateCreated : 1 }, limit : 1 }
        }
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] publishCurrentTenant=" + OLog.debugString(publishCurrentTenant))
        let tenant = Tenants.findOne(publishCurrentTenant.criteria, publishCurrentTenant.options)
        if (!tenant) {
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] no return from findOne, subscription is not ready")
            return
        }
        if (!publishCurrentTenant.criteria._id) {
            publishCurrentTenant = {}
            publishCurrentTenant.criteria = { _id : tenant._id }
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] overriding publishCurrentTenant=" + OLog.debugString(publishCurrentTenant))
            Store.dispatch(setPublishAuthoringTemplate(publishCurrentTenant))
        }
        let publishCurrentDomain = Store.getState().publishCurrentDomain
        if (!publishCurrentDomain) {
            publishCurrentDomain = {}
            publishCurrentDomain.criteria = { _id: { $in: Util.getDomainIds(Meteor.userId(), tenant._id) } }
            publishCurrentDomain.options = { sort : { name : 1, dateCreated : 1 }, limit : 1 }
        }
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] domainRequest=" + OLog.debugString(publishCurrentDomain))
        let domain = Domains.findOne(publishCurrentDomain.criteria, publishCurrentDomain.options)
        if (!domain) {
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] no return from findOne, subscription is not ready")
            return
        }
        if (!publishCurrentDomain.criteria._id) {
            publishCurrentDomain = {}
            publishCurrentDomain.criteria = { _id : domain._id }
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] overriding criteria=" + OLog.debugString(publishCurrentDomain))
            Store.dispatch(setPublishCurrentDomain(publishCurrentDomain))
        }
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] selected, data ready=" + OLog.debugString(publishCurrentDomain) + " domain=" + OLog.debugString(domain))
        // Augment tenant with domain:
        tenant.domain = domain
        return tenant
    },

    templates() {
        let publishAuthoringTemplate = Store.getState().publishAuthoringTemplate
        if (!publishAuthoringTemplate) {
            let templateArray = VXApp.findTemplateList()
            if (!templateArray || templateArray.length === 0) {
                return
            }
            publishAuthoringTemplate = {}
            publishAuthoringTemplate.criteria = { _id: templateArray[0]._id }
            publishAuthoringTemplate.options = {}
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] overriding publishAuthoringTemplate=" + OLog.debugString(publishAuthoringTemplate))
            Store.dispatch(setPublishAuthoringTemplate(publishAuthoringTemplate))
        }
        let template = Templates.findOne(publishAuthoringTemplate.criteria, publishAuthoringTemplate.options)
        if (!template) {
            OLog.debug("contextmaker.js route [" + Util.routePath() + "] no return from findOne, subscription is not ready")
            return
        }
        OLog.debug("contextmaker.js route [" + Util.routePath() + "] publishAuthoringTemplate=" + OLog.debugString(publishAuthoringTemplate))
        return template
    },

    template() {
        const criteria = { _id : UX.lastSegment() }
        OLog.debug(`contextmaker.js route [template] criteria=${OLog.debugString(criteria)}`)
        return Templates.findOne(criteria)
    }
}
