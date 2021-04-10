import {Component} from "react"
import VXInput from "/imports/vx/client/VXInput"
import PropTypes from "prop-types"
import VXCheck from "/imports/vx/client/VXCheck"

export default class Signin2FABody extends Component {

    static propTypes = {
        onEnter : PropTypes.func.isRequired
    }

    render() {
        return (
            <>
                <p className="small-text input-center margin-top-15 margin-bottom-15">
                    {Util.i18n("common.label_please_enter_code")}
                </p>
                <VXInput id="token"
                    label={Util.i18n("common.label_2fa_token")}
                    groupClass="top-fieldbox-header-center"
                    className="input-center"
                    value={""}
                    required={true}
                    rule={VX.common.token}
                    format={FX.integer}
                    popoverPlacement="top"
                    dbName="token"
                    onEnter={this.props.onEnter}/>
                <VXCheck id="do-not-ask-again"
                    className="margin-bottom-20"
                    labelClass="small-text"
                    label={Util.i18n("common.label_do_not_ask_again")}
                    checked={false}
                    dbName="doNotAskAgain"/>
            </>
        )
    }
}
