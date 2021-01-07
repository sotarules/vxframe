"use strict";

Serv = {

    /**
     * Check to ensure that user is logged in.
     *
     * @throws Meteor.Error [403] if user is not logged in.
     */
    checkLogin() {
        let userId = Meteor.userId()
        OLog.debug("serv.js checkLogin user=" + userId)
        if (!userId) {
            OLog.debug("serv.js user is not logged in, checkLogin will throw Meteor.Error")
            throw new Meteor.Error(403, Util.i18n("common.not_logged_in"))
        }
    },

    /**
     * Invoke each of the validation rules in the supplied array. If any rule returns a message,
     * stop the process and return that message.
     *
     * Each array element takes the form { rule: <rule>, args: <args> }
     *
     * where <rule> is a validation rule and <args> are necessary arguments.
     *
     * @param {array} Validation request array.
     * @return {string} First validation error message generated by any rule.
     */
    validate(elements) {
        for (let index = 0; index < elements.length; index++) {
            let element = elements[index]
            let rule = element.rule
            let args = element.args
            if (!_.isFunction(rule)) {
                throw new Meteor.Error(511, "Validation rule " + rule + " is not a function.")
            }
            if (!_.isArray(args)) {
                throw new Meteor.Error(511, "Validation rule " + Util.functionName(rule) + " arguments [" + args + "] are not an array.")
            }
            let myReturn = rule.apply(this, args)
            if (myReturn) {
                return myReturn
            }
        }
    },

    /**
     * Arbitrary wait for a specified duration.
     *
     * @param {number} duration Duration of wait in milliseconds.
     */
    delay(duration) {
        let fut = new Future()
        Meteor.setTimeout(() => {
            fut.return()
        }, duration)
        fut.wait()
        return
    },

    /**
     * Perform MongoDB query via aggregation pipeline.  In debug mode, this function will perform an explain plan
     * operation followed by the actual query.  The coding used is inspired Meteor Hacks aggregate package.
     *
     * @param {object} collection MongoDB collection.
     * @param {array} pipeline Aggregation pipeline.
     * @return {array} Results.
     */
    aggregate(collection, pipeline) {
        //let logUserId = Util.getSystemUserId()
        /*
        OLog.debug("serv.js aggregate collection=" + collection._name + " pipeline=" + OLog.debugString(pipeline) + " logLevel=" + OLog.logLevel, logUserId)
        if (OLog.logLevel >= OLog.logLevelMap.DEBUG) {
            let explainResults = Meteor.wrapAsync(collection.rawCollection().aggregate.bind(collection.rawCollection()))(pipeline, { explain: true })
            if (explainResults) {
                explainResults.forEach(explainResult => {
                    explainResult.stages.forEach(stage => {
                        if (stage.$cursor && stage.$cursor.queryPlanner && stage.$cursor.queryPlanner.winningPlan) {
                            OLog.debug("serv.js aggregate winningPlan=" + OLog.debugString(stage.$cursor.queryPlanner.winningPlan), logUserId)
                        }
                    })
                })
            }
        }
        */
        //let startMoment = moment()
        let  results = Meteor.wrapAsync(collection.rawCollection().aggregate.bind(collection.rawCollection()))(pipeline)
        //let endMoment = moment()
        //let duration = endMoment.diff(startMoment)
        //OLog.debug("serv.js aggregate collection=" + collection._name + " duration=" + duration +
        //    " results length=" + results.length + " pipeline=" + OLog.debugString(pipeline), logUserId)
        return results
    },

    /**
     * Allow/Deny rules support.
     */
    isAssertionTrue(assertion, operation, doc, modifier) {
        if (assertion) {
            OLog.debug(`serv.js isAssertionTrue ${operation} *granted* doc=${OLog.debugString(doc)} modifier=${OLog.debugString(modifier)}`)
            return true
        }
        OLog.debug(`serv.js isAssertionTrue ${operation} *denied* doc=${OLog.debugString(doc)} modifier=${OLog.debugString(modifier)}`)
        return false
    },

    isUserSuperAdmin(userId, operation, doc, modifier) {
        if (Util.isUserSuperAdmin(userId)) {
            OLog.debug("serv.js isUserSuperAdmin " + operation + " *granted* userId=" + userId + " is super administrator doc=" + OLog.debugString(doc) + " modifier=" + OLog.debugString(modifier))
            return true
        }
        // Note test for Super Admin severity show not generate hard error on failure:
        OLog.debug("serv.js isUserSuperAdmin " + operation + " *denied* userId=" + userId + " is *not* super administrator doc=" + OLog.debugString(doc) + " modifier=" + OLog.debugString(modifier))
        return false
    },

    isUserAdmin(userId, tenantId, operation, doc, modifier) {
        if (!tenantId) {
            OLog.error("serv.js isUserAdmin " + operation + " *denied* missing tenantId doc=" + OLog.errorString(doc) + " modifier=" + OLog.errorString(modifier))
            return false
        }
        if (Util.isUserAdmin(userId, tenantId)) {
            OLog.debug("serv.js isUserAdmin " + operation + " *granted* userId=" + userId + " is administrator for tenantId=" + tenantId + " doc=" + OLog.debugString(doc) + " modifier=" + OLog.debugString(modifier))
            return true
        }
        OLog.error("serv.js isUserAdmin " + operation + " *denied* userId=" + userId + " is *not* administrator for tenantId=" + tenantId + " doc=" + OLog.errorString(doc) + " modifier=" + OLog.errorString(modifier))
        return false
    },

    isUserLoggedIn(userId, operation, doc, modifier) {

        if (!!userId) {
            OLog.debug("serv.js isUserLoggedIn " + operation + " *granted* user=" + userId + " is logged in doc=" + OLog.debugString(doc) + " modifier=" + OLog.debugString(modifier))
            return true
        }

        OLog.error("serv.js isUserLoggedIn " + operation + " *denied* userId=" + userId + " is *not* logged in doc=" + OLog.errorString(doc) + " modifier=" + OLog.errorString(modifier))
        return false
    },

    isUserDomain(userId, domainId, operation, doc, modifier) {

        if (Util.isUserDomain(userId, domainId)) {
            OLog.debug("serv.js isUserDomain " + operation + " *granted* user=" + userId + " is member of " + domainId + " doc=" + OLog.debugString(doc) + " modifier=" + OLog.debugString(modifier))
            return true
        }

        OLog.error("serv.js isUserDomain " + operation + " *denied* userId=" + userId + " is *not* a member of " + domainId + " doc=" + OLog.errorString(doc) + " modifier=" + OLog.errorString(modifier))
        return false
    },

    isAllowUserSetCurrentDomain(adminId, userId, domainId, operation, doc, modifier) {
        if (!domainId) {
            OLog.debug("serv.js isAllowUserSetCurrentDomain *null-domain* " + operation + " *granted* adminId=" + adminId + " userId=" + userId + " domainId=" + domainId + " doc=" + OLog.debugString(doc) + " modifier=" + OLog.debugString(modifier))
            return true
        }
        let tenantId = Util.getTenantId(domainId)
        let allowSetDomain = (Serv.isUserAdmin(adminId, tenantId, operation, doc, modifier) || adminId === userId) &&
            Serv.isUserDomain(adminId, domainId, operation, doc, modifier) &&
            Serv.isUserDomain(userId, domainId, operation, doc, modifier)
        if (allowSetDomain) {
            OLog.debug("serv.js isAllowUserSetCurrentDomain " + operation + " *granted* adminId=" + adminId + " userId=" + userId + " tenantId=" + tenantId + " domainId=" + domainId + " doc=" + OLog.debugString(doc) + " modifier=" + OLog.debugString(modifier))
        }
        else {
            OLog.error("serv.js isAllowUserSetCurrentDomain " + operation + " *denied* adminId=" + adminId + " userId=" + userId + " tenantId=" + tenantId + " domainId=" + domainId + " doc=" + OLog.errorString(doc) + " modifier=" + OLog.errorString(modifier))
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
