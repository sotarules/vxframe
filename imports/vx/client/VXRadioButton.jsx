import { Component } from "react"
import PropTypes from "prop-types"

export default class VXRadioButton extends Component {

    static displayName = "VXRadioButton"

    static propTypes = {
        id : PropTypes.string.isRequired,
        label : PropTypes.string,
        name : PropTypes.string,
        value : PropTypes.string,
        labelClassName : PropTypes.string,
        inputClassName : PropTypes.string,
        disabled : PropTypes.bool,
        tooltip : PropTypes.string,
        onClick : PropTypes.func,
        onChange : PropTypes.func
    }

    render() {
        return (
            <div className={`radio-button ${this.props.className || ""}`}>
                <input id={this.props.id}
                    className={`radio-button-input ${this.props.inputClassName || ""}`}
                    type="radio"
                    name={this.props.name}
                    value={this.props.value}
                    checked={this.checked()}
                    disabled={this.props.disabled}
                    onChange={this.handleChange.bind(this)}/>
                <label title={this.props.tooltip}
                    className={`radio-button-label ${this.props.labelClassName || ""}`}
                    htmlFor={this.props.id}>
                    {this.props.label}
                </label>
                {this.props.children}
            </div>
        )
    }

    handleChange(event) {
        event.persist()
        this.props.setActiveValue(this.props.value)
        if (this.props.onChange) {
            this.props.onChange(event, this.props.value, this)
        }
    }

    checked() {
        const activeValue = this.props.getActiveValue()
        return activeValue === this.props.value ? "checked" : ""
    }
}
