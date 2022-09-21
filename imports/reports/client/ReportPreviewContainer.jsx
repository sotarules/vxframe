import { withTracker } from "meteor/react-meteor-data"
import {connect} from "react-redux"
import ReportPreview from "./ReportPreview"

const mapStateToProps = state => {
    return {
        reportData : state.reportData,
        reportLoading : state.reportLoading
    }
}

const ReportPreviewConnect = connect(
    mapStateToProps
)(ReportPreview)

export default withTracker(( ) => {
    const report = ContextMaker.report()
    if (report) {
        VXApp.conditionallyFetchReportData(report)
    }
    return {
        report
    }
})(ReportPreviewConnect)

