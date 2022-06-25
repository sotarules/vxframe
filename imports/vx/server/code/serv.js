Serv = {

    /**
     * Perform MongoDB query via aggregation pipeline.  In debug mode, this function will perform an explain plan
     * call followed by the actual query. The coding used is inspired Meteor Hacks aggregate package.
     *
     * @param {object} collection MongoDB collection.
     * @param {array} pipeline Aggregation pipeline.
     * @return {array} Results array potentially grouped.
     */
    async aggregate(collection, pipeline) {
        const coll = collection.rawCollection()
        if (OLog.logLevel >= OLog.logLevelMap.DEBUG) {
            const explainResults = await Meteor.wrapAsync(coll.aggregate.bind(coll))(pipeline, { explain: true }).toArray()
            explainResults.forEach(function(explainResult) {
                if (explainResult.ok) {
                    if (explainResult.stages) {
                        explainResult.stages.forEach((stage, index) => {
                            if (stage.$cursor && stage.$cursor.queryPlanner && stage.$cursor.queryPlanner.winningPlan) {
                                OLog.debug(`serv.js aggregate stage ${index} explain ` +
                                    `winningPlan=${OLog.debugString(stage.$cursor.queryPlanner.winningPlan)}`)
                            }
                        })
                    }
                }
                else {
                    OLog.error(`serv.js aggregate explain plan error explainResult=${OLog.debugString(explainResult)}`)
                }
            })
        }
        return await Meteor.wrapAsync(coll.aggregate.bind(coll))(pipeline).toArray()
    },

    isAssertionTrue(assertion, operation) {
        if (assertion) {
            OLog.debug(`serv.js isAssertionTrue ${operation} *granted*`)
            return true
        }
        OLog.debug(`serv.js isAssertionTrue ${operation} *denied*`)
        return false
    },

    isUserSuperAdmin(userId, operation) {
        if (Util.isUserSuperAdmin(userId)) {
            OLog.debug(`serv.js isUserSuperAdmin ${operation} *granted* userId=${userId} is super administrator`)
            return true
        }
        // Note test for Super Admin severity show not generate hard error on failure:
        OLog.debug(`serv.js isUserSuperAdmin ${operation} *denied* userId=${userId} is *not* super administrator`)
        return false
    },

    isUserAdmin(userId, tenantId, operation) {
        if (!tenantId) {
            OLog.error(`serv.js isUserAdmin ${operation} *denied* missing tenantId`)
            return false
        }
        if (Util.isUserAdmin(userId, tenantId)) {
            OLog.debug(`serv.js isUserAdmin ${operation} *granted* userId=${userId} is administrator ` +
                `for tenantId=${tenantId}`)
            return true
        }
        OLog.error(`serv.js isUserAdmin ${operation} *denied* userId=${userId} is *not* administrator for ` +
            `tenantId=${tenantId}`)
        return false
    },

    isUserLoggedIn(userId, operation) {
        if (!!userId) {
            OLog.debug(`serv.js isUserLoggedIn ${operation} *granted* user=${userId} is logged in`)
            return true
        }
        OLog.error(`serv.js isUserLoggedIn ${operation} *denied* userId=${userId} is *not* logged in`)
        return false
    },

    isUserDomain(userId, domainId, operation) {
        if (Util.isUserDomain(userId, domainId)) {
            OLog.debug(`serv.js isUserDomain ${operation} *granted* user=${userId} is member of ${domainId}`)
            return true
        }
        OLog.error(`serv.js isUserDomain ${operation} *denied* userId=${userId} is *not* a member of ${domainId}`)
        return false
    },

    isAllowUserSetCurrentDomain(adminId, userId, domainId, operation) {
        if (!domainId) {
            OLog.debug(`serv.js isAllowUserSetCurrentDomain *null-domain* ${operation} *granted* adminId=${adminId} ` +
                `userId=${userId} domainId=${domainId}`)
            return true
        }
        if (Serv.isUserAdmin(adminId, operation) || adminId === userId) {
            OLog.debug(`serv.js isAllowUserSetCurrentDomain ${operation} *granted* adminId=${adminId} userId=${userId} ` +
                `domainId=${domainId}`)
            return true
        }
        OLog.error(`serv.js isAllowUserSetCurrentDomain ${operation} *denied* adminId=${adminId} userId=${userId} ` +
            `domainId=${domainId}`)
        return false
    },

    checkOperators(modifier, validOperators) {
        for (let operator in modifier) {
            if (!_.contains(validOperators, operator)) {
                return operator
            }
        }
    },

    checkUnsettableFields(modifier, unsettableFields) {
        if (modifier.$set) {
            for (let field in modifier.$set) {
                if (_.contains(unsettableFields, field)) {
                    return field
                }
            }
            for (let field in modifier.$unset) {
                if (_.contains(unsettableFields, field)) {
                    return field
                }
            }
        }
    }
}
