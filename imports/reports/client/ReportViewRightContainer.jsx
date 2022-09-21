import { connect } from "react-redux"
import { withTracker } from "meteor/react-meteor-data"
import ReportViewRight from "/imports/reports/client/ReportViewRight"

const mapStateToPropsPrime = state => {
    return {
        reportData : state.reportData,
        reportLoading : state.reportLoading
    }
}

const ReportViewRightConnect = connect(
    mapStateToPropsPrime
)(ReportViewRight)

const MeteorContainer = withTracker(() => {
    const report = ContextMaker.reports()
    if (report) {
        VXApp.conditionallyFetchReportData(report)
    }
    return {
        report
    }
})(ReportViewRightConnect)

const mapStateToProps = state => {
    return {
        publishAuthoringReport : state.publishAuthoringReport
    }
}

export default connect(
    mapStateToProps
)(MeteorContainer)
