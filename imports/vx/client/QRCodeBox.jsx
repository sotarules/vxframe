import { Component } from "react"
import PropTypes from "prop-types"

export default class QRCodeBox extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired
    }

    static defaultProps = {
        id : "vx-qr-code-box"
    }

    render() {
        return (
            <div className="qr-code-box">
                {this.props.children}
            </div>
        )
    }
}
