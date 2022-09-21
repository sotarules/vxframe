import { Component } from "react"
import PropTypes from "prop-types"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup"
import RadioButton from "/imports/vx/client/RadioButton"
import ReportEntityList from "/imports/vx/client/ReportEntityList"
import BottomButton from "/imports/vx/client/BottomButton"
import { setPublishAuthoringReport } from "/imports/vx/client/code/actions"

export default class ReportViewLeft extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        reports : PropTypes.array.isRequired
    }

    static defaultProps = {
        id : "report-view-left"
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

    render() {
        return (
            <div id={this.props.id}
                className="left-list-container flexi-grow">
                <RadioButtonGroup id="button-group-reports"
                    value="REPORTS">
                    <RadioButton id="button-reports"
                        text={Util.i18n("common.label_reports")}
                        value="REPORTS"/>
                </RadioButtonGroup>
                <ReportEntityList id="report-view-left-list"
                    reports={this.props.reports}
                    selectable={true}
                    chevrons={true}
                    onSelect={this.handleSelectEntity.bind(this)}/>
                <BottomButton id="button-create-report"
                    className="btn-primary"
                    text={Util.i18n("common.button_create_report")}
                    onClick={this.handleClickCreate.bind(this)}/>
            </div>
        )
    }

    handleSelectEntity(event, component) {
        const publishAuthoringReport = {}
        publishAuthoringReport.criteria = { _id : component.props.itemId }
        Store.dispatch(setPublishAuthoringReport(publishAuthoringReport))
        if (UX.isSlideMode()) {
            UX.iosMinorPush("common.button_reports", "RIGHT")
        }
    }

    handleClickCreate(callback) {
        callback()
        UX.setLocked(["report-view-left", "report-view-right"], true)
        Reports.insert({ }, (error, reportId) => {
            if (error) {
                OLog.error(`ReportViewLeft.jsx error attempting to create report=${error}`)
                UX.notifyForDatabaseError(error)
                return
            }
            const publishAuthoringReport = {}
            publishAuthoringReport.criteria = { _id : reportId }
            Store.dispatch(setPublishAuthoringReport(publishAuthoringReport))
            if (UX.isSlideMode()) {
                UX.iosMajorPush("common.button_reports", "common.button_reports", `/report/${reportId}`, "RIGHT")
            }
            else {
                UX.iosMajorPush(null, null, `/report/${reportId}`, "RIGHT", "crossfade")
            }
        })
    }
}
