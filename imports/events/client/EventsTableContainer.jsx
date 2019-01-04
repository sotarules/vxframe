import { withTracker } from "meteor/react-meteor-data"
import EventsTable from "/imports/events/client/EventsTable"

export default withTracker(( ) => {

    let publishRequest = Store.getState().publishCurrentEvents

    return {
        eventRows : Events.find(publishRequest.criteria, publishRequest.options).fetch()
    }

})(EventsTable)
