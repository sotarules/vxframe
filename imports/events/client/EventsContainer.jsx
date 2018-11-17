import { withTracker } from "meteor/react-meteor-data"
import Events from "/imports/events/client/Events.jsx"

export default withTracker(() => {

    let result = VXApp.getSubscriptionParameters()
    if (!result.success) {
        OLog.debug("EventsContainer.jsx withTracker subscription parameters not ready result=" + OLog.debugString(result))
        return
    }

    let ready = new ReactiveVar(false)

    let eventType = Session.get("SELECTED_EVENT_TYPE") || Util.i18n("events.event_type_all")
    let eventRows = Session.get("SELECTED_EVENT_ROWS") || 50
    let eventEndDate = Session.get("SELECTED_EVENT_END_DATE")

    let criteria = {}

    if (eventType !== Util.i18n("events.event_type_all")) {
        criteria.type = eventType
    }

    if (eventEndDate) {
        criteria.date = { $lte: eventEndDate }
    }

    let options = {}
    options.sort = { date : -1 }
    options.limit = eventRows

    let publishRequest = VXApp.makePublishingRequest("events", result.subscriptionParameters, criteria, options)
    Session.set("PUBLISH_CURRENT_EVENTS", publishRequest.server)

    let handles = []
    handles.push(Meteor.subscribe("events", publishRequest.server))

    UX.waitSubscriptions(handles, () => {
        ready.set(true)
        UX.clearLoading()
    })

    let timezone = Util.getUserTimezone(Meteor.userId())
    OLog.debug("EventsContainer.jsx withTracker eventEndDate=" + eventEndDate + " timezone=" + timezone)

    return {
        rowsArray : UX.makeRowsArray(),
        eventTypes : UX.makeEventTypesArray(true),
        ready : !!ready.get(),
        eventType : eventType,
        eventRows : eventRows,
        eventEndDate : eventEndDate,
        timezone : timezone
    }

})(Events)
