import {Component} from "react"
import PropTypes from "prop-types"
import BasicPanel from "/imports/vx/client/BasicPanel"
import PrintPreview from "/imports/vx/client/PrintPreview"
import ReportBody from "./ReportBody"

export default class ReportPreview extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        report : PropTypes.object,
        reportData : PropTypes.object,
        reportLoading : PropTypes.bool
    }

    static defaultProps = {
        id : "report-preview"
    }

    constructor(props) {
        super(props)
        this.locked = false
        this.state = { printDisplayed: false }
    }

    shouldComponentUpdate() {
        return !this.locked
    }

    setLocked(locked) {
        this.locked = locked
    }

    componentDidMount() {
        this.registerDelegates()
        this.conditionallyPrint()
    }

    componentDidUpdate() {
        this.registerDelegates()
        this.conditionallyPrint()
    }

    registerDelegates() {
        if (this.props.report) {
            UX.unregisterIosButtonDelegates()
            UX.registerIosButtonDelegate("ios-button-send", this.handleSend.bind(this))
            UX.registerIosButtonDelegate("ios-button-download", this.handleDownload.bind(this), null, null, null, null, true)
            UX.registerIosButtonDelegate("ios-button-print", this.handlePrint.bind(this))
            UX.registerIosButtonDelegate("ios-button-done-editing", this.handleDoneEditing.bind(this))
        }
    }

    conditionallyPrint() {
        if (!this.props.reportLoading && !this.state.printDisplayed) {
            this.setState({printDisplayed: true}, () => {
                Meteor.setTimeout(() => {
                    window.print()
                }, 1000)
            })
        }
    }

    render() {
        return (
            <div id={this.props.id}
                className="flexi-grow lock-exiting-component">
                <BasicPanel id={`${this.props.id}-basic-panel`}>
                    <PrintPreview id={`${this.props.id}-print-preview`}>
                        <ReportBody id={`${this.props.id}-report-body`}
                            report={this.props.report}
                            reportData={this.props.reportData}
                            reportLoading={this.props.reportLoading}
                            showHeading={true}/>
                    </PrintPreview>
                </BasicPanel>
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
        Meteor.setTimeout(() => {
            callback()
            window.print()
        }, 1000)
    }

    handleDoneEditing() {
        UX.iosPopAndGo("crossfade")
    }
}
