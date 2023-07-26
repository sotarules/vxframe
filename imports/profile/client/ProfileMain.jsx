import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import RightBody from "/imports/vx/client/RightBody"
import FooterCancelSave from "/imports/vx/client/FooterCancelSave"
import VXForm from "/imports/vx/client/VXForm"
import VXInput from "/imports/vx/client/VXInput"
import VXSelect from "/imports/vx/client/VXSelect"
import VXImage from "/imports/vx/client/VXImage"

export default class ProfileMain extends Component {

    static propTypes = {
        user : PropTypes.object.isRequired,
        states : PropTypes.array.isRequired,
        countries : PropTypes.array.isRequired,
        locales : PropTypes.array.isRequired,
        timezones : PropTypes.array.isRequired,
    }

    render() {
        return (
            <RightPanel>
                <RightBody>
                    <VXForm id="profile-main-form"
                        ref={(form) => { this.form = form }}
                        className="right-panel-form"
                        autoComplete="on"
                        collection={Meteor.users}
                        receiveProps={false}
                        _id={this.props.user._id}>
                        <div className="row">
                            <div className="col-sm-4">
                                <VXSelect id="country"
                                    codeArray={this.props.countries}
                                    label={Util.i18n("profile.label_country")}
                                    required={true}
                                    star={true}
                                    tooltip={Util.i18n("profile.tooltip_country")}
                                    value={this.props.user.profile.country}
                                    rule={VX.common.country}
                                    siblings={["zip", "phone", "mobile"]}
                                    dbName={"profile.country"}/>
                            </div>
                            <div className="col-sm-4">
                                <VXSelect id="locale"
                                    codeArray={this.props.locales}
                                    label={Util.i18n("profile.label_locale")}
                                    required={true}
                                    star={true}
                                    tooltip={Util.i18n("profile.tooltip_locale")}
                                    value={this.props.user.profile.locale}
                                    rule={VX.common.locale}
                                    dbName={"profile.locale"}/>
                            </div>
                            <div className="col-sm-4">
                                <VXSelect id="timezone"
                                    codeArray={this.props.timezones}
                                    label={Util.i18n("profile.label_timezone")}
                                    tooltip={Util.i18n("profile.tooltip_timezone")}
                                    value={this.props.user.profile.timezone}
                                    dbName={"profile.timezone"}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-4">
                                <VXInput id="firstName"
                                    name="fname"
                                    label={Util.i18n("profile.label_firstName")}
                                    required={true}
                                    star={true}
                                    tooltip={Util.i18n("profile.tooltip_firstName")}
                                    value={this.props.user.profile.firstName}
                                    rule={VX.common.firstName}
                                    dbName={"profile.firstName"}/>
                            </div>
                            <div className="col-sm-3">
                                <VXInput id="middleName"
                                    name="mname"
                                    label={Util.i18n("profile.label_middleName")}
                                    tooltip={Util.i18n("profile.tooltip_middleName")}
                                    value={this.props.user.profile.middleName}
                                    rule={VX.common.middleName}
                                    dbName={"profile.middleName"}/>
                            </div>
                            <div className="col-sm-5">
                                <VXInput id="lastName"
                                    name="lname"
                                    label={Util.i18n("profile.label_lastName")}
                                    required={true}
                                    star={true}
                                    tooltip={Util.i18n("profile.tooltip_lastName")}
                                    value={this.props.user.profile.lastName}
                                    rule={VX.common.lastName}
                                    dbName={"profile.lastName"}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                                <VXInput id="address1"
                                    label={Util.i18n("profile.label_address1")}
                                    tooltip={Util.i18n("profile.tooltip_address1")}
                                    value={this.props.user.profile.address1}
                                    rule={VX.common.address1}
                                    dbName={"profile.address1"}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-6">
                                <VXInput id="address2"
                                    label={Util.i18n("profile.label_address2")}
                                    tooltip={Util.i18n("profile.tooltip_address2")}
                                    value={this.props.user.profile.address2}
                                    rule={VX.common.address2}
                                    dbName={"profile.address2"}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-4">
                                <VXInput id="city"
                                    label={Util.i18n("profile.label_city")}
                                    tooltip={Util.i18n("profile.tooltip_city")}
                                    value={this.props.user.profile.city}
                                    rule={VX.common.city}
                                    dbName={"profile.city"}/>
                            </div>
                            <div className="col-sm-4">
                                <VXSelect id="state"
                                    codeArray={UX.addBlankSelection(this.props.states)}
                                    label={Util.i18n("profile.label_state")}
                                    tooltip={Util.i18n("profile.tooltip_state")}
                                    value={this.props.user.profile.state}
                                    rule={VX.common.state}
                                    _id={this.props.user._id}
                                    collection={Meteor.users}
                                    dbName={"profile.state"}/>
                            </div>
                            <div className="col-sm-3">
                                <VXInput id="zip"
                                    label={Util.i18n("profile.label_zip")}
                                    tooltip={Util.i18n("profile.tooltip_zip")}
                                    value={this.props.user.profile.zip}
                                    rule={VX.common.zip}
                                    format={FX.zipUS}
                                    dbName={"profile.zip"}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-4">
                                <VXInput id="phone"
                                    label={Util.i18n("profile.label_phone")}
                                    tooltip={Util.i18n("profile.tooltip_phone")}
                                    value={this.props.user.profile.phone}
                                    supplementalValues={[ this.props.user.profile.country || "US" ]}
                                    rule={VX.common.phone}
                                    format={FX.phoneUS}
                                    supplement={["country"]}
                                    dbName={"profile.phone"}/>
                            </div>
                            <div className="col-sm-4">
                                <VXInput id="mobile"
                                    label={Util.i18n("profile.label_mobile")}
                                    tooltip={Util.i18n("profile.tooltip_mobile")}
                                    value={this.props.user.profile.mobile}
                                    supplementalValues={[ this.props.user.profile.country || "US" ]}
                                    rule={VX.common.mobile}
                                    format={FX.phoneUS}
                                    supplement={["country"]}
                                    dbName={"profile.mobile"}/>
                            </div>
                        </div>
                        <hr className="hr-dark"/>
                        <VXImage id="profile-image-input"
                            value={this.props.user.profile.photoUrl}
                            imageType="profile"
                            dbName={"profile.photoUrl"}/>
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
