import { withTracker } from "meteor/react-meteor-data"
import {connect} from "react-redux"
import ReportEditRight from "./ReportEditRight"

const mapStateToProps = state => {
    return {
        reportData : state.reportData,
        reportLoading : state.reportLoading
    }
}

const ReportEditRightConnect = connect(
    mapStateToProps
)(ReportEditRight)

export default withTracker(() => {
    const report = ContextMaker.reports()
    if (report) {
        VXApp.conditionallyFetchReportData(report, true)
    }
    return {
        report
    }
})(ReportEditRightConnect)

