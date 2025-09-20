Log.allow({
    insert: function() {
        return true
    },
    update: function() {
        return false
    },
    remove: function() {
        return false
    },
    fetch: []
})

Config.allow({
    insert: function() {
        return false
    },
    update: function() {
        return false
    },
    remove: function() {
        return false
    },
    fetch: []
})

Clipboard.allow({
    insert: function(userId, doc) {
        return Serv.isAssertionTrue(userId === doc.userId, "Clipboard.allow insert")
    },
    update: function(userId, doc) {
        return Serv.isAssertionTrue(userId === doc.userId, "Clipboard.allow update")
    },
    remove: function() {
        return false
    },
    fetch: ["userId"]
})

Events.allow({
    insert: function() {
        return false
    },
    update: function() {
        return false
    },
    remove: function() {
        return false
    },
    fetch: []
})

Notifications.allow({
    insert: function() {
        return false
    },
    update: function() {
        return true
    },
    remove: function() {
        return false
    },
    fetch: []
})

Tenants.allow({
    insert: function(userId) {
        OLog.error(`allow.js Tenants.allow insert *denied* userId=${userId}`)
        return false
    },
    update: function(userId) {
        return Serv.isUserAdmin(userId, "Tenants.allow update")
    },
    remove: function(userId) {
        OLog.error(`allow.js Tenants.allow remove *denied* userId=${userId}`)
        return false
    },
    fetch: []
})

Domains.allow({
    insert: function(userId) {
        return Serv.isUserAdmin(userId, "Domains.allow insert")
    },
    update: function(userId) {
        return Serv.isUserAdmin(userId, "Domains.allow update")
    },
    remove: function(userId) {
        OLog.error(`allow.js Domains.allow remove *denied* userId=${userId}`)
        return false
    },
    fetch: ["tenant"]
})

Meteor.users.allow({
    insert: function(userId) {
        OLog.error(`allow.js Meteor.users.allow insert *denied* userId=${userId}`)
        return false
    },
    update: function() {
        return true
    },
    remove: function(userId) {
        OLog.error(`allow.js Meteor.users.allow remove *denied* userId=${userId}`)
        return false
    },
    fetch: ["_id", "profile.tenants", "profile.domains"]
})

Meteor.users.deny({
    insert: function(userId) {
        OLog.error(`allow.js Meteor.users.deny insert *denied* userId=${userId}`)
        return true
    },
    update: function(userId, doc, fields, modifier) {
        const validOperators = ["$set", "$unset", "$push", "$pull"]
        const unsettableFields = ["profile", "profile.tenants"]
        OLog.debug(`allow.js Meteor.users.deny update attempted userId=${userId}`)
        if (!Serv.isUserLoggedIn(userId, "Meteor.users.deny update")) {
            return true
        }
        const badOperator = Serv.checkOperators(modifier, validOperators)
        if (badOperator) {
            OLog.error(`allow.js Meteor.users.deny update *denied* userId=${userId} ` +
                `attempted to use MongoDB badOperator=${badOperator}`)
            return true
        }
        const badField = Serv.checkUnsettableFields(modifier, unsettableFields)
        if (badField) {
            OLog.error(`allow.js Meteor.users.deny update *denied* userId=${userId} ` +
                `attempted to set unsettable badField=${badField}`)
            return true
        }
        if (!_.contains(Util.getTenantIds(doc._id), Util.getCurrentTenantId(userId)) &&
            !Serv.isUserSuperAdmin(userId, "Meteor.users.deny update")) {
            OLog.error(`allow.js Meteor.users.deny update *denied* userId=${userId} ` +
                "attempted to update user that doesn't belong to invoking  administrator's current tenant")
            return true
        }
        if (modifier.$set) {
            for (let fieldPath in modifier.$set) {
                if (fieldPath === "profile.currentDomain") {
                    const domainId = modifier.$set["profile.currentDomain"]
                    if (!Serv.isAllowUserSetCurrentDomain(userId, doc._id, domainId, "Meteor.users.deny update")) {
                        return true
                    }
                }
                if (/profile\.tenants\.\d+\./.test(fieldPath)) {
                    if (!Serv.isUserAdmin(userId, "Meteor.users.deny update")) {
                        return true
                    }
                }
            }
        }
        if (modifier.$push) {
            if (modifier.$push["profile.tenants"]) {
                if (modifier.$push["profile.tenants"].tenantId) {
                    if (!Serv.isUserAdmin(userId, "Meteor.users.deny update")) {
                        return true
                    }
                }
                else {
                    OLog.error(`allow.js Meteor.users.deny update *denied* userId=${userId} has attempted to ` +
                        "$push tenant without tenantId")
                    return true
                }
            }
            if (modifier.$push["profile.domains"]) {
                if (modifier.$push["profile.domains"].$each && modifier.$push["profile.domains"].$each.length > 0 && modifier.$push["profile.domains"].$each[0].domainId) {
                    if (!Serv.isUserAdmin(userId, "Meteor.users.deny update")) {
                        return true
                    }
                }
                else {
                    OLog.error(`allow.js Meteor.users.deny update *denied* userId=${userId} has attempted to ` +
                        "$push domain without properly-formatted $each operator")
                    return true
                }
            }
        }
        if (modifier.$pull) {
            if (modifier.$pull["profile.tenants"]) {
                if (modifier.$pull["profile.tenants"].tenantId) {
                    if (doc._id === userId) {
                        OLog.debug(`allow.js Meteor.users.deny update *granted* userId=${userId} is attempting to ` +
                            `eject from tenantId=${modifier.$pull["profile.tenants"].tenantId}`)
                        return false
                    }

                    if (!Serv.isUserAdmin(userId, "Meteor.users.deny update")) {
                        return true
                    }
                }
                else {
                    OLog.error(`allow.js Meteor.users.deny update *denied* userId=${userId} has attempted to ` +
                        "$pull tenant without tenantId")
                    return true
                }
            }
            if (modifier.$pull["profile.domains"]) {
                if (modifier.$pull["profile.domains"].domainId) {
                    if (doc._id === userId) {
                        OLog.debug(`allow.js Meteor.users.deny update *granted* userId=${userId} is attempting to ` +
                            `eject from domainId=${modifier.$pull["profile.domains"].domainId}`)
                        return false
                    }
                    if (!Serv.isUserAdmin(userId, "Meteor.users.deny update")) {
                        return true
                    }
                }
                else {
                    OLog.error(`allow.js Meteor.users.deny update *denied* userId=${userId} has attempted to ` +
                        "$pull domain without domainId")
                    return true
                }
            }
        }
        OLog.debug(`allow.js Meteor.users.deny update *granted* *catch-all* userId=${userId}`)
        return false
    },
    remove: function(userId) {
        OLog.error(`allow.js Meteor.users.deny remove *denied* userId=${userId}`)
        return true
    },
    fetch: ["_id", "profile.tenants", "profile.domains"]
})

Templates.allow({
    insert: function(userId, doc) {
        return Serv.isUserDomain(userId, doc.domain, "Templates.allow insert")
    },
    update: function(userId, doc) {
        return Serv.isUserDomain(userId, doc.domain, "Templates.allow update")
    },
    remove: function(userId) {
        OLog.error(`allow.js Templates.allow remove *denied* userId=${userId}`)
        return false
    },
    fetch: ["domain"]
})

Functions.allow({
    insert(userId, doc) {
        return Serv.isUserDomain(userId, doc.domain, "Functions.allow insert")
    },
    update(userId, doc) {
        return Serv.isUserDomain(userId, doc.domain, "Functions.allow update")
    },
    remove(userId) {
        OLog.error(`allow.js Functions.allow remove *denied* userId=${userId}`)
        return false
    },
    fetch: ["domain"]
})

Reports.allow({
    insert(userId, doc) {
        return Serv.isUserDomain(userId, doc.domain, "Reports.allow insert")
    },
    update(userId, doc) {
        return Serv.isUserDomain(userId, doc.domain, "Reports.allow update")
    },
    remove(userId) {
        OLog.error(`allow.js Reports.allow remove *denied* userId=${userId}`)
        return false
    },
    fetch: ["domain"]
})

UploadStats.allow({
    insert: function() {
        return true
    },
    update: function() {
        return true
    },
    remove: function() {
        return false
    },
    fetch: []
})
