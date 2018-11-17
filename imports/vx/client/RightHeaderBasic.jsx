import { Component } from "react"

export default class RightHeaderBasic extends Component {

    render() {
        return (
            <div className="top-header flexi-fixed">
                {this.props.children}
            </div>
        )
    }
}
