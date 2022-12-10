import {Component} from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import RightHeader from "/imports/vx/client/RightHeader"
import EmptyRightPanel from "/imports/vx/client/EmptyRightPanel"
import RetireModal from "/imports/vx/client/RetireModal"
import RightBody from "/imports/vx/client/RightBody"
import ReportBody from "./ReportBody"
import ReportFooter from "./ReportFooter"
import {setPublishAuthoringReport} from "/imports/vx/client/code/actions"


export default class ReportViewRight extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        report : PropTypes.object,
        reportData : PropTypes.object,
        reportLoading : PropTypes.bool
    }

    static defaultProps = {
        id : "report-view-right"
    }

    constructor(props) {
        super(props)
        this.locked = false
    }

    shouldComponentUpdate() {
        return !this.locked
    }

    setLocked(locked) {
        this.locked = locked
    }

    componentDidMount() {
        this.registerDelegates()
    }

    componentDidUpdate() {
        this.registerDelegates()
    }

    registerDelegates() {
        UX.unregisterIosButtonDelegates()
        if (this.props.report) {
            UX.registerIosButtonDelegate("ios-button-send", this.handleSend.bind(this))
            UX.registerIosButtonDelegate("ios-button-download", this.handleDownload.bind(this), null, null, null, null, true)
            UX.registerIosButtonDelegate("ios-button-print", this.handlePrint.bind(this))
            UX.registerIosButtonDelegate("ios-button-edit", this.handleEdit.bind(this))
            UX.registerIosButtonDelegate("ios-button-clone", this.handleClone.bind(this))
            UX.registerIosButtonDelegate("ios-button-delete", this.handleDelete.bind(this))
        }
    }

    render() {
        if (!this.props.report) {
            return <EmptyRightPanel emptyMessage={Util.i18n("common.empty_report_rhs_details")}/>
        }
        return (
            <div id={this.props.id}
                className="flexi-grow lock-exiting-component">
                {this.props.report ? (
                    <RightPanel>
                        <RightHeader iconUrl={`${CX.CLOUDFILES_PREFIX}/img/system/reports1.png`}
                            name={this.props.report.name}
                            description={this.props.report.description}/>
                        <RightBody scrollable={true}
                            className="right-body-no-margin-top"
                            scrollClass="scroll-both">
                            <ReportBody id={`${this.props.id}-report-body`}
                                report={this.props.report}
                                reportData={this.props.reportData}
                                reportLoading={this.props.reportLoading}/>
                        </RightBody>
                        <ReportFooter id={`${this.props.id}-report-footer`}
                            report={this.props.report}
                            reportData={this.props.reportData}
                            reportLoading={this.props.reportLoading}/>
                    </RightPanel>
                ) : (
                    <EmptyRightPanel emptyMessage={Util.i18n("common.empty_edit_record_missing")}/>
                )}
            </div>
        )
    }

    handleSend(callback) {
        VXApp.handleSendReport(callback, this.props.report)
    }

    handleDownload(callback) {
        VXApp.handleDownloadReport(callback, this.props.report)
    }

    handlePrint(callback) {
        VXApp.handlePrintReport(callback)
    }

    handleEdit(callback) {
        callback()
        UX.iosMajorPush(null, null, "/report", "RIGHT", "crossfade")
    }

    handleClone(callback) {
        callback()
        UX.setLocked(["report-view-left"], true)
        VXApp.cloneReport(this.props.report._id)
    }

    handleDelete(callback) {
        callback()
        UX.showModal(<RetireModal title={Util.i18n("common.label_retire_report")}
            collection={Reports}
            _id={this.props.report._id}
            retireMethod="retireReport"
            publishSetAction={setPublishAuthoringReport}/>)
    }
}
