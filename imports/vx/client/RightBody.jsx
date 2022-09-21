import { Component } from "react"
import PropTypes from "prop-types"

export default class RightBody extends Component {

    static propTypes = {
        className : PropTypes.string.isRequired,
        scrollable : PropTypes.bool.isRequired,
        scrollClass : PropTypes.string.isRequired
    }

    static defaultProps = {
        className : "right-body",
        scrollable : true,
        scrollClass : "scroll-y"
    }

    render() {
        return (
            <div id="right-body" className={`flexi-grow ${this.scrollClasses()} ${this.props.className || ""}`}>
                {this.props.children}
            </div>
        )
    }

    scrollClasses() {
        return this.props.scrollable ? `${this.props.scrollClass} scroll-momentum zero-height-hack` : ""
    }
}
