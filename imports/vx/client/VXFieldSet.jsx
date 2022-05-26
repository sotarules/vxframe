import { Component } from "react"
import PropTypes from "prop-types"

export default class VXFieldSet extends Component {

    static propTypes = {
        legend : PropTypes.string.isRequired,
        className : PropTypes.string,
        legendClassName : PropTypes.string
    }

    render() {
        return (
            <fieldset className={`flexi-grow ${this.props.className || ""}`}>
                <legend className={this.props.legendClassName}>{this.props.legend}</legend>
                {this.props.children}
            </fieldset>
        )
    }
}
