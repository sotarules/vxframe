import { Component } from "react"
import PropTypes from "prop-types"

export default class TopBarSubsystemStatus extends Component {

    static propTypes = {
        name: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        statusIconClass: PropTypes.string.isRequired
    }

    render() {
        return (
            <div className="nav-cell-status-group">
                <div className="nav-cell-status-name" title={this.props.message}>{this.props.name}</div>
                {" "}
                <div className={this.props.statusIconClass} title={this.props.message}></div>
            </div>
        )
    }
}
