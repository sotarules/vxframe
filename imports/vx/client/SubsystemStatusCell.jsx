import { Component } from "react"
import PropTypes from "prop-types"
import SubsystemStatus from "/imports/vx/client/SubsystemStatus"

export default class SubsystemStatusCell extends Component {

    static propTypes = {
        record : PropTypes.object.isRequired,
        recordType : PropTypes.string.isRequired,
        className : PropTypes.string
    }

    render() {
        return (
            <td className={`subsystem-status-cell table-cell-middle table-cell-center ${this.props.className || ""}`}
                style={this.styles().subsystemStatus}>
                <SubsystemStatus record={this.props.record}
                    recordType={this.props.recordType}/>
            </td>
        )
    }

    styles() {
        return {
            subsystemStatus : { width: "50px" }
        }
    }
}
