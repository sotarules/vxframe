import { Component } from "react";
import PropTypes from "prop-types";

export default class EventsRow extends Component {

    static propTypes = {
        eventRow : PropTypes.object.isRequired
    }

    render() {
        return (
            <tr>
                <td className="events-cell">
                    <span>{this.formatDateTime()}</span>
                </td>
                <td className="events-cell">
                    <span>{this.formatType()}</span>
                </td>
                <td className="events-cell">
                    <span>{this.formatDomain()}</span>
                </td>
                <td className="events-key">
                    <span>{this.formatEventData()}</span>
                </td>
            </tr>
        );
    }

    formatDateTime() {
        return moment(this.props.eventRow.date).format("MM/DD/YYYY HH:mm:ss.SSS");
    }

    formatType() {
        return this.props.eventRow.type;
    }

    formatDomain() {

        let domain = Domains.findOne(this.props.eventRow.domain);
        if (!domain) {
            return this.props.eventRow.domain;
        }

        return domain.name;
    }

    formatEventData() {
        return EJSON.stringify(this.props.eventRow.eventData);
    }
}

