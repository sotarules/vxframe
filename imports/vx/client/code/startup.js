import initReactFastclick from "react-fastclick"
import { createBrowserHistory } from "history"
import { setRoutePath } from "/imports/vx/client/code/actions"
import { setExemptRoute } from "/imports/vx/client/code/actions"
import { setAuthorizedRoute } from "/imports/vx/client/code/actions"

// This makes it possible to debug even if the user hasn't yet logged in (very helpful for debugging hyperlinks
// such as sign-off actions):
if (Meteor.absoluteUrl().indexOf("sota.ddns.net") >= 0) {
    console.log(`startup.js development absoluteUrl=${Meteor.absoluteUrl()} so client log level will be DEBUG`)
    OLog.setLogLevel(5)
}

const doRoute = () => {
    const routePath = Util.routePath()
    const exemptRoute = VXApp.isExemptRoute()
    const authorizedRoute = VXApp.isAuthorizedRoute()
    if (routePath !== Store.getState().routePath) {
        Store.dispatch(setRoutePath(routePath))
    }
    if (exemptRoute !== Store.getState().exemptRoute) {
        Store.dispatch(setExemptRoute(exemptRoute))
    }
    if (authorizedRoute !== Store.getState().authorizedRoute) {
        Store.dispatch(setAuthorizedRoute(authorizedRoute))
    }
    OLog.debug(`startup.js doRoute routePath=${routePath} exemptRoute=${exemptRoute} authorizedRoute=${authorizedRoute}`)
    if (!(exemptRoute || authorizedRoute)) {
        OLog.debug("startup.js doRoute neither exempt route nor authorized route defeat global subscriptions")
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
        OLog.debug(`startup.js browser history listen URL is ${location.pathname}${location.search}${location.hash} action ${action}`)
        doRoute()
    })

    ReactDOM.render(Routes.renderRoutes(), document.getElementById("react-root"))

    // Compute initial slide mode based on device characteristics:
    UX.updateSlideMode()

    PNotify.prototype.options.styling = "fontawesome"
    // Disable scroll for the document, we'll handle it ourselves
    $(document).on("touchmove", event => {
        event.preventDefault()
    })

    // Dynamic changes in screen size can change the slide-mode state of the system:
    $(window).on("resize", () => {
        UX.updateSlideMode()
    })

    // Anti-rubber-band logic:
    UX.noRubberBand()

    // Capture and log the client version:
    Accounts.onLogin(() => {
        OLog.debug("startup.js Accounts onLogin *fire*")
        Meteor.call("onClientLogin", Meteor.userId(), Meteor.appVersion.version, error => {
            if (error) {
                OLog.error(`startup.js Accounts onClientLogin callback error=${error}`)
                return
            }
        })
    })

    // Use React-friendly FastClick:
    initReactFastclick()

    doRoute()
})
