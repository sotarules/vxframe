import { Component } from "react"
import PropTypes from "prop-types"
import EventsRow from "/imports/events/client/EventsRow"

export default class EventsTable extends Component {

    static propTypes = {
        eventRows: PropTypes.array.isRequired
    }

    render() {
        return (
            <div className="flexi-grow scroll-both scroll-momentum zero-height-hack">
                <table className="events-table">
                    <tbody>
                        {this.renderLogRows()}
                    </tbody>
                </table>
            </div>
        )
    }

    renderLogRows() {
        return this.props.eventRows.map(eventRow => (
            <EventsRow key={eventRow._id} eventRow={eventRow}/>
        ))
    }
}
