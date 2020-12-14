import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import RightBody from "/imports/vx/client/RightBody"
import VXForm from "/imports/vx/client/VXForm"
import VXFieldSet from "/imports/vx/client/VXFieldSet"
import VXInput from "/imports/vx/client/VXInput"
import CheckboxRow from "/imports/vx/client/CheckboxRow"
import FooterCancelSave from "/imports/vx/client/FooterCancelSave"

export default class SettingsDomain extends Component {

    static propTypes = {
        user : PropTypes.object.isRequired,
        config : PropTypes.object.isRequired,
        tenant : PropTypes.object.isRequired,
        domain : PropTypes.object.isRequired,
        states : PropTypes.array.isRequired,
        countries : PropTypes.array.isRequired
    }

    render() {
        return (
            <RightPanel>
                <RightBody>
                    <VXForm id="settings-domain-form"
                        ref={(form) => { this.form = form }}
                        className="right-panel-form"
                        dynamic={false}
                        collection={Domains}
                        receiveProps={false}
                        _id={this.props.domain._id}>
                        <VXFieldSet legend={Util.i18n("system_settings.label_domain_settings")}>
                            <div className="row">
                                <div className="col-sm-4">
                                    <VXInput id="name"
                                        label={Util.i18n("system_settings.label_domain_name")}
                                        required={true}
                                        value={this.props.domain.name}/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-8">
                                    <VXInput id="description"
                                        label={Util.i18n("system_settings.label_domain_description")}
                                        required={true}
                                        value={this.props.domain.description}/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12 margin-top-20">
                                    <h4>{Util.i18n("system_settings.label_domain_notification_settings")}</h4>
                                </div>
                            </div>
                            <CheckboxRow id="mailgunTest"
                                rowClass="margin-top-10"
                                className="checkbox-singlespace"
                                label={Util.i18n("system_settings.label_domain_mailgun_test")}
                                tooltip={Util.i18n("system_settings.tooltip_domain_mailgun_test")}
                                checked={this.props.domain.mailgunTest}/>
                            <div className="row">
                                <div className="col-sm-6">
                                    <VXInput id="mailgunPrivateApiKey"
                                        label={Util.i18n("system_settings.label_domain_mailgun_private_api_key")}
                                        tooltip={Util.i18n("system_settings.tooltip_domain_mailgun_private_api_key")}
                                        value={this.props.domain.mailgunPrivateApiKey}/>
                                </div>
                                <div className="col-sm-6">
                                    <VXInput id="mailgunPublicApiKey"
                                        label={Util.i18n("system_settings.label_domain_mailgun_public_api_key")}
                                        tooltip={Util.i18n("system_settings.tooltip_domain_mailgun_public_api_key")}
                                        value={this.props.domain.mailgunPublicApiKey}/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <VXInput id="mailgunDomain"
                                        label={Util.i18n("system_settings.label_domain_mailgun_domain")}
                                        tooltip={Util.i18n("system_settings.tooltip_domain_mailgun_domain")}
                                        value={this.props.domain.mailgunDomain}/>
                                </div>
                                <div className="col-sm-6">
                                    <VXInput id="mailgunDestinationOverride"
                                        label={Util.i18n("system_settings.label_domain_mailgun_destination_override")}
                                        tooltip={Util.i18n("system_settings.tooltip_domain_mailgun_destination_override")}
                                        extra={["mailgunDestinationOverride"]}
                                        rule={VX.login.email}
                                        value={this.props.domain.mailgunDestinationOverride}/>
                                </div>
                            </div>
                            <CheckboxRow id="twilioTest"
                                rowClass="margin-top-20"
                                className="checkbox-singlespace"
                                label={Util.i18n("system_settings.label_domain_twilio_test")}
                                tooltip={Util.i18n("system_settings.tooltip_domain_twilio_test")}
                                checked={this.props.domain.twilioTest}/>
                            <div className="row">
                                <div className="col-sm-6">
                                    <VXInput id="twilioUser"
                                        label={Util.i18n("system_settings.label_domain_twilio_user")}
                                        tooltip={Util.i18n("system_settings.tooltip_domain_twilio_user")}
                                        value={this.props.domain.twilioUser}/>
                                </div>
                                <div className="col-sm-6">
                                    <VXInput id="twilioAuthToken"
                                        label={Util.i18n("system_settings.label_domain_twilio_auth_token")}
                                        tooltip={Util.i18n("system_settings.tooltip_domain_twilio_auth_token")}
                                        value={this.props.domain.twilioAuthToken}/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <VXInput id="twilioFromPhone"
                                        label={Util.i18n("system_settings.label_domain_twilio_from_phone")}
                                        tooltip={Util.i18n("system_settings.tooltip_domain_twilio_from_phone")}
                                        value={this.props.domain.twilioFromPhone}/>
                                </div>
                                <div className="col-sm-6">
                                    <VXInput id="twilioDestinationOverride"
                                        label={Util.i18n("system_settings.label_domain_twilio_destination_override")}
                                        tooltip={Util.i18n("system_settings.tooltip_domain_twilio_destination_override")}
                                        value={this.props.domain.twilioDestinationOverride}/>
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
        UX.save(this.form, laddaCallback);
    }
}
