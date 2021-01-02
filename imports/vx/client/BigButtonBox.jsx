import { Component } from "react"
import PropTypes from "prop-types"

export default class BigButtonBox extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string
    }

    render() {
        return (
            <div id={this.props.id}
                className={`big-button-box ${this.props.className || ""}`}>
                {this.props.children}
            </div>
        )
    }
}
