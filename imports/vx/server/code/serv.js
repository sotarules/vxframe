Serv = {

    /**
     * Perform MongoDB query via aggregation pipeline.  In debug mode, this function will perform an explain plan
     * operation followed by the actual query. The coding used is inspired Meteor Hacks aggregate package.
     *
     * @param {object} collection MongoDB collection.
     * @param {array} pipeline Aggregation pipeline.
     * @return {array} Results array.
     */
    aggregate(collection, pipeline) {
        const logUserId = Util.getSystemUserId()
        OLog.debug(`serv.js aggregate collection=${collection._name} pipeline=${OLog.debugString(pipeline)} ` +
            `logLevel=${OLog.logLevel}`, logUserId)
        if (OLog.logLevel >= OLog.logLevelMap.DEBUG) {
            const explainResults = Meteor.wrapAsync(collection.rawCollection().aggregate.bind(collection.rawCollection()))(pipeline, { explain: true })
            if (explainResults) {
                explainResults.forEach(explainResult => {
                    explainResult.stages.forEach(stage => {
                        if (stage.$cursor && stage.$cursor.queryPlanner && stage.$cursor.queryPlanner.winningPlan) {
                            OLog.debug(`serv.js aggregate winningPlan=${OLog.debugString(stage.$cursor.queryPlanner.winningPlan)}`, logUserId)
                        }
                    })
                })
            }
        }
        const startMoment = moment()
        const results = Meteor.wrapAsync(collection.rawCollection().aggregate.bind(collection.rawCollection()))(pipeline)
        const endMoment = moment()
        const duration = endMoment.diff(startMoment)
        OLog.debug(`serv.js aggregate collection=${collection._name} duration=${duration} results ` +
            `length=${results.length} pipeline=${OLog.debugString(pipeline)}`, logUserId)
        return results
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
        let tenantId = Util.getTenantId(domainId)
        let allowSetDomain = (Serv.isUserAdmin(adminId, tenantId, operation) || adminId === userId) &&
            Serv.isUserDomain(adminId, domainId, operation) &&
            Serv.isUserDomain(userId, domainId, operation)
        if (allowSetDomain) {
            OLog.debug(`serv.js isAllowUserSetCurrentDomain ${operation} *granted* adminId=${adminId} userId=${userId} ` +
                `tenantId=${tenantId} domainId=${domainId}`)
        }
        else {
            OLog.error(`serv.js isAllowUserSetCurrentDomain ${operation} *denied* adminId=${adminId} userId=${userId} ` +
                `tenantId=${tenantId} domainId=${domainId}`)
        }
        return allowSetDomain
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
