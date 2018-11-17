import { Component } from "react"
import PropTypes from "prop-types"

export default class SubsystemStatus extends Component {

    static propTypes = {
        record : PropTypes.object.isRequired,
        recordType : PropTypes.string.isRequired
    }

    render() {
        return (
            <span className={this.subsystemStatusClass()} title={this.subsystemStatusMessage()}></span>
        )
    }

    subsystemStatusClass() {
        return VXApp.subsystemStatusClass(this.props.recordType, this.props.record) + " subsystem-status-icon fa fa-square"
    }

    subsystemStatusMessage() {
        return VXApp.subsystemStatusMessage(this.props.recordType, this.props.record)
    }
}
