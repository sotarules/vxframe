import { Component } from "react"
import PropTypes from "prop-types"
import Parser from "html-react-parser"

export default class TextCell extends Component {

    static propTypes = {
        id : PropTypes.string,
        className : PropTypes.string,
        textClassName : PropTypes.string,
        style : PropTypes.object,
        value : PropTypes.string
    }

    render() {
        return (
            <td id={this.props.id}
                className={this.props.className}
                style={this.props.style}>
                <span className={this.props.textClassName}>
                    {Parser(this.props.value)}
                </span>
            </td>
        )
    }
}
