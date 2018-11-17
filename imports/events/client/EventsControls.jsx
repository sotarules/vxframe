import { Component } from "react"
import PropTypes from "prop-types"
import VXForm from "/imports/vx/client/VXForm.jsx"
import VXSelect from "/imports/vx/client/VXSelect.jsx"
import VXDate from "/imports/vx/client/VXDate.jsx"

export default class EventsControls extends Component {

    static propTypes = {
        rowsArray : PropTypes.array.isRequired,
        eventTypes : PropTypes.array.isRequired,
        eventType : PropTypes.string,
        eventRows : PropTypes.number,
        eventEndDate : PropTypes.instanceOf(Date),
        timezone : PropTypes.string.isRequired
    }

    render() {
        return (
            <div className="events-control-container flex-section-fixed">
                <VXForm id="events-control-form">
                    <div id="events-control-row" className="row">
                        <div className="col-sm-2">
                            <div className="events-top-control">
                                <VXSelect id="event-type"
                                    codeArray={this.props.eventTypes}
                                    value={this.props.eventType}
                                    onChange={this.handleChangeEventType.bind(this)}/>
                            </div>
                        </div>
                        <div className="col-sm-2">
                            <div className="events-top-control">
                                <VXSelect id="event-rows"
                                    codeArray={this.props.rowsArray}
                                    value={this.props.eventRows}
                                    onChange={this.handleChangeEventRows.bind(this)}/>
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <div className="events-top-control">
                                <VXDate id={"end-date"}
                                    format="MM/DD/YYYY HH:mm:ss"
                                    value={this.props.eventEndDate}
                                    timezone={this.props.timezone}
                                    onChange={this.handleChangeEndDate.bind(this)}/>
                            </div>
                        </div>
                    </div>
                </VXForm>
            </div>
        )
    }

    handleChangeEventType(event) {
        let eventType = event.target.value;
        OLog.debug("EventsControls.jsx handleChangeEventType eventType=" + eventType);
        Session.set("SELECTED_EVENT_TYPE", eventType);
    }

    handleChangeEventRows(event) {
        let eventRows = parseInt(event.target.value);
        OLog.debug("EventsControls.jsx handleChangeEventRows logRows=" + eventRows);
        Session.set("SELECTED_EVENT_ROWS", eventRows);
    }

    handleChangeEndDate(event) {
        OLog.debug("EventsControls.jsx handleChangeEndDate date=" + event.date);
        Session.set("SELECTED_EVENT_END_DATE", event.date ? event.date.toDate() : null);
    }
}
