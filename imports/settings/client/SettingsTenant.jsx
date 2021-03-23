import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import RightBody from "/imports/vx/client/RightBody"
import VXForm from "/imports/vx/client/VXForm"
import VXFieldSet from "/imports/vx/client/VXFieldSet"
import VXInput from "/imports/vx/client/VXInput"
import VXSelect from "/imports/vx/client/VXSelect"
import FooterCancelSave from "/imports/vx/client/FooterCancelSave"

export default class SettingsTenant extends Component {

    static propTypes = {
        user : PropTypes.object.isRequired,
        config : PropTypes.object.isRequired,
        tenant : PropTypes.object.isRequired,
        admins : PropTypes.array.isRequired,
        states : PropTypes.array.isRequired,
        countries : PropTypes.array.isRequired,
        timezones : PropTypes.array.isRequired
    }

    render() {
        return (
            <RightPanel>
                <RightBody>
                    <VXForm id="settings-tenant-form"
                        ref={(form) => { this.form = form }}
                        className="right-panel-form"
                        dynamic={false}
                        collection={Tenants}
                        receiveProps={false}
                        _id={this.props.tenant._id}>
                        <VXFieldSet legend={Util.i18n("system_settings.label_tenant_settings")}>
                            <div className="row">
                                <div className="col-sm-4">
                                    <VXSelect id="pocUserId"
                                        codeArray={UX.addBlankSelection(this.props.admins)}
                                        label={Util.i18n("system_settings.label_tenant_account_poc")}
                                        tooltip={Util.i18n("system_settings.tooltip_tenant_account_poc")}
                                        required={true}
                                        value={this.props.tenant.pocUserId}/>
                                </div>
                                <div className="col-sm-4">
                                    <VXInput id="functionAnchor"
                                        label={Util.i18n("system_settings.label_tenant_function_anchor")}
                                        tooltip={Util.i18n("system_settings.tooltip_tenant_function_anchor")}
                                        value={this.props.tenant.functionAnchor}/>
                                </div>
                                <div className="col-sm-4">
                                    <VXSelect id="timezone"
                                        codeArray={this.props.timezones}
                                        label={Util.i18n("system_settings.label_tenant_timezone")}
                                        tooltip={Util.i18n("system_settings.tooltip_tenant_timezone")}
                                        value={this.props.tenant.timezone}/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12 margin-top-20">
                                    <h4>{Util.i18n("system_settings.label_tenant_information")}</h4>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-4">
                                    <VXInput id="name"
                                        label={Util.i18n("system_settings.label_tenant_name")}
                                        required={true}
                                        value={this.props.tenant.name}/>
                                </div>
                                <div className="col-sm-4">
                                    <VXSelect id="country"
                                        codeArray={UX.addBlankSelection(this.props.countries)}
                                        label={Util.i18n("system_settings.label_tenant_country")}
                                        value={this.props.tenant.country}
                                        rule={VX.common.country}/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <VXInput id="description"
                                        label={Util.i18n("system_settings.label_tenant_description")}
                                        value={this.props.tenant.description}/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-8">
                                    <VXInput id="address1"
                                        label={Util.i18n("system_settings.label_tenant_address1")}
                                        value={this.props.tenant.address1}
                                        rule={VX.common.address1}/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-8">
                                    <VXInput id="address2"
                                        label={Util.i18n("system_settings.label_tenant_address2")}
                                        value={this.props.tenant.address2}
                                        rule={VX.common.address2}/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-4">
                                    <VXInput id="city"
                                        label={Util.i18n("system_settings.label_tenant_city")}
                                        value={this.props.tenant.city}
                                        rule={VX.common.city}/>
                                </div>
                                <div className="col-sm-4">
                                    <VXSelect id="state"
                                        codeArray={UX.addBlankSelection(this.props.states)}
                                        label={Util.i18n("system_settings.label_tenant_state")}
                                        value={this.props.tenant.state}
                                        rule={VX.common.state}/>
                                </div>
                                <div className="col-sm-3">
                                    <VXInput id="zip"
                                        label={Util.i18n("system_settings.label_tenant_zip")}
                                        value={this.props.tenant.zip}
                                        rule={VX.common.zip}/>
                                </div>
                            </div>
                        </VXFieldSet>
                    </VXForm>
                </RightBody>
                <FooterCancelSave ref={(footer) => {this.footer = footer} }
                    id="right-panel-footer"
                    onReset={this.onReset.bind(this)}
                    onSave={this.onSave.bind(this)}/>
            </RightPanel>
        )
    }

    onReset() {
        UX.resetForm(this.form)
    }

    onSave(laddaCallback) {
        UX.save(this.form, laddaCallback)
    }
}
