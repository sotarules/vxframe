import {get, set} from "lodash"
import UploadModalContainer from "/imports/vx/client/UploadModalContainer"
import allReducersVx from "/imports/vx/client/code/reducers/allReducers"
import ReportSendModal from "/imports/reports/client/ReportSendModal"
import {
    setCurrentDomainId,
    setCurrentLocale,
    setCurrentPublishingMode,
    setCurrentReportRecord,
    setCurrentUserId,
    setFunctionUpdateTimestamp,
    setListImportLastPercent,
    setPublishAuthoringDomain,
    setPublishAuthoringFunction,
    setPublishAuthoringReport,
    setPublishAuthoringTemplate,
    setPublishAuthoringUser,
    setPublishCurrentDomain,
    setPublishCurrentDomains,
    setPublishCurrentFunctions,
    setPublishCurrentReports,
    setPublishCurrentTemplates,
    setPublishCurrentTenant,
    setPublishCurrentTenants,
    setPublishCurrentUploadStats,
    setPublishCurrentUsers,
    setPublishingModeClient,
    setPublishingModeServer,
    setReportData,
    setReportGuid,
    setReportLoading,
    setSubscriptionParameters
} from "/imports/vx/client/code/actions"

VXApp = { ...VXApp, ...{

    /**
     * Handle normal signin passing email, password and potentially 2FA token to Meteor login subsystem.
     * This is a heavily-customized approach using a very poorly-documented API.
     *
     * @param {object} state React state of sign-in component.
     * @param {function} callback Callback bearing either error or results.
     */
    handleSignin(state, callback) {
        const { email, password, token, doNotAskAgain } = state
        Accounts.callLoginMethod({
            methodArguments: [{
                user: { email },
                twoFactorPassword: Accounts._hashPassword(password),
                twoFactorToken: token,
                doNotAskAgain: doNotAskAgain,
                twoFactorHash: UX.getLocalStorageWithExpiry(CX.LOCAL_STORAGE_TWO_FACTOR_HASH_KEY)
            }],
            validateResult: (result) => {
                if (!token) {
                    return
                }
                if (doNotAskAgain) {
                    OLog.debug(`vxapp.handleSignin email=${email} token=${token} doNotAskAgain=${doNotAskAgain} *setting* local storage`)
                    UX.setLocalStorageWithExpiry(CX.LOCAL_STORAGE_TWO_FACTOR_HASH_KEY, result.twoFactorHash,
                        CX.LOCAL_STORAGE_TWO_FACTOR_HASH_TTL)
                }
                else {
                    OLog.debug(`vxapp.handleSignin email=${email} token=${token} doNotAskAgain=${doNotAskAgain} *removing* local storage`)
                    UX.removeLocalStorageWithExpiry(CX.LOCAL_STORAGE_TWO_FACTOR_HASH_KEY)
                }
            },
            userCallback: callback
        })
    },

    /**
     * Handle forgot password link.
     *
     * @param {object} form Form instance.
     */
    async handleForgotPassword(form) {
        try {
            if (!UX.checkForm(form, [ "password" ] )) {
                return
            }
            const email = UX.getComponentValue("email")
            OLog.debug(`vxapp.js handleForgotPassword email=${email}`)
            const user = await UX.call("findUserInsensitive", email)
            const emailEffective = (user ? user.username : email)
            Accounts.forgotPassword( { email : emailEffective }, error => {
                if (error) {
                    OLog.debug("vxapp.js handleForgotPassword Accounts.forgotPassword failed " +
                        `attempted email=${emailEffective} error=${error}`)
                    UX.createAlertLegacy("alert-danger", "login.forgot_password_error", { error : error.reason })
                    return
                }
                UX.createAlertLegacy("alert-info", "login.reset_password_sent", { email : emailEffective })
            })
        }
        catch (error) {
            UX.createAlertLegacy("alert-danger", "login.forgot_password_error", { error : error.reason })
            OLog.error(`vxapp.js handleForgotPassword exception=${error}`)
        }
    },

    /**
     * Return true if logout on browser close is enabled for this application.
     *
     * @return {boolean} True if the system should log the user out when browser is closed.
     */
    isLogoutOnBrowserClose() {
        return false
    },

    /**
     * Return unioned reducers. This function will likely be overridden at the application level.
     *
     * @return {object} Union of all reducers system-wide.
     */
    unionedReducers() {
        return { ...allReducersVx }
    },

    /**
     * Clear user session settings.
     */
    clearSessionSettings() {
        OLog.debug("vxapp.js clearSessionSettings")
        Store.dispatch(setPublishAuthoringDomain(null))
        Store.dispatch(setPublishAuthoringFunction(null))
        Store.dispatch(setPublishAuthoringReport(null))
        Store.dispatch(setPublishAuthoringTemplate(null))
        Store.dispatch(setPublishAuthoringUser(null))
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
        const publishCurrentReports = VXApp.makePublishingRequest("reports",
            newSubscriptionParameters, { dateRetired : { $exists: false } }, { sort: { name: 1 } })
        const publishCurrentUploadStats = VXApp.makePublishingRequest("uploadstats",
            newSubscriptionParameters, { }, { })

        if (doClient) {
            Store.dispatch(setPublishCurrentTenants(publishCurrentTenants.client))
            Store.dispatch(setPublishCurrentDomains(publishCurrentDomains.client))
            Store.dispatch(setPublishCurrentUsers(publishCurrentUsers.client))
            Store.dispatch(setPublishCurrentTemplates(publishCurrentTemplates.client))
            Store.dispatch(setPublishCurrentFunctions(publishCurrentFunctions.client))
            Store.dispatch(setPublishCurrentReports(publishCurrentReports.client))
            Store.dispatch(setPublishCurrentUploadStats(publishCurrentUploadStats.client))
        }

        if (doServer) {
            handles.push(Meteor.subscribe("config"))
            handles.push(Meteor.subscribe("clipboard"))
            handles.push(Meteor.subscribe("current_tenants", publishCurrentTenants.server))
            handles.push(Meteor.subscribe("current_domains", publishCurrentDomains.server))
            handles.push(Meteor.subscribe("current_users", publishCurrentUsers.server))
            handles.push(Meteor.subscribe("templates", publishCurrentTemplates.server))
            handles.push(Meteor.subscribe("functions", publishCurrentFunctions.server))
            handles.push(Meteor.subscribe("reports", publishCurrentReports.server))
            handles.push(Meteor.subscribe("uploadstats", publishCurrentUploadStats.server))
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
        const meteorUserId = window.localStorage.getItem("Meteor.userId")
        if (VXApp.isAppAuthorizedRoute && VXApp.isAppAuthorizedRoute(meteorUserId)) {
            return !!meteorUserId
        }
        const superAdminRoutes = ["/log", "/events" ]
        const systemAdminRoutes = ["/users-domains", "/domains-users", "/user/", "/domain/", "/tenant/"]
        const path = Util.routePath()
        if (Util.startsWith(superAdminRoutes, path)) {
            return Util.isUserSuperAdmin(meteorUserId)
        }
        if (Util.startsWith(systemAdminRoutes, path)) {
            return Util.isUserAdmin(meteorUserId)
        }
        return !!meteorUserId
    },

    /**
     * Determine if this is a wide layout route.
     *
     * @param {string} rotePath Route path to test.
     * @return {boolean} True if this is a wide layout route.
     */
    isWideRoute(routePath) {
        if (VXApp.isAppWideRoute) {
            return VXApp.isAppWideRoute(routePath)
        }
        return true
    },

    /**
     * Return true if system is in slide mode.
     *
     * @return {boolean} True if system is in slide mode.
     */
    isSlideMode() {
        return $(window).width() < 768
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

        OLog.debug("vxapp.js globalSubscriptions have been computed *wait* for publication")
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

        UX.unregisterIosButtonDelegates()

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
     * Extract the record ID from a standard publishing request.
     *
     * @param {object} publishingRequest Publishing request object.
     * @return {string} ID of selected record.
     */
    criteriaId(publishingRequest) {
        return get(publishingRequest, "criteria._id")
    },

    /**
     * Conditionally set a redux property, which contains the publishing criteria for a
     * single record, to arbitrarily select the first record in a list. This is nececessary
     * to initialize the redux store the first time a route is rendered.
     *
     * @param {string} reduxPropertyName Name of redux property to initialize.
     * @param {object} setAction Redux set action.
     * @param {?} list Function to return an array of records or array.
     */
    selectFirstRecord(reduxPropertyName, setAction, list) {
        const array = _.isFunction(list) ? list() : list
        if (!array || array.length === 0) {
            Store.dispatch(setAction(null))
            return
        }
        const publish = Store.getState()[reduxPropertyName] || {}
        const _id = publish?.criteria?._id
        if (!!_.findWhere(array, { _id })) {
            return
        }
        publish.criteria = { _id: array[0]._id }
        publish.options = {}
        OLog.debug(`vxapp.js selectFirstRecord reduxPropertyName=${reduxPropertyName} _id=${_id} ` +
            `*overriding* new publish=${OLog.debugString(publish)}`)
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
     * Hard logout removes user tokens from session storage, this is for immediate
     * logout without delay.
     */
    logoutImmediately() {
        Meteor.logout()
        window.localStorage.removeItem("Meteor.loginToken")
        window.localStorage.removeItem("Meteor.loginTokenExpires")
        window.localStorage.removeItem("Meteor.userId")
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

    handleDropUserDomain(dropInfo, user) {
        VXApp.handleDropMulti(Meteor.users, user, "profile.domains", "domainId", dropInfo, VXApp.userDomainNewItemHandler)
    },

    userDomainNewItemHandler(item, index, parameters) {
        const user = parameters.targetRecord
        const domainId = item["data-item-id"]
        if (_.findWhere(user.profile.domains, { domainId : domainId })) {
            OLog.debug(`vxapp.js userDomainNewItemHandler userId=${user._id} domainId=${domainId} ` +
                " already exists *bypass*")
            return
        }
        const newRow = {}
        newRow.domainId = domainId
        newRow.roles = []
        return newRow
    },

    handleDropDomainUser(dropInfo, domain, users) {
        dropInfo.items.forEach(item => {
            const userId = item["data-item-id"]
            const user = _.findWhere(users, { _id: userId })
            VXApp.updateDomainUser(domain, user)
        })
    },

    updateDomainUser(domain, user) {
        const tenants = user.profile.tenants || []
        const domains = user.profile.domains || []
        if (_.findWhere(domains, { domainId: domain._id })) {
            OLog.debug(`vxapp.js updateDomainUser ${Util.fetchFullName(user._id)} ` +
                `already has domain ${Util.fetchDomainName(domain._id)} duplicates suppressed`)
            return
        }
        const modifier = {}
        modifier.$push = {}
        modifier.$push["profile.domains"] = { $each: [ { domainId : domain._id, roles : [ ] } ] }
        OLog.debug(`vxapp.js updateDomainUser add domain ${Util.fetchDomainName(domain._id)} to ${Util.fetchFullName(user)}`)
        if (!_.findWhere(tenants, { tenantId: domain.tenant })) {
            OLog.debug(`vxapp.js updateDomainUser add tenant ${Util.fetchTenantName(domain.tenant)} ` +
                `to ${Util.fetchFullName(user._id)}`)
            modifier.$push["profile.tenants"] = { tenantId: domain.tenant, roles : [ ]  }
        }
        OLog.debug(`vxapp.js updateDomainUser modifier=${OLog.debugString(modifier)}`)
        Meteor.users.update( { _id: user._id }, modifier, error => {
            if (error) {
                OLog.error(`vxapp.js updateDomainUser error returned from MongoDB update=${error}`)
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
        const user = Meteor.users.findOne(userId)
        if (!user) {
            OLog.error(`vxapp.js deleteUserDomain unable to find userId=${userId}`)
            return
        }
        const domains = user.profile.domains || []
        const index = _.indexOf(_.pluck(user.profile.domains, "domainId"), domainIdDeleted)
        if (index < 0 || index >= domains.length) {
            OLog.error(`vxapp.js deleteUserDomain index ${index} out of range domains.length=${domains.length}`)
            return
        }
        const domainRecordDeleted = Domains.findOne( { _id: domainIdDeleted } )
        if (!domainRecordDeleted) {
            OLog.error(`vxapp.js deleteUserDomain unable to find domainId=${domainIdDeleted}`)
            return
        }
        const tenantId = domainRecordDeleted.tenant
        const modifier = {}
        modifier.$pull = {}
        modifier.$pull["profile.domains"] = { domainId: domainIdDeleted }
        domains.splice(index, 1)
        let tenantStillUsed = false
        domains.forEach(domainObject => {
            const domainRecordRemaining = Domains.findOne(domainObject.domainId)
            if (domainRecordRemaining?.tenant === tenantId) {
                tenantStillUsed = true
            }
        })
        OLog.debug(`vxapp.js deleteUserDomain for user ${Util.fetchFullName(userId)} deleting ` +
            `domain ${Util.fetchDomainName(domainIdDeleted)}`)
        if (!tenantStillUsed) {
            OLog.debug(`vxapp.js deleteUserDomain deleting domain ${Util.fetchDomainName(domainIdDeleted)} ` +
                `tenant ${Util.fetchTenantName(tenantId)} will no longer be required and will be removed`)
            modifier.$pull["profile.tenants"] = { tenantId }
        }
        if (user.profile.currentDomain === domainIdDeleted) {
            if (domains.length < 1) {
                OLog.error(`vxapp.js deleteUserDomain ${Util.fetchFullName(userId)} cannot remove last domain`)
                UX.notify({ success: false, icon: "TRIANGLE", key: "common.alert_cannot_remove_last_domain" })
                return
            }
            modifier.$set = {}
            modifier.$set["profile.currentDomain"] = domains[0].domainId
        }
        OLog.debug(`vxapp.js deleteUserDomain for user ${Util.fetchFullName(userId)} modifier=${OLog.debugString(modifier)}`)
        Meteor.users.update(user._id, modifier, error => {
            if (error) {
                OLog.error(`vxapp.js deleteUserDomain error returned from MongoDB update=${error}`)
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
                OLog.error(`vxapp.js error attempting to clone templateId=${templateId} error=${error}`)
                UX.notifyForDatabaseError(error)
                return
            }
            const publishAuthoringTemplate = {}
            publishAuthoringTemplate.criteria = { _id: templateId }
            Store.dispatch(setPublishAuthoringTemplate(publishAuthoringTemplate))
            UX.iosMajorPush(null, null, `/template/${templateId}`, "RIGHT", "crossfade")
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
            const publishAuthoringFunction = {}
            publishAuthoringFunction.criteria = { _id: functionId }
            Store.dispatch(setPublishAuthoringFunction(publishAuthoringFunction))
            UX.iosMajorPush(null, null, `/function/${functionId}`, "RIGHT", "crossfade")
        })
    },

    findReportList() {
        const publishCurrentReports = Store.getState().publishCurrentReports
        OLog.debug(`vxapp.js findReportList publishCurrentReports=${OLog.debugString(publishCurrentReports)}`)
        return Reports.find(publishCurrentReports.criteria, publishCurrentReports.options).fetch()
    },

    cloneReport(reportId) {
        const report = Reports.findOne(reportId)
        if (!report) {
            return
        }
        delete report._id
        delete report.dateCreated
        delete report.userCreated
        Reports.insert(report, (error, reportId) => {
            if (error) {
                OLog.error(`vxapp.js error attempting to clone reportId=${reportId} error=${error}`)
                UX.notifyForDatabaseError(error)
                return
            }
            const publishAuthoringReport = {}
            publishAuthoringReport.criteria = { _id: reportId }
            Store.dispatch(setPublishAuthoringReport(publishAuthoringReport))
            UX.iosMajorPush(null, null, `/report/${reportId}`, "RIGHT", "crossfade")
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
     * @param {string} excludeDomainId Domain ID to be excluded (if any).
     * @return {array} Array of domains (code and localized).
     */
    makeDomainArray(excludeDomainId) {
        const domains = VXApp.findDomainList()
        const codeArray = _.reject(domains, domain => domain._id === excludeDomainId).map(domain => {
            return { code: domain._id, localized: domain.name }
        })
        codeArray.sort((recordA, recordB) => {
            return Util.safeCompare(recordA.localized, recordB.localized)
        })
        return codeArray
    },

    /**
     * Make an array of functions for a drop-down list.  The code is the function ID
     * and the localization is the "friendly" function description.
     *
     * @param {string} functionType True to limit the list to a particular function type.
     * @return {array} Array of functions (code and localized).
     */
    makeFunctionArray(domainId, functionType) {
        domainId = domainId || Util.getCurrentDomainId(Meteor.userId())
        const criteria = {}
        criteria.dateRetired = { $exists: false }
        criteria.domain = domainId
        if (functionType)  {
            criteria.functionType = functionType
        }
        const codeArray = Functions.find(criteria).map(funktion => {
            const friendlyName = funktion.description || funktion.name
            return { code : funktion._id, localized : friendlyName }
        })
        codeArray.sort((recordA, recordB) => {
            return Util.safeCompare(recordA.localized, recordB.localized)
        })
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
     * @param {string} notificationScope Scope of notification (e.g., USER, DOMAIN).
     * @return {string} MongoDB ID of new event.
     */
    async createEvent(eventType, eventData, variables, notificationScope) {
        try {
            await UX.call("createEvent", eventType, eventData, variables, notificationScope)
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
     * @param {?} value New value or null to unset.
     */
    updateHandlerSimple(collection, record, rowsPath, value) {
        const mongoPath = Util.toMongoPath(rowsPath)
        const modifier = {}
        if (!Util.isNullish(value)) {
            modifier.$set = {}
            modifier.$set[mongoPath] = value
        }
        else {
            modifier.$unset = {}
            modifier.$unset[mongoPath] = null
        }
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
     * @param {string} rowsPath JSON path to array of rows to be updated.
     * @param {string} rowId Name of a property that uniquely identifies row.
     * @param {object} row Optional pre-populated row.
     * @param {string} GUID of added row.
     */
    addRow(collection, record,  rowsPath, rowId, row) {
        try {
            const mongoPath = Util.toMongoPath(rowsPath)
            let newRow = { }
            newRow[rowId] = Util.getGuid()
            newRow = { ...newRow, ...row }
            const modifier = {}
            modifier.$push = {}
            modifier.$push[mongoPath] = newRow
            OLog.debug(`vxapp.js addRow recordId=${record._id} rowsPath=${rowsPath} mongoPath=${mongoPath} ` +
                `modifier=${OLog.debugString(modifier)}`)
            collection.update(record._id, modifier)
            OLog.debug(`vxapp.js addRow recordId=${record._id} rowsPath=${rowsPath} mongoPath=${mongoPath} ` +
                `id=${newRow[rowId]} *success*`)
            return newRow[rowId]
        }
        catch (error) {
            UX.notifyForError(error)
        }
    },

    /**
     * Remove handler for VXRowPanel and VXRowList.
     *
     * @param {object} collection MongoDB collection to update.
     * @param {object} record Record to be updated.
     * @param {string} rowsPath JSON path to array of rows to be updated.
     * @param {string} rowId Name of a property that uniquely identifies row.
     * @param {array} selectedRowIds IDs of rows to be removed.
     */
    removeRow(collection, record, rowsPath, rowId, selectedRowIds) {
        try {
            const mongoPath = Util.toMongoPath(rowsPath)
            const modifier = {}
            modifier.$pull = {}
            modifier.$pull[mongoPath] = { [rowId]: { $in: selectedRowIds } }
            OLog.debug(`vxapp.js removeRow recordId=${record._id} rowsPath=${rowsPath} mongoPath=${mongoPath} ` +
                `selectedRowIds=${selectedRowIds} modifier=${OLog.debugString(modifier)}`)
            collection.update(record._id, modifier)
            OLog.debug(`vxapp.js removeRow recordId=${record._id} rowsPath=${rowsPath} mongoPath=${mongoPath} ` +
                `selectedRowIds=${selectedRowIds} *success*`)
        }
        catch (error) {
            UX.notifyForError(error)
        }
    },

    /**
     * Return the selected row IDs. If none are supplied, return the last row ID in the row array.
     *
     * @param {object} record Record to be updated.
     * @param {string} rowsPath JSON path to array of rows to be updated.
     * @param {string} rowId Name of a property that uniquely identifies row.
     * @param {array} selectedRowIds IDs of rows to be removed.
     * @return {array} Selected row IDs possibly defaulted.
     */
    selectedRowIds(record, rowsPath, rowId, selectedRowIds) {
        const rows = get(record, rowsPath)
        if (!(rows && rows.length > 0)) {
            return
        }
        if (selectedRowIds.length === 0) {
            selectedRowIds.push(rows[rows.length - 1][rowId])
        }
        return selectedRowIds
    },

    /**
     * Update handler for VXRowPanel and VXRowList.
     *
     * @param {object} collection MongoDB collection to update.
     * @param {object} record Record to be updated.
     * @param {string} rowsPath JSON path to array of rows to be updated.
     * @param {string} rowId Name of a property that uniquely identifies row.
     * @param {object} component Component whose state was changed resulting in this update.
     * @param {?} value New value.
     * @param {object} extra Optional name/value pairs.
     */
    updateRow(collection, record, rowsPath, rowId, component, value, extra) {
        try {
            const $item = $(`#${component.props.id}`).closest(".vx-list-item")
            const componentRowId = $item.attr("data-item-id")
            if (!componentRowId) {
                OLog.error(`vxapp.js updateRow recordId=${record._id} componentId=${component.props.id} ` +
                    `rowsPath=${rowsPath} componentRowId=${componentRowId}`)
                return
            }
            const rows = get(record, rowsPath)
            const mongoPath = Util.toMongoPath(rowsPath)
            const index = Util.indexOf(rows, rowId, componentRowId)
            if (index < 0) {
                return
            }
            const modifier = {}
            modifier.$set = {}
            modifier.$set[`${mongoPath}.${index}.${component.props.dbName}`] = value
            if (extra) {
                Object.keys(extra).forEach(key => {
                    const value = extra[key]
                    modifier.$set[`${mongoPath}.${index}.${key}`] = value
                })
            }
            OLog.debug(`vxapp.js updateRow recordId=${record._id} componentId=${component.props.id} ` +
                `rowsPath=${rowsPath} mongoPath=${mongoPath} modifier=${OLog.debugString(modifier)}`)
            collection.update(record._id, modifier)
            OLog.debug(`vxapp.js updateRow recordId=${record._id} *success*`)
        }
        catch (error) {
            UX.notifyForError(error)
        }
    },

    /**
     * Replace any number of properties in a specified row.
     *
     * @param {object} collection MongoDB collection to update.
     * @param {object} record Record to be updated.
     * @param {string} rowsPath JSON path to array of rows to be updated.
     * @param {string} rowId Name of a property that uniquely identifies row.
     * @param {string} id Unique ID of this row (typically GUID).
     * @param {object} row Row with new data (will be merged with existing data).
     */
    replaceRow(collection, record, rowsPath, rowId, id, row) {
        try {
            const rows = get(record, rowsPath)
            const selector = {}
            selector[rowId] = id
            const existingRow = _.findWhere(rows, selector)
            if (!existingRow) {
                OLog.error(`vxapp.js replaceRow replacement recordId=${record._id} rowsPath=${rowsPath} ` +
                `rowId=${rowId} id=${id} row could not be found no update will occur`)
                return
            }
            const replacementRow = { ...existingRow, ...row }
            const mongoPath = Util.toMongoPath(rowsPath)
            const index = Util.indexOf(rows, rowId, id)
            if (index < 0) {
                OLog.error(`vxapp.js replaceRow replacement recordId=${record._id} rowsPath=${rowsPath} ` +
                `rowId=${rowId} id=${id} unable to derive index of row no update will occur`)
                return
            }
            const modifier = {}
            modifier.$set = {}
            modifier.$set[`${mongoPath}.${index}`] = replacementRow
            OLog.debug(`vxapp.js replaceRow recordId=${record._id} rowsPath=${rowsPath} ` +
                `rowId=${rowId} id=${id} mongoPath=${mongoPath} modifier=${OLog.debugString(modifier)}`)
            collection.update(record._id, modifier)
            OLog.debug(`vxapp.js replaceRow recordId=${record._id} *success*`)
        }
        catch (error) {
            UX.notifyForError(error)
        }
    },

    /**
     * This function provides update service a special type of data structure, where the user
     * experience is a list of rows, either used or unused, but the internal database format is an array
     * of codes that map to used rows. This type of data structure saves space and is more
     * concise in cases where there are many potential rows, but only a tiny subset are used.
     *
     * @param {array} codeArray Array of objects bearing code and localization.
     * @param {object} collection Collection to be updated.
     * @param {object} record Record to be updated.
     * @param {string} rowsPath Path to array within record.
     * @param {string} rowId Name of the property that uniquely identifies the row.
     * @param {string} id unique row ID.
     * @param {object} component Component that has been updated.
     * @param {?} value Value that has been updated.
     */
    updateCodeArray(codeArray, collection, record, rowsPath, rowId, id, component, value) {
        try {
            const rebuiltArray = []
            codeArray.forEach(codeArrayObject => {
                let element = _.find(get(record, rowsPath), element => {
                    return element[rowId] === codeArrayObject.code
                })
                if (id === codeArrayObject.code) {
                    // If this component bears the usedIndicator property, it will be a checkbox control.
                    // When this control is cleared, we simply omit the element from the rebuilt array.
                    if (component.props.usedIndicator && !value) {
                        return
                    }
                    if (!element) {
                        element = {}
                        element[rowId] = codeArrayObject.code
                    }
                    set(element, component.props.dbName, value)
                }
                if (element) {
                    rebuiltArray.push(element)
                }
            })
            const mongoPath = Util.toMongoPath(rowsPath)
            const modifier = {}
            modifier.$set = {}
            modifier.$set[mongoPath] = rebuiltArray
            OLog.debug(`vxapp.js updateCodeArray recordId=${record._id} componentId=${component.props.id} ` +
                `rowsPath=${rowsPath} rowId=${rowId} id=${id} modifier=${OLog.debugString(modifier)}`)
            collection.update(record._id, modifier)
            OLog.debug(`vxapp.js updateCodeArray recordId=${record._id} *success*`)
        }
        catch (error) {
            UX.notifyForError(error)
        }
    },

    /**
     * This function handles the update of a single field associated with a tree node (VXTree). Such updates
     * are typically driven by the tree node modal.
     *
     * @param {object} collection Collection to be updated.
     * @param {object} record Record to be updated.
     * @param {string} fieldsDbName MongoDB name of fields array.
     * @param {string} metadataPath Path of metadata definition.
     * @param {object} component Component that has been updated.
     * @param {?} value Value that has been updated.
     */
    updateTreeNodeField(collection, record, fieldsDbName, metadataPath, component, value) {
        metadataPath = metadataPath || "ROOT"
        const fields = record[fieldsDbName] || []
        let fieldsObject = _.findWhere(fields, { metadataPath })
        if (!fieldsObject) {
            fieldsObject = {}
            fieldsObject.metadataPath = metadataPath
            fields.push(fieldsObject)
        }
        if (!(Util.isNullish(value) || value === false)) {
            fieldsObject[component.props.dbName] = value
        }
        else {
            delete fieldsObject[component.props.dbName]
        }
        if (Object.keys(fieldsObject).length === 1) {
            const index = Util.indexOf(fields, "metadataPath", metadataPath)
            fields.splice(index, 1)
        }
        VXApp.updateHandlerSimple(collection, record, fieldsDbName, fields)
    },

    /**
     * Reset all fields associated with a specified metadata path.
     *
     * @param {object} collection Collection to be updated.
     * @param {object} record Record to be updated.
     * @param {string} fieldsDbName MongoDB name of fields array.
     * @param {string} metadataPath Path of metadata definition.
     */
    updateTreeNodeFieldsReset(collection, record, fieldsDbName, metadataPath) {
        metadataPath = metadataPath || "ROOT"
        const fields = record[fieldsDbName] || []
        const index = Util.indexOf(fields, "metadataPath", metadataPath)
        fields.splice(index, 1)
        VXApp.updateHandlerSimple(collection, record, fieldsDbName, fields)
    },

    /**
     * Drop handler for multi-select drops.
     *
     * @param {object} collection Collection to be updated.
     * @param {object} record Record to be updated.
     * @param {string} rowsPath Path to array within record.
     * @param {string} rowId Name of the property that uniquely identifies the row.
     * @param {object} dropInfo Drop information object.
     * @param {func} newItemHandler Function to transform a single new row from dropped item.
     */
    handleDropMulti(collection, record, rowsPath, rowId, dropInfo, newItemHandler) {
        const parameters = {}
        parameters.dropInfo = dropInfo
        parameters.rowId = rowId
        parameters.newItemHandler = newItemHandler
        parameters.sourceCollection = collection
        parameters.sourceRecord = record
        parameters.sourceRowsPath = rowsPath
        parameters.targetCollection = collection
        parameters.targetRecord = record
        parameters.targetRowsPath = rowsPath
        VXApp.handleDropMultiPrime(parameters)
    },

    /**
     * Generalized drop handler for cross-list drag/drop.
     *
     * @param {object} parameteters Parameters object with source and target information.
     */
    handleDropMultiPrime(parameters) {
        try {
            const dropInfo = parameters.dropInfo
            const singleUpdate =
                parameters.sourceCollection === parameters.targetCollection &&
                parameters.sourceRecord._id === parameters.targetRecord._id
            const singleList = singleUpdate &&
                parameters.sourceRowsPath === parameters.targetRowsPath
            const samePanel = !dropInfo.senderId
            const sourceRows = get(parameters.sourceRecord, parameters.sourceRowsPath, [])
            const targetRows = get(parameters.targetRecord, parameters.targetRowsPath, [])
            if (dropInfo.clone) {
                const spliceIndex = VXApp.computeSpliceIndex(targetRows, parameters.rowId, dropInfo)
                dropInfo.items.forEach((item, index) => {
                    const newRow = parameters.newItemHandler(item, index, parameters)
                    if (!newRow) {
                        return
                    }
                    const newIndex = spliceIndex + index
                    OLog.debug("vxapp.js handleDropMultiPrime *splicing* single row " +
                        `newIndex=${newIndex} newRow=${OLog.debugString(newRow)}`)
                    targetRows.splice(newIndex, 0, newRow)
                })
            }
            else {
                const insertArray = dropInfo.items.map(item => {
                    return _.findWhere(sourceRows, { [parameters.rowId]: item["data-item-id"] })
                })
                const insertedIds = _.pluck(dropInfo.items, "data-item-id")
                if (samePanel) {
                    VXApp.purgeDroppedRows(targetRows, parameters.rowId, insertedIds)
                }
                else {
                    VXApp.purgeDroppedRows(sourceRows, parameters.rowId, insertedIds)
                }
                const spliceIndex = VXApp.computeSpliceIndex(targetRows, parameters.rowId, dropInfo)
                OLog.debug(`vxapp.js handleDropMultiPrime *splicing* singleList=${singleList} samePanel=${samePanel} ` +
                    `${insertArray.length} rows into ${targetRows.length} rows at spliceIndex=${spliceIndex} between ` +
                    `${parameters.rowId}=${dropInfo.prevTargetItemId} and ` +
                    `${parameters.rowId}=${dropInfo.nextTargetItemId}`)
                targetRows.splice(spliceIndex, 0, ...insertArray)
            }
            if (singleUpdate) {
                const modifier = {}
                modifier.$set = {}
                if (!singleList) {
                    const sourceMongoPath = Util.toMongoPath(parameters.sourceRowsPath)
                    modifier.$set[sourceMongoPath] = sourceRows
                }
                const targetMongoPath = Util.toMongoPath(parameters.targetRowsPath)
                modifier.$set[targetMongoPath] = targetRows
                OLog.debug(`vxapp.js handleDropMultiPrime recordId=${parameters.targetRecord._id} ` +
                    `rowsPath=${parameters.targetRowsPath} rowId=${parameters.rowId} ` +
                    `modifier=${OLog.debugString(modifier)}`)
                parameters.targetCollection.update(parameters.targetRecord._id, modifier)
            }
            else {
                throw new Error("vxapp.js handleDropMultiPrime only single update is currently supported")
            }
        }
        catch (error) {
            UX.notifyForError(error)
        }
    },

    /**
     * Given a drop information instance, compute and return the splice index.
     *
     * @param {array} targetRows Target rows.
     * @param {string} rowId Row ID.
     * @param {object} dropInfo Drop information object.
     * @return {number} Splice index.
     */
    computeSpliceIndex(targetRows, rowId, dropInfo) {
        if (dropInfo.nextTargetItemId) {
            const elementIndex = Util.indexOf(targetRows, rowId, dropInfo.nextTargetItemId)
            const spliceIndex = elementIndex
            OLog.debug(`vxapp.js computeSpliceIndex nextTargetItemId=${dropInfo.nextTargetItemId} elementIndex=${elementIndex} spliceIndex=${spliceIndex}`)
            return spliceIndex
        }
        if (dropInfo.prevTargetItemId) {
            const elementIndex = Util.indexOf(targetRows, rowId, dropInfo.prevTargetItemId)
            const spliceIndex = elementIndex + 1
            OLog.debug(`vxapp.js computeSpliceIndex prevTargetItemId=${dropInfo.prevTargetItemId} elementIndex=${elementIndex} spliceIndex=${spliceIndex}`)
            return spliceIndex
        }
        OLog.debug("vxapp.js computeSpliceIndex dropInfo does not contain prevTargetItemId nor nextTargetItemId likely empty target cell")
        return 0
    },

    /**
     * Mutate an array to purge rows which are about to be dropped.
     *
     * @param {array} rows Array of rows to be purged.
     * @param {string} rowId Row ID.
     * @param {array} insertedIds Array of IDs to be purged.
     */
    purgeDroppedRows(rows, rowId, purgeIds) {
        for (let purgeIndex = rows.length - 1; purgeIndex >= 0; purgeIndex--) {
            const row = rows[purgeIndex]
            if (purgeIds.includes(row[rowId])) {
                rows.splice(purgeIndex, 1)
            }
        }
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
     * Add a database-resident function to global object.
     *
     * @param {object} newFunction New function.
     */
    addFunction(newFunction) {
        try {
            const functionAnchor = VXApp.functionAnchor()
            if (!functionAnchor) {
                return
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
     * Update a global object function.
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
    },

    /**
     * Client-side support for uploading a file.
     *
     * @param {string} uploadType Upload type.
     * @param {object} currentUpload Current upload reactive variable.
     * @param {object} file HTML file instance.
     * @param {object} uploadParameters Optional upload parameters object.
     */
    uploadFile(uploadType, currentUpload, file, uploadParameters) {
        try {
            OLog.debug("vxapp.js uploadFile *fire*")
            if (!file) {
                OLog.error("vxapp.js uploadFile *error* no file input was supplied")
                return
            }
            Meteor.call("initUploadStats", uploadType, file.name, file.type, file.size, (error, result) => {
                if (!result.success) {
                    UX.createNotificationForResult(result)
                    VXApp.setUploadStatus(uploadType, "CLEARED")
                    return
                }
                Meteor.call("createImportEvent", "LIST_IMPORT_START", uploadType, (error, result) => {
                    if (!result.success) {
                        UX.createNotificationForResult(result)
                        VXApp.setUploadStatus(uploadType, "CLEARED")
                        return
                    }
                    VXApp.uploadTransmit(uploadType, currentUpload, uploadParameters, file)
                })
            })
        }
        catch (error) {
            OLog.error(`vxapp.js uploadFile unexpected error=${error}`)
            UX.createNotificationForResult({ success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() } })
            VXApp.setUploadStatus(uploadType, "CLEARED")
        }
    },

    /**
     * Upload file: transmit data.
     *
     * @param {string} type Upload type.
     * @param {object} currentUpload Current upload reactive variable.
     * @param {object} uploadParameters Optional upload parameters object.
     * @param {object} file HTML file instance.
     */
    uploadTransmit(uploadType, currentUpload, uploadParameters, file) {
        try {
            // This is rocket science - see below
            let trackerComputation
            const uploadStats = VXApp.findUploadStats(uploadType)
            if (!uploadStats) {
                OLog.error(`vxapp.js uploadTransmit uploadType=${uploadType} unable to find Upload Stats`)
                VXApp.setUploadStatus(uploadType, "FAILED")
                return
            }
            // We upload only one file, in case multiple files were selected:
            const upload = Uploads.insert({ file : file, transport: "ddp", chunkSize: "dynamic" }, false)
            upload.on("start", function() {
                Store.dispatch(setListImportLastPercent(0))
                currentUpload.set(this)
            })
            upload.on("end", function(error, fileObject) {
                if (trackerComputation) {
                    OLog.debug(`vxapp.js uploadTransmit uploadType=${uploadType} stopping computation`)
                    trackerComputation.stop()
                }
                if (error) {
                    OLog.error(`vxapp.js uploadTransmit domainId=${uploadStats.domain} ` +
                        `uploadType=${uploadStats.uploadType} error=${error}`)
                    UX.createNotificationForResult({ success: false, icon: "UPLOAD", key: "common.alert_upload_error",
                        variables: { errorMessage: error.toString() } })
                    currentUpload.set(false)
                    VXApp.setUploadStatus(uploadType, "FAILED")
                    return
                }
                if (VXApp.isUploadStatus(uploadType, "STOPPED")) {
                    OLog.debug(`vxapp.js uploadTransmit domainId=${uploadStats.domain} ` +
                        `uploadType=${uploadStats.uploadType} *end* processing aborted because transmission has been stopped`)
                    return
                }
                OLog.debug(`vxapp.js uploadTransmit domainId=${uploadStats.domain} ` +
                    `uploadType=${uploadStats.uploadType} uploadParameters=${OLog.debugString(uploadParameters)} ` +
                    `path=${fileObject.path} successfully uploaded totalSize=${fileObject.size}`)
                const modifier = {}
                modifier.$set = {}
                modifier.$set.filePath = fileObject.path
                modifier.$set.status = "WAITING"
                modifier.$set.uploadParameters = uploadParameters
                UploadStats.update(uploadStats._id, modifier)
            })
            upload.start()
            // Don't use FileUpload percentage directly, instead mirror progress directly into UploadStats record.
            // When UploadStats is the central authority, all browser clients see the upload progress bar, and all
            // authorized users have the option to stop the upload. Conversely, FileUpload is local to this client.
            Tracker.autorun(function(computation) {
                // This is rocket science, but we're anchoring trackerComputation in a closure.
                // When the upload finishes, we'll stop this autorun.
                trackerComputation = computation
                const fileUpload = currentUpload.get()
                if (!fileUpload) {
                    OLog.error("vxapp.js uploadTransmit autorun FileUpload is not present")
                    return
                }
                const oldPercent = Store.getState().listImportLastPercent || 0
                const newPercent = fileUpload.progress ? fileUpload.progress.get() : 0
                if (newPercent > oldPercent) {
                    OLog.debug(`vxapp.js uploadTransmit oldPercent=${oldPercent} newPercent=${newPercent}`)
                    Store.dispatch(setListImportLastPercent(newPercent))
                    if (VXApp.isUploadStatus(uploadType, "TRANSMITTING")) {
                        UploadStats.update(uploadStats._id, { $set: { processed: newPercent } })
                    }
                }
            })
        }
        catch (error) {
            OLog.error(`vxapp.js uploadTransmit unexpected error=${error}`)
            UX.createNotificationForResult({ success: false, icon: "BUG", key: "common.alert_unexpected_error",
                variables: { error: error.toString() } })
            VXApp.setUploadStatus(uploadType, "FAILED")
        }
    },

    /**
     * Upload file: stop import.
     *
     * @param {string} type Upload type.
     * @param {object} currentUpload Current upload reactive variable.
     * @param {function) callback Callback function.
     */
    uploadStop(uploadType, currentUpload, callback) {
        try {
            const uploadStats = VXApp.findUploadStats(uploadType)
            if (!uploadStats) {
                callback()
                return
            }
            const fileUpload = currentUpload.get()
            Meteor.setTimeout(function() {
                // If status is TRANSMITTING we must call abort on the fileUpload object to stop the
                // file transfer:
                if (uploadStats.status === "TRANSMITTING") {
                    if (fileUpload) {
                        fileUpload.abort()
                    }
                    Meteor.call("createImportEvent", "LIST_IMPORT_STOP", uploadType, (error, result) => {
                        if (!result.success) {
                            UX.createNotificationForResult(result)
                        }
                        VXApp.setUploadStatus(uploadType, "STOPPED")
                        callback()
                        return
                    })
                    return
                }
                // Otherwise (e.g., status is INSERTING) we have to formally request that the process be stopped:
                Meteor.call("uploadRequestStop", uploadType, (error, result) => {
                    if (!result.success) {
                        UX.createNotificationForResult(result)
                    }
                    callback()
                    return
                })

            }, 1000)
        }
        catch (error) {
            OLog.error(`vxapp.js uploadStop unexpected error=${error}`)
            UX.createNotificationForResult({ success : false, icon : "BUG", key : "common.alert_unexpected_error",
                variables : { error: error.toString() } })
            callback()
            return
        }
    },

    /**
     * Client support for getting upload errors localized as string.
     *
     * @param {string} uploadType Upload type.
     * @return {string} Upload errors list (localized).
     */
    uploadErrors(uploadType) {
        const uploadStats = VXApp.findUploadStats(uploadType)
        if (!(uploadStats && uploadStats.messages && uploadStats.messages.length > 0)) {
            return
        }
        uploadStats.messages.sort(function(messageA, messageB) {
            if (messageA.index > messageB.index) return +1
            if (messageA.index < messageB.index) return -1
            return 0
        })
        const messagesLocalized = _.map(uploadStats.messages, message => {
            return Util.i18n("common.message_import_validation", {
                fieldIdentifier: Util.i18n(message.fieldIdKey, message.fieldIdVariables),
                value : message.value,
                text: Util.i18n(message.result.key, message.result.variables)
            })
        })
        return messagesLocalized.join("<br>")
    },

    /**
     * Client support for importing templates.
     *
     * @param {object} event Event object.
     */
    handleClickImportTemplates(event) {
        OLog.debug(`vxapp.js handleClickImportTemplates user=${Util.getUserEmail()}`)
        event.preventDefault()
        Meteor.setTimeout(() => {
            UX.showModal(<UploadModalContainer id="template-upload-modal"
                uploadType="TEMPLATE"
                heading={Util.i18n("common.label_import_templates")}/>)
        }, 300)
        UX.toggleNav()
    },

    /**
     * Handler for context menus (react-contexify). Extract and supply helpful data.
     *
     * @param {object} event Event object.
     * @return {object} Context menu information.
     */
    makeContextCellData(event) {
        const $cell = $(event.target).closest(".context-menu-cell")
        const $list = $(event.target).closest(".vx-list", $cell[0])
        const $item = $(event.target).closest(".vx-list-item", $cell[0])
        const data = {}
        data.cellId = $cell.attr("id")
        data.listId = $list.attr("id")
        data.itemId = $item.attr("id")
        data.index = $item.index()
        data.selectedRowIds = UX.selectedRowIds(data.listId)
        data.selectedDbIds = UX.selectedDbIds(data.listId)
        data["data-item-id"] =  $item.attr("data-item-id")
        data["data-db-id"] =  $item.attr("data-db-id")
        return data
    },

    /**
     * Dynamically subscribe using a publish request and optional criteria to filter
     * the subscription.
     *
     * @param {object} publishRequest Publishing request to use as a base.
     * @param {string} subscription Name of the subscription.
     * @param {object} criteria Optional criteria to merge with publishing request.
     * @param {object} opotions Optional options to merge with publishing request.
     * @return {object} handle Handle from subscription.
     */
    subscribe(publishRequest, subscription, criteria, options) {
        const publishRequestModified = {}
        publishRequestModified.criteria = { ...publishRequest.criteria, ...criteria }
        publishRequestModified.options = { ...publishRequest.options, ...options }
        return Meteor.subscribe(subscription, publishRequestModified)
    },

    /**
     * Construct and return a report tree model based on a supplied report record.
     *
     * @param {object} report Report record.
     * @return {array} Array of nodes.
     */
    makeReportTreeModel(report) {
        if (!report.entityType) {
            return
        }
        const metadataPathStack = []
        const treeRoot = {}
        treeRoot.label = VXApp.makeReportTreeModelLabelRoot(report)
        treeRoot.value = null
        treeRoot.children = VXApp.makeReportTreeModelRecursive(report, treeRoot,
            Meta[report.entityType], metadataPathStack)
        return [ treeRoot ]
    },

    /**
     * Construct and return label for the metadata ROOT node.
     *
     * @param {object} report Report record.
     * @return {string} Metadata root label.
     */
    makeReportTreeModelLabelRoot(report) {
        let label = Util.localizeCode("entityType", report.entityType)
        const fieldsObject = _.findWhere(report.fields, { metadataPath: "ROOT" })
        if (!fieldsObject) {
            return label
        }
        const fieldsArray = []
        if (fieldsObject.padding) {
            fieldsArray.push(Util.localizeCode("reportCellPadding", fieldsObject.padding))
        }
        if (fieldsObject.limit === 0) {
            fieldsArray.push(Util.i18n("common.label_all"))
        }
        if (fieldsObject.limit > 0) {
            fieldsArray.push(fieldsObject.limit)
        }
        if (fieldsArray.length > 0) {
            label += ` \u25CF\u25CF\u25CF ${fieldsArray.join(" ")}  \u25CF\u25CF\u25CF`
        }
        return label
    },

    /**
     * Given a report tree node (parent) and a metadata object, construct and return
     * an array of child tree nodes.
     *
     * @param {object} report Report record.
     * @param {object} treeNode Report tree node (parent).
     * @param {object} metadataNode Metadata node.
     * @param {object} metadataPathStack Metadata path stack.
     * @return {array} Child tree nodes (processed recursively).
     */
    makeReportTreeModelRecursive(report, treeNode, metadataNode, metadataPathStack) {
        const treeNodes = []
        Object.keys(metadataNode).forEach(key => {
            const metadataChild = metadataNode[key]
            if (metadataChild.guid) {
                return
            }
            if (metadataChild.usedIndicator) {
                return
            }
            metadataPathStack.push(key)
            const metadataPath = metadataPathStack.join(".")
            const treeChild = {}
            treeChild.label = VXApp.makeReportTreeModelLabel(metadataPath, metadataChild, report)
            treeChild.value = treeNode.value ? `${treeNode.value}.${key}` : key
            if (metadataChild.definition) {
                treeChild.children = VXApp.makeReportTreeModelRecursive(report, treeChild, metadataChild.definition, metadataPathStack)
            }
            treeNodes.push(treeChild)
            metadataPathStack.pop()
        })
        return treeNodes
    },

    makeReportTreeModelLabel(metadataPath, metadataChild, report) {
        let label = Util.i18nLocalize(metadataChild.localized)
        const fieldsObject = _.findWhere(report.fields, { metadataPath })
        if (!fieldsObject) {
            return label
        }
        const fieldsArray = []
        if (fieldsObject.sort) {
            fieldsArray.push(`[${fieldsObject.sort}]`)
        }
        if (fieldsObject.alignment) {
            fieldsArray.push(Util.localizeCode("reportColumnAlignment", fieldsObject.alignment))
        }
        if (fieldsObject.width) {
            fieldsArray.push(Util.localizeCode("reportColumnWidth", fieldsObject.width))
        }
        if (fieldsObject.overflow) {
            fieldsArray.push(Util.localizeCode("reportOverflowRule", fieldsObject.overflow))
        }
        if (fieldsObject.negation) {
            fieldsArray.push(Util.localizeCode("negationOperator", fieldsObject.negation))
        }
        if (fieldsObject?.operator) {
            fieldsArray.push(Util.localizeCode("logicalOperator", fieldsObject.operator))
        }
        if (fieldsObject?.filter) {
            fieldsArray.push(VXApp.transformText(metadataChild, report.domain, fieldsObject.filter))
        }
        if (fieldsArray.length > 0) {
            label += ` \u25CF\u25CF\u25CF ${fieldsArray.join(" ")}  \u25CF\u25CF\u25CF`
        }
        return label
    },


    /**
     * Conditionally fetch report data to Redux.
     *
     * @param {object} report Report record.
     */
    async conditionallyFetchReportData(report) {
        try {
            if (!(report && report.entityType)) {
                return
            }
            const currentReportRecord = Store.getState().currentReportRecord
            const equalReport = currentReportRecord &&
                Util.isDeepEqual(currentReportRecord.checked, report.checked) &&
                Util.isDeepEqual(currentReportRecord.fields,  report.fields)
            if (equalReport) {
                OLog.debug(`vxapp.js conditionallyFetchReportData report name=${report.name} is unchanged fetch bypassed`)
                return
            }
            const reportGuid = Util.getGuid()
            OLog.debug(`vxapp.js conditionallyFetchReportData report name=${report.name} *fetch* report=${reportGuid}`)
            Store.dispatch(setCurrentReportRecord(report))
            Store.dispatch(setReportGuid(reportGuid))
            const server = Util.getCodeProperty("entityType", report.entityType, "server")
            if (!server) {
                Store.dispatch(setReportLoading(true))
                const reportData = VXApp.makeReportData(report)
                if (Store.getState().reportGuid === reportGuid) {
                    Store.dispatch(setReportLoading(false))
                    Store.dispatch(setReportData(reportData))
                }
                else {
                    OLog.warn(`vxapp.js conditionallyFetchReportData report name=${report.name} *client* GUID mismatch *ignore*`)
                }
                return
            }
            Store.dispatch(setReportLoading(true))
            const result = await UX.call("fetchReportData", report._id)
            if (Store.getState().reportGuid === reportGuid) {
                Store.dispatch(setReportLoading(false))
                Store.dispatch(setReportData(result.reportData))
            }
            else {
                OLog.warn(`vxapp.js conditionallyFetchReportData report name=${report.name} *server* GUID mismatch *ignore*`)
            }
        }
        catch (error) {
            UX.notifyForError(error)
            Store.dispatch(setReportLoading(false))
        }
    },

    /**
     * Handle the update of a report row in the user profile.
     *
     * @param {object} collection MongoDB collection to update.
     * @param {?} value The value being updated.
     * @param {object} collection MongoDB collection to update.
     * @param {object} record Record to be updated.
     * @param {string} rowsPath JSON path to array of rows to be updated.
     * @param {string} rowId Name of a property that uniquely identifies row.
     */
    handleUpdateReportRow(component, value, collection, record, rowsPath, rowId) {
        const extra = {}
        extra.nextDate = null
        VXApp.updateRow(collection, record, rowsPath, rowId, component, value, extra)
    },

    handlePrintReport(callback, report) {
        callback()
        UX.iosMajorPush(null, null, `/reportpreview/${report._id}`,
            "RIGHT", "crossfade")
    },

    handleSendReport(callback, report) {
        callback()
        UX.showModal(<ReportSendModal title={report.name}
            report={report}/>)
    },

    async handleDownloadReport(callback, report) {
        try {
            const result = await UX.call("fetchReportSpreadsheet", report._id)
            if (!result.success) {
                callback()
                UX.notify(result)
            }
            const blob = new Blob([result.array.buffer])
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${report.name}.xlsx`
            const clickHandler = () => {
                callback()
                setTimeout(() => {
                    URL.revokeObjectURL(url)
                    a.removeEventListener("click", clickHandler)
                }, 150)
            }
            a.addEventListener("click", clickHandler, false)
            a.click()
        }
        catch (error) {
            UX.notifyForError(error)
        }
    }
}}
