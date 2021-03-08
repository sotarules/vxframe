import { Component } from "react"
import PropTypes from "prop-types"

export default class Decoration extends Component {

    static propTypes = {
        iconClassName : PropTypes.string.isRequired,
        color : PropTypes.oneOf(["green", "yellow", "red", "gray", "black", "blue"]).isRequired,
        size : PropTypes.oneOf(["small", "medium"]).isRequired,
        tooltip : PropTypes.string,
        position : PropTypes.oneOf(["upper-left", "upper-right", "lower-left", "lower-right"]).isRequired
    }

    static defaultProps = {
        position : "upper-left"
    }

    render() {
        return (
            <div className={this.decorationClassName()}
                title={this.props.tooltip}>
                <span className={this.props.iconClassName}/>
            </div>
        )
    }

    decorationClassName() {
        return `entity-decoration-${this.props.color}-${this.props.size} ` +
            `entity-decoration-${this.props.size}-${this.props.position}`
    }
}
