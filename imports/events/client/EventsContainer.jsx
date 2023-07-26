import { connect } from "react-redux"
import { withTracker } from "meteor/react-meteor-data"
import Events from "/imports/events/client/Events"
import { setPublishCurrentEvents } from "/imports/vx/client/code/actions"

const MeteorContainer = withTracker(props => {

    const result = VXApp.getSubscriptionParameters()
    if (!result.success) {
        OLog.debug(`EventsContainer.jsx withTracker subscription parameters not ready result=${OLog.debugString(result)}`)
        return { ready : false }
    }

    const ready = new ReactiveVar(false)
    const criteria = {}

    if (props.selectedEventType !== "ALL") {
        criteria.type = props.selectedEventType
    }

    if (props.selectedEventEndDate) {
        criteria.date = { $lte: props.selectedEventEndDate }
    }

    const options = {}
    options.sort = { date : -1 }
    options.limit = props.selectedEventRows

    const publishRequest = VXApp.makePublishingRequest("events", result.subscriptionParameters, criteria, options)
    Store.dispatch(setPublishCurrentEvents(publishRequest.server))

    const handles = []
    handles.push(UX.subscribe("events", publishRequest.server))

    UX.waitSubscriptions(handles, () => {
        ready.set(true)
        UX.clearLoading()
    })

    const timezone = Util.getUserTimezone(Meteor.userId())

    OLog.debug(`EventsContainer.jsx withTracker eventEndDate=${props.selectedEventEndDate} timezone=${timezone}`)

    return {
        ready : !!ready.get(),
        rowsArray : UX.makeRowsArray(),
        eventTypes : UX.makeEventTypesArray(true),
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
