import {Component} from "react"
import VXInput from "/imports/vx/client/VXInput"
import PropTypes from "prop-types"

export default class SigninStandardBody extends Component {

    static propTypes = {
        onEnter : PropTypes.func.isRequired
    }

    render() {
        return (
            <>
                <VXInput id="email"
                    type="email"
                    autoComplete="email"
                    popoverPlacement="right"
                    required={true}
                    placeholder={Util.i18n("login.email")}
                    rule={VX.login.email}
                    onEnter={this.props.onEnter}/>
                <VXInput id="password"
                    type="password"
                    autoComplete="password"
                    popoverPlacement="right"
                    required={true}
                    placeholder={Util.i18n("login.password")}
                    rule={VX.login.password}
                    onEnter={this.props.onEnter}/>
            </>
        )
    }
}
