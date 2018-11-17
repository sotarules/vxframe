import { withTracker } from "meteor/react-meteor-data"
import SystemLogTable from "/imports/systemlog/client/SystemLogTable.jsx"

export default withTracker(( ) => {

    let publishRequest = Session.get("PUBLISH_CURRENT_LOG")

    if (publishRequest.criteria.message) {
        publishRequest.criteria.message = new RegExp(publishRequest.criteria.message, "i")
    }

    return {
        logRows : Log.find(publishRequest.criteria, publishRequest.options).fetch()
    }

})(SystemLogTable)
