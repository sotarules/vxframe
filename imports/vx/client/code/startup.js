import initReactFastclick from "react-fastclick"
import { createBrowserHistory } from "history"
import { setRoutePath } from "/imports/vx/client/code/actions"
import { setExemptRoute } from "/imports/vx/client/code/actions"
import { setAuthorizedRoute } from "/imports/vx/client/code/actions"
import { setWideRoute } from "/imports/vx/client/code/actions"

// This makes it possible to debug even if the user hasn't yet logged in (very helpful for debugging hyperlinks
// such as sign-off actions):
if (Meteor.absoluteUrl().indexOf("sota.ddns.net") >= 0) {
    console.log(`startup.js development absoluteUrl=${Meteor.absoluteUrl()} so client log level will be DEBUG`)
    OLog.setLogLevel(5)
}

if (VXApp.isLogoutOnBrowserClose()) {
    console.log("startup.js (vx) logout on browser close *enabled*")
    if (!sessionStorage.getItem("vxsession")) {
        console.log("startup.js (vx) session storage vxsession is not present system shall logout immediately")
        VXApp.logoutImmediately()
    }
    window.onload = function() {
        if (sessionStorage.getItem("vxsession") === "on") {
            console.log("startup.js (vx) onload vxsession is on *continue*")
            return
        }
        console.log("startup.js (vx) onload vxsession is not present and will be set to on")
        sessionStorage.setItem("vxsession", "on")
    }
}

const doRoute = () => {
    console.log(`startup.js doRoute [${Util.routePath()}] *init*`)
    UX.lockExitingComponents(true)
    const routePath = Util.routePath()
    if (routePath !== Store.getState().routePath) {
        Store.dispatch(setRoutePath(routePath))
    }
    const valid = Routes.isValidRoute(routePath)
    if (!valid) {
        console.log(`startup.js doRoute [${Util.routePath()}] *invalid* no subscriptions shall be performed`)
        VXApp.routeAfter()
        return
    }
    const wideRoute = VXApp.isWideRoute()
    if (wideRoute !== Store.getState().wideRoute) {
        Store.dispatch(setWideRoute(wideRoute))
    }
    const exemptRoute = VXApp.isExemptRoute()
    if (exemptRoute) {
        console.log(`startup.js doRoute [${Util.routePath()}] *exempt* no subscriptions shall be performed`)
        if (exemptRoute !== Store.getState().exemptRoute) {
            Store.dispatch(setExemptRoute(exemptRoute))
        }
        VXApp.routeAfter()
        return
    }
    const authorizedRoute = VXApp.isAuthorizedRoute()
    console.log(`startup.js doRoute [${Util.routePath()}] userId=${Meteor.userId()} authorizedRoute=${authorizedRoute}`)
    if (authorizedRoute !== Store.getState().authorizedRoute) {
        Store.dispatch(setAuthorizedRoute(authorizedRoute))
    }
    if (!Meteor.userId()) {
        console.log(`startup.js doRoute [${Util.routePath()}] *not-logged-in* no subscriptions shall be performed`)
        VXApp.routeAfter()
        return
    }
    VXApp.routeBefore()
    VXApp.doGlobalSubscriptions(() => {
        VXApp.routeAfter()
    })
}

Meteor.startup(() => {
    // Default loading to hold off any rendering until subscriptions are loaded (see below).
    UX.setLoading(true)
    BrowserHistory = createBrowserHistory()
    BrowserHistory.listen((location, action) => {
        console.log(`startup.js browser history listen URL is ${location.pathname}${location.search}${location.hash} action ${action}`)
        doRoute()
    })

    ReactDOM.render(Routes.renderRoutes(), document.getElementById("react-root"))
    // Compute initial slide mode based on device characteristics:
    UX.updateSlideMode()
    PNotify.prototype.options.styling = "fontawesome"
    // Dynamic changes in screen size can change the slide-mode state of the system:
    $(window).on("resize", () => {
        UX.updateSlideMode()
    })
    // Anti-rubber-band logic:
    UX.noRubberBand()
    // Capture and log the client version:
    Accounts.onLogin(() => {
        console.log("startup.js Accounts onLogin *fire*")
        Meteor.call("onClientLogin", Meteor.userId(), Meteor.appVersion.version, error => {
            if (error) {
                console.log(`startup.js Accounts onClientLogin callback error=${error}`)
                return
            }
        })
    })
    // Use React-friendly FastClick:
    initReactFastclick()
    doRoute()
})
