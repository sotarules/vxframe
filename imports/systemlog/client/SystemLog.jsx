import { Component } from "react"
import PropTypes from "prop-types"
import SystemLogControls from "/imports/systemlog/client/SystemLogControls"
import SystemLogTableContainer from "/imports/systemlog/client/SystemLogTableContainer"

export default class SystemLog extends Component {

    static propTypes = {
        rowsArray : PropTypes.array.isRequired,
        logLevels : PropTypes.array.isRequired,
        ready : PropTypes.bool.isRequired,
        logLevel : PropTypes.string,
        logRows : PropTypes.number,
        logEndDate : PropTypes.instanceOf(Date),
        searchPhrase : PropTypes.string,
        timezone : PropTypes.string.isRequired
    }

    render() {
        return (
            <div className="fill flex-section">
                <SystemLogControls rowsArray={this.props.rowsArray}
                    logLevels={this.props.logLevels}
                    logLevel={this.props.logLevel}
                    logRows={this.props.logRows}
                    logEndDate={this.props.logEndDate}
                    searchPhrase={this.props.searchPhrase}
                    timezone={this.props.timezone}/>
                {this.props.ready &&
                    <SystemLogTableContainer/>
                }
            </div>
        )
    }
}
