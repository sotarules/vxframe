import DomainEdit from "/imports/domains/client/DomainEdit"
import DomainUserView from "/imports/usersdomains/client/DomainUserView"
import DomainView from "/imports/domains/client/DomainView"
import EventsContainer from "/imports/events/client/EventsContainer"
import LayoutDiagContainer from "/imports/layout/client/LayoutDiagContainer"
import LayoutNone from "/imports/layout/client/LayoutNone"
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

FlowRouter.route("/", {
    action : () => {
        VXApp.mount(LayoutNoneContainer, <SigninContainer/>)
    }
})

FlowRouter.route("/signin", {
    action : () => {
        VXApp.mount(LayoutNoneContainer, <SigninContainer/>)
    }
})

FlowRouter.route("/signin-verified", {
    action : () => {
        // No operation for now
    }
})

FlowRouter.route("/enroll-account/:token", {
    action : () => {
        VXApp.mount(LayoutNoneContainer, <SigninContainer/>)
    }
})

FlowRouter.route("/reset-password/:token", {
    action : () => {
        VXApp.mount(LayoutNoneContainer, <SigninContainer/>)
    }
})

FlowRouter.route("/verify-email/:token", {
    action : () => {
        let token = FlowRouter.getParam("token")
        OLog.debug("router.js router.js [" + Util.routePath() + "] token=" + token)
        Accounts.verifyEmail(token, () => {
            FlowRouter.go("/signin-verified")
        })
    }
})

FlowRouter.route("/log", {
    action : () => {
        VXApp.mount(LayoutDiagContainer, <SystemLogContainer/>, true)
    }
})

FlowRouter.route("/events", {
    action : () => {
        VXApp.mount(LayoutDiagContainer, <EventsContainer/>, true)
    }
})

FlowRouter.route("/profile", {
    action : () => {
        VXApp.mount(LayoutStandardContainer, <ProfileContainer/>, false)
    }
})

FlowRouter.route("/users-domains", {
    action : () => {
        VXApp.mount(LayoutStandardContainer, <UserDomainView/>)
    }
})

FlowRouter.route("/domains-users", {
    action : () => {
        VXApp.mount(LayoutStandardContainer, <DomainUserView/>)
    }
})

FlowRouter.route("/user/:_id", {
    action : () => {
        VXApp.mount(LayoutStandardContainer, <UserEdit/>)
    }
})

FlowRouter.route("/domain/:_id", {
    action : () => {
        VXApp.mount(LayoutStandardContainer, <DomainEdit/>)
    }
})

FlowRouter.route("/tenants", {
    action : () => {
        VXApp.mount(LayoutStandardContainer, <TenantView/>)
    }
})

FlowRouter.route("/tenant/:_id", {
    action : () => {
        VXApp.mount(LayoutStandardContainer, <TenantEdit/>)
    }
})

FlowRouter.route("/domains", {
    action : () => {
        VXApp.mount(LayoutStandardContainer, <DomainView/>)
    }
})

FlowRouter.route("/system-settings", {
    action : () => {
        VXApp.mount(LayoutStandardContainer, <SettingsContainer/>, false)
    }
})

FlowRouter.route("/templates", {
    action : () => {
        VXApp.mount(LayoutStandardContainer, <TemplateViewContainer/>, true)
    }
})

FlowRouter.route("/template/:_id", {
    action : () => {
        VXApp.mount(LayoutStandardContainer, <TemplateEditContainer/>, true)
    }
})

FlowRouter.notFound = {
    action : () => {
        VXApp.mountInternal(LayoutNone, { content : <NotFoundPage/> })
    }
}
