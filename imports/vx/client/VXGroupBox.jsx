import { Component } from "react"
import PropTypes from "prop-types"

export default class VXGroupBox extends Component {

    static propTypes = {
        legend : PropTypes.string.isRequired,
        className : PropTypes.string,
        legendClassName : PropTypes.string
    }

    render() {
        return (
            <fieldset className={`group-fieldset ${this.props.className} || ""}`}>
                <legend className={`group-legend ${this.props.className} || ""}`}>
                    {this.props.legend}
                </legend>
                {this.props.children}
            </fieldset>
        )
    }
}
