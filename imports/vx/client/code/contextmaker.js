"use strict"

import { setPublishAuthoringUser } from "/imports/vx/client/code/actions"
import { setPublishAuthoringDomain } from "/imports/vx/client/code/actions"
import { setPublishAuthoringTemplate } from "/imports/vx/client/code/actions"
import { setPublishCurrentTenant } from "/imports/vx/client/code/actions"
import { setPublishCurrentDomain } from "/imports/vx/client/code/actions"

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
        let publishAuthoringUser = {}
        if (Util.isRoutePath("/user/")) {
            publishAuthoringUser.criteria = { _id : UX.getParam("_id") }
            OLog.debug(`contextmaker.js route [user] *correct* publishAuthoringUser=${OLog.debugString(publishAuthoringUser)}`)
            Store.dispatch(setPublishAuthoringUser(publishAuthoringUser))
        }
        else {
            publishAuthoringUser = Store.getState().publishAuthoringUser
            OLog.debug(`contextmaker.js route [user] *incorrect* publishAuthoringUser=${OLog.debugString(publishAuthoringUser)}`)
        }
        return Meteor.users.findOne(publishAuthoringUser.criteria)
    },

    domain() {
        let publishAuthoringDomain = {}
        if (Util.isRoutePath("/domain/")) {
            publishAuthoringDomain.criteria = { _id : UX.getParam("_id") }
            OLog.debug(`contextmaker.js route [domain] *correct* publishAuthoringDomain=${OLog.debugString(publishAuthoringDomain)}`)
            Store.dispatch(setPublishAuthoringDomain(publishAuthoringDomain))
        }
        else {
            publishAuthoringDomain = Store.getState().publishAuthoringDomain
            OLog.debug(`contextmaker.js route [domain] *incorrect* publishAuthoringDomain=${OLog.debugString(publishAuthoringDomain)}`)
        }
        return Domains.findOne(publishAuthoringDomain.criteria)
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
        let publishCurrentTenant = {}
        if (Util.isRoutePath("/tenant/")) {
            publishCurrentTenant.criteria = { _id : UX.getParam("_id") }
            OLog.debug(`contextmaker.js route [tenant] *correct* publishCurrentTenant=${OLog.debugString(publishCurrentTenant)}`)
            Store.dispatch(setPublishCurrentTenant(publishCurrentTenant))
        }
        else {
            publishCurrentTenant = Store.getState().publishCurrentTenant
            OLog.debug(`contextmaker.js route [tenant] *incorrect* publishCurrentTenant=${OLog.debugString(publishCurrentTenant)}`)
        }
        return Tenants.findOne(publishCurrentTenant.criteria)
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
        let publishAuthoringTemplate = {}
        if (Util.isRoutePath("/template/")) {
            publishAuthoringTemplate.criteria = { _id : UX.getParam("_id") }
            OLog.debug(`contextmaker.js route [template] *correct* publishAuthoringTemplate=${OLog.debugString(publishAuthoringTemplate)}`)
            Store.dispatch(setPublishAuthoringTemplate(publishAuthoringTemplate))
        }
        else {
            publishAuthoringTemplate = Store.getState().publishAuthoringTemplate
            OLog.debug(`contextmaker.js route [template] *incorrect* publishAuthoringTemplate=${OLog.debugString(publishAuthoringTemplate)}`)
        }
        return Templates.findOne(publishAuthoringTemplate.criteria)
    }
}
