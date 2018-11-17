import { Component } from "react"
import PropTypes from "prop-types"

export default class VXFieldSet extends Component {

    static propTypes = {
        legend : PropTypes.string.isRequired,
        className : PropTypes.string
    }

    render() {
        return (
            <fieldset className={this.props.className}>
                <legend>{this.props.legend}</legend>
                {this.props.children}
            </fieldset>
        )
    }
}
