import { withTracker } from "meteor/react-meteor-data"
import ReportEditLeft from "/imports/reports/client/ReportEditLeft"

export default withTracker(( ) => {
    const report = ContextMaker.report()
    return {
        report
    }
})(ReportEditLeft)
