import { Component } from "react"

export default class NavList extends Component {

    render() {
        return (
            <div id="section-list-left" className="list-group scroll-y scroll-momentum search-select-defeat flexi-grow">
                {this.props.children}
            </div>
        )
    }
}
