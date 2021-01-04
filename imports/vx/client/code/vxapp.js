import {get, set} from "lodash"
import {
    setFunctionUpdateTimestamp,
    setCurrentDomainId,
    setCurrentLocale,
    setCurrentPublishingMode,
    setCurrentUserId,
    setIosState,
    setPublishAuthoringDomain,
    setPublishAuthoringTemplate,
    setPublishAuthoringFunction,
    setPublishAuthoringUser,
    setPublishCurrentDomain,
    setPublishCurrentDomains,
    setPublishCurrentTenant,
    setPublishCurrentTenants,
    setPublishCurrentUsers,
    setPublishCurrentTemplates,
    setPublishCurrentFunctions,
    setPublishingModeClient,
    setPublishingModeServer,
    setSubscriptionParameters
} from "/imports/vx/client/code/actions"

VXApp = _.extend(VXApp || {}, {

    /**
     * Clear user session settings.
     */
    clearSessionSettings() {
        OLog.debug("vxapp.js clearSessionSettings")
        Store.dispatch(setPublishAuthoringDomain(null))
        Store.dispatch(setPublishAuthoringUser(null))
        Store.dispatch(setPublishAuthoringTemplate(null))
        Store.dispatch(setPublishAuthoringFunction(null))
        Store.dispatch(setFunctionUpdateTimestamp(null))
        if (VXApp.clearAppSessionSettings) {
            VXApp.clearAppSessionSettings()
        }
    },

    changeGlobalSubscriptions(doClient, doServer, newSubscriptionParameters) {

        OLog.debug("vxapp.js changeGlobalSubscriptions *fire*")

        const handles = []

        const publishCurrentTenants = VXApp.makePublishingRequest("current_tenants",
            newSubscriptionParameters, {}, { sort: { name: 1, dateCreated: 1 } })
        const publishCurrentDomains = VXApp.makePublishingRequest("current_domains",
            newSubscriptionParameters, {}, { sort: { name: 1, dateCreated: 1 } })
        const publishCurrentUsers = VXApp.makePublishingRequest("current_users",
            newSubscriptionParameters, {}, { sort: { "profile.lastName": 1, "profile.firstName": 1, createdAt: 1 } })
        const publishCurrentTemplates = VXApp.makePublishingRequest("templates",
            newSubscriptionParameters, { dateRetired : { $exists : false } }, { sort: { "name": 1 } })
        const publishCurrentFunctions = VXApp.makePublishingRequest("functions",
            newSubscriptionParameters, { dateRetired : { $exists: false } }, { sort: { name: 1 } })

        if (doClient) {
            Store.dispatch(setPublishCurrentTenants(publishCurrentTenants.client))
            Store.dispatch(setPublishCurrentDomains(publishCurrentDomains.client))
            Store.dispatch(setPublishCurrentUsers(publishCurrentUsers.client))
            Store.dispatch(setPublishCurrentTemplates(publishCurrentTemplates.client))
            Store.dispatch(setPublishCurrentFunctions(publishCurrentFunctions.client))
        }

        if (doServer) {
            handles.push(Meteor.subscribe("config"))
            handles.push(Meteor.subscribe("clipboard"))
            handles.push(Meteor.subscribe("current_tenants", publishCurrentTenants.server))
            handles.push(Meteor.subscribe("current_domains", publishCurrentDomains.server))
            handles.push(Meteor.subscribe("current_users", publishCurrentUsers.server))
            handles.push(Meteor.subscribe("templates", publishCurrentTemplates.server))
            handles.push(Meteor.subscribe("functions", publishCurrentFunctions.server))
        }

        return handles
    },

    /**
     * Given a layout component and content return a combined React element that is ready for
     * mounting.
     *
     * @param {function} layout React layout (e.g., LayoutStandard).
     * @param {function} content React content (e.g., <EntityBody/>).
     * @return {object} Element combined with content.
     */
    routeElement(layout, content) {
        try {
            if (layout && content) {
                console.log("vxapp.js routeElement will layout and return react element for route")
                OLog.debug("vxapp.js routeElement will layout and return react element for route")
                return React.createElement(layout, { content : content })
            }
        }
        catch (error) {
            OLog.error(`vxapp.js routeElement unexpected error=${error}`)
        }
    },

    /**
     * Perform goDefault to go programmatically to the default route for this user.
     */
    afterLogin() {
        OLog.debug("vxapp.js afterLogin *fire*")
        UX.showLoading()
        UX.setLoading(true)
        UX.goDefault()
    },

    /**
     * Determine if this route is exempt from subscription and before-route processing.
     *
     * @param {string} path Optional Route path (defaults to current path).
     * @return {boolean} True if route is exempt from standard processing.
     */
    isExemptRoute(path) {
        path = path || Util.routePath()
        if (path === "/") {
            return true
        }
        if (VXApp.isAppExemptRoute && VXApp.isAppExemptRoute(path)) {
            return true
        }
        const exemptRoutes = ["/signin", "/enroll-account", "/reset-password"]
        if (Util.startsWith(exemptRoutes, path)) {
            return true
        }
        return false
    },

    /**
     * Determine if this route is authorized for the current user.
     *
     * @return {boolean} True if the current user is authorized for the current route.
     */
    isAuthorizedRoute() {
        if (VXApp.isAppAuthorizedRoute && VXApp.isAppAuthorizedRoute()) {
            return true
        }
        const superAdminRoutes = ["/log", "/events" ]
        const systemAdminRoutes = ["/users-domains", "/domains-users", "/user/", "/domain/", "/tenant/",
            "/functions", "/function/", ]
        const path = Util.routePath()
        if (Util.startsWith(superAdminRoutes, path)) {
            return Util.isUserSuperAdmin()
        }
        if (Util.startsWith(systemAdminRoutes, path)) {
            return Util.isUserAdmin()
        }
        return true
    },

    /**
     * Determine the initial panel for a given route.
     *
     * @param {string} Route path for which initial panel should be determined.
     * @return {string} Initial panel (i.e., LEFT, RIGHT, BOTH)
     */
    getInitialPanel(routePath) {
        let panel
        if (VXApp.getAppInitialPanel) {
            panel = VXApp.getAppInitialPanel(routePath)
        }
        // VXFrame base system doesn't use BasicPair so return LEFT to accommodate SlidePair.
        if (!panel) {
            panel = "LEFT"
        }
        OLog.debug(`vxapp.js getInitialPanel routePath=${routePath} panel=${panel}`)
        return panel
    },

    /**
     * Set up global subscriptions.
     *
     * @param {function} Mandatory callback invoked when subscriptions are ready.
     */
    doGlobalSubscriptions(callback) {
        let result = VXApp.getSubscriptionParameters()
        if (result.success) {
            OLog.debug("vxapp.js doGlobalSubscriptions subscriptionParameters exist and will be used")
            VXApp.doGlobalSubscriptionsContinued(result.subscriptionParameters, callback)
            return
        }
        Meteor.call("getSubscriptionParameters", (error, result) => {
            if (!result.success) {
                OLog.error(`vxapp.js doGlobalSubscriptions bad result=${OLog.errorString(result)}`)
                callback(false)
                return
            }
            VXApp.doGlobalSubscriptionsContinued(result.subscriptionParameters, callback)
            return
        })
    },

    /**
     * Continue with global subscriptions by subscribing then proceed to default route.
     *
     * @param {object} subscriptionParameters Subscription parameters object.
     * @param {function} Mandatory callback invoked when subscriptions are ready.
     */
    doGlobalSubscriptionsContinued(subscriptionParameters, callback) {
        OLog.debug("vxapp.js doGlobalSubscriptionsContinued *continue*")
        VXApp.globalSubscriptions(subscriptionParameters, (error, result) => {
            if (!result.success) {
                OLog.error(`vxapp.js doGlobalSubscriptionsContinued result=${OLog.errorString(result)}`)
                callback(false)
                return
            }
            callback(true)
            return
        })
    },

    /**
     * Set up global subscriptions if necessary.
     *
     * @param {object} newSubscriptionParameters Subscription parameters object.
     * @param {function} Mandatory callback.
     */
    globalSubscriptions(newSubscriptionParameters, callback) {

        OLog.debug("vxapp.js globalSubscriptions *fire*")

        const oldSubscriptionParameters = Store.getState().subscriptionParameters

        const oldPublishingModeClient = Store.getState().publishingModeClient
        const oldPublishingModeServer = Store.getState().publishingModeServer

        const newPublishingModeClient = VXApp.getPublishingMode("client", newSubscriptionParameters)
        const newPublishingModeServer = VXApp.getPublishingMode("server", newSubscriptionParameters)

        const oldSubscriptionParametersString = JSON.stringify(oldSubscriptionParameters)
        const newSubscriptionParametersString = JSON.stringify(newSubscriptionParameters)

        const isEmpty = Config.find().count() === 0
        const isSameSubscriptionParameters = newSubscriptionParametersString === oldSubscriptionParametersString
        const isSamePublishingModeClient = newPublishingModeClient === oldPublishingModeClient
        const isSamePublishingModeServer = newPublishingModeServer === oldPublishingModeServer

        if (!isEmpty && isSameSubscriptionParameters && isSamePublishingModeClient && isSamePublishingModeServer) {
            OLog.debug(`vxapp.js globalSubscriptions ${newSubscriptionParameters.email} all parameters *match* no action will be taken`)
            // Initialize redux store prior to rendering to comply with React best practices:
            VXApp.doContextMakerBeforeRender()
            callback(null, { success: true })
            UX.setLoading(false)
            return
        }

        if (!isSameSubscriptionParameters) {
            OLog.debug(`vxapp.js globalSubscriptions ${newSubscriptionParameters.email} subscription parameters *changed* and will be updated`)
            Store.dispatch(setSubscriptionParameters(newSubscriptionParameters))
        }

        const doClient = isEmpty || !isSameSubscriptionParameters || !isSamePublishingModeClient
        const doServer = isEmpty || !isSameSubscriptionParameters || !isSamePublishingModeServer

        OLog.debug(`vxapp.js globalSubscriptions ${newSubscriptionParameters.email} doClient=${doClient} doServer=${doServer} ` +
            `newPublishingModeClient=${newPublishingModeClient} newPublishingModeServer=${newPublishingModeServer}`)

        if (doClient) {
            Store.dispatch(setPublishingModeClient(newPublishingModeClient))
        }

        if (doServer) {
            Store.dispatch(setPublishingModeServer(newPublishingModeServer))
        }

        let handles = VXApp.changeGlobalSubscriptions(doClient, doServer, newSubscriptionParameters)
        if (VXApp.changeAppGlobalSubscriptions) {
            handles = handles.concat(VXApp.changeAppGlobalSubscriptions(doClient, doServer, newSubscriptionParameters))
        }

        OLog.warn("vxapp.js globalSubscriptions have been computed *wait* for publication")
        UX.setLoading(true)
        UX.waitSubscriptions(handles, (error, result) => {
            if (VXApp.onAppChangeSubscriptionsReady) {
                VXApp.onAppChangeSubscriptionsReady()
            }
            VXApp.addAllFunctions()
            VXApp.doContextMakerBeforeRender()
            OLog.debug(`vxapp.js globalSubscriptions ready domain count=${Domains.find().count()}`)
            callback(error, result)
            UX.setLoading(false)
            return
        })

        return
    },

    /**
     * Reset session settings and global subscriptions.
     *
     * @param {object} callback Mandatory callback.
     */
    refreshSessionSettingsAndGlobalSubscriptions(callback) {
        VXApp.clearSessionSettings()
        UX.showLoading()
        VXApp.refreshGlobalSubscriptions(() => {
            UX.clearLoading()
            callback()
        })
    },

    /**
     * Refresh global subscriptions.
     *
     * @param {object} callback Mandatory callback.
     */
    refreshGlobalSubscriptions(callback) {
        let result = VXApp.getSubscriptionParameters()
        if (!result.success) {
            OLog.error(`vxapp.js refreshGlobalSubscriptions unable to get subscription parameters result=${OLog.errorString(result)}`)
            callback(false)
            return
        }
        Meteor.defer(() => {
            VXApp.globalSubscriptions(result.subscriptionParameters, (error, result) => {
                if (!result.success) {
                    OLog.error(`vxapp.js refreshGlobalSubscriptions unable to refresh global subscriptions result=${OLog.errorString(result)}`)
                    callback(false)
                    return
                }
                callback(true)
            })
        })
    },

    /**
     * Perform a variety of functions immediately when the route changes.
     */
    routeBefore() {

        OLog.debug(`vxapp.js routeBefore [${Util.routePath()}] *fire*`)
        if (VXApp.isExemptRoute()) {
            return
        }

        let userId = Meteor.userId()
        if (!userId) {
            OLog.debug(`vxapp.js routeBefore [${Util.routePath()}] user is not logged in`)
            return
        }

        let email = Util.getUserEmail(userId)
        if (!email) {
            OLog.debug(`vxapp.js routeBefore [${Util.routePath()}] userId=${userId} subscription is not yet ready`)
            return
        }

        const iosState = Store.getState().iosState
        delete iosState.iosButtonState
        Store.dispatch(setIosState(iosState))

        let tenantId = Util.getCurrentTenantId(userId)
        let domainId = Util.getCurrentDomainId(userId)
        let currentDomainId = Store.getState().currentDomainId
        let publishingMode = VXApp.getPublishingMode(tenantId, domainId, "client", userId)
        let currentPublishingMode = Store.getState().currentPublishingMode
        if (domainId !== currentDomainId || publishingMode !== currentPublishingMode) {
            OLog.debug(`vxapp.js routeBefore [${Util.routePath()}] *before* email=${email} detected domain or publishing mode change:` +
                ` domain=${Util.fetchDomainName(domainId)} mode=${publishingMode} *clearing* session variables`)
            Store.dispatch(setPublishCurrentTenant({ criteria: { _id: tenantId } }))
            Store.dispatch(setPublishCurrentDomain({ criteria: { _id: domainId } }))
            Store.dispatch(setPublishAuthoringUser(null))
            Store.dispatch(setPublishAuthoringDomain(null))
            Store.dispatch(setCurrentDomainId(domainId))
            Store.dispatch(setCurrentPublishingMode(publishingMode))
            VXApp.setSessionVariables(userId)
        }

        let currentUserId = Store.getState().currentUserId
        if (userId !== currentUserId) {
            if (email && domainId) {
                OLog.debug(`vxapp.js routeBefore [${Util.routePath()}] *before* email=${email} domain ${Util.fetchDomainName(domainId)}`)
                Store.dispatch(setCurrentUserId(userId))
                let currentLocale = Util.getProfileValue("locale")
                Store.dispatch(setCurrentLocale(currentLocale))
                OLog.debug(`vxapp.js routeBefore [${Util.routePath()}] *before* email=${email} i18n currentLocale=${currentLocale}`)
                // Set the user's default timezone if it hasn't already been established:
                if (!Util.getProfileValue("timezone", userId)) {
                    let detectedTimezone = TimezonePicker.detectedZone()
                    OLog.debug(`vxapp.js routeBefore [${Util.routePath()}] *before* email=${email} setting user profile timezone=${detectedTimezone}`)
                    Meteor.users.update(userId, { $set: { "profile.timezone": detectedTimezone } })
                }
                // Set session variables that piggy back on existing subscriptions:
                VXApp.setSessionVariables(userId)
            }
            else {
                OLog.debug(`vxapp.js routeBefore [${Util.routePath()}] *before* email=${email} *notready* userId=${userId} waiting for email and domain`)
            }
        }
        else {
            OLog.debug(`vxapp.js routeBefore [${Util.routePath()}] *before* email=${email} *matching* userId=${userId} currentUserId=${currentUserId}`)
        }

        if (Util.routePath() && UXState.previousBefore === Util.routePath()) {
            OLog.debug(`vxapp.js routeBefore [${Util.routePath()}] *before* email=${email} route is unchanged from previous=${UXState.previousBefore} before action will be suppressed`)
            return
        }

        UXState.previousBefore = Util.routePath()
        OLog.debug(`vxapp.js routeBefore [${Util.routePath()}] invoking doRouteBefore`)
        Routes.doRouteBefore()
    },

    /**
     * Perform a variety functions after new route.
     */
    routeAfter() {
        OLog.debug(`vxapp.js routeAfter [${Util.routePath()}] *fire*`)
        Routes.doRouteAfter()
        UX.setLoading(false)
        Meteor.setTimeout(() => {
            UX.clearLoading()
        }, 250)
    },

    /**
     * Set session variables that "piggy back" on previously-set subscriptions.
     *
     * @param {string} userId Current user ID.
     */
    setSessionVariables(userId) {
        if (VXApp.setAppSessionVariables) {
            VXApp.setAppSessionVariables(userId)
        }
    },

    /**
     * Conditionally set a redux property, which contains the publishing criteria for a
     * single record, to arbitrarily select the first record in a list. This is nececessary
     * to initialize the redux store the first time a route is rendered.
     *
     * @param {string} reduxPropertyName Name of redux property to initialize.
     * @param {object} setAction Redux set action.
     * @param {function} listFunction Function to return an array of records.
     */
    selectFirstRecord(reduxPropertyName, setAction, listFunction) {
        OLog.debug(`vxapp.js selectFirstRecord *init* reduxPropertyName=${reduxPropertyName}`)
        if (Store.getState()[reduxPropertyName]) {
            OLog.debug("vxapp.js selectFirstRecord redux already intialized " +
                `${reduxPropertyName}=${OLog.debugString(Store.getState()[reduxPropertyName])}`)
            return
        }
        OLog.debug(`vxapp.js selectFirstRecord invoking list function ${Util.functionName(listFunction)}`)
        const array = listFunction()
        if (!array || array.length === 0) {
            OLog.error(`vxapp.js selectFirstRecord ${Util.functionName(listFunction)} returned *falsy* ` +
                `unable to initialize redux variable ${reduxPropertyName}`)
            return
        }
        const publish = {}
        publish.criteria = { _id: array[0]._id }
        publish.options = {}
        OLog.debug(`vxapp.js selectFirstRecord *overriding* ${reduxPropertyName} criteria=${OLog.debugString(publish)}`)
        Store.dispatch(setAction(publish))
    },

    /**
     * Check ContextMaker for the presence of a function named <rotue>BeforeRender, and if that function
     * exists, invoke it. This is needed to initialize redux store early prior to rendering.
     */
    doContextMakerBeforeRender() {
        const contextMakerFunctionName = `${Util.routeFirstSegment(Util.routePath())}BeforeRender`
        const func = ContextMaker[contextMakerFunctionName]
        if (!func) {
            OLog.debug(`vxapp.js doContextMakerBefore no beforeRoute hook for ContextMaker.${contextMakerFunctionName}`)
            return
        }
        OLog.debug(`vxapp.js doContextMakerBefore *invoke* ContextMaker.${contextMakerFunctionName}`)
        func()
    },

    /**
     * Logout gracefully.  It is necessary to redirect to home prior to logout in order to
     * ensure that React containers do not re-draw pages that require current Meteor user ID.
     *
     * @param {function} callback Callback function.
     */
    logout(callback) {
        OLog.debug(`vxapp.js logout user=${Util.getUserEmail(Meteor.userId())}`)
        VXApp.clearSessionSettings()
        if (callback) {
            Meteor.setTimeout(() => {
                callback()
            })
        }
        OLog.debug("vxapp.js logout function was successful, redirecting to signin page and deferring logout")
        UX.go("/")
        Meteor.setTimeout(() => {
            OLog.debug("vxapp.js logout purging redux persist store and UXState.previousBefore route")
            Persistor.purge().then(() => { return Persistor.flush() }).then(() => { Persistor.pause() })
            UXState.previousBefore = null
            Meteor.logout(error => {
                if (error) {
                    OLog.error(`vxapp.js logout function returned unexpected error=${error}`)
                    return
                }
                OLog.debug("vxapp.js logout was successful")
            })
        }, 1000)
    },

    /**
     * Add/remove a role to/from a user in a given domain/tenant.
     *
     * @param {string} userOrId User or ID.
     * @param {string} tenantOrDomainId Tenant or domain ID.
     * @param {string} roleName Role name to be added/removed.
     * @param {boolean} updateTenant True to update tenant, false to update domain.
     * @param {boolean} checked True to add role, false to remove role.
     */
    updateTenantOrDomainRole(userOrId, tenantOrDomainId, roleName, updateTenant, checked) {
        let user = Util.user(userOrId)
        if (!user) {
            OLog.error("vxapp.js updateTenantOrDomainRole unable to locate userOrId=" + userOrId)
            return
        }
        let modifier = {}
        modifier.$set = {}
        if (updateTenant) {
            let tenantObject = _.findWhere(user.profile.tenants, { tenantId : tenantOrDomainId } )
            if (!tenantObject) {
                OLog.error("vxapp.js updateTenantOrDomainRole unable to locate tenantId=" + tenantOrDomainId)
                return
            }
            let index = _.indexOf(_.pluck(user.profile.tenants, "tenantId"), tenantOrDomainId)
            // Add the role if checked (avoid duplicates)
            if (checked) {
                if (!_.contains(tenantObject.roles, roleName)) {
                    tenantObject.roles.push(roleName)
                }
            }
            else {
                tenantObject.roles = _.without(tenantObject.roles, roleName)
            }
            modifier.$set["profile.tenants." + index + ".roles"] = tenantObject.roles
            OLog.debug("vxapp.js updateTenantOrDomainRole user " + Util.fetchFullName(user._id) + " tenant " + Util.fetchTenantName(tenantOrDomainId) + " modifier=" + OLog.debugString(modifier))
        }
        else {
            let domainObject = _.findWhere(user.profile.domains, { domainId : tenantOrDomainId } )
            if (!domainObject) {
                OLog.error("vxapp.js updateTenantOrDomainRole unable to locate domainId=" + tenantOrDomainId)
                return
            }
            let index = _.indexOf(_.pluck(user.profile.domains, "domainId"), tenantOrDomainId)
            // Add the role if checked (avoid duplicates)
            if (checked) {
                if (!_.contains(domainObject.roles, roleName)) {
                    domainObject.roles.push(roleName)
                }
            }
            else {
                domainObject.roles = _.without(domainObject.roles, roleName)
            }
            modifier.$set["profile.domains." + index + ".roles"] = domainObject.roles
            OLog.debug("vxapp.js updateTenantOrDomainRole user " + Util.fetchFullName(user._id) + " domain " + Util.fetchDomainName(tenantOrDomainId) + " modifier=" + OLog.debugString(modifier))
        }
        Meteor.users.update(user._id, modifier, error => {
            if (error) {
                OLog.error("vxapp.js updateTenantOrDomainRole error returned from dynamic field update=" + error)
                UX.notifyForDatabaseError(error)
                return
            }
        })
    },


    /**
     * Return a list of tenants.
     *
     * @param {string} userId Optional user ID to filter tenants.
     * @return {array} Array of tenants.
     */
    findTenantList(userId) {
        let publishCurrentTenants = Store.getState().publishCurrentTenants
        if (!publishCurrentTenants) {
            return
        }
        userId = userId || Meteor.userId()
        let tenantIds = Util.getTenantIds(userId)
        const criteria = { ...publishCurrentTenants.criteria }
        criteria._id = { $in: tenantIds }
        OLog.debug(`vxapp.js findTenantList adjusted criteria=${OLog.debugString(criteria)}`)
        return _.filter(Tenants.find(publishCurrentTenants.criteria, publishCurrentTenants.options).fetch(), tenant => {
            return Util.isTenantActive(tenant._id)
        })
    },

    /**
     * Return a list of domains.
     *
     * @return {array} Array of domains.
     */
    findDomainList() {
        let publishCurrentDomains = Store.getState().publishCurrentDomains
        if (!publishCurrentDomains) {
            return
        }
        let domainIdsVisible = Util.getDomainIds(Meteor.userId())
        let domainArray = []
        Domains.find(publishCurrentDomains.criteria, publishCurrentDomains.options).forEach(domain => {
            if (!Util.isDomainActive(domain._id)) {
                return
            }
            if (!Util.isPreference("ALL_MEMBERS_AND_DOMAINS")) {
                // Hide domains that we don't have access to:
                if (!_.contains(domainIdsVisible, domain._id)) {
                    return
                }
            }
            return domainArray.push(domain)
        })
        return domainArray
    },

    /**
     * Return the list of currently-published users.
     *
     * @return {array} Array of users.
     */
    findUserList() {
        let publishCurrentUsers = Store.getState().publishCurrentUsers
        if (!publishCurrentUsers) {
            return
        }
        // Do not include retired records:
        publishCurrentUsers.criteria["profile.dateRetired"] = { $exists: false }
        //OLog.debug("vxapp.js findUserList adjusted publishCurrentUsers=" + OLog.debugString(publishCurrentUsers))
        return Meteor.users.find(publishCurrentUsers.criteria, publishCurrentUsers.options).fetch()
    },

    /**
     * Find the list of domain objects associated with a supplied user ID.
     *
     * @param {object} userId User ID whose domains are to be returned.
     * @param {string} tenantId Optional tenant ID to filter results.
     * @return {array} Array of domain objects augmented with domain.
     */
    findUserDomainList(userId, tenantId) {
        let user = Meteor.users.findOne(userId)
        if (!user) {
            OLog.error("vxapp.js findUserDomainList unable to find userId=" + userId)
            return
        }
        if (!tenantId && !Util.isPreference("ALL_MEMBERS_AND_DOMAINS")) {
            tenantId = Util.getCurrentTenantId(Meteor.userId())
        }
        let tenantIdsVisible = Util.getTenantIds(Meteor.userId())
        let domainIdsVisible = Util.getDomainIds(Meteor.userId())
        let domainArray = []
        user.profile.domains.forEach(userDomain => {
            if (!Util.isPreference("ALL_MEMBERS_AND_DOMAINS")) {
                // Hide domains that we don't have access to:
                if (!_.contains(domainIdsVisible, userDomain.domainId)) {
                    return
                }
            }
            userDomain.domain = Domains.findOne( { _id : userDomain.domainId } )
            if (!userDomain.domain) {
                //OLog.error("vxapp.js findUserDomainList email=" + Util.getUserEmail(user._id) + " has reference to non-existent domainId=" + userDomain.domainId)
                return
            }
            if (!Util.isDomainActive(userDomain.domain)) {
                return
            }
            // If a tenant ID as supplied, us it to filter the results:
            if (tenantId && userDomain.domain.tenant !== tenantId) {
                return
            }
            if (!Util.isPreference("ALL_MEMBERS_AND_DOMAINS")) {
                // Hide domains from foreign teams:
                if (!_.contains(tenantIdsVisible, userDomain.domain.tenant)) {
                    return
                }
            }
            domainArray.push(userDomain)
        })

        return domainArray
    },

    /**
     * Find the list of user objects associated with a supplied domain record.
     *
     * @param {object} domain Context object.
     * @return {array} Array of user objects.
     */
    findDomainUserList(domain) {
        return Meteor.users.find( { "profile.dateRetired": { $exists: false }, "profile.domains": { $elemMatch : { domainId : domain._id } } }, { sort: { "profile.lastName": 1, dateCreated: 1 } } ).fetch()
    },

    /**
     * Drop domain on user.
     *
     * @param {Object} dropTarget Drop target.
     * @param {Object} ui UI object (JQuery Sortable).
     */
    updateUserDomain(dropTarget, ui) {
        let stringOldIndex = $(ui.item).attr("data-previndex")
        let oldIndex = stringOldIndex ? parseInt(stringOldIndex) : null
        let newIndex = ui.item.index()
        let $domainContainer = ui.item.children(".entity-container-small")
        let domainId = $domainContainer.attr("data-mongo-id")
        let publishAuthoringUser = Store.getState().publishAuthoringUser
        if (!publishAuthoringUser) {
            return
        }
        let user = Meteor.users.findOne(publishAuthoringUser.criteria)
        if (!user) {
            return
        }
        let tenants = user.profile.tenants || []
        let domains = user.profile.domains || []
        // If we're from domain list, oldIndex will be null:
        if (!Util.isWholeNumber(oldIndex)) {
            // Resist duplicates:
            if (_.findWhere(domains, { domainId: domainId })) {
                OLog.debug(`vxapp.js updateUserDomain ${Util.fetchFullName(user._id)} already has domain ` +
                    `${Util.fetchDomainName(domainId)} duplicates suppressed`)
                return
            }
        }
        // If we have an old index we're moving dragging the domain from one place to another:
        if (Util.isWholeNumber(oldIndex)) {
            OLog.debug(`vxapp.js updateUserDomain ${Util.fetchFullName(user._id)} domain ` +
                `${Util.fetchDomainName(domainId)} dragged from ${oldIndex} to ${newIndex}`)
            dropTarget.sortable("cancel")
            // Currently MongoDB cannot do a $pull and $push operation in a single transaction.  There is
            // an open issue about this but for now we have to do this in two steps.
            let modifier = {}
            modifier.$pull = {}
            modifier.$pull["profile.domains"] = { domainId : domainId }
            Meteor.users.update(user._id, modifier, error => {
                if (error) {
                    OLog.error(`vxapp.js updateUserDomain error returned from MongoDB update=${error}`)
                    UX.notifyForDatabaseError(error)
                    return
                }
            })
            modifier = {}
            modifier.$push = {}
            modifier.$push["profile.domains"] = { $each: [ domains[oldIndex] ], $position: newIndex }
            Meteor.users.update(user._id, modifier, error => {
                if (error) {
                    OLog.error(`vxapp.js updateUserDomain error returned from MongoDB update=${error}`)
                    UX.notifyForDatabaseError(error)
                    return
                }
            })
        }
        else {
            OLog.debug(`vxapp.js updateUserDomain ${Util.fetchFullName(user._id)} domain ` +
                `${Util.fetchDomainName(domainId)} dragged from LHS list to index ${newIndex}`)
            let modifier = {}
            modifier.$push = {}
            modifier.$push["profile.domains"] = { $each: [ { domainId : domainId, roles : [ ] } ], $position: newIndex }
            let tenantId = Util.getTenantId(domainId)
            if (!tenantId) {
                OLog.error(`vxapp.js updateUserDomain cannot find tenant of domainId=${domainId}`)
                return
            }
            if (!_.findWhere(tenants, { tenantId: tenantId })) {
                OLog.debug(`vxapp.js updateUserDomain ${Util.fetchFullName(user._id)} will get tenant ` +
                    `${Util.fetchTenantName(tenantId)}`)
                modifier.$push["profile.tenants"] = { tenantId: tenantId, roles : [ ]  }
            }
            OLog.debug(`vxapp.js updateUserDomain ${Util.fetchFullName(user._id)} modifier=${OLog.debugString(modifier)}`)
            Meteor.users.update(user._id, modifier, error => {
                if (error) {
                    OLog.error(`vxapp.js updateUserDomain error returned from MongoDB update=${error}`)
                    UX.notifyForDatabaseError(error)
                    return
                }
            })
        }
    },

    /**
     * Drop user on domain.
     *
     * @param {object} dropTarget Drag source.
     * @param {object} ui UI object (JQuery Sortable).
     */
    updateDomainUser(dropTarget, ui) {
        let $userContainer = ui.item.children(".entity-container-small")
        let userId = $userContainer.attr("data-mongo-id")
        let publishAuthoringDomain = Store.getState().publishAuthoringDomain
        if (!publishAuthoringDomain) {
            return
        }
        let domain = Domains.findOne(publishAuthoringDomain.criteria)
        if (!domain) {
            return
        }
        let user = Meteor.users.findOne(userId)
        if (!user) {
            return
        }
        let tenants = user.profile.tenants || []
        let domains = user.profile.domains || []
        // Resist duplicates:
        if (_.findWhere(domains, { domainId: domain._id })) {
            OLog.debug("vxapp.js updateDomainUser " + Util.fetchFullName(user._id) + " already has domain " + Util.fetchDomainName(domain._id) + " duplicates suppressed")
            return
        }
        let modifier = {}
        modifier.$push = {}
        // Each operator is supplied even when immaterial to simplify schema validation rules:
        modifier.$push["profile.domains"] = { $each: [ { domainId : domain._id, roles : [ ] } ] }
        OLog.debug("vxapp.js updateDomainUser add domain " + Util.fetchDomainName(domain._id) + " to " + Util.fetchFullName(userId))
        if (!_.findWhere(tenants, { tenantId: domain.tenant })) {
            OLog.debug("vxapp.js updateDomainUser add tenant " + Util.fetchTenantName(domain.tenant) + " to " + Util.fetchFullName(user._id))
            modifier.$push["profile.tenants"] = { tenantId: domain.tenant, roles : [ ]  }
        }
        OLog.debug("vxapp.js updateDomainUser modifier=" + OLog.debugString(modifier))
        Meteor.users.update( { _id: userId }, modifier, error => {
            if (error) {
                OLog.error("vxapp.js updateDomainUser error returned from MongoDB update=" + error)
                UX.notifyForDatabaseError(error)
                return
            }
        })
    },

    /**
     * Delete a domain from a specified user.
     *
     * @param {string} userId User ID.
     * @param {string} domainIdDeleted Domain ID.
     */
    deleteUserDomain(userId, domainIdDeleted) {
        let user = Meteor.users.findOne(userId)
        if (!user) {
            OLog.error("vxapp.js deleteUserDomain unable to find userId=" + userId)
            return
        }
        let domains = user.profile.domains || []
        let index = _.indexOf(_.pluck(user.profile.domains, "domainId"), domainIdDeleted)
        if (index < 0 || index >= domains.length) {
            OLog.error("vxapp.js deleteUserDomain index " + index + " out of range domains.length=" + domains.length)
            return
        }
        let domainRecordDeleted = Domains.findOne( { _id: domainIdDeleted } )
        if (!domainRecordDeleted) {
            OLog.error("vxapp.js deleteUserDomain unable to find domainId=" + domainIdDeleted)
            return
        }
        let tenantIdDeleted = domainRecordDeleted.tenant
        let modifier = {}
        modifier.$pull = {}
        modifier.$pull["profile.domains"] = { domainId: domainIdDeleted }
        domains.splice(index, 1)
        let tenantStillUsed = false
        domains.every(domainObject => {
            let domainRecordRemaining = Domains.findOne(domainObject.domainId)
            if (!domainRecordRemaining) {
                // At this time, delete domain is running on the client.
                // Very tricky here, since not all domains and tenants are in memory we need to simply
                // bypass this one (assume no system integrity issue)
                return true
            }
            if (domainRecordRemaining.tenant === tenantIdDeleted) {
                tenantStillUsed = true
                return false
            }
            return true
        })
        OLog.debug("vxapp.js deleteUserDomain for user " + Util.fetchFullName(userId) + " deleting domain " + Util.fetchDomainName(domainIdDeleted))
        if (!tenantStillUsed) {
            OLog.debug("vxapp.js deleteUserDomain deleting domain " + Util.fetchDomainName(domainIdDeleted) + " tenant " + Util.fetchTenantName(tenantIdDeleted) + " will no longer be required and will be removed")
            modifier.$pull["profile.tenants"] = { tenantId: tenantIdDeleted }
        }
        if (user.profile.currentDomain === domainIdDeleted) {
            if (domains.length < 1) {
                OLog.error("vxapp.js deleteUserDomain user domains length is zero (impossible) unable to reset currentDomain")
                return
            }
            OLog.debug("vxapp.js deleteUserDomain resetting currentDomain, old=" + Util.fetchDomainName(domainIdDeleted) + " new=" + Util.fetchDomainName(domains[0].domainId))
            modifier.$set = {}
            modifier.$set["profile.currentDomain"] = null
        }
        OLog.debug("vxapp.js deleteUserDomain for user " + Util.fetchFullName(userId) + " modifier=" + OLog.debugString(modifier))
        Meteor.users.update(user._id, modifier, error => {
            if (error) {
                OLog.error("vxapp.js deleteUserDomain error returned from MongoDB update=" + error)
                UX.notifyForDatabaseError(error)
                return
            }
        })
    },

    /**
     * Validate that a user can be removed from a specified domain.
     *
     * @param {string} userId User ID that is tentatively losing the domain.
     * @param {string} domainId Domain ID that is tentatively being lost.
     * @param {string} thingRemoved Either "USER" or "DOMAIN" (point-of-view) affects the warning message.
     * @return {object} Result object.
     */
    validateRemoveUserFromDomain(userId, domainId, thingRemoved) {
        OLog.debug("vxapp.js validateRemoveUserFromDomain userId=" + userId + " domainId=" + domainId + " thingRemoved=" + thingRemoved)
        return { success : true, icon : "ENVELOPE", key : "common.alert_transaction_success" }
    },

    /**
     * Delete a tenant from a specified user.
     *
     * @param {string} userId User ID.
     * @param {string} tenantId TenantId ID.
     */
    deleteUserTenant(userId, tenantId) {
        Util.getDomainIds(userId, tenantId, true).forEach(domainId => {
            VXApp.deleteUserDomain(userId, domainId)
        })
    },

    /**
     * Create team event handler.
     *
     * @param {function} callback Callback.
     */
    onCreateTenant(callback) {
        Meteor.call("createTenant", (error, result) => {
            callback()
            UX.notify(result, error, true)
            if (error || (result && !result.success)) {
                return
            }
            let publishCurrentTenant = {}
            publishCurrentTenant.criteria = { _id : result.tenantId }
            Store.dispatch(setPublishCurrentTenant(publishCurrentTenant))
            let publishCurrentDomain = {}
            publishCurrentDomain.criteria = { _id : result.domainId }
            Store.dispatch(setPublishCurrentDomain(publishCurrentDomain))
            UX.iosMajorPush(null, null, "/tenant/" + result.tenantId, "RIGHT", "crossfade")
        })
    },

    /**
     * Get the color class for the given record's subsystem.
     *
     * @param {string} subsystem Subsystem name (e.g., CARD).
     * @param {object) record Record containing status to get.
     * return {string} Color class for subsystem status.
     */
    subsystemStatusClass(subsystem, record) {
        let subsystemStatus = VXApp.getSubsystemStatus(subsystem, record)
        if (!subsystemStatus) {
            return CX.SUBSYSTEM_STATUS_CLASS_MAP.GRAY
        }
        return CX.SUBSYSTEM_STATUS_CLASS_MAP[subsystemStatus.status]
    },

    /**
     * Get the message for a given record's subsystem.
     *
     * @param {string} subsystem Subsystem name (e.g., CARD).
     * @param {object) record Record containing status to get.
     * return {string} Localized message.
     */
    subsystemStatusMessage(subsystem, record) {
        let subsystemStatus = VXApp.getSubsystemStatus(subsystem, record)
        if (!subsystemStatus) {
            return
        }
        return Util.i18n(subsystemStatus.key, subsystemStatus.variables)
    },

    /**
     * Return an array of template records.
     *
     * @return {array} Array of recipient records.
     */
    findTemplateList() {
        const publishCurrentTemplates = Store.getState().publishCurrentTemplates
        OLog.debug(`vxapp.js findTemplateList publishCurrentTemplates=${OLog.debugString(publishCurrentTemplates)}`)
        return Templates.find(publishCurrentTemplates.criteria, publishCurrentTemplates.options).fetch()
    },

    cloneTemplate(templateId) {
        let template = Templates.findOne(templateId)
        if (!template) {
            return
        }
        delete template._id
        delete template.dateCreated
        delete template.userCreated
        delete template.subsystemStatus
        Templates.insert(template, (error, templateId) => {
            if (error) {
                OLog.error("vxapp.js error attempting to clone templateId=" + templateId + " error=" + error)
                UX.notifyForDatabaseError(error)
                return
            }
            UX.iosMajorPush(null, null, "/template/" + templateId, "RIGHT", "crossfade")
        })
    },

    findFunctionList() {
        const publishCurrentFunctions = Store.getState().publishCurrentFunctions
        OLog.debug(`vxapp.js findFunctionList publishCurrentFunctions=${OLog.debugString(publishCurrentFunctions)}`)
        return Functions.find(publishCurrentFunctions.criteria, publishCurrentFunctions.options).fetch()
    },

    cloneFunction(functionId) {
        const funktion = Functions.findOne(functionId)
        if (!funktion) {
            return
        }
        delete funktion._id
        delete funktion.dateCreated
        delete funktion.userCreated
        Functions.insert(funktion, (error, functionId) => {
            if (error) {
                OLog.error(`vxapp.js error attempting to clone functionId=${functionId} error=${error}`)
                UX.notifyForDatabaseError(error)
                return
            }
            UX.iosMajorPush(null, null, `/function/${functionId}`, "RIGHT", "crossfade")
        })
    },

    /**
     * Perform undo on the specified collection.
     *
     * @param {object} collection Collection.
     * @param {object} doc Document current state.
     */
    undo(collection, doc) {
        Meteor.call("undo", collection._name, doc, (error, result) => {
            UX.notify(result, error, true)
        })
    },

    /**
     * Perform redo on the specified collection.
     *
     * @param {object} collection Collection.
     * @param {object} doc Document current state.
     */
    redo(collection, doc) {
        Meteor.call("redo", collection._name, doc, (error, result) => {
            UX.notify(result, error, true)
        })
    },

    /**
     * Set the contents of the clipboard.
     *
     * @param {string} clipboardType Type of clipboard (application-specific).
     * @param {object} payload Payload object.
     */
    setClipboard(clipboardType, payload) {
        const clipboard = Clipboard.findOne({ userId: Meteor.userId })
        if (!clipboard) {
            OLog.debug(`vxapp.js setClipboard initializing clipboard for user=${Meteor.userId()}`)
            Clipboard.insert({ clipboardType, payload })
            return
        }
        const modifier = {}
        modifier.$set = {}
        modifier.$set.clipboardType = clipboardType
        modifier.$set.payload = payload
        OLog.debug(`vxapp.js setClipboard clipboardId=${clipboard._id} user=${Meteor.userId()} modifier=${OLog.debugString(modifier)}`)
        Clipboard.update(clipboard._id, modifier)
    },

    /**
     * Get the contents of the clipboard.
     *
     * @param {string} clipboardType Optional type of clipboard desired.
     * @return {object} Payload object or null if nothing in clipboard or wrong type.
     */
    getClipboard(clipboardType) {
        const selector = {}
        selector.userId = Meteor.userId()
        const clipboard = Clipboard.findOne(selector)
        if (!clipboard) {
            return null
        }
        return clipboard.clipboardType === clipboardType ? clipboard.payload : null
    },

    /**
     * Make an array of domains for a drop-down list.
     *
     * @param {boolean} includeBlank True to include blank row at beginning.
     * @param {string} excludeDomainId Domain ID to be excluded (if any).
     * @return {array} Array of domains (code and localized).
     */
    makeDomainArray(includeBlank, excludeDomainId) {
        const domains = VXApp.findDomainList()
        const codeArray = _.reject(domains, domain => domain._id === excludeDomainId).map(domain => {
            return { code: domain._id, localized: domain.name }
        })
        codeArray.sort((recordA, recordB) => {
            return recordA.localized.localeCompare(recordB.localized)
        })
        if (includeBlank) {
            codeArray.unshift( { code: "", localized: "" } )
        }
        return codeArray
    },

    /**
     * Make animation classes for SlidePanel and similar components.
     *
     * @param {string} status Transition status.
     * @param {string} classes Base classes.
     * @param {string} animation Animation name.
     * @return {string} Base classes augmented with animation classes.
     */
    makeAnimationClasses(status, classes, animation) {

        if (animation) {
            switch (status) {
            case "entering" :
                classes += " " + animation + "-enter"
                break
            case "entered" :
                classes += " " + animation + "-enter " + animation + "-enter-active"
                break
            case "exiting" :
                classes += " " + animation + "-exit"
                break
            case "exited" :
                classes += " " + animation + "-exit " + animation + "-exit-active"
                break
            }
        }

        return classes
    },

    /**
     * Get animation timeout.
     *
     * @param {string} animation Animation name.
     * @return {number} Milliseconds or zero if no animation.
     */
    animationTimeout(animation) {
        return animation ? CX.SLIDE_ANIMATION_DURATION : 0
    },

    /**
     * Set one-time listener to handle clean-up after animation finishes.
     *
     * @param {object} node DOM element being animated.
     * @param {function} callback Callback (must be called after finish).
     */
    handleAnimationEnd(node, callback) {
        $(node).one("webkitAnimationEnd oanimationend msAnimationEnd animationend", () => {
            UX.afterAnimate()
            callback()
        })
    },

    /**
     * Create an event (also create accompanying notification(s) if applicable).
     *
     * @param {string} Event type (e.g., ORDER_CREATED).
     * @param {object} Event data in object form.
     * @param {object} Variables to be inserted into notifications.
     * @return {string} MongoDB ID of new event.
     */
    async createEvent(eventType, eventData, variables) {
        try {
            await UX.call("createEvent", eventType, eventData, variables)
        }
        catch (error) {
            OLog.error(`vxapp.js createEvent error=${error}`)
            return
        }
    },


    /**
     * Simple update handler to use when overriding default behavior at component level.
     * You can upate any collection and field by supplying the parameters below.
     *
     * @param {object} collection MongoDB collection to update.
     * @param {object} record Record to be updated.
     * @param {string} rowsPath Lodash-style update path.
     * @param {?} value New value.
     */
    updateHandlerSimple(collection, record, rowsPath, value) {
        const mongoPath = Util.toMongoPath(rowsPath)
        const modifier = {}
        modifier.$set = {}
        modifier.$set[mongoPath] = value
        OLog.debug(`vxapp.js updateHandlerSimple collection=${collection._name} recordId=${record._id} ` +
            `rowsPath=${rowsPath} mongoPath=${mongoPath} modifier=${OLog.debugString(modifier)}`)
        collection.update(record._id, modifier, error => {
            if (error) {
                UX.notifyForError(error)
                return
            }
            OLog.debug(`vxapp.js updateHandlerSimple collection=${collection._name} recordId=${record._id} *success*`)
        })
    },

    /**
     * Add handler for VXRowPanel and VXRowList.
     *
     * @param {object} collection MongoDB collection to update.
     * @param {object} record Record to be updated.
     * @param {string} rowsPath JSON path to array of rows to be updated.     *
     * @param {string} rowId Name of a property that uniquely identifies row.
     */
    addRow(collection, record,  rowsPath, rowId) {
        const mongoPath = Util.toMongoPath(rowsPath)
        const row = {}
        row[rowId] = Util.getGuid()
        const modifier = {}
        modifier.$push = {}
        modifier.$push[mongoPath] = row
        OLog.debug(`vxapp.js addRow recordId=${record._id} rowsPath=${rowsPath} mongoPath=${mongoPath} ` +
            `modifier=${OLog.debugString(modifier)}`)
        collection.update(record._id, modifier, error => {
            if (error) {
                UX.notifyForError(error)
                return
            }
            OLog.debug(`vxapp.js addRow recordId=${record._id} rowsPath=${rowsPath} mongoPath=${mongoPath} ` +
                `id=${row[rowId]} *success*`)
        })
    },

    /**
     * Add handler for VXRowPanel and VXRowList.
     *
     * @param {object} collection MongoDB collection to update.
     * @param {object} record Record to be updated.
     * @param {string} rowsPath JSON path to array of rows to be updated.
     * @param {string} rowId Name of a property that uniquely identifies row.
     * @param {string} id Unique ID of this row (typically GUID).
     */
    removeRow(collection, record, rowsPath, rowId, id) {
        const rows = get(record, rowsPath)
        if (!(rows && rows.length > 0)) {
            return
        }
        id = id || rows[rows.length - 1][rowId]
        const mongoPath = Util.toMongoPath(rowsPath)
        const modifier = {}
        modifier.$pull = {}
        modifier.$pull[mongoPath] = { id }
        OLog.debug(`vxapp.js removeRow recordId=${record._id} rowsPath=${rowsPath} mongoPath=${mongoPath} id=${id} ` +
            `modifier=${OLog.debugString(modifier)}`)
        collection.update(record._id, modifier, error => {
            if (error) {
                UX.notifyForError(error)
                return
            }
            OLog.debug(`vxapp.js removeRow recordId=${record._id} rowsPath=${rowsPath} mongoPath=${mongoPath} ` +
                `id=${id} *success*`)
        })
    },

    /**
     * Update handler for VXRowPanel and VXRowList.
     *
     * @param {object} collection MongoDB collection to update.
     * @param {object} record Record to be updated.
     * @param {string} rowsPath JSON path to array of rows to be updated.
     * @param {object} component Component whose state was changed resulting in this update.
     * @param {?} value New value.
     */
    updateRow(collection, record, rowsPath, component, value) {
        // The IDs of all components must start with the row ID
        const componentRowId = component.props.id.split("-")[0]
        if (!componentRowId) {
            return
        }
        const rows = get(record, rowsPath)
        const mongoPath = Util.toMongoPath(rowsPath)
        const index = Util.indexOf(rows, "id", componentRowId)
        if (index < 0) {
            return
        }
        const modifier = {}
        modifier.$set = {}
        modifier.$set[`${mongoPath}.${index}.${component.props.dbName}`] = value
        OLog.debug(`vxapp.js updateRow recordId=${record._id} componentId=${component.props.id} ` +
            `rowsPath=${rowsPath} mongoPath=${mongoPath} modifier=${OLog.debugString(modifier)}`)
        collection.update(record._id, modifier, error => {
            if (error) {
                UX.notifyForError(error)
                return
            }
            OLog.debug(`vxapp.js updateRow recordId=${record._id} *success*`)
        })
    },

    /**
     * This function provides update service a special type of data structure, where the user
     * experience is a list of rows with checkboxes, but the internal database format is an array
     * of codes that map to the "checked" rows. This type of data structure saves space and is more
     * concise in cases where there are many potential rows, but only a tiny subset are checked.
     *
     * @param {array} codeArray Invariant array of codes typically from codes.js.
     * @param {object} collection Collection to be updated.
     * @param {object} record Record to be updated.
     * @param {string} rowsPath Path to array within record.
     * @param {string} rowId Name of the property that uniquely identifies the row.
     * @param {string} checkboxdbName Name of the checkbox property that controls whether the element exists.
     * @param {object} component Component that has been updated.
     * @param {?} value Value that has been updated.
     */
    updateCodeArray(codeArray, collection, record, rowsPath, rowId, checkboxdbName, component, value) {
        // The IDs of all components must start with the row ID
        const componentRowId = component.props.id.split("-")[0]
        if (!componentRowId) {
            return
        }
        const rebuiltArray = []
        codeArray.forEach(code => {
            let element = _.find(get(record, rowsPath), element => {
                return element[rowId] === code
            })
            if (componentRowId === code) {
                if (component.props.dbName === checkboxdbName && !value) {
                    return
                }
                if (!element) {
                    element = {}
                    element[rowId] = code
                }
                set(element, component.props.dbName, value)
            }
            if (element) {
                rebuiltArray.push(element)
            }
        })
        const modifier = {}
        modifier.$set = {}
        modifier.$set[rowsPath] = rebuiltArray
        OLog.debug(`vxapp.js updateCodeArray recordId=${record._id} componentId=${component.props.id} ` +
            `rowsPath=${rowsPath} componentRowId=${componentRowId} modifier=${OLog.debugString(modifier)}`)
        collection.update(record._id, modifier, error => {
            if (error) {
                UX.notifyForError(error)
                return
            }
            OLog.debug(`vxapp.js updateCodeArray recordId=${record._id} *success*`)
        })
    },

    /**
     * Determine the MongoDB modifier to push an object bearing a code into a destination
     * array while preserving the order determined by a source array. This function can
     * be used in drag/drop operation where the goal is to ensure that the drop zone order
     * matches the drag list order.
     *
     * @param {array} sourceArray Array of codes in canonical sequence.
     * @param {array} destinationArray Array of codes in order matching drop zone.
     * @param {array} newCodeName Code to be inserted.
     * @param {object} newObject New object bearing code to be inserted.
     * @return {string} MongoDB modifier either newObject unchanged or wrapped with $each and $position.
     */
    codeArrayPushModifier(sourceArray, destinationArray, newCodeName, newObject) {
        const newObjectCanonicalIndex = sourceArray.indexOf(newCodeName)
        if (newObjectCanonicalIndex < 0) {
            OLog.error(`vxapp.js codeArrayPushModifier sourceArray=${sourceArray} does not contain newCodeName=${newCodeName}`)
            return
        }
        for (let destinationIndex = 0; destinationIndex < destinationArray.length; destinationIndex++) {
            const existingCode = destinationArray[destinationIndex]
            const existingObjectCanonicalIndex = sourceArray.indexOf(existingCode)
            if (newObjectCanonicalIndex < existingObjectCanonicalIndex) {
                return { $each: [ newObject ], $position: destinationIndex }
            }
        }
        return newObject
    },

    /**
     * Apply filters to a standard publishing object. There are two types of filters: criteria or text.
     * Criteria filters are simply additional properties added to the criteria. Text filters leverage
     * Regex expressions to search text fields within the collection, and the caller must supply an
     * object such as { searchPhrase: "Aetna", propertyNames: [ "name", "description" ] }.
     *
     * @param {object} publish Standard publishing object.
     * @param {object} criteria Standard criteria filter is an object merged with publishing criteria.
     * @param {object} text String used to form
     * @return {object} Standard publishing object adjusted with filters.
     */
    applyFilters(publish, criteria, text) {
        const publishAdjusted = { ...publish }
        if (criteria) {
            publishAdjusted.criteria = { ...publish.criteria, ...criteria }
        }
        if (text) {
            const searchRegex = new RegExp(text.searchPhrase, "i")
            publishAdjusted.criteria.$or = []
            text.propertyNames.forEach(propertyName => {
                publishAdjusted.criteria.$or.push({ [propertyName]: searchRegex })
            })
        }
        return publishAdjusted
    },

    /**
     * Return a reference to a specified instance of FunctionAceEditor.
     *
     * @param {string} componentId Component ID of FunctionAceEditor.
     */
    aceEditor(componentId) {
        componentId = componentId || "ace-editor"
        const functionAceEditor = UX.findComponentById(componentId)
        if (!functionAceEditor) {
            OLog.error(`vxapp.js aceEditor unable to find componentId=${componentId}`)
            return
        }
        return functionAceEditor.reactAce.editor
    },

    /**
     * Execute function supplied as string.
     *
     * @param {string} functionString Function as string.
     * @param {object} data Data passed to function
     * @return {?} Return value
     */
    eval(functionString, data) {
        try {
            let func = eval(`(${functionString})`)
            return func.call(data, data)
        }
        catch (error) {
            console.log("vxapp.js eval function error", functionString)
            console.log("vxapp.js eval error", error)
        }
    },

    /**
     * Test a given function by executing it and display a helpful notification.
     *
     * @param {string} functionString Function as string.
     */
    async testFunction(functionString) {
        try {
            try {
                const data = VXApp.functionTestDataDefault()
                console.log("VXApp.testFunction data", data)
                const result = await VXApp.eval(functionString, data)
                UX.notify({ success : true, icon : "CALCULATOR", key: "common.alert_function_valid" })
                console.log("Function test successful - return value:", result)
            }
            catch (error) {
                UX.notifyForError(error)
            }
        }
        catch (error) {
            UX.notifyForError(error)
        }
    },

    /**
     * Return a data object to be used with the Test Function button.
     * This is application-specific data object or empty object.
     */
    functionTestDataDefault() {
        if (VXApp.appFunctionTestDataDefault) {
            return VXApp.appFunctionTestDataDefault()
        }
        return {}
    },

    /**
     * Add all database functions to VXApp.
     */
    addAllFunctions() {
        const functionAnchor = VXApp.functionAnchor()
        if (!functionAnchor) {
            return
        }
        const functions = VXApp.findFunctionList()
        OLog.debug("vxapp.js addAllFunctions will add all functions to " +
            `${functionAnchor} global object with count=${functions.length}`)
        window[functionAnchor] = {}
        functions.forEach(newFunction => {
            VXApp.addFunction(newFunction, false)
        })
        Store.dispatch(setFunctionUpdateTimestamp(new Date().toISOString()))
    },

    /**
     * Add a database-resident function to KeepTrack global object.
     *
     * @param {object} newFunction New function.
     * @param {boolean} quiet True to add quietly.
     */
    addFunction(newFunction, quiet) {
        try {
            const functionAnchor = VXApp.functionAnchor()
            if (!functionAnchor) {
                return
            }
            if (!quiet) {
                console.log(`vxapp.js addFunction will add ${newFunction.name} to ${functionAnchor} global object`)
            }
            if (!newFunction.name) {
                console.log(`vxapp.js addFunction no name yet ignoring functionId=${newFunction._id}`)
                return
            }
            if (typeof newFunction.name === "string") {
                delete window[functionAnchor][newFunction.name]
            }
            if (!newFunction.value) {
                console.log(`vxapp.js addFunction no value conditionally deleting functionId=${newFunction._id}`)
                return
            }
            const func = eval(`(${newFunction.value})`)
            if (typeof newFunction.name === "string" && typeof func === "function") {
                window[functionAnchor][newFunction.name] = func
            }
        }
        catch (error) {
            OLog.error(`vxapp.js addFunction unexpected error ${error}`)
        }
    },

    /**
     * Update a KeepTrack global object function.
     *
     * @param {object} newFunction New function.
     * @param {object} oldFunction Old function.
     */
    changeFunction(newFunction, oldFunction) {
        try {
            const functionAnchor = VXApp.functionAnchor()
            if (!functionAnchor) {
                return
            }
            console.log(`vxapp.js changeFunction will change ${oldFunction.name} in ${functionAnchor} global object`)
            if (typeof oldFunction.name === "string") {
                delete window[functionAnchor][oldFunction.name]
            }
            if (newFunction.dateRetired) {
                console.log(`vxapp.js changeFunction ${oldFunction.name} has been retired and will not be reinstated`)
                return
            }
            if (!newFunction.name) {
                console.log(`vxapp.js changeFunction no name yet ignoring functionId=${newFunction._id}`)
                return
            }
            if (!newFunction.value) {
                console.log(`vxapp.js changeFunction no value conditionally deleting functionId=${newFunction._id}`)
                return
            }
            const func = eval(`(${newFunction.value})`)
            if (typeof newFunction.name === "string" && typeof func === "function") {
                OLog.debug(`vxapp.js changeFunction will add ${newFunction.name} to ${functionAnchor} global object`)
                window[functionAnchor][newFunction.name] = func
            }
        }
        catch (error) {
            OLog.error(`vxapp.js changeFunction unexpected error ${error}`)
        }
    },

    /**
     * Remove a Gavel global object function.
     *
     * @param {string} functionId Function ID.
     */
    removeFunction(oldFunction) {
        try {
            const functionAnchor = VXApp.functionAnchor()
            if (!functionAnchor) {
                return
            }
            if (typeof oldFunction.name === "string") {
                console.log(`vxapp.js removeFunction will remove ${oldFunction.name} from ${functionAnchor} global object`)
                delete window[functionAnchor][oldFunction.name]
            }
        }
        catch (error) {
            OLog.error(`vxapp.js removeFunction unexpected error ${error}`)
        }
    }
})
