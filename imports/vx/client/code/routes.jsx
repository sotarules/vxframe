import React from "react"
import { Router, Route, Switch, Redirect } from "react-router-dom"
import DomainEdit from "/imports/domains/client/DomainEdit"
import DomainUserView from "/imports/usersdomains/client/DomainUserView"
import DomainView from "/imports/domains/client/DomainView"
import EventsContainer from "/imports/events/client/EventsContainer"
import LayoutDiagContainer from "/imports/layout/client/LayoutDiagContainer"
import LayoutNoneContainer from "/imports/layout/client/LayoutNoneContainer"
import LayoutStandardContainer from "/imports/layout/client/LayoutStandardContainer"
import NotFoundPage from "/imports/notfound/client/NotFoundPage"
import ProfileContainer from "/imports/profile/client/ProfileContainer"
import SettingsContainer from "/imports/settings/client/SettingsContainer"
import SigninContainer from "/imports/signin/client/SigninContainer"
import SystemLogContainer from "/imports/systemlog/client/SystemLogContainer"
import TemplateEditContainer from "/imports/templates/client/TemplateEditContainer"
import TemplateViewContainer from "/imports/templates/client/TemplateViewContainer"
import TenantEdit from "/imports/tenants/client/TenantEdit"
import TenantView from "/imports/tenants/client/TenantView"
import UserDomainView from "/imports/usersdomains/client/UserDomainView"
import UserEdit from "/imports/users/client/UserEdit"

Routes = {
    getRoutes() {
        const appRoutes = (Routes.getAppRoutes && Routes.getAppRoutes()) || []
        return appRoutes.concat([
            { path: "/", layoutName: "LayoutNoneContainer", component: SigninContainer },
            { path: "/signin", layoutName: "LayoutNoneContainer", component: SigninContainer },
            { path: "/enroll-account/:token", layoutName: "LayoutNoneContainer", component: SigninContainer },
            { path: "/reset-password/:token", layoutName: "LayoutNoneContainer", component: SigninContainer },
            { path: "/log", layoutName: "LayoutDiagContainer", component: SystemLogContainer },
            { path: "/events", layoutName: "LayoutDiagContainer", component: EventsContainer },
            { path: "/profile", layoutName: "LayoutStandardContainer", component: ProfileContainer },
            { path: "/users-domains", layoutName: "LayoutStandardContainer", component: UserDomainView },
            { path: "/domains-users", layoutName: "LayoutStandardContainer", component: DomainUserView },
            { path: "/user/:_id", layoutName: "LayoutStandardContainer", component: UserEdit },
            { path: "/domain/:_id", layoutName: "LayoutStandardContainer", component: DomainEdit },
            { path: "/tenants", layoutName: "LayoutStandardContainer", component: TenantView },
            { path: "/tenant/:_id", layoutName: "LayoutStandardContainer", component: TenantEdit },
            { path: "/domains", layoutName: "LayoutStandardContainer", component: DomainView },
            { path: "/system-settings", layoutName: "LayoutStandardContainer", component: SettingsContainer },
            { path: "/templates", layoutName: "LayoutStandardContainer", component: TemplateViewContainer },
            { path: "/template/:_id", layoutName: "LayoutStandardContainer", component: TemplateEditContainer },
        ])
    },

    renderRoutes() {
        return (
            <Router history={BrowserHistory}>
                <Switch>
                    <Route exact path={Routes.pathArrayFor("LayoutNoneContainer")}>
                        <LayoutNoneContainer>
                            {Routes.routesFor("LayoutNoneContainer")}
                        </LayoutNoneContainer>
                    </Route>
                    <Route exact path={Routes.pathArrayFor("LayoutDiagContainer")}>
                        <LayoutDiagContainer>
                            {Routes.routesFor("LayoutDiagContainer")}
                        </LayoutDiagContainer>
                    </Route>
                    <Route exact path={Routes.pathArrayFor("LayoutStandardContainer")}
                        render={Routes.renderStandardLayout}/>
                    <Route>
                        <LayoutNoneContainer>
                            <NotFoundPage />
                        </LayoutNoneContainer>
                    </Route>
                </Switch>
            </Router>
        )
    },

    renderStandardLayout({location}) {
        OLog.debug(`routes.jsx renderStandardLayout key=${location.key} pathname=${location.pathname}`)
        return (
            <LayoutStandardContainer location={location}>
                {Routes.routesFor("LayoutStandardContainer")}
            </LayoutStandardContainer>
        )
    },

    /**
     * Do any special functions before route.
     */
    doRouteBefore() {
        if (Routes.doAppRouteBefore) {
            Routes.doAppRouteBefore()
        }
    },

    /**
     * Do any special functions after route.
     */
    doRouteAfter() {
        UX.setLoading(false)
        if (Routes.doAppRouteAfter) {
            Routes.doAppRouteAfter()
        }
    },

    /**
     * Return the path array which is the set of all paths that share the supplied layout.
     *
     * @param {object} layoutName Layout name of component to use as filter.
     * @return {array} Array of routes.
     */
    pathArrayFor(layoutName) {
        const routeObjects = _.filter(Routes.getRoutes(), routeObject => layoutName === routeObject.layoutName)
        return routeObjects.map(routeObject => routeObject.path)
    },

    /**
     * Return React router Route components for all paths whose layout matches the one supplied.
     * These are rendered routes as opposed to component routes. If the user is not logged in,
     * (and the route isn't exempt) the rendered route will be a redirect to the signin page.
     *
     * @param {object} layoutName Layout name of component to use as filter.
     * @return {array} Array of routes.
     */
    routesFor(layoutName) {
        const routeObjects = _.filter(Routes.getRoutes(), routeObject => layoutName === routeObject.layoutName)
        return routeObjects.map((routeObject, index) => {
            return (<Route path={routeObject.path} key={index} exact={true} render={props => {
                const isLoggedIn = !!Meteor.userId()
                const Component = routeObject.component
                return isLoggedIn || VXApp.isExemptRoute(routeObject.path) ?
                    <Component {...props} /> : <Redirect to={{ pathname: "/", state: { from: props.location } }} />
            }}/>)
        })
    }
}
