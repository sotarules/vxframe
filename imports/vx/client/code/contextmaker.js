import {
    setPublishCurrentTenant,
    setPublishAuthoringDomain,
    setPublishAuthoringTemplate,
    setPublishAuthoringFunction,
    setPublishAuthoringUser,
    setPublishCurrentDomain
} from "/imports/vx/client/code/actions"

ContextMaker = {

    "users-domainsBeforeRender"() {
        VXApp.selectFirstRecord("publishAuthoringUser", setPublishAuthoringUser, VXApp.findUserList)
    },

    "users-domains"() {
        const publishAuthoringUser = Store.getState().publishAuthoringUser
        if (!publishAuthoringUser) {
            OLog.debug("contextmaker.js users-domains redux variable publishAuthoringUser is *falsy* " +
                "unable to return user list")
            return
        }
        const user = Meteor.users.findOne(publishAuthoringUser.criteria, publishAuthoringUser.options)
        if (!user) {
            OLog.debug("contextmaker.js users-domains *falsy* return from Meteor.users.findOne, subscription is not ready")
            return
        }
        OLog.debug(`contextmaker.js users-domains publishAuthoringUser=${OLog.debugString(publishAuthoringUser)}`)
        return user
    },

    user() {
        const criteria = { _id : UX.lastSegment() }
        OLog.debug(`contextmaker.js route user criteria=${OLog.debugString(criteria)}`)
        return Meteor.users.findOne(criteria)
    },

    "domains-usersBeforeRender"() {
        VXApp.selectFirstRecord("publishAuthoringDomain", setPublishAuthoringDomain, VXApp.findDomainList)
    },

    "domains-users"() {
        const publishAuthoringDomain = Store.getState().publishAuthoringDomain
        if (!publishAuthoringDomain) {
            OLog.debug("contextmaker.js domains-users redux variable publishAuthoringDomain is *falsy* " +
                "unable to return domain list")
            return
        }
        const domain = Domains.findOne(publishAuthoringDomain.criteria, publishAuthoringDomain.options)
        if (!domain) {
            OLog.debug("contextmaker.js domains-users *falsy* return from Domains.findOne, subscription is not ready")
            return
        }
        OLog.debug(`contextmaker.js domains-users publishAuthoringUser=${OLog.debugString(publishAuthoringDomain)}`)
        return domain
    },

    domain() {
        const criteria = { _id : UX.lastSegment() }
        OLog.debug(`contextmaker.js route domain criteria=${OLog.debugString(criteria)}`)
        return Domains.findOne(criteria)
    },

    tenantsBeforeRender() {
        VXApp.selectFirstRecord("publishCurrentTenant", setPublishCurrentTenant, VXApp.findTenantList)
    },

    tenants() {
        const publishCurrentTenant = Store.getState().publishCurrentTenant
        if (!publishCurrentTenant) {
            OLog.debug("contextmaker.js tenants redux variable publishCurrentTenant is *falsy* " +
                "unable to return tenant list")
            return
        }
        const tenant = Tenants.findOne(publishCurrentTenant.criteria, publishCurrentTenant.options)
        if (!tenant) {
            OLog.debug("contextmaker.js tenants *falsy* return from Tenants.findOne, subscription is not ready")
            return
        }
        OLog.debug(`contextmaker.js tenants publishCurrentTenant=${OLog.debugString(publishCurrentTenant)}`)
        return tenant
    },

    tenant() {
        const criteria = { _id : UX.lastSegment() }
        OLog.debug(`contextmaker.js route tenant criteria=${OLog.debugString(criteria)}`)
        return Tenants.findOne(criteria)
    },

    domainsBeforeRender() {
        let publishCurrentTenant = Store.getState().publishCurrentTenant
        if (!publishCurrentTenant) {
            publishCurrentTenant = {}
            publishCurrentTenant.criteria = { _id: Util.getCurrentTenantId(Meteor.userId()) }
            publishCurrentTenant.options = {}
            OLog.debug("contextmaker.js domainsBeforeRender tenant *overriding* " +
                `publishCurrentTenant=${OLog.debugString(publishCurrentTenant)}`)
            Store.dispatch(setPublishCurrentTenant(publishCurrentTenant))
        }
        else {
            OLog.debug("contextmaker.js domainsBeforeRender tenant redux already intialized " +
                `publishCurrentTenant=${OLog.debugString(publishCurrentTenant)}`)
        }
        let publishCurrentDomain = Store.getState().publishCurrentDomain
        if (!publishCurrentDomain) {
            publishCurrentDomain = {}
            publishCurrentDomain.criteria = { _id: Util.getCurrentDomainId(Meteor.userId()) }
            publishCurrentDomain.options = {}
            OLog.debug("contextmaker.js domainsBeforeRender domain *overriding* " +
                `publishCurrentDomain=${OLog.debugString(publishCurrentDomain)}`)
            Store.dispatch(setPublishCurrentDomain(publishCurrentDomain))
        }
        else {
            OLog.debug("contextmaker.js domainsBeforeRender domain redux already intialized " +
                `publishCurrentDomain=${OLog.debugString(publishCurrentDomain)}`)
        }
    },

    domains() {
        const publishCurrentTenant = Store.getState().publishCurrentTenant
        const publishCurrentDomain = Store.getState().publishCurrentDomain
        if (!(publishCurrentTenant && publishCurrentDomain)) {
            OLog.error("contextmaker.js domains redux not initialized " +
                `publishCurrentTenant=${OLog.debugString(publishCurrentTenant)} ` +
                `publishCurrentDomain=${OLog.debugString(publishCurrentDomain)}`)
            return
        }
        OLog.debug("contextmaker.js domains " +
            `publishCurrentTenant=${OLog.debugString(publishCurrentTenant)} ` +
            `publishCurrentDomain=${OLog.debugString(publishCurrentDomain)}`)
        const tenant = Tenants.findOne(publishCurrentTenant.criteria, publishCurrentTenant.options)
        if (!tenant) {
            OLog.error("contextmaker.js domains no return from Tenant.findOne")
            return
        }
        const domain = Domains.findOne(publishCurrentDomain.criteria, publishCurrentDomain.options)
        if (!domain) {
            OLog.error("contextmaker.js domains no return from Domains.findOne")
            return
        }
        OLog.debug("contextmaker.js domains data *ready* " +
            `publishCurrentTenant=${OLog.debugString(publishCurrentTenant)} ` +
            `publishCurrentDomain=${OLog.debugString(publishCurrentDomain)}`)
        // Augment tenant with domain:
        tenant.domain = domain
        return tenant
    },

    templatesBeforeRender() {
        VXApp.selectFirstRecord("publishAuthoringTemplate", setPublishAuthoringTemplate, VXApp.findTemplateList)
    },

    templates() {
        const publishAuthoringTemplate = Store.getState().publishAuthoringTemplate
        if (!publishAuthoringTemplate) {
            OLog.debug("contextmaker.js templates redux variable publishAuthoringTemplate is *falsy* " +
                "unable to return template list")
            return
        }
        const template = Templates.findOne(publishAuthoringTemplate.criteria, publishAuthoringTemplate.options)
        if (!template) {
            OLog.debug("contextmaker.js templates *falsy* return from Templates.findOne, subscription is not ready")
            return
        }
        OLog.debug(`contextmaker.js templates publishAuthoringTemplate=${OLog.debugString(publishAuthoringTemplate)}`)
        return template
    },

    template() {
        const criteria = { _id : UX.lastSegment() }
        OLog.debug(`contextmaker.js  template criteria=${OLog.debugString(criteria)}`)
        return Templates.findOne(criteria)
    },

    functionsBeforeRender() {
        VXApp.selectFirstRecord("publishAuthoringFunction", setPublishAuthoringFunction, VXApp.findFunctionList)
    },

    functions() {
        const publishAuthoringFunction = Store.getState().publishAuthoringFunction
        if (!publishAuthoringFunction) {
            OLog.debug("contextmaker.js functions redux variable publishAuthoringFunction is *falsy* " +
                "unable to return function list")
            return
        }
        const funktion = Functions.findOne(publishAuthoringFunction.criteria, publishAuthoringFunction.options)
        if (!funktion) {
            OLog.debug("contextmaker.js functions *falsy* return from Functions.findOne, subscription is not ready")
            return
        }
        OLog.debug(`contextmaker.js functions publishAuthoringFunction=${OLog.debugString(publishAuthoringFunction)}`)
        return funktion
    },

    funktion() {
        const criteria = { _id : UX.lastSegment() }
        OLog.debug(`contextmaker.js function criteria=${OLog.debugString(criteria)}`)
        return Functions.findOne(criteria)
    },
}
