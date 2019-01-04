import { Component } from "react"
import PropTypes from "prop-types"
import VXButton from "/imports/vx/client/VXButton"
import VXCheck from "/imports/vx/client/VXCheck"
import VXSelect from "/imports/vx/client/VXSelect"
import ProfileReportsModal from "/imports/profile/client/ProfileReportsModal"

export default class ProfileReportsRow extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        user : PropTypes.object.isRequired,
        reportType : PropTypes.string.isRequired,
        description : PropTypes.string.isRequired,
        reportFrequencies : PropTypes.array.isRequired,
        timeUnits : PropTypes.array.isRequired,
    }

    constructor(props) {
        super(props)
        let isCheckedSendEmail = this.isCheckedSendEmail()
        let selectedFrequency = UX.chooseFirstIfBlank(this.selectedReportFrequency(), this.props.reportFrequencies)
        let selectedTimeUnit = UX.chooseFirstIfBlank(this.selectedTimeUnit(), this.props.timeUnits)
        let timeOptions = Util.makeTimeOptionsArray(selectedTimeUnit)
        let selectedTimeOption = UX.chooseFirstIfBlank(this.selectedTimeOption(), timeOptions)
        this.state = {
            isCheckedSendEmail : isCheckedSendEmail,
            selectedFrequency : selectedFrequency,
            selectedTimeUnit : selectedTimeUnit,
            selectedTimeOption : selectedTimeOption,
            timeOptions : timeOptions
        }
    }

    render() {
        return (
            <li id={this.props.id} className="list-group-item report-control-container">
                <div className="report-container-small">
                    <table className="report-table">
                        <tbody>
                            <tr>
                                <td className="report-list-description">
                                    <div className="report-text">{this.props.description}</div>
                                </td>
                                <td className="report-list-right">
                                    <div className="report-list-right-set">
                                        <div className="report-list-button">
                                            <VXButton id={"button-send-now-" + this.props.reportType}
                                                className="button-send-now btn btn-default btn-block ladda-button"
                                                tooltip={Util.i18n("profile.tooltip_send_now")}
                                                iconClass="fa fa-lg fa-paper-plane-o"
                                                onClick={this.handleClickSendReport.bind(this)}>
                                            </VXButton>
                                        </div>
                                        <VXCheck id={"sendEmail-" + this.props.reportType}
                                            className="report-list-checkbox hidden-sm hidden-xs"
                                            label={Util.i18n("profile.label_send_email")}
                                            labelClass="notificationprefs-mode-label"
                                            checked={this.state.isCheckedSendEmail}
                                            onChange={this.handleChangeSendEmail.bind(this)}/>
                                        <VXSelect id={"reportFrequency-" + this.props.reportType}
                                            className="report-list-dropdown hidden-sm hidden-xs"
                                            selectClass="report-list-select-frequency"
                                            codeArray={this.props.reportFrequencies}
                                            value={this.stateSelectedFrequency}
                                            onChange={this.handleChangeFrequency.bind(this)}/>
                                        <VXSelect id={"timeUnit-" + this.props.reportType}
                                            className="report-list-dropdown hidden-sm hidden-xs"
                                            selectClass="time-unit report-list-select-timeunit"
                                            codeArray={this.props.timeUnits}
                                            value={this.state.selectedTimeUnit}
                                            onChange={this.handleChangeTimeUnit.bind(this)}/>
                                        <VXSelect id={"timeOption-" + this.props.reportType}
                                            className="report-list-dropdown hidden-sm hidden-xs"
                                            selectClass="report-list-select-timeoption"
                                            codeArray={this.state.timeOptions}
                                            value={this.state.selectedTimeOption}
                                            onChange={this.handleChangeTimeOption.bind(this)}/>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </li>
        )
    }

    isCheckedSendEmail() {
        return !!Util.fetchReportPreferenceValue(this.props.user, this.props.reportType, "reportType")
    }

    selectedReportFrequency() {
        return Util.fetchReportPreferenceValue(this.props.user, this.props.reportType, "reportFrequency")
    }

    selectedTimeUnit() {
        return Util.fetchReportPreferenceValue(this.props.user, this.props.reportType, "timeUnit")
    }

    selectedTimeOption() {
        return Util.fetchReportPreferenceValue(this.props.user, this.props.reportType, "timeOption")
    }

    handleChangeSendEmail(event) {
        this.setState({ isCheckedSendEmail : !!event.target.checked })
    }

    handleChangeFrequency(event) {
        this.setState({ selectedFrequency : event.target.value })
    }

    handleChangeTimeUnit(event) {
        let codeArray = Util.makeTimeOptionsArray(event.target.value)
        this.setState({ selectedTimeUnit : event.target.value, timeOptions : codeArray, selectedTimeOption : codeArray[0].code })
    }

    handleChangeTimeOption(event) {
        this.setState({ selectedTimeOption : event.target.value })
    }

    handleClickSendReport(callback) {
        OLog.debug("ProfileReportsRow.jsx handleClickSendReport reportType=" + this.props.reportType)
        callback()
        if (Util.isReportParameterDefinitions(this.props.reportType)) {
            UX.showModal(<ProfileReportsModal user={this.props.user}
                reportType={this.props.reportType}/>)
            return
        }
        Util.sendReport(this.props.reportType, Util.reportParameterDefaults(this.props.reportType))
    }
}
