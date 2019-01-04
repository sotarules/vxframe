import { Component } from "react"
import PropTypes from "prop-types"
import SystemLogRow from "/imports/systemlog/client/SystemLogRow"

export default class SystemLogTable extends Component {

    static propTypes = {
        logRows: PropTypes.array.isRequired
    }

    render() {
        return (
            <div className="flexi-grow scroll-both scroll-momentum zero-height-hack">
                <table className="log-table">
                    <tbody>
                        {this.renderLogRows()}
                    </tbody>
                </table>
            </div>
        )
    }

    renderLogRows() {
        return this.props.logRows.map(logRow => (
            <SystemLogRow key={logRow._id} logRow={logRow}/>
        ))
    }
}
