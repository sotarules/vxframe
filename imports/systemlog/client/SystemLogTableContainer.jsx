import { withTracker } from "meteor/react-meteor-data"
import SystemLogTable from "/imports/systemlog/client/SystemLogTable"

export default withTracker(( ) => {

    let publishRequest = Store.getState().publishCurrentLog

    if (publishRequest.criteria.message) {
        publishRequest.criteria.message = new RegExp(publishRequest.criteria.message, "i")
    }

    return {
        logRows : Log.find(publishRequest.criteria, publishRequest.options).fetch()
    }

})(SystemLogTable)
