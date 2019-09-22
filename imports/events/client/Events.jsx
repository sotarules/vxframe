import { Component } from "react"
import PropTypes from "prop-types"
import LoadingSpinner from "/imports/vx/client/LoadingSpinner"
import EventsControls from "/imports/events/client/EventsControls"
import EventsTableContainer from "/imports/events/client/EventsTableContainer"

export default class Events extends Component {

    static propTypes = {
        ready : PropTypes.bool.isRequired,
        rowsArray : PropTypes.array,
        eventTypes : PropTypes.array,
        eventType : PropTypes.string,
        eventRows : PropTypes.number,
        eventEndDate : PropTypes.instanceOf(Date),
        timezone : PropTypes.string
    }

    render() {
        if (!this.props.ready) {
            return (<LoadingSpinner/>)
        }
        return (
            <div className="fill flex-section">
                <EventsControls rowsArray={this.props.rowsArray}
                    eventTypes={this.props.eventTypes}
                    eventType={this.props.eventType}
                    eventRows={this.props.eventRows}
                    eventEndDate={this.props.eventEndDate}
                    timezone={this.props.timezone}/>
                {this.props.ready &&
                    <EventsTableContainer/>
                }
            </div>
        )
    }
}
