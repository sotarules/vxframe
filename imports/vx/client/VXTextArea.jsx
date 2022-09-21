import { Component } from "react"
import PropTypes from "prop-types"

export default class TextArea extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        name : PropTypes.string,
        autoComplete : PropTypes.string,
        groupClass : PropTypes.string,
        className : PropTypes.string,
        type : PropTypes.string,
        placeholder : PropTypes.string,
        label : PropTypes.string,
        star : PropTypes.bool,
        tooltip : PropTypes.string,
        required : PropTypes.bool,
        disabled : PropTypes.bool,
        readOnly : PropTypes.bool,
        value : PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
        supplementalValues : PropTypes.array,
        rule : PropTypes.oneOfType([ PropTypes.func, PropTypes.string ]),
        format : PropTypes.object,
        rows : PropTypes.number,
        resize : PropTypes.bool,
        popoverPlacement : PropTypes.string,
        bindingType : PropTypes.string,
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
        popoverPlacement : "bottom",
        format : FX.trim,
        rows : 4,
        resize : true
    }

    constructor(props) {
        super(props)
        this.state = { value : "", error : false, popoverText : null, modified : false, cr : false, editing : false }
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

    UNSAFE_componentWillReceiveProps(newProps) {
        if (UX.isFormReceiveProps(this) && newProps.hasOwnProperty("value")) {
            //OLog.debug("VXTextArea.jsx UNSAFE_componentWillReceiveProps componentId=" + this.props.id + " value=" + newProps.value + " *update*")
            this.setValue(newProps.value)
        }
    }

    render() {
        return (
            <div className={`form-group ${this.state.error ? " " + CX.CLASS_HAS_ERROR : ""} ${this.props.groupClass || ""}`}>
                {this.props.label &&
                    <label htmlFor={this.props.id} className="control-label"  title={this.props.tooltip}>
                        {this.props.label}{" "}
                        {this.props.star &&
                            <span className="fa fa-star-o icon-required"></span>
                        }
                    </label>
                }
                <textarea
                    id={this.props.id}
                    name={this.props.name}
                    rows={this.props.rows}
                    style={this.style()}
                    className={`form-control ${this.props.className || ""}`}
                    placeholder={this.props.placeholder}
                    disabled={this.props.disabled}
                    readOnly={this.props.readOnly}
                    value={this.state.value}
                    onChange={this.handleChange.bind(this)}
                    onMouseDown={this.handleMouseDown.bind(this)}
                    onBlur={this.handleBlur.bind(this)}
                    onKeyPress={this.handleKeyPress.bind(this)}
                    ref={inputElement => { this.inputElement = inputElement } }
                />
            </div>
        )
    }

    style() {
        return this.props.resize ? null : { resize: "none" }
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
                this.props.onChange(event, this.getValue(), this)
            }
        })
    }

    handleMouseDown(event) {
        // Do not focus the control if the user is right clicking (e.g., show context menu)
        if (event.button === 2) {
            event.preventDefault()
        }
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
