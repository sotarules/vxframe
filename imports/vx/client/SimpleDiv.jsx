import { Component } from "react"
import PropTypes from "prop-types"

export default class SimpleDiv extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired
    }

    render() {
        return (
            <div {...this.props}>
                {this.props.children}
            </div>
        )
    }
}
