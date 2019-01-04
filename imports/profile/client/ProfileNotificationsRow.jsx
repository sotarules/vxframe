import { Component } from "react"
import PropTypes from "prop-types"
import VXCheck from "/imports/vx/client/VXCheck"

export default class ProfileNotificationsRow extends Component {

    static propTypes = {
        user : PropTypes.object.isRequired,
        eventType : PropTypes.string.isRequired,
        description : PropTypes.string.isRequired
    }

    render() {
        return (
            <li className="list-group-item notificationprefs-control-container">
                <div className="notificationprefs-container-small">
                    <table className="notificationprefs-table">
                        <tbody>
                            <tr>
                                <td className="notificationprefs-list-description">
                                    <div className="notificationprefs-text">
                                        {this.props.description}
                                    </div>
                                </td>
                                <td className="notificationprefs-list-right">
                                    <div className="notificationprefs-list-checkboxes">
                                        <VXCheck id={"popup-" + this.props.eventType}
                                            className="notificationprefs-list-checkbox"
                                            label={Util.i18n("profile.label_popup")}
                                            labelClass="notificationprefs-mode-label"
                                            checked={this.isChecked("PNOTIFY", this.props.eventType)}/>
                                        <VXCheck id={"email-" + this.props.eventType}
                                            className="notificationprefs-list-checkbox"
                                            label={Util.i18n("profile.label_email")}
                                            labelClass="notificationprefs-mode-label"
                                            checked={this.isChecked("EMAIL", this.props.eventType)}/>
                                        <VXCheck id={"sms-" + this.props.eventType}
                                            className="notificationprefs-list-checkbox"
                                            label={Util.i18n("profile.label_sms")}
                                            labelClass="notificationprefs-mode-label"
                                            checked={this.isChecked("SMS", this.props.eventType)}/>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </li>
        );
    }

    isChecked(mode, eventType) {
        return Util.isNotificationEnabled(this.props.user, eventType, mode);
    }
}
