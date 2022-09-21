import {Component} from "react"
import PropTypes from "prop-types"
import VXHTML from "/imports/vx/client/VXHTML"
import EmptyRightPanel from "/imports/vx/client/EmptyRightPanel"
import LoadingSpinner from "/imports/vx/client/LoadingSpinner"

export default class ReportBody extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        report : PropTypes.object.isRequired,
        reportData : PropTypes.object,
        reportLoading : PropTypes.bool,
        showHeading : PropTypes.bool
    }

    static defaultProps = {
        showHeading : false
    }

    render() {
        if (this.props.reportLoading) {
            return (<LoadingSpinner className="loading-spinner-white-background"/>)
        }
        if (!(this.props.reportData && this.props.report.checked?.length > 0)) {
            return (<EmptyRightPanel emptyMessage={Util.i18n("common.empty_report_body")}/>)
        }
        const html = VXApp.makeReportHtml(this.props.report, this.props.reportData, this.props.showHeading, false)
        return (
            <div id={this.props.id}
                className="flexi-grow report-container">
                <VXHTML id={`${this.props.id}-body`}
                    className="flexi-grow report-body"
                    html={html}/>
            </div>
        )
    }
}
