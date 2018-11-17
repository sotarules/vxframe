import { Component } from "react"
import PropTypes from "prop-types"
import VXCheck from "/imports/vx/client/VXCheck.jsx"

export default class CheckboxRow extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        label : PropTypes.string.isRequired,
        tooltip : PropTypes.string,
        rowClass : PropTypes.string,
        className : PropTypes.string,
        checked : PropTypes.bool
    }

    render() {
        return (
            <div className={"row " + this.props.rowClass}>
                <div className="col-sm-12">
                    <VXCheck id={this.props.id}
                        label={this.props.label}
                        tooltip={this.props.tooltip}
                        className={this.props.className}
                        checked={this.props.checked}/>
                </div>
            </div>
        )
    }
}
