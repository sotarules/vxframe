"use strict";

import { setCurrentDomainId } from "/imports/vx/client/code/actions"
import { setCurrentLocale } from "/imports/vx/client/code/actions"
import { setCurrentUserId } from "/imports/vx/client/code/actions"
import { setCurrentPublishingMode } from "/imports/vx/client/code/actions"
import { setPublishingModeClient } from "/imports/vx/client/code/actions"
import { setPublishingModeServer } from "/imports/vx/client/code/actions"
import { setSubscriptionParameters } from "/imports/vx/client/code/actions"
import { setPublishCurrentTenants } from "/imports/vx/client/code/actions"
import { setPublishCurrentDomains } from "/imports/vx/client/code/actions"
import { setPublishCurrentUsers } from "/imports/vx/client/code/actions"
import { setPublishCurrentTenant } from "/imports/vx/client/code/actions"
import { setPublishCurrentDomain } from "/imports/vx/client/code/actions"
import { setPublishAuthoringUser } from "/imports/vx/client/code/actions"
import { setPublishAuthoringDomain } from "/imports/vx/client/code/actions"
import { setPublishAuthoringTemplate } from "/imports/vx/client/code/actions"
import { setLoading } from "/imports/vx/client/code/actions"

VXApp = _.extend(VXApp || {}, {

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
        UX.showLoading()
        OLog.debug("vxapp.js afterLogin *fire*")
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
        const systemAdminRoutes = ["/users-domains", "/domains-users", "/user/", "/domain/", "/tenant/"]
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
        OLog.debug("vxapp.js doGlobalSubscriptions *init*")
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

        let oldSubscriptionParameters = Store.getState().subscriptionParameters
        let oldPublishingModeClient = Store.getState().publishingModeClient
        let oldPublishingModeServer = Store.getState().publishingModeServer
        let newPublishingModeClient = VXApp.getPublishingMode("client", newSubscriptionParameters)
        let newPublishingModeServer = VXApp.getPublishingMode("server", newSubscriptionParameters)

        let oldSubscriptionParametersString = JSON.stringify(oldSubscriptionParameters)
        let newSubscriptionParametersString = JSON.stringify(newSubscriptionParameters)

        if (VXSubs._cacheList.length > 0 &&
            newSubscriptionParametersString === oldSubscriptionParametersString &&
            newPublishingModeClient === oldPublishingModeClient &&
            newPublishingModeServer === oldPublishingModeServer) {
            OLog.debug(`vxapp.js globalSubscriptions ${newSubscriptionParameters.email} old and new subscription parameters *match* invoking callback`)
            callback(null, { success: true })
            return
        }

        if (newSubscriptionParametersString !== oldSubscriptionParametersString) {
            OLog.debug(`vxapp.js globalSubscriptions ${newSubscriptionParameters.email} subscription parameters *changed*`)
            Store.dispatch(setSubscriptionParameters(newSubscriptionParameters))
        }

        let publishCurrentTenants, publishCurrentDomains, publishCurrentUsers
        if (VXSubs._cacheList.length === 0 ||
            newSubscriptionParametersString !== oldSubscriptionParametersString ||
            oldPublishingModeClient !== newPublishingModeClient) {
            OLog.debug(`vxapp.js globalSubscriptions ${newSubscriptionParameters.email} client subscription mode has *changed* to ${newPublishingModeClient}`)
            Store.dispatch(setPublishingModeClient(newPublishingModeClient))
            publishCurrentTenants = VXApp.makePublishingRequest("current_tenants", newSubscriptionParameters, {}, { sort: { name: 1, dateCreated: 1 } })
            Store.dispatch(setPublishCurrentTenants(publishCurrentTenants.client))
            publishCurrentDomains = VXApp.makePublishingRequest("current_domains", newSubscriptionParameters, {}, { sort: { name: 1, dateCreated: 1 } })
            Store.dispatch(setPublishCurrentDomains(publishCurrentDomains.client))
            publishCurrentUsers = VXApp.makePublishingRequest("current_users", newSubscriptionParameters, {}, { sort: { "profile.lastName": 1, "profile.firstName": 1, createdAt: 1 } })
            Store.dispatch(setPublishCurrentUsers(publishCurrentUsers.client))
        }

        if (VXSubs._cacheList.length === 0 ||
            newSubscriptionParametersString !== oldSubscriptionParametersString ||
            oldPublishingModeServer !== newPublishingModeServer) {

            OLog.debug(`vxapp.js globalSubscriptions ${newSubscriptionParameters.email} server subscription mode has *changed* to ${newPublishingModeServer}`)

            Store.dispatch(setLoading(true))
            Store.dispatch(setPublishingModeServer(newPublishingModeServer))

            let handles = []
            handles.push(VXSubs.subscribe("config"))
            handles.push(VXSubs.subscribe("clipboard"))
            handles.push(VXSubs.subscribe("current_tenants", publishCurrentTenants.server))
            handles.push(VXSubs.subscribe("current_domains", publishCurrentDomains.server))
            handles.push(VXSubs.subscribe("current_users", publishCurrentUsers.server))

            if (VXApp.getAppGlobalSubscriptions) {
                OLog.debug("vxapp.js getAppGlobalSubscriptions detected, application-level subscriptions will be honored")
                handles = handles.concat(VXApp.getAppGlobalSubscriptions(newSubscriptionParameters))
            }

            UX.waitSubscriptions(handles, (error, result) => {
                Store.dispatch(setLoading(false))
                callback(error, result)
            })
            return
        }

        OLog.debug(`vxapp.js globalSubscriptions ${newSubscriptionParameters.email} server subscription remains the same`)
        callback(null, { success: true })
        return
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
                UX.clearLoading()
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
                Store.dispatch(setCurrentUserId(currentUserId))
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
        // Template function (override in VXApps)
    },

    /**
     * Return a dual-mode object with search criteria.  The client criteria is used to
     * populate session variables to control Mini-MongoDB finds.  The server criteria is used to
     * control subscriptions on the server.
     *
     * @param {string} subscriptionName Subscription name (e.g., "current_cards").
     * @param {object} subscriptionParameters Subscription parameters object.
     * @param {object} criteria MongoDB criteria.
     * @param {object} options MongoDB options.
     * @return {object} Dual-mode publish request object.
     */
    makePublishingRequest(subscriptionName, subscriptionParameters, criteria, options) {
        let publishRequest = {}
        _.each(["client", "server"], (side) => {
            let mode = VXApp.getPublishingMode(side, subscriptionParameters)
            publishRequest[side] = {}
            publishRequest[side].criteria = $.extend(true, {}, criteria)
            publishRequest[side].options = options
            publishRequest[side].extra = {}
            publishRequest[side].extra.subscriptionName = subscriptionName
            publishRequest[side].extra.mode = mode
            VXApp.adjustPublishingRequest(publishRequest[side], subscriptionParameters.userId, subscriptionParameters)
        })
        OLog.debug("vxapp.js makePublishingRequest " + subscriptionName + " " + OLog.debugString(publishRequest))
        return publishRequest
    },

    /**
     * Infer the current publishing mode based on the route.
     *
     * DEFEAT - no adjustment to tenants and domains.
     * TEXAS - user sees all tenants.
     * TEAM - user sees all domains in a single tenant.
     * DOMAIN - user sees a single domain.
     *
     * @param {string} side Side client or server.
     * @param {object} subscriptionParameters Subscription parameters object.
     * @return {string} Publishing mode.
     */
    getPublishingMode(side, subscriptionParameters) {
        //console.log("vxapp.js getPublishingMode side=" + side + " subscriptionParameters=" + OLog.debugString(subscriptionParameters))
        if (Util.isRoutePath("/log") || Util.isRoutePath("/events")) {
            return subscriptionParameters.superAdmin && subscriptionParameters.preferenceLogsDefeatTenantFilters ? "DEFEAT" : "TEXAS"
        }
        if (UX.iosIsRoutePathOnStack("/users-domains") || UX.iosIsRoutePathOnStack("/domains-users") || Util.isRoutePath("/user/") || Util.isRoutePath("/domain/")) {
            return subscriptionParameters.superAdmin && subscriptionParameters.preferenceAllMembersAndDomains ? "DEFEAT" : "TEAM"
        }
        if (UX.iosIsRoutePathOnStack("/tenants") || Util.isRoutePath("/tenant/") || Util.isRoutePath("/domains")) {
            return subscriptionParameters.superAdmin ? "DEFEAT" : "TEAM"
        }
        if (Util.isRoutePath("/tenants") || Util.isRoutePath("/tenant/") || Util.isRoutePath("/domains")) {
            return "TEXAS"
        }
        return "DOMAIN"
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
        VXSubs.clear()
        if (callback) {
            Meteor.setTimeout(() => {
                callback()
            })
        }
        OLog.debug("vxapp.js logout function was successful, redirecting to signin page and deferring logout")
        UX.go("/")
        Meteor.setTimeout(() => {
            OLog.debug("vxapp.js logout purging redux persist store")
            Persistor.purge().then(() => { return Persistor.flush() }).then(() => { Persistor.pause() })
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
     * Clear user session settings.
     */
    clearSessionSettings() {
        OLog.debug("vxapp.js clearSessionSettings")
        Store.dispatch(setPublishAuthoringDomain(null))
        Store.dispatch(setPublishAuthoringUser(null))
        Store.dispatch(setPublishAuthoringTemplate(null))
        if (VXApp.clearAppSessionSettings) {
            VXApp.clearAppSessionSettings()
        }
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
                OLog.debug("vxapp.js updateUserDomain " + Util.fetchFullName(user._id) + " already has domain " + Util.fetchDomainName(domainId) + " duplicates suppressed")
                return
            }
        }
        // If we have an old index we're moving dragging the domain from one place to another:
        if (Util.isWholeNumber(oldIndex)) {
            OLog.debug("vxapp.js updateUserDomain " + Util.fetchFullName(user._id) + " domain " + Util.fetchDomainName(domainId) + " dragged from " + oldIndex + " to " + newIndex)
            dropTarget.sortable("cancel")
            // Currently MongoDB cannot do a $pull and $push operation in a single transaction.  There is
            // an open issue about this but for now we have to do this in two steps.
            let modifier = {}
            modifier.$pull = {}
            modifier.$pull["profile.domains"] = domains[oldIndex]
            Meteor.users.update(user._id, modifier, error => {
                if (error) {
                    OLog.error("vxapp.js updateUserDomain error returned from MongoDB update=" + error)
                    UX.notifyForDatabaseError(error)
                    return
                }
            })
            modifier = {}
            modifier.$push = {}
            modifier.$push["profile.domains"] = { $each: [ domains[oldIndex] ], $position: newIndex }
            Meteor.users.update(user._id, modifier, error => {
                if (error) {
                    OLog.error("vxapp.js updateUserDomain error returned from MongoDB update=" + error)
                    UX.notifyForDatabaseError(error)
                    return
                }
            })
        }
        else {
            OLog.debug("vxapp.js updateUserDomain " + Util.fetchFullName(user._id)  + " domain " + Util.fetchDomainName(domainId) + " dragged from LHS list to index " + newIndex)
            let modifier = {}
            modifier.$push = {}
            modifier.$push["profile.domains"] = { $each: [ { domainId : domainId, roles : [ ] } ], $position: newIndex }
            let tenantId = Util.getTenantId(domainId)
            if (!tenantId) {
                OLog.error("vxapp.js updateUserDomain cannot find tenant of domainId=" + domainId)
                return
            }
            if (!_.findWhere(tenants, { tenantId: tenantId })) {
                OLog.debug("vxapp.js updateUserDomain " + Util.fetchFullName(user._id) + " will get tenant " + Util.fetchTenantName(tenantId))
                modifier.$push["profile.tenants"] = { tenantId: tenantId, roles : [ ]  }
            }
            OLog.debug("vxapp.js updateUserDomain " + Util.fetchFullName(user._id) + " modifier=" + OLog.debugString(modifier))
            Meteor.users.update(user._id, modifier, error => {
                if (error) {
                    OLog.error("vxapp.js updateUserDomain error returned from MongoDB update=" + error)
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
            modifier.$pull["profile.tenants"] = {
                tenantId: tenantIdDeleted
            }
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
        if (userId) {
            let tenantIds = Util.getTenantIds(userId)
            publishCurrentTenants.criteria._id = { $in: tenantIds }
        }
        OLog.debug("vxapp.js findTenantList adjusted publishCurrentTenants=" + OLog.debugString(publishCurrentTenants))
        return _.filter(Tenants.find(publishCurrentTenants.criteria, publishCurrentTenants.options).fetch(), tenant => {
            return Util.isTenantActive(tenant._id)
        })
    },

    isEditVisible() {
        if (Util.isRoutePath("/templates") ) {
            return Util.isUserAdmin()
        }
        if (Util.isRoutePath("/users-domains") ) {
            return Util.isUserAdmin()
        }
        if (Util.isRoutePath("/domains-users") ) {
            return Util.isUserAdmin()
        }
        if (Util.isRoutePath("/tenants")) {
            return Util.isUserSuperAdmin()
        }
        return false
    },

    isCloneVisible() {
        if (Util.isRoutePath("/templates") ) {
            return Util.isUserAdmin()
        }
        if (Util.isRoutePath("/users-domains")) {
            return Util.isUserAdmin()
        }
        if (Util.isRoutePath("/domains-users") ) {
            return Util.isUserAdmin()
        }
        return false
    },

    isDeleteVisible() {
        if (Util.isRoutePath("/templates") ) {
            return Util.isUserAdmin()
        }
        if (Util.isRoutePath("/users-domains")) {
            return Util.isUserAdmin()
        }
        if (Util.isRoutePath("/domains-users") ) {
            return Util.isUserAdmin()
        }
        if (Util.isRoutePath("/tenants")) {
            return Util.isUserSuperAdmin()
        }
        return false
    },

    isUndoVisible() {
        return false
    },

    isRedoVisible() {
        return false
    },

    isDoneEditingVisible() {
        if (Util.isRoutePath("/template/") ) {
            return true
        }
        if (Util.isRoutePath("/user/")) {
            return true
        }
        if (Util.isRoutePath("/domain/")) {
            return true
        }
        if (Util.isRoutePath("/tenant/")) {
            return true
        }
        return false
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
        let request = {}
        request.criteria = {}
        request.criteria.dateRetired = { $exists: false }
        request.options = {}
        request.options.sort = { name: 1 }
        OLog.debug("vxapp.js findTemplateList findTemplateList=" + OLog.debugString(request))
        return Templates.find(request.criteria, request.options).fetch()
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
    }
})
