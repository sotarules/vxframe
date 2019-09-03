import initReactFastclick from "react-fastclick"
import { createBrowserHistory } from "history"
import { setRoutePath } from "/imports/vx/client/code/actions"

// This makes it possible to debug even if the user hasn't yet logged in (very helpful for debugging hyperlinks
// such as sign-off actions):
if (Meteor.absoluteUrl().indexOf("sota.ddns.net") >= 0) {
    console.log(`startup.js development absoluteUrl=${Meteor.absoluteUrl()} so client log level will be DEBUG`)
    OLog.setLogLevel(5)
}

Meteor.startup(() => {

    console.log("startup.js creating browser history object")

    // Default loading to hold off any rendering until subscriptions are loaded (see below).
    UX.setLoading(true)

    BrowserHistory = createBrowserHistory()
    BrowserHistory.listen((location, action) => {
        OLog.debug(`startup.js history listener URL is ${location.pathname}${location.search}${location.hash} action ${action}`)
        Store.dispatch(setRoutePath(location.pathname))
        OLog.debug(`startup.js browser history listen routePath=${Util.routePath}`)
        if (VXApp.isExemptRoute()) {
            OLog.debug("startup.js browser history exempt route do not attempt to load global subscriptions")
            return
        }
        VXApp.routeBefore()
        VXApp.doGlobalSubscriptions(() => {
            VXApp.routeAfter()
        })
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
        console.log("startup.js Accounts onLogin *fire*")
        Meteor.call("onClientLogin", Meteor.userId(), Meteor.appVersion.version, error => {
            if (error) {
                console.log("startup.js Accounts onClientLogin callback error=" + error)
                return
            }
        })
    })

    // Use React-friendly FastClick:
    initReactFastclick()

    // Reset global subscriptions here to handle the case where user is starting the system
    // via bookmarked page that needs subscriptions ready:
    VXApp.doGlobalSubscriptions(success => {
        OLog.debug(`startup.js [${Util.routePath()}] doGlobalSubscriptions callback success=${success}`)
        VXApp.routeBefore()
        VXApp.routeAfter()
    })
})
