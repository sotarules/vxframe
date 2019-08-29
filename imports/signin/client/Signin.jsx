import { Component } from "react"
import PropTypes from "prop-types"
import VXForm from "/imports/vx/client/VXForm"
import VXInput from "/imports/vx/client/VXInput"
import VXButton from "/imports/vx/client/VXButton"
import SigninModal from "/imports/signin/client/SigninModal"

export default class Signin extends Component {

    static propTypes = {
        mode : PropTypes.string.isRequired
    }

    state = { email : "", password : "" }

    render() {
        return (
            <div className="flexi-grow">
                <div id="signin-composite" className="signin-flex-container fade-first notification-container">
                    <div id="signin-panel" className="signin-flex-panel panel panel-default">
                        <div className="panel-body">
                            <VXForm id="signin-form"
                                popoverContainer="body"
                                ref={(form) => { this.form = form }}>
                                <div className="panel-padding">
                                    <img id="signin-logo" src={ CX.LOGO_PATH }
                                        className="img-responsive fade-first pull-center"/>
                                    <div className="logo-title">
                                        {Util.i18n("common.label_logo_title")}
                                    </div>
                                    <VXInput id="email"
                                        type="email"
                                        autoComplete="email"
                                        popoverPlacement="right"
                                        required={true}
                                        value={this.state.email}
                                        placeholder={Util.i18n("login.email")}
                                        rule={VX.login.email}
                                        onChange={this.handleChangeEmail.bind(this)}
                                        onEnter={this.handleEnter.bind(this)}/>
                                    <VXInput id="password"
                                        type="password"
                                        autoComplete="password"
                                        popoverPlacement="right"
                                        required={true}
                                        value={this.state.password}
                                        placeholder={Util.i18n("login.password")}
                                        rule={VX.login.password}
                                        onChange={this.handleChangePassword.bind(this)}
                                        onEnter={this.handleEnter.bind(this)}/>
                                    <div className="form-group">
                                        <VXButton id="signin-button"
                                            className="btn btn-primary btn-custom btn-block"
                                            data-style="zoom-in"
                                            onClick={this.handleClickSignin.bind(this)}>
                                            {Util.i18n("login.sign_in")}
                                        </VXButton>
                                    </div>
                                </div>
                                <div id="forgot-password-container" className="form-group">
                                    <a id="forgot-password" onClick={this.handleClickForgotPassword.bind(this)}>
                                        {Util.i18n("login.forgot_password")}
                                    </a>
                                </div>
                            </VXForm>
                            <div className="row">
                                <div id="alert-placeholder" className="col-md-12"></div>
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

    handleChangeEmail(event) {
        this.setState({email : event.target.value})
    }

    handleChangePassword(event) {
        this.setState({password : event.target.value})
    }

    handleEnter() {
        let signinButton = UX.findComponentById("signin-button")
        signinButton.start()
        this.handleClickSignin(() => {
            signinButton.stop()
        })
    }

    handleClickSignin(callback) {
        try {
            if (!UX.checkForm(this.form)) {
                callback()
                return
            }
            let email = UX.getComponentValue("email")
            let password = UX.getComponentValue("password")
            Meteor.loginWithPassword(email, password, (error) => {
                if (error) {
                    OLog.debug(`Signin.jsx handleClickSignin Meteor.loginWithPassword failed, email=${email} error=${error}`)
                    UX.createAlertLegacy("alert-danger", "login.login_error", { error : error.reason })
                    callback()
                    return
                }
                OLog.debug(`Signin.jsx handleClickSignin Meteor.loginWithPassword success, email=${email}`)
                VXApp.afterLogin()
            })
        }
        catch (error) {
            OLog.error("Signin.jsx handleClickSignin error=" + error)
        }
    }

    handleClickForgotPassword() {
        try {
            if (!UX.checkForm(this.form, [ "password" ] )) {
                return
            }
            let email = UX.getComponentValue("email")
            OLog.debug("Signin.jsx handleClickForgotPassword email=" + email)
            Meteor.call("findUserInsensitive", email, (error, user) => {
                if (error) {
                    OLog.debug("Signin.jsx handleClickForgotPassword findUserInsensitive failed, attempted email=" + email + " error=" + error)
                    UX.createAlertLegacy("alert-danger", "login.forgot_password_error", { error : error.reason })
                    return
                }
                let emailEffective = (user ? user.username : email)
                Accounts.forgotPassword( { email : emailEffective }, (error) => {
                    if (error) {
                        OLog.debug("Signin.jsx handleClickForgotPassword Accounts.forgotPassword failed, attempted email=" + emailEffective + " error=" + error)
                        UX.createAlertLegacy("alert-danger", "login.forgot_password_error", { error : error.reason })
                        return
                    }
                    UX.createAlertLegacy("alert-info", "login.reset_password_sent", { email : emailEffective })
                })
            })
        }
        catch (error) {
            OLog.error("Signin.jsx handleClickForgotPassword exception=" + error)
        }
    }
}
