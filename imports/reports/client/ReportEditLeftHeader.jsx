import {Component} from "react"
import PropTypes from "prop-types"
import VXForm from "/imports/vx/client/VXForm"
import VXButton from "/imports/vx/client/VXButton"
import VXInput from "/imports/vx/client/VXInput"
import VXSelect from "/imports/vx/client/VXSelect"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup"
import RadioButton from "/imports/vx/client/RadioButton"

export default class ReportEditLeftHeader extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        report : PropTypes.object.isRequired
    }

    static defaultProps = {
        id : "report-edit-left-header"
    }

    render() {
        return (
            <div id={this.props.id}
                className="flexi-fixed">
                <RadioButtonGroup id="button-group-reports"
                    className="thin-bottom-margin"
                    value="REPORTS">
                    <RadioButton id="button-reports"
                        text={Util.i18n("common.label_reports")}
                        value="REPORTS"/>
                </RadioButtonGroup>
                <VXForm id="report-filters-form"
                    ref={(form) => { this.form = form }}
                    className="flexi-fixed top-header-group report-filters-form"
                    dynamic={true}
                    collection={Reports}
                    _id={this.props.report._id}>
                    <div className="row">
                        <div className="col-sm-8">
                            <VXInput id={`${this.props.id}-name`}
                                label={Util.i18n("common.label_name")}
                                value={this.props.report.name}
                                dbName="name"/>
                        </div>
                        <div className="col-sm-4">
                            <VXSelect id={`${this.props.id}-entity-type`}
                                codeArray={UX.addBlankSelection(VXApp.makeEntityTypeArray())}
                                label={Util.i18n("common.label_entity_type")}
                                value={this.props.report.entityType}
                                dbName="entityType"
                                modifyHandler={this.handleModifyEntityType.bind(this)}/>
                        </div>
                        <div className="col-sm-8">
                            <VXInput id={`${this.props.id}-description`}
                                label={Util.i18n("common.label_description")}
                                value={this.props.report.description}
                                dbName="description"/>
                        </div>
                        <div className="col-sm-4">
                            <VXButton id={`${this.props.id}-button-reset`}
                                className="btn btn-default btn-block report-filters-button"
                                iconClass="fa fa-refresh"
                                onClick={this.handleClickReset.bind(this)}>
                                {Util.i18n("common.button_reset")}
                            </VXButton>
                        </div>
                    </div>
                </VXForm>
            </div>
        )
    }

    handleModifyEntityType(component, modifier) {
        UX.mutateModifierTraditional(component, modifier)
        modifier.$unset = modifier.$unset || {}
        modifier.$unset.checked = null
        modifier.$unset.fields = null
    }

    handleClickReset(callback) {
        VXApp.updateHandlerSimple(Reports, this.props.report, "fields", null)
        callback(true)
    }
}
