import { Component } from "react"
import PropTypes from "prop-types"

export default class Decoration extends Component {

    static propTypes = {
        iconClassName : PropTypes.string.isRequired,
        color : PropTypes.oneOf(["green", "yellow", "red", "gray", "black", "blue"]).isRequired,
        size : PropTypes.oneOf(["small", "medium"]).isRequired,
        tooltip : PropTypes.string
    }

    render() {
        return (
            <div className={`entity-decoration-${this.props.color}-${this.props.size}`}
                title={this.props.tooltip}>
                <span className={this.props.iconClassName}/>
            </div>
        )
    }
}
