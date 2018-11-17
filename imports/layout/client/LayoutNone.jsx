import { Component } from "react"
import PropTypes from "prop-types"
import VXAnchor from "/imports/vx/client/VXAnchor.jsx"

export default class LayoutNone extends Component {

    static propTypes = {
        content : PropTypes.element.isRequired
    }

    render() {
        return (
            <div className="flexi-grow overflow-hidden">
                {this.props.content}
                <VXAnchor/>
            </div>
        )
    }
}
