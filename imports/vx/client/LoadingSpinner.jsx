import { Component } from "react"
import ReactSpinner from "/imports/vx/client/ReactSpinner"

export default class LoadingSpinner extends Component {

    static opts = {
        zIndex : 0,
        width : 3
    }

    render() {
        return (
            <div className={`flexi-grow position-relative ${this.props.className || ""}`}>
                <ReactSpinner config={ LoadingSpinner.opts }/>
            </div>
        )
    }
}
