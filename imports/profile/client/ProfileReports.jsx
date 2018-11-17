import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel.jsx"
import RightBody from "/imports/vx/client/RightBody.jsx"
import VXForm from "/imports/vx/client/VXForm.jsx"
import ProfileReportsRow from "/imports/profile/client/ProfileReportsRow.jsx"
import FooterCancelSave from "/imports/vx/client/FooterCancelSave.jsx"

export default class ProfileReports extends Component {

    static propTypes = {
        user : PropTypes.object.isRequired,
        reportDefinitionObjects : PropTypes.array.isRequired,
        reportFrequencies : PropTypes.array.isRequired,
        timeUnits : PropTypes.array.isRequired,
    }

    render() {
        return (
            <RightPanel>
                <RightBody>
                    <VXForm id="profile-reports-form"
                        ref={form => {this.form = form}}
                        className="right-panel-form"
                        autoComplete="on"
                        collection={Meteor.users}
                        receiveProps={false}
                        _id={this.props.user._id}
                        updateHandler={this.handleUpdate.bind(this)}>
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="report-list list-group">
                                    {this.renderReports()}
                                </div>
                            </div>
                        </div>
                    </VXForm>
                </RightBody>
                <FooterCancelSave ref={(footer) => {this.footer = footer} }
                    id="right-panel-footer"
                    onReset={this.onReset.bind(this)}
                    onSave={this.onSave.bind(this)}/>
            </RightPanel>
        )
    }

    renderReports() {
        return this.props.reportDefinitionObjects.map(reportDefinitionObject => (
            <ProfileReportsRow id={"profile-report-row-" + reportDefinitionObject.reportType}
                key={reportDefinitionObject.reportType}
                user={this.props.user}
                reportType={reportDefinitionObject.reportType}
                description={reportDefinitionObject.description}
                reportFrequencies={this.props.reportFrequencies}
                timeUnits={this.props.timeUnits}/>
        ))
    }

    onReset() {
        UX.resetForm(this.form)
    }

    onSave(laddaCallback) {
        UX.save(this.form, laddaCallback)
    }

    handleUpdate(callback) {

        let reportPreferences

        for (let reportType in Meteor.i18nMessages.codes.reportType) {

            let component = UX.findComponentById("profile-report-row-" + reportType)
            if (!component) {
                OLog.debug("ProfileReports.jsx handleUpdate unable to find reportType=" + reportType)
                continue
            }

            if (!component.state.isCheckedSendEmail) {
                continue
            }

            reportPreferences = reportPreferences || []

            let reportPreference = {}

            reportPreference.reportType = reportType
            reportPreference.reportFrequency = component.state.selectedFrequency
            reportPreference.timeUnit = component.state.selectedTimeUnit
            reportPreference.timeOption = component.state.selectedTimeOption

            // Note that we are starting fresh using the current date as the last executed date.
            // This will prevent a ton of "catch up" reports from being generated if the user switches from
            // MONTH report to an HOUR report.
            reportPreference.nextDate = Util.computeNextDate(reportPreference.reportFrequency,
             reportPreference.timeUnit, reportPreference.timeOption, this.props.user.profile.timezone, new Date())

            reportPreferences.push(reportPreference)
        }

        let modifier = {}

        if (reportPreferences) {
            modifier.$set = {}
            modifier.$set["profile.reportPreferences"] = reportPreferences
        }
        else {
            modifier.$unset = {}
            modifier.$unset["profile.reportPreferences"] = ""
        }

        OLog.debug("ProfileReports.jsx handleUpdate userId=" + this.props.user._id + " modifier=" + OLog.debugString(modifier))

        Meteor.users.update(this.props.user._id, modifier, function(error) {
            if (callback) {
                if (error) {
                    callback(error)
                    return
                }
                callback(null, { success : true })
            }
        })

        return true
    }
}
