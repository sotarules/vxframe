import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import RightBody from "/imports/vx/client/RightBody"
import VXForm from "/imports/vx/client/VXForm"
import VXInput from "/imports/vx/client/VXInput"
import FooterCancelSave from "/imports/vx/client/FooterCancelSave"

export default class ProfileCredentials extends Component {

    static propTypes = {
        user : PropTypes.object.isRequired,
    }

    render() {
        return (
            <RightPanel>
                <RightBody>
                    <VXForm id="profile-credentials-form"
                        ref={(form) => { this.form = form }}
                        className="right-panel-form"
                        autoComplete="on"
                        collection={Meteor.users}
                        receiveProps={false}
                        _id={this.props.user._id}>
                        <div className="row">
                            <div className="col-sm-3">
                                <VXInput id="password"
                                    name="password"
                                    type="password"
                                    label={Util.i18n("profile.label_password")}
                                    tooltip={Util.i18n("profile.tooltip_password")}
                                    required={true}
                                    value={""}
                                    rule={VX.login.password}
                                    fetchHandler={() => {}}
                                    updateHandler={this.updatePassword.bind(this)}
                                    extra={["confirmPassword"]}
                                    tandem="confirmPassword"/>
                            </div>
                            <div className="col-sm-3">
                                <VXInput id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    label={Util.i18n("profile.label_confirm_password")}
                                    tooltip={Util.i18n("profile.tooltip_confirm_password")}
                                    required={true}
                                    value={""}
                                    rule={VX.login.confirm_password}
                                    fetchHandler={() => {}}
                                    updateHandler={() => {}}
                                    extra={["password"]}
                                    tandem="password"/>
                            </div>
                        </div>
                    </VXForm>
                </RightBody>
                <FooterCancelSave ref={(footer) => {this.footer = footer} }
                    id="right-panel-footer"
                    onReset={this.onReset.bind(this)}
                    onSave={this.onSave.bind(this)}
                />
            </RightPanel>
        )
    }

    async updatePassword(component, strippedValue) {
        if (!strippedValue || strippedValue.length === 0) {
            return
        }
        try {
            UX.notify(await UX.call("setPassword", strippedValue))
        }
        catch (error) {
            UX.notifyForError(error)
        }
    }

    onReset() {
        UX.resetForm(this.form)
    }

    onSave(laddaCallback) {
        UX.save(this.form, laddaCallback, true)
    }
}
