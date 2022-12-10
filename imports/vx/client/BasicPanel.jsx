import { Component } from "react"
import PropTypes from "prop-types"
import IOSButtonBarContainer from "/imports/layout/client/IOSButtonBarContainer"

export default class BasicPanel extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired
    }

    static defaultProps = {
        id : "vx-basic-panel"
    }

    render() {
        return (
            <div id={this.props.id} className="animation-panel flexi-grow">
                <IOSButtonBarContainer/>
                <div id="basic-panel-row"
                    className="row conserve-space fill">
                    <div id="basic-panel-column"
                        className="col-xs-12 fill">
                        {this.props.children}
                    </div>
                </div>
            </div>
        )
    }
}
