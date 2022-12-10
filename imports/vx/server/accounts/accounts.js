import { authenticator } from "otplib"

Accounts.emailTemplates.siteName = CX.SYSTEM_NAME
Accounts.emailTemplates.from = `${CX.SYSTEM_NAME} <${CX.SYSTEM_EMAIL}>`

Accounts.urls.resetPassword = function(token) {
    OLog.debug(`accounts.js resetPassword URL fetched, token=${token}`)
    return Meteor.absoluteUrl(`reset-password/${token}`)
}

Accounts.urls.verifyEmail = function(token) {
    OLog.debug(`accounts.js verifyEmail URL fetched, token=${token}`)
    return Meteor.absoluteUrl(`verify-email/${token}`)
}

Accounts.urls.enrollAccount = function(token) {
    OLog.debug("accounts.js enrollAccount URL fetched, token=" + token)
    return Meteor.absoluteUrl(`enroll-account/${token}`)
}

Accounts.onCreateUser((options, user) => {
    try {
        OLog.debug(`accounts.js onCreateUser user=${OLog.debugString(user)}`)
        const adminUserId = Meteor.userId() ? Meteor.userId() : Util.getSystemUserId()
        const tenantId = Util.getCurrentTenantId(adminUserId)
        const domainId = Util.getCurrentDomainId(adminUserId)
        const tenant = Tenants.findOne(tenantId)
        if (!tenant) {
            OLog.error(`accounts.js Accounts.onCreateUser unable to find tenantId=${tenantId}`)
            throw new Meteor.Error(`accounts.js Accounts.onCreateUser unable to find tenantId=${tenantId}`)
        }
        const domain = Domains.findOne(domainId)
        if (!domain) {
            OLog.error(`accounts.js Accounts.onCreateUser unable to find domainId=${domainId}`)
            throw new Meteor.Error(`accounts.js Accounts.onCreateUser unable to find domainId=${domainId}`)
        }
        const tenants = [ { tenantId : tenantId, roles : [ ] } ]
        const domains = [ { domainId : domainId, roles : [ ] } ]
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
        OLog.debug(`accounts.js Accounts.onCreateUser callback *completed* by adminUserId=${adminUserId} user=${OLog.debugString(user)}`)
        return user
    }
    catch (error) {
        OLog.error(`accounts.js Accounts.onCreateUser user=${OLog.errorString(user)} error=${OLog.errorError(error)}`)
    }
})

Accounts.validateLoginAttempt(info => {
    OLog.debug(`accounts.js validateLoginAttempt info=${OLog.debugString(info)}`)
    if (!info.allowed) {
        return false
    }
    if (info.type === "password" && info.methodName === "login") {
        if (info.user.twoFactorEnabled) {
            return false
        }
    }
    return true
})

Accounts.registerLoginHandler("two-factor", options => {
    OLog.debug(`accounts.js registerLoginHandler two-factor options=${OLog.debugString(options)}`)
    if (!options.twoFactorPassword) {
        return undefined
    }
    const user = Accounts.findUserByEmail(options.user.email)
    if (!user) {
        OLog.debug(`accounts.js registerLoginHandler unable to find account associated with email=${options.user.email}`)
        throw new Meteor.Error(403, Util.i18n("common.invalid_user_not_found"))
    }
    if (!user.services || !user.services.password || !user.services.password.bcrypt) {
        OLog.error(`accounts.js registerLoginHandler user record *corrupt* email=${options.user.email} is missing ` +
            "services, services.password, or services.password.bcrypt")
        throw new Meteor.Error(403, Util.i18n("common.invalid_user_record_corrupt"))
    }
    if (Accounts._checkPassword(user, options.twoFactorPassword).error) {
        OLog.debug(`accounts.js registerLoginHandler incorrect password for email=${options.user.email}`)
        throw new Meteor.Error(403, Util.i18n("common.invalid_password_incorrect"))
    }
    if (!user.twoFactorEnabled) {
        OLog.debug(`accounts.js registerLoginHandler email=${options.user.email} has not yet enabled two-factor authentication *proceed*`)
        return { userId: user._id }
    }
    if (options.twoFactorHash) {
        const expectedHash = VXApp.computeTwoFactorSecretHash(user)
        const match = options.twoFactorHash === expectedHash
        OLog.debug(`accounts.js registerLoginHandler email=${options.user.email} has enabled the 30-day two-factor bypass ` +
            `expected hash=${expectedHash} local storage hash=${options.twoFactorHash} match=${match}`)
        if (match) {
            return { userId: user._id }
        }
    }
    if (!options.twoFactorToken) {
        OLog.debug(`accounts.js registerLoginHandler email=${options.user.email} ` +
            "token not yet provided so system shall prompt for two-factor authentication")
        throw new Meteor.Error("two-factor-required")
    }
    const token = options.twoFactorToken
    const secret = user.services.twoFactorSecret
    authenticator.options = {
        window: 2
    }
    const valid = authenticator.verify({ token, secret })
    OLog.debug(`accounts.js registerLoginHandler email=${options.user.email} token=${token} ` +
        `authenticator verify method returned valid=${valid}`)
    if (!valid) {
        throw new Meteor.Error(403, Util.i18n("common.invalid_two_factor_token"))
    }
    const twoFactorHash = VXApp.computeTwoFactorSecretHash(user)
    OLog.debug(`accounts.js registerLoginHandler email=${options.user.email} twoFactorHash=${twoFactorHash}`)
    return { userId: user._id, options: { twoFactorHash } }
})
