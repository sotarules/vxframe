import { Component } from "react"
import PropTypes from "prop-types"

export default class VXTab extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        name : PropTypes.string.isRequired
    }

    render() {
        return this.props.children
    }
}
