import { Component } from "react"
import PropTypes from "prop-types"

export default class VXInput extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        name : PropTypes.string,
        autoComplete : PropTypes.string,
        className : PropTypes.string,
        type : PropTypes.string,
        placeholder : PropTypes.string,
        label : PropTypes.string,
        star : PropTypes.bool,
        tooltip : PropTypes.string,
        required : PropTypes.bool,
        disabled : PropTypes.bool,
        value : PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
        supplementalValues : PropTypes.array,
        rule : PropTypes.oneOfType([ PropTypes.func, PropTypes.string ]),
        format : PropTypes.object,
        popoverPlacement : PropTypes.string,
        bindingType : PropTypes.string,
        style : PropTypes.object,
        labelStyle : PropTypes.object,
        extra : PropTypes.array,
        supplement : PropTypes.array,
        siblings : PropTypes.array,
        onChange : PropTypes.func,
        onUpdate : PropTypes.func,
        onEnter : PropTypes.func,
        tandem : PropTypes.string,
        dbName : PropTypes.string,
        fetchHandler : PropTypes.func,
        updateHandler : PropTypes.func,
        invalidHandler : PropTypes.func,
        modifyHandler : PropTypes.func
    }

    static defaultProps = {
        disabled : false,
        popoverPlacement : "bottom",
        format : FX.trim
    }

    constructor(props) {
        super(props)
        this.state = { value : "", error : false, popoverText : null, modified : false, cr : false }
    }

    reset() {
        this.setState(this.originalState)
    }

    componentDidMount() {
        UX.register(this)
        let value = Util.getNullAsEmpty(Util.toString(UX.render(this, this.props.value, this.props.supplementalValues)));
        this.setState({ value : value }, () => {
            this.originalState = Object.assign({}, this.state)
        })
    }

    componentWillUnmount() {
        UX.unregister(this)
    }

    componentWillReceiveProps(newProps) {
        if (UX.isFormReceiveProps(this) && newProps.hasOwnProperty("value")) {
            //OLog.debug("VXInput.jsx componentWillReceiveProps componentId=" + this.props.id + " value=" + newProps.value + " *update*")
            this.setValue(newProps.value)
        }
    }

    render() {
        return (
            <div className={"form-group" + (this.state.error ? " " + CX.CLASS_HAS_ERROR : "")}>
                {this.props.label &&
                    <label htmlFor={this.props.id}
                        className="control-label"
                        style={this.props.labelStyle}
                        title={this.props.tooltip}>
                        {this.props.label}{" "}
                        {this.props.star &&
                            <span className="fa fa-star-o icon-required"></span>
                        }
                    </label>
                }
                <input
                    id={this.props.id}
                    name={this.props.name}
                    autoComplete={this.props.autoComplete}
                    type={this.props.type || "text"}
                    className={`form-control ${this.props.className || ""}`}
                    placeholder={this.props.placeholder}
                    disabled={this.props.disabled}
                    value={this.state.value}
                    style={this.props.style}
                    onChange={this.handleChange.bind(this)}
                    onBlur={this.handleBlur.bind(this)}
                    onKeyPress={this.handleKeyPress.bind(this)}
                    ref={inputElement => { this.inputElement = inputElement } }
                />
            </div>
        )
    }

    getValue() {
        return UX.parsedValue(this, UX.strip(this, this.state.value))
    }

    setValue(value) {
        this.setState({value: Util.getNullAsEmpty(Util.toString(UX.render(this, value)))})
    }

    handleChange(event) {
        event.persist()
        this.setState({value: event.target.value, modified : true }, () => {
            if (this.props.onChange) {
                this.props.onChange(event)
            }
        })
    }

    handleKeyPress(event) {
        if (event.charCode === 13 && !event.shiftKey) {
            this.setState( { cr : true }, () => {
                this.inputElement.blur()
            })
        }
        else {
            this.setState( { cr : false } )
        }
    }

    handleBlur(event) {
        if (this.state.modified) {
            UX.validateComponent(this)
            if (this.props.onUpdate) {
                this.props.onUpdate(event, this.getValue(), this)
            }
            if (this.state.cr) {
                if (this.props.onEnter) {
                    this.props.onEnter(event)
                }
            }
        }
    }
}
