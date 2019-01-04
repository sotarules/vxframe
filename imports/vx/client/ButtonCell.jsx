import { Component } from "react"
import PropTypes from "prop-types"
import VXButton from "/imports/vx/client/VXButton"

export default class ButtonCell extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string,
        cellClassName : PropTypes.string,
        onClick : PropTypes.func,
        text : PropTypes.string,
        iconClass : PropTypes.string,
        style : PropTypes.object,
        large : PropTypes.bool,
        title : PropTypes.string,
        minimumDuration : PropTypes.number
    }

    render() {
        return (
            <td className={`table-cell-center table-cell-middle ${this.props.cellClassName || ""}`}
                style={this.props.style}>
                <VXButton id={this.props.id}
                    title={this.props.title}
                    className={`btn btn-block ${(this.props.large ? "" : "btn-sm")} ${(this.props.className ? this.props.className : "btn-default")}`}
                    iconClass={this.props.iconClass}
                    minimumDuration={this.props.minimumDuration}
                    onClick={this.props.onClick ? this.props.onClick.bind(this) : null}>
                    {this.props.text}
                </VXButton>
            </td>
        )
    }
}
