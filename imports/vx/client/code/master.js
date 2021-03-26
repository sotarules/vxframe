import { combineReducers, createStore } from "redux"
import { persistStore, persistReducer } from "redux-persist"
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2"
import storage from "redux-persist/lib/storage"
import { setCurrentLocale } from "/imports/vx/client/code/actions"
import {setFunctionUpdateTimestamp} from "/imports/vx/client/code/actions"

React = require("react")
ReactDOM = require("react-dom")

console.log("master.js (vx) *init*")

const persistConfig = {
    key: "root",
    storage,
    stateReconciler: autoMergeLevel2,
    blacklist: ["loading"]
}

const persistedReducer = persistReducer(persistConfig, combineReducers(VXApp.unionedReducers()))
Store = createStore(persistedReducer)

Persistor = persistStore(Store, null, () => {
    const keyCount = Object.keys(Store.getState()).length
    console.log(`master.js (vx) persistor *rehydration* finished property keyCount=${keyCount}`)
})

document.title = Util.i18n("master.page_title")

/**
 * General client-side error handler. Note that JQuery recommendation is NOT to use a JQuery error
 * event handler for the window object because it is not possible to get the error, URL and line
 * argument values.
 */
window.onerror = (error, url, line) => {

    if (error) {
        // Seems to occur on iOS if the device sleeps and restarts:
        if (error.indexOf("INVALID_STATE_ERR") >= 0) {
            return
        }
        // Software is under development and being changed:
        if (error.indexOf("Uncaught SyntaxError") >= 0) {
            return
        }
        // Reference preview window is displaying something that is imposing "same origin" policy:
        if (error.indexOf("Script error") >= 0) {
            return
        }
        // Chrome iOS throws this, but it has no symptoms:
        if (error.indexOf("SyntaxError: Unexpected token ')'") >= 0) {
            return
        }
    }

    OLog.error("master.js window onerror event, error=" + error + " url=" + url + " line=" + line)
}

document.addEventListener("touchstart", event => {
    UX.touchCount = event.touches.length
    OLog.warn(`master.js touchstart UX.touchCount=${UX.touchCount}`)
}, false)

document.addEventListener("touchend", event => {
    UX.touchCount = event.touches.length
    OLog.warn(`master.js touchend UX.touchCount=${UX.touchCount}`)
}, false)

/**
 * Detects changes in user logLevel.
 */
Tracker.autorun(() => {
    let logLevel = Util.getProfileValue("logLevel")
    if (_.isNumber(logLevel)) {
        OLog.setLogLevel(logLevel)
    }
})

Tracker.autorun(() => {
    let locale = Util.getProfileValue("locale")
    Store.dispatch(setCurrentLocale(locale))
})

Tracker.autorun(function() {

    // Reactive: if user ID changes, re-initialize:
    let userId = Meteor.userId()
    if (!userId) {
        if (UXState.notificationObserver) {
            console.log("master.js autorun notification observer *stop*")
            UXState.notificationObserver.stop()
            UXState.notificationObserver = null
        }
        return
    }

    let myNotificationsRequest = {}
    myNotificationsRequest.criteria = { recipientId : userId, PNOTIFY_processed : { $exists : false }, date : { $gte : new Date() } }
    myNotificationsRequest.options = { sort : { date : -1 } }

    console.log("master.js autorun notification observer *subscribe*")

    Meteor.subscribe("my_notifications", myNotificationsRequest)

    // Timeout allows initialization to complete.  Without this PNotify can throw errors during initialization trying to find
    // attribute CSS on an element that doesn't exist:
    Meteor.setTimeout(() => {
        UXState.notificationObserver = Notifications.find(myNotificationsRequest.criteria, myNotificationsRequest.options).observeChanges({
            added : (id) => {
                let notification = Notifications.findOne({ _id : id })
                if (!notification) {
                    OLog.error("master.js autorun notification observer could not find notificationId=" + id)
                    return
                }
                if (notification.PNOTIFY_processed) {
                    return
                }
                // Strange, somehow it is possible during login/logout transition for this observer to still be observing the
                // previously-logged-in user.  Let's make sure that this notification is for our user:
                if (notification.recipientId !== Meteor.userId()) {
                    return
                }
                //console.log("master.js autorun: notification observer notificationId=" + id + " *added*", notification)
                if (Util.isNotificationDesired(notification, "PNOTIFY")) {
                    // Sherpa has special checkbox for verbose notifications:
                    if (Meteor.user().profile.verboseNotifications || notification.type === "ERROR") {
                        let type = CX.NOTIFICATION_TYPE_MAP[notification.type]
                        let icon = CX.NOTIFICATION_ICON_MAP[notification.icon]
                        let text = Util.i18n(notification.key, notification.variables)
                        UX.createNotification({ type : type, text : text, icon : icon })
                    }
                }
                // Let's give the systems five seconds before clearing so that notifications will be shown
                // on all workstations prior to clearing (users may be logged into multiple browser pages at the same time):
                Meteor.setTimeout(() => {
                    Meteor.call("clearPNotify", id, true, (error, result) => {
                        UX.notify(result, error, true)
                    })
                }, 5000)
            }
        })
    }, 1000)
})

Tracker.autorun(function() {

    const userId = Meteor.userId()
    if (!userId) {
        if (UXState.functionObserver) {
            UXState.functionObserver.stop()
            UXState.functionObserver = null
        }
        return
    }

    // Set up dependency on domain ID changes run tracker
    Util.getCurrentDomainId(userId)

    // Wait until we have publishing criteria in redux:
    let publishCurrentFunctions = Util.clone(Store.getState().publishCurrentFunctions)
    if (!publishCurrentFunctions) {
        // This can run prior to redux initialization but it will re-run later:
        return
    }

    publishCurrentFunctions.criteria.dateModified = { $gt: new Date() }

    Meteor.subscribe("my_functions", publishCurrentFunctions)
    UXState.functionObserver = Functions.find(publishCurrentFunctions.criteria).observe({
        added : (newDocument) => {
            VXApp.addFunction(newDocument)
        },
        changed : (newDocument, oldDocument) => {
            VXApp.changeFunction(newDocument, oldDocument)
            Store.dispatch(setFunctionUpdateTimestamp(new Date().toISOString()))
        },
        removed : (oldDocument) => {
            VXApp.removeFunction(oldDocument)
        }
    })
})
