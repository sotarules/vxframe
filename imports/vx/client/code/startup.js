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
    OLog.debug(`startup.js doRoute [${Util.routePath()}] *init*`)
    const routePath = Util.routePath()
    if (routePath !== Store.getState().routePath) {
        Store.dispatch(setRoutePath(routePath))
    }
    const valid = Routes.isValidRoute(routePath)
    if (!valid) {
        OLog.debug(`startup.js doRoute [${Util.routePath()}] *invalid* no subscriptions shall be performed`)
        VXApp.routeAfter()
        return
    }
    const exemptRoute = VXApp.isExemptRoute()
    if (exemptRoute) {
        OLog.debug(`startup.js doRoute [${Util.routePath()}] *exempt* no subscriptions shall be performed`)
        if (exemptRoute !== Store.getState().exemptRoute) {
            Store.dispatch(setExemptRoute(exemptRoute))
        }
        VXApp.routeAfter()
        return
    }
    if (!Meteor.userId()) {
        OLog.debug(`startup.js doRoute [${Util.routePath()}] *not-logged-in* no subscriptions shall be performed`)
        VXApp.routeAfter()
        return
    }
    VXApp.routeBefore()
    VXApp.doGlobalSubscriptions(() => {
        const authorizedRoute = VXApp.isAuthorizedRoute()
        OLog.debug(`startup.js doRoute [${Util.routePath()}] user=${Util.getUserEmail()} authorizedRoute=${authorizedRoute}`)
        if (authorizedRoute !== Store.getState().authorizedRoute) {
            Store.dispatch(setAuthorizedRoute(authorizedRoute))
        }
        VXApp.routeAfter()
    })
}

Meteor.startup(() => {

    OLog.debug(`startup.js startup *genesis* welcome to ${CX.SYSTEM_NAME}`)

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
