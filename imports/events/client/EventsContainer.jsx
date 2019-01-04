import { connect } from "react-redux"
import { withTracker } from "meteor/react-meteor-data"
import Events from "/imports/events/client/Events"
import { setPublishCurrentEvents } from "/imports/vx/client/code/actions"

const MeteorContainer = withTracker(props => {

    let result = VXApp.getSubscriptionParameters()
    if (!result.success) {
        OLog.debug("EventsContainer.jsx withTracker subscription parameters not ready result=" + OLog.debugString(result))
        return
    }

    let ready = new ReactiveVar(false)
    let criteria = {}

    if (props.selectedEventType !== "ALL") {
        criteria.type = props.selectedEventType
    }

    if (props.selectedEventEndDate) {
        criteria.date = { $lte: props.selectedEventEndDate }
    }

    let options = {}
    options.sort = { date : -1 }
    options.limit = props.selectedEventRows

    let publishRequest = VXApp.makePublishingRequest("events", result.subscriptionParameters, criteria, options)
    Store.dispatch(setPublishCurrentEvents(publishRequest.server))

    let handles = []
    handles.push(Meteor.subscribe("events", publishRequest.server))

    UX.waitSubscriptions(handles, () => {
        ready.set(true)
        UX.clearLoading()
    })

    let timezone = Util.getUserTimezone(Meteor.userId())
    OLog.debug("EventsContainer.jsx withTracker eventEndDate=" + props.selectedEventEndDate + " timezone=" + timezone)

    return {
        rowsArray : UX.makeRowsArray(),
        eventTypes : UX.makeEventTypesArray(true),
        ready : !!ready.get(),
        eventType : props.selectedEventType,
        eventRows : props.selectedEventRows,
        eventEndDate : props.selectedEventEndDate,
        timezone : timezone
    }

})(Events)

const mapStateToProps = state => {
    let props = {
        selectedEventType : state.selectedEventType,
        selectedEventRows : state.selectedEventRows,
        selectedEventDate : state.selectedEventDate
    }
    return props
}

export default connect(mapStateToProps)(MeteorContainer)
