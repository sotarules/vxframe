import { Component } from "react"
import PropTypes from "prop-types"

export default class VXTabPanel extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        itemId : PropTypes.string,
        className : PropTypes.string,
        fade : PropTypes.bool
    }

    static defaultProps = {
        fade : true
    }

    render() {
        return (
            <div id={this.props.id}
                role="tabpanel"
                data-item-id={this.props.itemId}
                className={`vx-list-item tab-pane ${this.props.fade ? "fade" : ""} ` +
                    `flexi-grow ${this.props.className || ""}`}>
                {this.props.children}
            </div>
        )
    }
}
