import { Component } from "react"
import PropTypes from "prop-types"

export default class RightBody extends Component {

    static propTypes = {
        className : PropTypes.string.isRequired
    }

    static defaultProps = {
        className : "right-body"
    }

    render() {
        return (
            <div id="right-body" className={`scroll-y scroll-momentum scroll-fix flexi-grow zero-height-hack ${this.props.className || ""}`}>
                {this.props.children}
            </div>
        )
    }
}
