import { Component } from "react"

export default class RightPanel extends Component {

    render() {
        return (
            <div className="right-panel flexi-grow">
                {this.props.children}
            </div>
        )
    }
}
