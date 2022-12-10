import {
    setPublishCurrentTenant,
    setPublishAuthoringDomain,
    setPublishAuthoringTemplate,
    setPublishAuthoringFunction,
    setPublishAuthoringReport,
    setPublishAuthoringUser,
    setPublishCurrentDomain,
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
        const userId = VXApp.criteriaId(Store.getState().publishAuthoringUser)
        return Meteor.users.findOne(userId)
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
        const domainId = VXApp.criteriaId(Store.getState().publishAuthoringDomain)
        return Domains.findOne(domainId)
    },

    tenantsBeforeRender() {
        VXApp.selectFirstRecord("publishCurrentTenant", setPublishCurrentTenant, VXApp.findUserTenantList)
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
        const tenantId = VXApp.criteriaId(Store.getState().publishCurrentTenant)
        return Tenants.findOne(tenantId)
    },

    domainsBeforeRender() {
        const publishCurrentTenant = Store.getState().publishCurrentTenant
        if (!publishCurrentTenant) {
            const tenantId = Util.getCurrentTenantId()
            Store.dispatch(setPublishCurrentTenant(VXApp.simplePublishingRequest(tenantId)))
        }
        const publishCurrentDomain = Store.getState().publishCurrentDomain
        if (!publishCurrentDomain) {
            const domainId = Util.getCurrentDomainId()
            Store.dispatch(setPublishCurrentDomain(VXApp.simplePublishingRequest(domainId)))
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
        const templateId = VXApp.criteriaId(Store.getState().publishAuthoringTemplate)
        return Templates.findOne(templateId)
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
        const functionId = VXApp.criteriaId(Store.getState().publishAuthoringFunction)
        return Functions.findOne(functionId)
    },

    reportsBeforeRender() {
        VXApp.selectFirstRecord("publishAuthoringReport", setPublishAuthoringReport, VXApp.findReportList)
    },

    reports() {
        const publishAuthoringReport = Store.getState().publishAuthoringReport
        if (!publishAuthoringReport) {
            OLog.debug("contextmaker.js templates redux variable publishAuthoringReport is *falsy* " +
                "unable to return report list")
            return
        }
        const report = Reports.findOne(publishAuthoringReport.criteria, publishAuthoringReport.options)
        if (!report) {
            OLog.debug("contextmaker.js reports *falsy* return from Reports.findOne, subscription is not ready")
            return
        }
        OLog.debug(`contextmaker.js reports publishAuthoringReport=${OLog.debugString(publishAuthoringReport)}`)
        return report
    },

    report() {
        const reportId = VXApp.criteriaId(Store.getState().publishAuthoringReport)
        return Reports.findOne(reportId)
    },
}
