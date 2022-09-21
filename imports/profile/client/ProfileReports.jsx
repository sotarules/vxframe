import {Component} from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import RightBody from "/imports/vx/client/RightBody"
import VXForm from "/imports/vx/client/VXForm"
import VXRowPanel from "/imports/vx/client/VXRowPanel"
import ProfileReportsRow from "./ProfileReportsRow"

export default class ProfileReports extends Component {

    static propTypes = {
        user : PropTypes.object.isRequired,
        reportDefinitionObjects : PropTypes.array.isRequired,
        reports : PropTypes.array.isRequired
    }

    static defaultProps = {
        id : "profile-reports"
    }

    render() {
        return (
            <RightPanel>
                <RightBody>
                    <VXForm id={`${this.props.id}-form`}
                        ref={form => {this.form = form}}
                        className="right-panel-form"
                        collection={Meteor.users}
                        dynamic={true}
                        _id={this.props.user._id}>
                        <VXRowPanel id={`${this.props.id}-row-panel`}
                            editable={true}
                            scrollable={false}
                            title={Util.i18n("profile.label_reports")}
                            collection={Meteor.users}
                            record={this.props.user}
                            rowsPath={this.rowsPath()}
                            rowId="id"
                            component={ProfileReportsRow}
                            emptyMessage={Util.i18n("profile.empty_reports")}
                            reports={this.props.reports}
                            onUpdateRow={this.handleUpdateReportRow.bind(this)}/>
                    </VXForm>
                </RightBody>
            </RightPanel>
        )
    }

    rowsPath() {
        const domainId = Util.getCurrentDomainId(this.props.user)
        const domainIndex = Util.indexOf(this.props.user.profile.domains, "domainId", domainId)
        return `profile.domains[${domainIndex}].reports`
    }

    handleUpdateReportRow(component, value, collection, record, rowsPath, rowId) {
        VXApp.handleUpdateReportRow(component, value, collection, record, rowsPath, rowId)
    }
}
