import {Component} from "react"
import { authenticator } from "otplib"
import QRCode from "qrcode.react"
import PropTypes from "prop-types"
import QRCodeBox from "/imports/vx/client/QRCodeBox"
import VXModal from "/imports/vx/client/VXModal"
import VXForm from "/imports/vx/client/VXForm"
import VXInput from "/imports/vx/client/VXInput"
import ModalHeaderImage from "/imports/vx/client/ModalHeaderImage"
import ModalBody from "/imports/vx/client/ModalBody"
import ModalFooterConfirm from "/imports/vx/client/ModalFooterConfirm"

export default class Profile2FAModal extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        secret : PropTypes.string.isRequired
    }

    static defaultProps = {
        id : "profile-2FA-modal"
    }

    render() {
        const user = Util.getUserEmail(Meteor.userId())
        const service = CX.SYSTEM_NAME
        const otpauth = authenticator.keyuri(user, service, this.props.secret)
        return (
            <VXModal id={this.props.id}
                width="600px">
                <ModalHeaderImage imageUrl={Util.getProfileValue("photoUrl")}
                    rounded={true}
                    heading={Util.fetchFullName(Meteor.userId())}
                    subheading={Util.i18n("common.label_enable_two_factor_authentication")}/>
                <ModalBody>
                    <VXForm id={`${this.props.id}-form`}
                        elementType="div"
                        receiveProps={false}
                        _id={Meteor.userId()}
                        ref={(form) => { this.form = form }}>
                        <div className="row margin-top-10">
                            <div className="col-sm-12">
                                <p className="modal-simple-text">
                                    {Util.i18n("common.label_two_factor_authentication_rationale")}
                                </p>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <p className="modal-simple-text">
                                    {Util.i18n("common.label_two_factor_authentication_all_you_need")}
                                </p>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <ul className="modal-simple-text">
                                    <li>{Util.i18n("common.label_two_factor_authentication_google_authenticator")}</li>
                                    <li>{Util.i18n("common.label_two_factor_authentication_microsoft_authenticator")}</li>
                                    <li>{Util.i18n("common.label_two_factor_authentication_authy")}</li>
                                </ul>
                            </div>
                        </div>
                        <div className="row margin-bottom-20">
                            <div className="col-sm-12">
                                <div className="qr-code-box-container">
                                    <QRCodeBox>
                                        <QRCode value={otpauth} level="H" size={256} />
                                    </QRCodeBox>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <p className="modal-simple-text">
                                    {Util.i18n("common.label_two_factor_authentication_scan")}
                                </p>
                            </div>
                        </div>
                        <div className="token-input-container">
                            <VXInput id={`${this.props.id}-token-input`}
                                label={Util.i18n("common.label_2fa_token")}
                                groupClass="top-fieldbox-header-center"
                                className="input-center"
                                value={""}
                                required={true}
                                rule={VX.common.token}
                                format={FX.integer}
                                popoverPlacement="top"
                                dbName="token"/>
                        </div>
                    </VXForm>
                </ModalBody>
                <ModalFooterConfirm onClickConfirm={this.handleClickConfirm.bind(this)}/>
            </VXModal>
        )
    }

    async handleClickConfirm(modalCallback) {
        try {
            if (!UX.checkForm(this.form)) {
                modalCallback(false)
                return
            }
            const formObject = UX.makeFormObject(this.form)
            const result = await UX.call("verifyAndEnableTwoFactor", formObject.token, this.props.secret)
            if (!result.success) {
                modalCallback(false)
                UX.notify(result)
                return
            }
            modalCallback(true)
            UX.notify(result)
        }
        catch (error) {
            UX.notifyForError(error)
        }
    }
}
