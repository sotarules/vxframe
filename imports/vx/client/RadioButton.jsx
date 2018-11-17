import { Component } from "react"
import PropTypes from "prop-types"
import Parser from "html-react-parser"

export default class RadioButton extends Component {

    static PropTypes = {
        id : PropTypes.string.isRequired,
        text : PropTypes.string.isRequired,
        onClick : PropTypes.func
    }

    render() {
        return (
            <label className={`btn btn-default btn-bound-radio ${this.active()}`}
                onClick={this.handleClick.bind(this)}>
                <input id={this.props.id} type="radio" name="options"/>
                {Parser(this.props.text)}
            </label>
        )
    }

    handleClick(event) {
        event.persist()
        this.props.setActiveButtonId(this.props.id)
        if (this.props.onClick) {
            this.props.onClick(event, this)
        }
    }

    active() {
        return this.props.getActiveButtonId() === this.props.id ? "active" : ""
    }
}
