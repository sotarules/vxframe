import React from "react"
import { Router, Route, Switch } from "react-router-dom"

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
        const appRoutes = Routes.getAppRoutes ? Routes.getAppRoutes() : []
        return appRoutes.concat([
            <Route key="001" exact path="/" render={() => VXApp.routeElement(LayoutNoneContainer, <SigninContainer/>)}/>,
            <Route key="002" path="/signin" render={() => VXApp.routeElement(LayoutNoneContainer, <SigninContainer/>)}/>,
            <Route key="003" path="/enroll-account/:token" render={() => VXApp.routeElement(LayoutNoneContainer, <SigninContainer/>)}/>,
            <Route key="004" path="/reset-password/:token" render={() => VXApp.routeElement(LayoutNoneContainer, <SigninContainer/>)}/>,
            <Route key="005" path="/log" render={() => VXApp.routeElement(LayoutDiagContainer, <SystemLogContainer/>)}/>,
            <Route key="006" path="/events" render={() => VXApp.routeElement(LayoutDiagContainer, <EventsContainer/>)}/>,
            <Route key="007" path="/profile" render={() => VXApp.routeElement(LayoutStandardContainer, <ProfileContainer/>)}/>,
            <Route key="008" path="/users-domains" render={() => VXApp.routeElement(LayoutStandardContainer, <UserDomainView/>)}/>,
            <Route key="009" path="/domains-users" render={() => VXApp.routeElement(LayoutStandardContainer, <DomainUserView/>)}/>,
            <Route key="010" path="/user/:_id" render={() => VXApp.routeElement(LayoutStandardContainer, <UserEdit/>)}/>,
            <Route key="011" path="/domain/:_id" render={() => VXApp.routeElement(LayoutStandardContainer, <DomainEdit/>)}/>,
            <Route key="012" path="/tenants" render={() => VXApp.routeElement(LayoutStandardContainer, <TenantView/>)}/>,
            <Route key="013" path="/tenant/:_id" render={() => VXApp.routeElement(LayoutStandardContainer, <TenantEdit/>)}/>,
            <Route key="014" path="/domains" render={() => VXApp.routeElement(LayoutStandardContainer, <DomainView/>)}/>,
            <Route key="015" path="/system-settings" render={() => VXApp.routeElement(LayoutStandardContainer, <SettingsContainer/>)}/>,
            <Route key="016" path="/templates" render={() => VXApp.routeElement(LayoutStandardContainer, <TemplateViewContainer/>)}/>,
            <Route key="017" path="/template/:_id" render={() => VXApp.routeElement(LayoutStandardContainer, <TemplateEditContainer/>)}/>,
            <Route key="018" render={() => VXApp.routeElement(LayoutNoneContainer,  <NotFoundPage/>)}/>
        ])
    },

    renderRoutes() {
        return (
            <Router history={BrowserHistory}>
                <Switch>
                    {Routes.getRoutes()}
                </Switch>
            </Router>
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
        if (Routes.doAppRouteAfter) {
            Routes.doAppRouteAfter()
        }
    }
}

