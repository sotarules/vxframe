import { Component } from "react"
import ReactSpinner from "react-spinjs"

export default class LoadingSpinner extends Component {

    static opts = {
        zIndex : 0,
        width : 3
    }

    render() {
        return (
            <div className="flexi-grow">
                <ReactSpinner config={ LoadingSpinner.opts }/>
            </div>
        )
    }
}
