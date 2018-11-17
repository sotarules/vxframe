import { Component } from "react";
import PropTypes from "prop-types";

export default class SystemLogRow extends Component {

    static propTypes = {
        logRow : PropTypes.object.isRequired
    }

    render() {
        return (
            <tr className={this.rowClassName()}>
                <td className="log-cell">
                    <span>{this.formatDateTime()}</span>
                </td>
                <td className="log-cell">
                    <span>{this.formatSource()}</span>
                </td>
                <td className="log-cell">
                    <span>{this.formatDomain()}</span>
                </td>
                <td className="log-cell">
                    <span>{this.formatUser()}</span>
                </td>
                <td className="log-cell">
                    <span>{this.formatSeverity()}</span>
                </td>
                <td className="log-message">
                    <span>{this.formatMessage()}</span>
                </td>
            </tr>
        );
    }

    rowClassName() {

        let row = this.props.logRow;

        if (row.severity === "ERROR" || row.severity === "FATAL") {
            return "log-row-error";
        }

        return row.server ? "log-row-server" : "log-row-client";
    }

    formatDateTime() {
        return moment(this.props.logRow.date).format("MM/DD/YYYY HH:mm:ss.SSS");
    }

    formatSource() {
        return this.props.logRow.server ?
            Util.i18n("log.source_server") :
            Util.i18n("log.source_client");
    }

    formatDomain() {

        let domain = Domains.findOne(this.props.logRow.domain);
        if (!domain) {
            return this.props.logRow.domain;
        }

        return domain.name;
    }

    formatUser() {
        return this.props.logRow.user;
    }

    formatSeverity() {
        return this.props.logRow.severity;
    }

    formatMessage() {
        return this.props.logRow.message;
    }
}

