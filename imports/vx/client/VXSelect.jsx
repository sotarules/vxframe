import { Component } from "react"
import PropTypes from "prop-types"
import FieldSpinner from "/imports/vx/client/FieldSpinner"

export default class VXSelect extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        codeArray : PropTypes.array.isRequired,
        name : PropTypes.string,
        label : PropTypes.string,
        groupClass : PropTypes.string,
        className : PropTypes.string,
        star : PropTypes.bool,
        tooltip : PropTypes.string,
        required : PropTypes.bool,
        disabled : PropTypes.bool,
        value : PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
        rule : PropTypes.oneOfType([ PropTypes.func, PropTypes.string ]),
        format : PropTypes.object,
        popoverPlacement : PropTypes.string,
        bindingType : PropTypes.string,
        style : PropTypes.object,
        labelStyle : PropTypes.object,
        extra : PropTypes.array,
        supplement : PropTypes.func,
        siblings : PropTypes.array,
        inline : PropTypes.bool,
        onChange : PropTypes.func,
        tandem : PropTypes.func,
        dbName : PropTypes.string,
        fetchHandler : PropTypes.func,
        updateHandler : PropTypes.func,
        invalidHandler : PropTypes.func,
        modifyHandler : PropTypes.func
    }

    static defaultProps = {
        disabled : false,
        popoverPlacement : "bottom",
        style : {paddingLeft: "4px", paddingRight: "4px"}
    }

    constructor(props) {
        super(props)
        this.state = { value : "", codeArray : [], error : false, popoverText : null, loading : false }
    }

    reset() {
        this.setState(this.originalState)
    }

    componentDidMount() {
        UX.register(this)
        let value = Util.getNullAsEmpty(Util.toString(this.props.value))
        this.setState({ value : value, codeArray : this.props.codeArray }, () => {
            this.originalState = Object.assign({}, this.state)
        })
    }

    componentWillUnmount() {
        UX.unregister(this)
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (UX.isFormReceiveProps(this)) {
            if (newProps.hasOwnProperty("value")) {
                //OLog.debug(`VXSelect.jsx UNSAFE_componentWillReceiveProps componentId=${this.props.id} value=${newProps.value} *update*`)
                this.setValue(newProps.value)
            }
            if (newProps.hasOwnProperty("codeArray")) {
                //OLog.debug(`VXSelect.jsx UNSAFE_componentWillReceiveProps componentId=${this.props.id} codeArray=${OLog.debugString(newProps.codeArray)} *update*`)
                this.setCodeArray(newProps.codeArray)
            }
        }
    }

    getValue() {
        return UX.parsedValue(this, this.state.value)
    }

    setValue(value) {
        this.setState({value: Util.getNullAsEmpty(Util.toString(value))})
    }

    setLoading(loading, callback) {
        this.setState({loading: loading}, callback)
    }

    getCodeArray() {
        return this.state.codeArray
    }

    setCodeArray(codeArray) {
        this.setState({ codeArray: codeArray })
    }

    render() {
        return !this.props.inline ? this.renderStandard() : this.renderInline()
    }

    renderStandard() {
        return (
            <div className={`form-group ${this.state.error ? " " + CX.CLASS_HAS_ERROR : ""} ${this.props.groupClass || ""}`}>
                {this.props.label &&
                    <label htmlFor={this.props.id}
                        className="control-label"
                        title={this.props.tooltip}
                        style={this.props.labelStyle}>
                        <div className="top-label-span">
                            {this.props.label}{" "}
                            {this.props.star &&
                                <span className="fa fa-star-o icon-required"></span>
                            }
                        </div>
                        {""}
                    </label>
                }
                {!this.state.loading ? (
                    <select id={this.props.id}
                        name={this.props.id}
                        className={`form-control ${this.props.className || ""}`}
                        value={this.state.value}
                        disabled={this.props.disabled}
                        onChange={this.handleChange.bind(this)}
                        style={this.props.style}
                        ref={inputElement => { this.inputElement = inputElement } }>
                        {this.renderOptions()}
                    </select>
                ) : (
                    <div className={`form-group ${this.props.className || ""}`}>
                        <FieldSpinner/>
                    </div>
                )}
            </div>
        )
    }

    renderInline() {
        return (
            <select id={this.props.id}
                name={this.props.id}
                className={`form-control form-no-label select-xs input-inline ${this.props.className || ""}`}
                value={this.state.value}
                disabled={this.props.disabled}
                onChange={this.handleChange.bind(this)}
                style={this.props.style}
                ref={inputElement => { this.inputElement = inputElement } }>
                {this.renderOptions()}
            </select>
        )
    }

    renderOptions() {
        return this.state.codeArray.map(codeObject => (
            <option key={codeObject.code} value={codeObject.code}>{codeObject.localized}</option>
        ))
    }

    handleChange(event) {
        OLog.debug(`VXSelect.jsx handleChange id=${this.props.id} value=${event.target.value}`)
        event.persist()
        this.setState({value: event.target.value}, () => {
            UX.validateComponent(this)
            if (this.props.onChange) {
                this.props.onChange(event, this.getValue(), this)
            }
        })
    }
}
