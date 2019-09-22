import { Component } from "react"
import PropTypes from "prop-types"
import LoadingSpinner from "/imports/vx/client/LoadingSpinner"
import SystemLogControls from "/imports/systemlog/client/SystemLogControls"
import SystemLogTableContainer from "/imports/systemlog/client/SystemLogTableContainer"

export default class SystemLog extends Component {

    static propTypes = {
        ready : PropTypes.bool.isRequired,
        rowsArray : PropTypes.array,
        logLevels : PropTypes.array,
        logLevel : PropTypes.string,
        logRows : PropTypes.number,
        logEndDate : PropTypes.instanceOf(Date),
        searchPhrase : PropTypes.string,
        timezone : PropTypes.string
    }

    render() {
        if (!this.props.ready) {
            return (<LoadingSpinner/>)
        }
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
