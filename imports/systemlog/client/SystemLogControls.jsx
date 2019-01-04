import { Component } from "react"
import PropTypes from "prop-types"
import VXForm from "/imports/vx/client/VXForm"
import VXSelect from "/imports/vx/client/VXSelect"
import VXInput from "/imports/vx/client/VXInput"
import VXDate from "/imports/vx/client/VXDate"
import { setSelectedLogLevel } from "/imports/vx/client/code/actions"
import { setSelectedLogRows } from "/imports/vx/client/code/actions"
import { setSelectedLogEndDate } from "/imports/vx/client/code/actions"
import { setSearchPhrase } from "/imports/vx/client/code/actions"

export default class SystemLogControls extends Component {

    static propTypes = {
        rowsArray : PropTypes.array.isRequired,
        logLevels : PropTypes.array.isRequired,
        logLevel : PropTypes.string,
        logRows : PropTypes.number,
        logEndDate : PropTypes.instanceOf(Date),
        searchPhrase : PropTypes.string,
        timezone : PropTypes.string.isRequired
    }

    render() {
        return (
            <div className="log-control-container flex-section-fixed">
                <VXForm id="system-log-controls-form">
                    <div id="log-control-row" className="row">
                        <div className="col-sm-2">
                            <div className="log-top-control">
                                <VXSelect id="log-level"
                                    codeArray={this.props.logLevels}
                                    value={this.props.logLevel}
                                    onChange={this.handleChangeLogLevel.bind(this)}/>
                            </div>
                        </div>
                        <div className="col-sm-2">
                            <div className="log-top-control">
                                <VXSelect id="log-rows"
                                    codeArray={this.props.rowsArray}
                                    value={this.props.logRows}
                                    onChange={this.handleChangeLogRows.bind(this)}/>
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <div className="log-top-control">
                                <VXDate id={"end-date"}
                                    format="MM/DD/YYYY HH:mm:ss"
                                    value={this.props.logEndDate}
                                    timezone={this.props.timezone}
                                    onChange={this.handleChangeEndDate.bind(this)}/>
                            </div>
                        </div>
                        <div className="col-sm-3">
                            <div className="log-top-control">
                                <VXInput id="search-phrase"
                                    placeholder={Util.i18n("common.label_search_ellipsis")}
                                    value={this.props.searchPhrase}
                                    onUpdate={this.handleUpdateSearchPhrase.bind(this)}/>
                            </div>
                        </div>
                    </div>
                </VXForm>
            </div>
        )
    }

    handleChangeLogLevel(event) {
        let logLevel = event.target.value
        OLog.debug("SystemLogControls.jsx handleChangeLogLevel logLevel=" + logLevel)
        Store.dispatch(setSelectedLogLevel(logLevel))
    }

    handleChangeLogRows(event) {
        let logRows = parseInt(event.target.value);
        OLog.debug("SystemLogControls.jsx handleChangeLogRows logRows=" + logRows)
        Store.dispatch(setSelectedLogRows(logRows))
    }

    handleChangeEndDate(event) {
        OLog.debug("SystemLogControls.jsx handleChangeEndDate date=" + event.date)
        Store.dispatch(setSelectedLogEndDate(event.date ? event.date.toDate() : null))
    }

    handleUpdateSearchPhrase(event) {
        OLog.debug("SystemLogControls.jsx handleUpdateSearchPhrase value=" + event.target.value)
        Store.dispatch(setSearchPhrase(Util.getEmptyAsNull(event.target.value)))
    }
}
