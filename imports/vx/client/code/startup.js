import initReactFastclick from "react-fastclick"
import {createBrowserHistory} from "history"
import {createRoot} from "react-dom/client"
import {setExemptRoute, setRoutePath, setWideRoute} from "/imports/vx/client/code/actions"

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
    const routePathOld = Store.getState().routePath
    const routePathNew = Util.routePath()
    if (routePathNew !== routePathOld) {
        Store.dispatch(setRoutePath(routePathNew))
    }
    const valid = Routes.isValidRoute(routePathNew)
    if (!valid) {
        console.log(`startup.js doRoute [${Util.routePath()}] *invalid* no subscriptions shall be performed`)
        VXApp.routeAfter()
        return
    }
    const wideRoute = VXApp.isWideRoute(routePathNew)
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
    UX.setLoading(true)
    BrowserHistory = createBrowserHistory()
    BrowserHistory.listen((location, action) => {
        OLog.warn(`startup.js browser history listen URL is ${location.pathname}${location.search}${location.hash} action ${action}`)
        doRoute()
    })
    UX["react-root"] = createRoot(document.getElementById("react-root"))
    UX["react-root"].render(Routes.renderRoutes())
    UX.handleResize()
    PNotify.prototype.options.styling = "fontawesome"
    $(window).on("resize", () => {
        UX.handleResize()
    })
    UX.noRubberBand()
    Accounts.onLogin(() => {
        console.log("startup.js Accounts onLogin *fire*")
        Meteor.call("onClientLogin", Meteor.userId(), Meteor.appVersion.version, React.version, error => {
            if (error) {
                console.log(`startup.js Accounts onLogin callback error=${error}`)
                return
            }
            if (VXApp.onLogin) {
                VXApp.onLogin()
            }
            Meteor.setInterval(() => {
                try {
                    const loginToken = Meteor._localStorage.getItem("Meteor.loginToken")
                    const loginTokenExpires = Meteor._localStorage.getItem("Meteor.loginTokenExpires")
                    if (loginToken && loginTokenExpires) {
                        const tokenExpired = moment(loginTokenExpires).isBefore(moment())
                        if (tokenExpired) {
                            OLog.debug("startup.js Accounts onLogin token check " +
                                `email=${Util.getUserEmail()} loginToken=${loginToken} tokenExpired=${tokenExpired} ` +
                                "invoking VXApp.logout()")
                            VXApp.logout()
                        }
                    }
                }
                catch (error) {
                    OLog.error(`startup.js Accounts onLogin token check error=${OLog.errorError(error)}`)
                }
            }, 60000)
        })
    })
    initReactFastclick()
    doRoute()
})
