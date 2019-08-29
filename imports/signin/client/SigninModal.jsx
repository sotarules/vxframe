import { Component } from "react"
import PropTypes from "prop-types"
import VXModal from "/imports/vx/client/VXModal"
import ModalHeaderSimple from "/imports/vx/client/ModalHeaderSimple"
import ModalBody from "/imports/vx/client/ModalBody"
import ModalFooterSimple from "/imports/vx/client/ModalFooterSimple"
import VXForm from "/imports/vx/client/VXForm"
import VXInput from "/imports/vx/client/VXInput"

export default class SigninModal extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        mode : PropTypes.oneOf(["ENROLL", "RESET_PASSWORD"]).isRequired
    }

    static defaultProps = {
        id : "signin-modal"
    }

    modeData = {
        ENROLL : {
            title : Util.i18n("login.enroll_account_title"),
            buttonText : Util.i18n("login.button_enroll"),
            handleClick : this.handleClickEnroll
        },
        RESET_PASSWORD : {
            title : Util.i18n("login.reset_password_title"),
            buttonText : Util.i18n("login.button_password_reset"),
            handleClick : this.handleClickResetPassword
        }
    }

    render() {
        return (
            <VXModal id="signin-modal" contentClass="modal-reset-password-content">
                <ModalHeaderSimple title={this.modeData[this.props.mode].title}
                    closeButton={true}/>
                <ModalBody thinPaddingTop={true}>
                    <VXForm id="signin-modal-form"
                        popoverContainer="body"
                        receiveProps={false}
                        ref={(form) => { this.form = form }}>
                        <div className="row">
                            <div className="col-xs-12">
                                <VXInput id="modal-password"
                                    type="password"
                                    popoverPlacement="right"
                                    required={true}
                                    value={""}
                                    label={Util.i18n("login.password")}
                                    placeholder={Util.i18n("login.password")}
                                    rule={VX.login.password}
                                    extra={["modal-confirm-password"]}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12">
                                <VXInput id="modal-confirm-password"
                                    type="password"
                                    popoverPlacement="right"
                                    required={true}
                                    value={""}
                                    label={Util.i18n("login.confirm_password")}
                                    placeholder={Util.i18n("login.confirm_password")}
                                    rule={VX.login.confirm_password}
                                    extra={["modal-password"]}/>
                            </div>
                        </div>
                    </VXForm>
                </ModalBody>
                <ModalFooterSimple buttonText={this.modeData[this.props.mode].buttonText}
                    buttonClassName="btn btn-primary btn-custom btn-block"
                    onClickButton={this.modeData[this.props.mode].handleClick.bind(this)}/>
            </VXModal>
        )
    }

    handleClickEnroll(callback) {

        try {

            if (!UX.checkForm(this.form)) {
                callback(false)
                return
            }

            let token = UX.lastSegment()
            let password = UX.getComponentValue("modal-password")

            OLog.debug("SigninModal.jsx handleClickEnroll information is valid, proceeding with token=" + token + " password=" + password)

            Accounts.resetPassword(token, password, (error) => {

                if (error) {
                    OLog.error("SigninModal.jsx handleClickEnroll Accounts.resetPassword failed, error=" + error)
                    UX.createAlertLegacy("alert-danger", "login.reset_password_error", { error : error.reason })
                    callback(false)
                    return
                }

                let email = Util.getUserEmail(Meteor.userId())

                OLog.debug("SigninModal.jsx handleClickEnroll Accounts.resetPassword success, email=" + email)

                Meteor.users.update(Meteor.userId(), { $set: { "profile.enrolled": true } }, (error) => {

                    if (error) {
                        OLog.error("SigninModal.jsx handleClickEnroll user update failed, email=" + email + " error=" + error)
                        callback(false)
                        return
                    }

                    UX.createAlertLegacy("alert-success", "login.enrollment_success")

                    let emailComponent = UX.findComponentById("email")
                    let passwordComponent = UX.findComponentById("password")

                    emailComponent.setValue(email)
                    passwordComponent.setValue(password)

                    callback(true)
                    return
                })
            })
        }
        catch (error) {
            OLog.error("SigninModal.jsx handleClickEnroll error=" + error)
            callback(false)
            return
        }
    }

    handleClickResetPassword(callback) {

        try {

            if (!UX.checkForm(this.form)) {
                callback(false)
                return
            }

            let token = UX.lastSegment()
            let password = UX.getComponentValue("modal-password")

            OLog.debug("SigninModal.jsx handleClickResetPassword information is valid, proceeding with token=" + token + " password=" + password)

            Accounts.resetPassword(token, password, (error) => {

                if (error) {
                    OLog.error("SigninModal.jsx handleClickResetPassword Accounts.resetPassword failed, error=" + error)
                    UX.createAlertLegacy("alert-danger", "login.reset_password_error", { error : error.reason })
                    callback(false)
                    return
                }

                let email = Util.getUserEmail(Meteor.userId())
                OLog.debug("SigninModal.jsx handleClickResetPassword Accounts.resetPassword success, email=" + email)

                UX.createAlertLegacy("alert-success", "login.reset_password_success")

                let emailComponent = UX.findComponentById("email")
                let passwordComponent = UX.findComponentById("password")
                emailComponent.setValue(email)
                passwordComponent.setValue(password)

                callback(true)
                return
            })
        }
        catch (error) {
            OLog.error("SigninModal.jsx handleClickResetPassword error=" + error)
            callback(false)
            return
        }
    }
}
