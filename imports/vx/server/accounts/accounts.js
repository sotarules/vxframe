"use strict"

Accounts.emailTemplates.siteName = CX.SYSTEM_NAME
Accounts.emailTemplates.from = `${CX.SYSTEM_NAME} <${CX.SYSTEM_EMAIL}>`

Accounts.urls.resetPassword = function(token) {
    OLog.debug("accounts.js resetPassword URL fetched, token=" + token)
    return Meteor.absoluteUrl("reset-password/" + token)
}

Accounts.urls.verifyEmail = function(token) {
    OLog.debug("accounts.js verifyEmail URL fetched, token=" + token)
    return Meteor.absoluteUrl("verify-email/" + token)
}

Accounts.urls.enrollAccount = function(token) {
    OLog.debug("accounts.js enrollAccount URL fetched, token=" + token)
    return Meteor.absoluteUrl("enroll-account/" + token)
}

/**
 * Set up initial user access.
 */
Accounts.onCreateUser((options, user) => {

    var adminUserId, tenantId, domainId, tenant, domain, tenants, domains

    try {

        OLog.debug("accounts.js Accounts.onCreateUser user=" + OLog.debugString(user))

        adminUserId = Meteor.userId() ? Meteor.userId() : Util.getSystemUserId()

        tenantId = Util.getCurrentTenantId(adminUserId)
        domainId = Util.getCurrentDomainId(adminUserId)

        tenant = Tenants.findOne(tenantId)
        if (!tenant) {
            OLog.error("accounts.js Accounts.onCreateUser unable to find tenantId=" + tenantId)
            throw new Meteor.Error("accounts.js Accounts.onCreateUser unable to find tenantId=" + tenantId)
        }

        domain = Domains.findOne(domainId)
        if (!domain) {
            OLog.error("accounts.js Accounts.onCreateUser unable to find domainId=" + domainId)
            throw new Meteor.Error("accounts.js Accounts.onCreateUser unable to find domainId=" + domainId)
        }

        tenants = [ { tenantId : tenantId, roles : [ ] } ]
        domains = [ { domainId : domainId, roles : [ ] } ]

        // Default profile:
        user.profile = {}
        user.profile.dateCreated = new Date()
        user.profile.userCreated = adminUserId
        user.profile.dateModified = new Date()
        user.profile.userModified = adminUserId
        user.profile.country = "US"
        user.profile.locale = "en"
        user.profile.tenants = tenants
        user.profile.domains = domains
        user.profile.currentDomain = domainId
        user.profile.source = options.source

        OLog.debug("accounts.js Accounts.onCreateUser callback *completed* by adminUserId=" + adminUserId + " user=" + OLog.debugString(user))

        return user
    }
    catch (error) {
        OLog.error("accounts.js Accounts.onCreateUser user=" + OLog.errorString(user) + " error=" + error)
    }
})

