import { Component } from "react"
import PropTypes from "prop-types"

export default class VXTinyButton extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        iconClassName : PropTypes.string.isRequired,
        className : PropTypes.string,
        onClick : PropTypes.func
    }

    render() {
        return (
            <a id={this.props.id}
                className={`btn btn-default btn-xs btn-small-icon-choose ${this.props.className}`}
                onClick={this.handleClick.bind(this)}>
                <span className={`fa fa-sm ${this.props.iconClassName}`}></span>
            </a>
        )
    }

    handleClick(event) {
        OLog.debug(`VXTinyButton.jsx handleClick id=${this.props.id}`)
        event.persist()
        if (this.props.onClick) {
            this.props.onClick(event, this)
        }
    }
}
