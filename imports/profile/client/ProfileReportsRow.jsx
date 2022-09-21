import {Component} from "react"
import PropTypes from "prop-types"
import VXRow from "/imports/vx/client/VXRow"
import VXSelect from "/imports/vx/client/VXSelect"
import VXTextArea from "/imports/vx/client/VXTextArea"
import VXCheck from "/imports/vx/client/VXCheck"

export default class ProfileReportsRow extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        row : PropTypes.object.isRequired,
        reports : PropTypes.array.isRequired
    }

    render() {
        return (
            <VXRow id={this.props.id}
                editable={true}
                standardPadding={false}
                itemId={this.props.row.id}>
                <div className="row">
                    <div className="col-sm-3">
                        <VXSelect id={`${this.props.id}-report`}
                            label={Util.i18n("profile.label_report")}
                            codeArray={UX.addBlankSelection(this.props.reports)}
                            value={this.props.row.reportId}
                            dbName="reportId"/>
                    </div>
                    <div className="col-sm-3">
                        <VXSelect id={`${this.props.id}-frequency`}
                            label={Util.i18n("profile.label_frequency")}
                            codeArray={UX.addBlankSelection(UX.makeCodeArray("reportFrequency"))}
                            value={this.props.row.reportFrequency}
                            dbName="reportFrequency"/>
                    </div>
                    <div className="col-sm-3">
                        <VXSelect id={`${this.props.id}-time-unit`}
                            label={Util.i18n("profile.label_time_unit")}
                            codeArray={UX.addBlankSelection(UX.makeCodeArray("timeUnit"))}
                            value={this.props.row.timeUnit}
                            dbName="timeUnit"/>
                    </div>
                    <div className="col-sm-3">
                        <VXSelect id={`${this.props.id}-time-option`}
                            label={Util.i18n("profile.label_time_option")}
                            codeArray={UX.addBlankSelection(Util.makeTimeOptionsArray(this.props.row.timeUnit))}
                            value={this.props.row.timeOption}
                            dbName="timeOption"/>
                    </div>
                </div>
                <div className="row margin-top-5">
                    <div className="col-sm-3">
                        <VXCheck id={`${this.props.id}-custom-distribution`}
                            label={Util.i18n("common.label_attachments")}
                            checked={this.props.row.attachments}
                            dbName="attachments"/>
                    </div>
                    <div className="col-sm-3">
                        <VXCheck id={`${this.props.id}-attachments`}
                            label={Util.i18n("common.label_custom_distribution")}
                            checked={this.props.row.customDistribution}
                            dbName="customDistribution"/>
                    </div>
                </div>
                <div className="row margin-bottom-10">
                    {!this.props.row.customDistribution ? (
                        <div className="col-sm-12">
                            <VXTextArea id={`${this.props.id}-recipients`}
                                groupClass="form-group-first"
                                label={Util.i18n("common.label_send_report_recipients")}
                                className="text-area-resize"
                                rows={6}
                                rule={VX.common.emailDistributionList}
                                value={this.props.row.recipients}
                                dbName="recipients"/>
                        </div>
                    ) : (
                        <div className="col-sm-3">
                            <VXSelect id={`${this.props.id}-distribution-function`}
                                codeArray={UX.addBlankSelection(VXApp.makeFunctionArray(Util.getCurrentDomainId(),
                                    "EMAIL_DISTRIBUTION"))}
                                groupClass="form-group-first"
                                label={Util.i18n("common.label_distribution_function")}
                                value={this.props.row.distributionFunctionId}
                                dbName="distributionFunctionId">
                            </VXSelect>
                        </div>
                    )}
                </div>
            </VXRow>
        )
    }
}
