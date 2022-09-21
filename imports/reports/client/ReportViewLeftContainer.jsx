import { withTracker } from "meteor/react-meteor-data"
import ReportViewLeft from "/imports/reports/client/ReportViewLeft"

export default withTracker(( ) => {
    const publishRequest = Store.getState().publishCurrentReports
    return {
        reports : Reports.find(publishRequest.criteria, publishRequest.options).fetch()
    }
})(ReportViewLeft)
