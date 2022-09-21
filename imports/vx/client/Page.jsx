import { Component } from "react"
import PropTypes from "prop-types"

export default class Page extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired
    }

    render() {
        return (
            <div id={this.props.id}
                className="page-top page-margin">
                {this.props.children}
            </div>
        )
    }
}
