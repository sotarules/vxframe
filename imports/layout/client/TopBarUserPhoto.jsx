import { Component } from "react"
import PropTypes from "prop-types"

export default class TopBarUserPhoto extends Component {

    static propTypes = {
        photoUrl: PropTypes.string,
        photoTooltip: PropTypes.string
    }

    render() {

        if (!this.props.photoUrl) {
            return null
        }

        return (
            <td className="nav-cell-photo">
                <a id="navbar-profile-image">
                    <div className="decoration-container">
                        <img className="navbar-profile-image" src={this.props.photoUrl} title={this.props.photoTooltip} />
                    </div>
                </a>
            </td>
        )
    }
}
