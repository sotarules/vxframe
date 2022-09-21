import { Component } from "react"
import PropTypes from "prop-types"

export default class VXHTML extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        html: PropTypes.string.isRequired,
        className: PropTypes.string
    }

    shouldComponentUpdate(nextProps,) {
        const identical = this.props.html === nextProps.html
        return !identical
    }

    componentDidMount() {
        this.append()
    }

    componentDidUpdate() {
        this.append()
    }

    render() {
        return (
            <div id={this.props.id}
                className={this.props.className}>
            </div>
        )
    }

    append() {
        $(`#${this.props.id}`).empty()
        $(`#${this.props.id}`).append(this.props.html)
    }
}
