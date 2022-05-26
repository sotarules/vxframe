import { Component } from "react"
import PropTypes from "prop-types"

export default class VXSpin extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        name : PropTypes.string,
        className : PropTypes.string,
        labelClassName : PropTypes.string,
        type : PropTypes.string,
        placeholder : PropTypes.string,
        label : PropTypes.string,
        star : PropTypes.bool,
        tooltip : PropTypes.string,
        required : PropTypes.bool,
        value : PropTypes.number,
        supplementalValues : PropTypes.array,
        rule : PropTypes.func,
        format : PropTypes.object,
        popoverPlacement : PropTypes.string,
        bindingType : PropTypes.string,
        extra : PropTypes.array,
        supplement : PropTypes.array,
        siblings : PropTypes.array,
        onChange : PropTypes.func,
        tandem : PropTypes.string,
        dbName : PropTypes.string,
        fetchHandler : PropTypes.func,
        updateHandler : PropTypes.func,
        invalidHandler : PropTypes.func,
        modifyHandler : PropTypes.func,
        min : PropTypes.number,
        max : PropTypes.number,
        step : PropTypes.number,
        boostat : PropTypes.number,
        maxboostedstep : PropTypes.number
    }

    static defaultProps = {
        popoverPlacement : "bottom",
        format : FX.trim,
        bindingType : "Integer",
        rule : VX.common.integer,
        min : 0,
        max : 1000000,
        step : 1,
        boostat : 5,
        maxboostedstep : 2000
    }

    constructor(props) {
        super(props)
        this.state = { value : Util.getNullAsEmpty(props.value), error : false, popoverText : null }
        this.originalState = Object.assign({}, this.state)
    }

    reset() {
        this.setState(this.originalState)
    }

    componentDidMount() {
        UX.register(this)
        $(this.getSelector()).TouchSpin({
            min: this.props.min,
            max: this.props.max,
            step: this.props.step,
            boostat: this.props.boostat,
            maxboostedstep: this.props.maxboostedstep,
        });
        if (this.props.value != null) {
            const value = Util.getInteger(this.props.value)
            $(this.getSelector()).val(value)
            this.setValue(value)
        }
        $(this.getSelector()).on("change", function(event) {
            this.doStateChange(event)
        }.bind(this))
    }

    componentWillUnmount() {
        UX.unregister(this)
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (UX.isFormReceiveProps(this) && newProps.hasOwnProperty("value")) {
            //OLog.debug("VXSpin.jsx UNSAFE_componentWillReceiveProps componentId=" + this.props.id + " value=" + newProps.value + " *update*")
            this.setValue(newProps.value)
            $(this.getSelector()).val(newProps.value)
        }
    }

    getSelector() {
        return `#${this.props.id}`
    }

    render() {
        return (
            <div className={"form-group top-touchspin top-fieldbox-header-center" + (this.state.error ? " " + CX.CLASS_HAS_ERROR : "")}>
                {this.props.label &&
                    <label htmlFor={this.props.id}
                        className={`control-label ${this.props.labelClassName || ""}`}
                        title={this.props.tooltip}>
                        <div className="top-label-span">
                            {this.props.label}{" "}
                            {this.props.star &&
                                <span className="fa fa-star-o icon-required"></span>
                            }
                        </div>
                    </label>
                }
                {/* zIndex to 3 so invalid rectangle RHS will be displayed */}
                <input
                    id={this.props.id}
                    name={this.props.name}
                    type={this.props.type || "text"}
                    className={`form-control ${this.props.className || ""}`}
                    style={{ zIndex: 3 }}
                    onChange={this.handleChange.bind(this)}
                    ref={inputElement => { this.inputElement = inputElement } }/>
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
        this.doStateChange(event)
    }

    doStateChange(event) {
        // Focus is necessary because the buttons consume events, preventing other fields from
        // blurring and recording. This is apparent when a VXSpin control is used side-by-side
        // with a VXInput field.
        this.inputElement.focus()
        this.setState({value: event.target.value }, () => {
            UX.validateComponent(this)
            if (this.props.onChange) {
                this.props.onChange(event, this.getValue(), this)
            }
        })
    }
}
