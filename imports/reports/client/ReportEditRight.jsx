import {Component} from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import EmptyRightPanel from "/imports/vx/client/EmptyRightPanel"
import RightHeader from "/imports/vx/client/RightHeader"
import RightBody from "/imports/vx/client/RightBody"
import ReportBody from "./ReportBody"
import ReportFooter from "./ReportFooter"

export default class ReportEditRight extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        report : PropTypes.object,
        reportData : PropTypes.object,
        reportLoading : PropTypes.bool
    }

    static defaultProps = {
        id : "report-edit-right"
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
            UX.registerIosButtonDelegate("ios-button-undo", this.handleUndo.bind(this))
            UX.registerIosButtonDelegate("ios-button-redo", this.handleRedo.bind(this))
            UX.registerIosButtonDelegate("ios-button-done-editing", this.handleDoneEditing.bind(this))
        }
    }

    render() {
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
                            <ReportBody id={`${this.props.id}-report-preview`}
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

    handleUndo(callback) {
        callback()
        if (this.props.report) {
            VXApp.undo(Reports, this.props.report)
        }
    }

    handleRedo(callback) {
        callback()
        if (this.props.report) {
            VXApp.redo(Reports, this.props.report)
        }
    }

    handleDoneEditing() {
        UX.iosPopAndGo("crossfade")
    }
}
