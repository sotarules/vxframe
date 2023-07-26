import { connect } from "react-redux"
import { withTracker } from "meteor/react-meteor-data"
import SystemLog from "/imports/systemlog/client/SystemLog"
import { setPublishCurrentLog } from "/imports/vx/client/code/actions"

const MeteorContainer = withTracker(props => {

    const result = VXApp.getSubscriptionParameters()
    if (!result.success) {
        OLog.debug(`SystemLogContainer.jsx withTracker subscription parameters not ready result=${OLog.debugString(result)}`)
        return { ready : false }
    }

    const ready = new ReactiveVar(false)
    const criteria = {}

    if (props.selectedLogLevel !== "ALL") {
        criteria.severity = props.selectedLogLevel
    }

    if (props.selectedLogEndDate) {
        criteria.date = { $lte: props.selectedLogEndDate }
    }

    if (props.searchPhrase) {
        criteria.message = props.searchPhrase
    }

    const options = {}
    options.sort = { date : -1, hrtime : -1 }
    options.limit = props.selectedLogRows

    const publishRequest = VXApp.makePublishingRequest("olog", result.subscriptionParameters, criteria, options)
    Store.dispatch(setPublishCurrentLog(publishRequest.server))

    const handles = []
    handles.push(UX.subscribe("olog", publishRequest.server))

    UX.waitSubscriptions(handles, () => {
        ready.set(true)
        UX.clearLoading()
    })

    const timezone = Util.getUserTimezone(Meteor.userId())

    OLog.debug(`SystemLogContainer.jsx withTracker logEndDate=${props.selectedLogEndDate} timezone=${timezone}`)

    return {
        ready : !!ready.get(),
        rowsArray : UX.makeRowsArray(),
        logLevels : UX.makeLogLevelsArray(true, false),
        logLevel : props.selectedLogLevel,
        logRows : props.selectedLogRows,
        logEndDate : props.selectedLogEndDate,
        searchPhrase : props.searchPhrase,
        timezone : timezone
    }

})(SystemLog)

const mapStateToProps = state => {
    return {
        selectedLogLevel : state.selectedLogLevel,
        selectedLogRows : state.selectedLogRows,
        selectedLogEndDate : state.selectedLogEndDate,
        searchPhrase : state.searchPhrase
    }
}

export default connect(mapStateToProps)(MeteorContainer)
