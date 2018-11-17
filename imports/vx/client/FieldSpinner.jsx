import { Component } from "react"
import ReactSpinner from "react-spinjs"

export default class FieldSpinner extends Component {

    static opts = {
        zIndex : 0,
        scale : 0.75,
        width : 3
    }

    render() {
        return (
            <div className="field-spinner-outer">
                <div className="field-spinner-container">
                    <ReactSpinner config={ FieldSpinner.opts }/>
                </div>
            </div>
        )
    }
}
