import { mount } from "react-mounter"
import LayoutNone from "/imports/layout/client/LayoutNone.jsx"
import NotFoundPage from "/imports/notfound/client/NotFoundPage.jsx"
import LayoutNoneContainer from "/imports/layout/client/LayoutNoneContainer.jsx"
import LayoutStandardContainer from "/imports/layout/client/LayoutStandardContainer.jsx"
import LayoutDiagContainer from "/imports/layout/client/LayoutDiagContainer.jsx"
import SigninContainer from "/imports/signin/client/SigninContainer.jsx"
import ProfileContainer from "/imports/profile/client/ProfileContainer.jsx"
import SettingsContainer from "/imports/settings/client/SettingsContainer.jsx"
import TenantView from "/imports/tenants/client/TenantView.jsx"
import TenantEdit from "/imports/tenants/client/TenantEdit.jsx"
import DomainView from "/imports/domains/client/DomainView.jsx"
import DomainEdit from "/imports/domains/client/DomainEdit.jsx"
import UserDomainView from "/imports/usersdomains/client/UserDomainView.jsx"
import DomainUserView from "/imports/usersdomains/client/DomainUserView.jsx"
import UserEdit from "/imports/users/client/UserEdit.jsx"
import EventsContainer from "/imports/events/client/EventsContainer.jsx"
import SystemLogContainer from "/imports/systemlog/client/SystemLogContainer.jsx"
import TemplateViewContainer from "/imports/templates/client/TemplateViewContainer.jsx"
import TemplateEditContainer from "/imports/templates/client/TemplateEditContainer.jsx"

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
        mount(LayoutNone, { content : <NotFoundPage/> })
    }
}
