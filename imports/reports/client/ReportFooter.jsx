import {Component} from "react"
import PropTypes from "prop-types"

export default class ReportFooter extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        report : PropTypes.object.isRequired,
        reportData : PropTypes.object,
        reportLoading : PropTypes.bool
    }

    render() {
        if (!(this.props.reportData && this.props.report.checked?.length > 0)) {
            return null
        }
        return (
            <div id={`${this.props.id}-footer`}
                className="flexi-fixed report-footer">
                <div className="report-footer-text">
                    {!this.props.reportLoading ?
                        Util.i18n("common.label_report_count", { count: this.props.reportData.rows.length }) :
                        (<span>&nbsp;</span>)
                    }
                </div>
            </div>
        )
    }
}
