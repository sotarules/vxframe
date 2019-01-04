import { Component } from "react"
import PropTypes from "prop-types"
import VXCheck from "/imports/vx/client/VXCheck"

export default class VXMultiSelect extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        codeArray : PropTypes.array.isRequired,
        label : PropTypes.string,
        labelClass : PropTypes.string,
        star : PropTypes.bool,
        tooltip : PropTypes.string,
        required : PropTypes.bool,
        popoverPlacement : PropTypes.string,
        value : PropTypes.array,
        dbName : PropTypes.string,
        onChange : PropTypes.func,
        updateHandler : PropTypes.func,
        modifyHandler : PropTypes.func
    }

    static defaultProps = {
        popoverPlacement : "bottom"
    }

    constructor(props) {
        super(props)
        OLog.debug("VXMultiSelect.jsx constructor props=" + OLog.debugString(props))
        this.state = { value : props.value }
        this.originalState = Object.assign({}, this.state)
    }

    reset() {
        this.setState(this.originalState)
    }

    componentDidMount() {
        UX.register(this)
    }

    componentWillUnmount() {
        UX.unregister(this)
    }

    componentWillReceiveProps(newProps) {
        if (UX.isFormReceiveProps(this) && newProps.hasOwnProperty("value")) {
            //OLog.debug("VXMultiSelect.jsx componentWillReceiveProps componentId=" + this.props.id + " value=" + newProps.value + " *update*")
            this.setValue(newProps.value)
        }
    }

    getValue() {
        return this.state.value
    }

    setValue(value) {
        this.setState({value: value})
    }

    render() {
        return (
            <div className={"form-group" + (this.state.error ? " " + CX.CLASS_HAS_ERROR : "")}>
                {this.props.label &&
                    <label htmlFor={this.props.id} className="control-label"  title={this.props.tooltip}>
                    {this.props.label}{" "}
                    {this.props.star &&
                        <span className="fa fa-star-o icon-required"></span>
                    }
                    </label>
                }
                <ul id={this.props.id}
                    className="form-control list-group multiselect-list scroll-y scroll-momentum scroll-fix flex-section-grow"
                    ref={inputElement => { this.inputElement = inputElement } }>
                    {this.renderCheckboxes()}
                </ul>
            </div>
        )
    }

    renderCheckboxes() {
        return this.props.codeArray.map(codeObject => (
            <VXCheck id={this.props.id + "-" + codeObject.code}
                key={this.props.id + "-" + codeObject.code}
                code={codeObject.code}
                label={codeObject.localized}
                className="checkbox-singlespace"
                checked={_.contains(this.state.value, codeObject.code)}
                onChange={this.handleChange.bind(this)}/>
        ))
    }

    handleChange(event, checked, component) {
        event.persist()
        let value = this.state.value || []
        if (checked) {
            if (!_.contains(value, component.props.code)) {
                value.push(component.props.code)
            }
        }
        else {
            if (_.contains(value, component.props.code)) {
                value = _.without(value, component.props.code)
            }
        }
        value = value.length > 0 ? value : null
        OLog.debug("VXMutliSelect.jsx handleChange id=" + this.props.id + " checked=" + checked + " code=" + component.props.code + " value=" + value)
        this.setState({ value : value }, () => {
            UX.validateComponent(this)
            if (this.props.onChange) {
                this.props.onChange(event, value, this)
            }
        })
    }
}
