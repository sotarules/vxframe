import {Component} from "react"
import PropTypes from "prop-types"
import VXForm from "/imports/vx/client/VXForm"
import VXButton from "/imports/vx/client/VXButton"
import SigninStandardBody from "./SigninStandardBody"
import Signin2FABody from "./Signin2FABody"
import SigninModal from "./SigninModal"

export default class Signin extends Component {

    static propTypes = {
        mode : PropTypes.string.isRequired
    }

    constructor(props) {
        super(props)
        this.state = { requiresTwoFactor: false, email: "", password: "", token: "", doNotAskAgain: false }
    }

    render() {
        return (
            <div className="flexi-grow">
                <div id="signin-container"
                    className="signin-flex-container fade-first notification-container">
                    <div id="signin-panel"
                        className="signin-flex-panel panel panel-default">
                        <div className="panel-body">
                            <VXForm id="signin-form"
                                popoverContainer="body"
                                receiveProps={false}
                                ref={(form) => { this.form = form }}>
                                <div className="panel-padding">
                                    <img id="signin-logo" src={ CX.LOGO_PATH }
                                        className="img-responsive fade-first pull-center"/>
                                    <div className="logo-title">
                                        {Util.i18n("common.label_logo_title")}
                                    </div>
                                    {!this.state.requiresTwoFactor ? (
                                        <SigninStandardBody onEnter={this.handleEnter.bind(this)} />
                                    )  : (
                                        <Signin2FABody onEnter={this.handleEnter.bind(this)} />
                                    )}
                                    <div className="form-group">
                                        <VXButton id="signin-button"
                                            className="btn btn-primary btn-custom btn-block"
                                            onClick={this.handleClickSignin.bind(this)}>
                                            {Util.i18n("login.sign_in")}
                                        </VXButton>
                                    </div>
                                    <div id="forgot-password-container" className="form-group">
                                        <a id="forgot-password" onClick={this.handleClickForgotPassword.bind(this)}>
                                            {Util.i18n("login.forgot_password")}
                                        </a>
                                    </div>
                                </div>
                            </VXForm>
                            <div className="row">
                                <div id="alert-placeholder" className="col-md-12">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    componentDidMount() {
        UX.fireFade()
        if (this.props.mode !== "NORMAL") {
            UX.showModal(<SigninModal mode={this.props.mode}/>)
        }
    }

    handleEnter() {
        const signinButton = UX.findComponentById("signin-button")
        signinButton.start()
        Meteor.setTimeout(() => {
            this.handleClickSignin(() => {
                signinButton.stop()
            })
        })
    }

    handleClickSignin(laddaCallback) {
        try {
            if (!UX.checkForm(this.form)) {
                laddaCallback()
                return
            }
            const formObject = UX.makeFormObject(this.form)
            this.setState({ ...formObject }, () => {
                this.proceedToSignin(laddaCallback)
            })
        }
        catch (error) {
            UX.createAlertLegacy("alert-danger", "login.login_error", { error : error.reason })
            OLog.error(`Signin.jsx handleClickSignin exception=${OLog.errorError(error)}`)
        }
    }

    proceedToSignin(laddaCallback) {
        VXApp.handleSignin(this.state, (error, result) => {
            if (error) {
                if (error.error === "two-factor-required") {
                    UX.clearFade()
                    Meteor.setTimeout(() => {
                        laddaCallback()
                        this.setState( { requiresTwoFactor: true } )
                        Meteor.setTimeout(() => {
                            UX.fireFade()
                        }, 200)
                    }, 350)
                    return
                }
                laddaCallback()
                UX.createAlertLegacy("alert-danger", "login.login_error", { error : error.reason })
                return
            }
            OLog.debug(`Signin.jsx proceedToSignin email=${this.state.email} result=${OLog.debugString(result)}`)
            VXApp.afterLogin()
        })
    }

    handleClickForgotPassword() {
        VXApp.handleForgotPassword(this.form)
    }
}
