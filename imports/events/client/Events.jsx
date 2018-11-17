import { Component } from "react"
import PropTypes from "prop-types"
import EventsControls from "/imports/events/client/EventsControls.jsx"
import EventsTableContainer from "/imports/events/client/EventsTableContainer.jsx"

export default class Events extends Component {

    static propTypes = {
        rowsArray : PropTypes.array.isRequired,
        eventTypes : PropTypes.array.isRequired,
        ready : PropTypes.bool.isRequired,
        eventType : PropTypes.string,
        eventRows : PropTypes.number,
        eventEndDate : PropTypes.instanceOf(Date),
        timezone : PropTypes.string.isRequired
    }

    render() {
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
