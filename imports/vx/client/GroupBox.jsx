import { Component } from "react"

export default class GroupBox extends Component {

    render() {
        return (
            <div className="top-groupbox">
                {this.props.children}
            </div>
        )
    }
}
