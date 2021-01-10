/*
 * Allow rules
 */
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
    update: function(userId, doc, fields, modifier) {
        return Serv.isUserSuperAdmin(userId, "Config.allow update", doc, modifier)
    },
    remove: function() {
        return false
    },
    fetch: []
})

Clipboard.allow({
    insert: function(userId, doc) {
        return Serv.isAssertionTrue(userId === doc.userId, "Clipboard.allow insert", doc)
    },
    update: function(userId, doc, fields, modifier) {
        return Serv.isAssertionTrue(userId === doc.userId, "Clipboard.allow update", doc, modifier)
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
    insert: function(userId, doc) {
        OLog.error("allow.js Tenants.allow insert *denied* userId=" + userId + " doc=" + OLog.errorString(doc))
        return false
    },
    update: function(userId, doc, fields, modifier) {
        return Serv.isUserAdmin(userId, doc._id, "Tenants.allow update", doc, modifier)
    },
    remove: function(userId, doc) {
        OLog.error("allow.js Tenants.allow remove *denied* userId=" + userId + " doc=" + OLog.errorString(doc))
        return false
    },
    fetch: []
})

Domains.allow({
    insert: function(userId, doc) {
        return Serv.isUserAdmin(userId, doc.tenant, "Domains.allow insert", doc)
    },
    update: function(userId, doc, fields, modifier) {
        return Serv.isUserAdmin(userId, doc.tenant, "Domains.allow update", doc, modifier)
    },
    remove: function(userId, doc) {
        OLog.error("allow.js Domains.allow remove *denied* userId=" + userId + " doc=" + OLog.errorString(doc))
        return false
    },
    fetch: ["tenant"]
})

Meteor.users.allow({
    insert: function(userId, doc) {
        OLog.error("allow.js Meteor.users.allow insert *denied* userId=" + userId + " doc=" + OLog.errorString(doc))
        return false
    },
    update: function(userId, doc, fields, modifier) {

        var tenantId

        if (!Serv.isUserLoggedIn(userId, "Meteor.users.allow update", doc, modifier)) {
            return false
        }

        tenantId = Util.getCurrentTenantId(userId)

        if (Serv.isUserAdmin(userId, tenantId, "Meteor.users.allow update", doc, modifier)) {
            return true
        }

        if (userId === doc._id) {
            OLog.debug("allow.js Meteor.users.allow update *granted* userId=" + userId + " is updating his own record")
            return true
        }

        OLog.error("allow.js Meteor.users.allow update *denied* userId=" + userId + " doesn't qualify with respect to allow criteria")
        return false
    },
    remove: function(userId, doc) {
        OLog.error("allow.js Meteor.users.allow remove *denied* userId=" + userId + " doc=" + OLog.errorString(doc))
        return false
    },
    fetch: ["_id", "profile.tenants", "profile.domains"]
})

Meteor.users.deny({
    insert: function(userId, doc) {
        OLog.error("allow.js Meteor.users.deny insert *denied* userId=" + userId + " doc=" + OLog.errorString(doc))
        return true
    },
    update: function(userId, doc, fields, modifier) {

        var validOperators, unsettableFields, badOperator, badField, fieldPath, tenantId, domainId, managerId

        validOperators = ["$set", "$unset", "$push", "$pull"]
        unsettableFields = ["profile", "profile.tenants", "profile.domains"]

        OLog.debug("allow.js Meteor.users.deny update attempted userId=" + userId + " doc=" + OLog.debugString(doc) + " modifier=" + OLog.debugString(modifier))

        if (!Serv.isUserLoggedIn(userId, "Meteor.users.deny update", doc, modifier)) {
            return true
        }

        badOperator = Serv.checkOperators(modifier, validOperators)
        if (badOperator) {
            OLog.error("allow.js Meteor.users.deny update *denied* userId=" + userId + " doc=" + OLog.errorString(doc) + " attempted to use MongoDB badOperator=" + badOperator)
            return true
        }

        badField = Serv.checkUnsettableFields(modifier, unsettableFields)
        if (badField) {
            OLog.error("allow.js Meteor.users.deny update *denied* userId=" + userId + " doc=" + OLog.errorString(doc) + " attempted to set unsettable badField=" + badField)
            return true
        }

        if (!_.contains(Util.getTenantIds(doc._id), Util.getCurrentTenantId(userId)) && !Serv.isUserSuperAdmin(userId, "Meteor.users.deny update", doc, modifier)) {
            OLog.error("allow.js Meteor.users.deny update *denied* userId=" + userId + " doc=" + OLog.errorString(doc) + " attempted to update user that doesn't belong to invoking administrator's current tenant")
            return true
        }

        if (modifier.$set) {

            for (fieldPath in modifier.$set) {

                if (fieldPath === "profile.currentDomain") {
                    domainId = modifier.$set["profile.currentDomain"]
                    if (!domainId) {
                        return true
                    }
                    if (!Serv.isAllowUserSetCurrentDomain(userId, doc._id, domainId, "Meteor.users.deny update", doc, modifier)) {
                        return true
                    }
                }

                if (/profile\.tenants\.\d+\./.test(fieldPath)) {
                    tenantId = Util.getTenantIdFromPath(doc, fieldPath, true)
                    if (!Serv.isUserAdmin(userId, tenantId, "Meteor.users.deny update", doc, modifier)) {
                        return true
                    }
                }

                if (/profile\.domains\.\d+\./.test(fieldPath)) {
                    tenantId = Util.getTenantIdFromPath(doc, fieldPath, false)
                    if (!Serv.isUserAdmin(userId, tenantId, "Meteor.users.deny update", doc, modifier)) {
                        return true
                    }
                }

                if (/profile\.tenants\.\d+\.managerId/.test(fieldPath)) {

                    tenantId = Util.getTenantIdFromPath(doc, fieldPath, true)
                    managerId = modifier.$set[fieldPath]

                    if (!(Util.isUserManager(managerId, tenantId))) {
                        OLog.error("allow.js Meteor.users.deny update *denied* userId=" + userId + " attempted to set manager=" + managerId + " for tenantId=" + tenantId + " but *not* manager in that tenant, doc=" + OLog.errorString(doc) + " modifier=" + OLog.errorString(modifier))
                        return true
                    }

                    OLog.debug("allow.js Meteor.users.deny update *granted* userId=" + userId + " will set manager=" + managerId + " for tenantId=" + tenantId + " doc=" + OLog.debugString(doc) + " modifier=" + OLog.debugString(modifier))
                }
            }
        }

        if (modifier.$push) {

            if (modifier.$push["profile.tenants"]) {

                if (modifier.$push["profile.tenants"].tenantId) {
                    if (!Serv.isUserAdmin(userId, modifier.$push["profile.tenants"].tenantId, "Meteor.users.deny update", doc, "$push['profile.tenants']")) {
                        return true
                    }
                }
                else {
                    OLog.error("allow.js Meteor.users.deny update *denied* userId=" + userId + " has attempted to $push tenant without tenantId")
                    return true
                }
            }

            if (modifier.$push["profile.domains"]) {

                if (modifier.$push["profile.domains"].$each && modifier.$push["profile.domains"].$each.length > 0 && modifier.$push["profile.domains"].$each[0].domainId) {

                    if (!Serv.isUserAdmin(userId, Util.getTenantId(modifier.$push["profile.domains"].$each[0].domainId), "Meteor.users.deny update", doc, "$push['profile.domains']")) {
                        return true
                    }
                }
                else {
                    OLog.error("allow.js Meteor.users.deny update *denied* userId=" + userId + " has attempted to $push domain without properly-formatted $each operator")
                    return true
                }
            }
        }

        if (modifier.$pull) {

            if (modifier.$pull["profile.tenants"]) {

                if (modifier.$pull["profile.tenants"].tenantId) {

                    if (doc._id === userId) {
                        OLog.debug("allow.js Meteor.users.deny update *granted* userId=" + userId + " is attempting to eject from tenantId=" + modifier.$pull["profile.tenants"].tenantId)
                        return false
                    }

                    if (!Serv.isUserAdmin(userId, modifier.$pull["profile.tenants"].tenantId, "Meteor.users.deny update", doc, "$pull['profile.tenants']")) {
                        return true
                    }
                }
                else {
                    OLog.error("allow.js Meteor.users.deny update *denied* userId=" + userId + " has attempted to $pull tenant without tenantId")
                    return true
                }
            }

            if (modifier.$pull["profile.domains"]) {

                if (modifier.$pull["profile.domains"].domainId) {

                    if (doc._id === userId) {
                        OLog.debug("allow.js Meteor.users.deny update *granted* userId=" + userId + " is attempting to eject from domainId=" + modifier.$pull["profile.domains"].domainId)
                        return false
                    }

                    if (!Serv.isUserAdmin(userId, Util.getTenantId(modifier.$pull["profile.domains"].domainId), "Meteor.users.deny update", doc, "$pull['profile.domains']")) {
                        return true
                    }
                }
                else {
                    OLog.error("allow.js Meteor.users.deny update *denied* userId=" + userId + " has attempted to $pull domain without domainId")
                    return true
                }
            }
        }

        OLog.debug("allow.js Meteor.users.deny update *granted* *catch-all* userId=" + userId + " docId=" + doc._id + " modifier=" + OLog.debugString(modifier))

        return false
    },
    remove: function(userId, doc) {
        OLog.error("allow.js Meteor.users.deny remove *denied* userId=" + userId + " doc=" + OLog.errorString(doc))
        return true
    },
    fetch: ["_id", "profile.tenants", "profile.domains"]
})

Templates.allow({
    insert: function(userId, doc) {
        return Serv.isUserDomain(userId, doc.domain, "Templates.allow insert", doc)
    },
    update: function(userId, doc, fields, modifier) {
        return Serv.isUserDomain(userId, doc.domain, "Templates.allow update", doc, modifier)
    },
    remove: function(userId, doc) {
        OLog.error("allow.js Templates.allow remove *denied* userId=" + userId + " doc=" + OLog.errorString(doc))
        return false
    },
    fetch: ["domain"]
})

Functions.allow({
    insert(userId, doc) {
        return Serv.isUserDomain(userId, doc.domain, "Functions.allow insert", doc)
    },
    update(userId, doc, fields, modifier) {
        return Serv.isUserDomain(userId, doc.domain, "Functions.allow update", doc, modifier)
    },
    remove(userId, doc) {
        OLog.error(`allow.js Functions.allow remove *denied* userId=${userId} doc=${OLog.errorString(doc)}`)
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
