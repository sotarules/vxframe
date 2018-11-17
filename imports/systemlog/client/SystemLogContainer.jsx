import { withTracker } from "meteor/react-meteor-data"
import SystemLog from "/imports/systemlog/client/SystemLog.jsx"

export default withTracker(() => {

    let result = VXApp.getSubscriptionParameters()
    if (!result.success) {
        OLog.debug("SystemLogContainer.jsx withTracker subscription parameters not ready result=" + OLog.debugString(result))
        return
    }

    let ready = new ReactiveVar(false)

    let logLevel = Session.get("SELECTED_LOG_LEVEL") || "ALL"
    let logRows = Session.get("SELECTED_LOG_ROWS") || 50
    let logEndDate = Session.get("SELECTED_LOG_END_DATE")
    let searchPhrase = Session.get("SEARCH_PHRASE")

    let criteria = {}

    if (logLevel !== "ALL") {
        criteria.severity = logLevel
    }

    if (logEndDate) {
        criteria.date = { $lte: logEndDate }
    }

    if (searchPhrase) {
        criteria.message = searchPhrase
    }

    let options = {}
    options.sort = { date : -1, hrtime : -1 }
    options.limit = logRows

    let publishRequest = VXApp.makePublishingRequest("olog", result.subscriptionParameters, criteria, options)
    Session.set("PUBLISH_CURRENT_LOG", publishRequest.server)

    let handles = []
    handles.push(Meteor.subscribe("olog", publishRequest.server))

    UX.waitSubscriptions(handles, () => {
        ready.set(true)
        UX.clearLoading()
    })

    let timezone = Util.getUserTimezone(Meteor.userId())
    OLog.debug("SystemLogContainer.jsx withTracker logEndDate=" + logEndDate + " timezone=" + timezone)

    return {
        rowsArray : UX.makeRowsArray(),
        logLevels : UX.makeLogLevelsArray(true, false),
        ready : !!ready.get(),
        logLevel : logLevel,
        logRows : logRows,
        logEndDate : logEndDate,
        searchPhrase : searchPhrase,
        timezone : timezone
    }

})(SystemLog)
