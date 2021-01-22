import { Component } from "react"
import PropTypes from "prop-types"
import Parser from "html-react-parser"

export default class RadioButton extends Component {

    static displayName = "RadioButton"

    static propTypes = {
        id : PropTypes.string.isRequired,
        text : PropTypes.string.isRequired,
        name : PropTypes.string,
        value : PropTypes.string,
        labelClassName : PropTypes.string,
        inputClassName : PropTypes.string,
        onClick : PropTypes.func
    }

    static defaultProps = {
        name : "options"
    }

    render() {
        return (
            <label className={`btn btn-default btn-bound-radio ${this.active()} ${this.props.labelClassName || ""}`}
                onClick={this.handleClick.bind(this)}>
                <input id={this.props.id}
                    className={this.props.inputClassName}
                    type="radio"
                    name={this.props.name}
                    value={this.props.value}/>
                {Parser(this.props.text)}
            </label>
        )
    }

    handleClick(event) {
        event.persist()
        this.props.setActiveValue(this.props.value)
        if (this.props.onClick) {
            this.props.onClick(event, this)
        }
    }

    active() {
        const activeValue = this.props.getActiveValue()
        return activeValue === this.props.value ? "active" : ""
    }
}
