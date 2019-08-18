import { Component } from "react"
import PropTypes from "prop-types"

export default class VXCheck extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        checked : PropTypes.bool,
        label : PropTypes.string,
        labelClass : PropTypes.string,
        disabled : PropTypes.bool,
        tooltip : PropTypes.string,
        dbName : PropTypes.string,
        onChange : PropTypes.func,
        updateHandler : PropTypes.func,
        modifyHandler : PropTypes.func,
    }

    constructor(props) {
        super(props)
        this.state = { checked : !!props.checked }
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

    UNSAFE_componentWillReceiveProps(newProps) {
        if (UX.isFormReceiveProps(this) && newProps.hasOwnProperty("checked")) {
            //OLog.debug("VXCheck.jsx UNSAFE_componentWillReceiveProps checked=" + newProps.checked + " *update*")
            this.setValue(!!newProps.checked)
        }
    }

    getValue() {
        return this.state.checked
    }

    setValue(checked) {
        this.setState({checked: !!checked})
    }

    render() {
        return (
            <div className={`checkbox ${this.props.className || ""}`}>
                <label title={this.props.tooltip} className={this.props.labelClass}>
                    <input id={this.props.id}
                        type="checkbox"
                        checked={this.state.checked}
                        disabled={this.props.disabled}
                        onChange={this.handleChange.bind(this)}/>
                    {this.props.label}
                </label>
            </div>
        )
    }

    handleChange(event) {
        OLog.debug("VXCheck.jsx handleChange id=" + this.props.id + " checked=" + event.target.checked)
        event.persist()
        this.setState({ checked : event.target.checked }, () => {
            UX.validateComponent(this)
            if (this.props.onChange) {
                this.props.onChange(event, this.getValue(), this)
            }
        })
    }
}
