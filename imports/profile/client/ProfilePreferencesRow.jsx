import { Component } from "react";
import PropTypes from "prop-types";
import VXSwitch from "/imports/vx/client/VXSwitch.jsx";

export default class ProfilePreferencesRow extends Component {

    static propTypes = {
        user : PropTypes.object.isRequired,
        preferenceDefinition : PropTypes.string.isRequired,
        description : PropTypes.string.isRequired
    }

    render() {
        return (
            <li className="list-group-item preferences-control-container">
                <div className="preferences-container-small">
                    <table className="preferences-table">
                        <tbody>
                            <tr>
                                <td className="preferences-list-description">
                                    <div className="preferences-text">
                                        {this.props.description}
                                    </div>
                                </td>
                                <td className="preferences-list-right fade-first">
                                    <div className="preferences-control pull-right">
                                        <VXSwitch id={"pserver-" + this.props.preferenceDefinition}
                                            checked={this.isChecked()}/>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </li>
        );
    }

    isChecked() {
        return Util.fetchStandardPreferenceValue(this.props.user, this.props.preferenceDefinition);
    }
}
