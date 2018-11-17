import { withTracker } from "meteor/react-meteor-data"
import EventsTable from "/imports/events/client/EventsTable.jsx"

export default withTracker(( ) => {

    let publishRequest = Session.get("PUBLISH_CURRENT_EVENTS")

    return {
        eventRows : Events.find(publishRequest.criteria, publishRequest.options).fetch()
    }

})(EventsTable)
