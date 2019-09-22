import { Component } from "react"
import PropTypes from "prop-types"

export default class VXSwitch extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        checked : PropTypes.bool,
        disabled : PropTypes.bool,
        size : PropTypes.string,
        animate : PropTypes.bool,
        color : PropTypes.string,
        onText : PropTypes.string,
        offText : PropTypes.string,
        dbName : PropTypes.string,
        onChange : PropTypes.func,
        updateHandler : PropTypes.func,
        modifyHandler : PropTypes.func
    }

    static defaultProps = {
        disabled : false,
        size : "small",
        animate : true,
        color : "primary",
        onText : Util.i18n("common.switch_on"),
        offText : Util.i18n("common.switch_off"),
    }

    constructor(props) {
        super(props)
        this.state = { checked : !!props.checked }
        this.originalState = Object.assign({}, this.state)
    }

    reset() {
        this.setState(this.originalState, () => {
            $(this.getSelector()).bootstrapSwitch("state", this.state.checked, true)
        })
    }

    componentDidMount() {

        UX.register(this)

        let selector = this.getSelector()
        let checked = !!this.state.checked
        let disabled = !!this.props.disabled

        $(selector).bootstrapSwitch()
        $(selector).bootstrapSwitch("state", checked, true)
        $(selector).bootstrapSwitch("disabled", disabled)

        $(selector).on("switchChange.bootstrapSwitch", (event) => {
            let checked = $(selector).bootstrapSwitch("state")
            this.handleChange(event, checked)
        })

        // These pesky Bootstrap switches have to be rendered invisibly,
        // and then faded in, because their draw logic is will cause a visible
        // jump when the initial state is set.
        Meteor.setTimeout(() => {
            UX.fireFade()
        }, 0)
    }

    componentWillUnmount() {
        UX.unregister(this)
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        let selector = this.getSelector()
        if (UX.isFormReceiveProps(this) && newProps.hasOwnProperty("disabled")) {
            //OLog.debug("VXSwitch.jsx UNSAFE_componentWillReceiveProps componentId=" + this.props.id + " disabled=" + newProps.disabled + " *update*")
            $(selector).bootstrapSwitch("disabled", newProps.disabled)
        }
        if (UX.isFormReceiveProps(this) && newProps.hasOwnProperty("checked")) {
            //OLog.debug("VXSwitch.jsx UNSAFE_componentWillReceiveProps componentId=" + this.props.id + " checked=" + newProps.checked + " *update*")
            this.setValue(newProps.value)
        }
    }

    getSelector() {
        return `#${this.props.id}`
    }

    getValue() {
        return this.state.checked
    }

    setValue(checked) {
        this.setState({value: checked});
        $(this.getSelector()).bootstrapSwitch("state", checked, true)
    }

    render() {
        return (
            <input id={this.props.id}
                type="checkbox"
                name={this.props.id}
                checked={this.state.checked}
                data-size={this.props.size}
                data-animate={this.props.animate}
                data-on-color={this.props.color}
                data-on-text={this.props.onText}
                data-off-text={this.props.offText}
                onChange={()=>{}}/>
        )
    }

    handleChange(event, checked) {
        OLog.debug("VXSwitch.jsx handleChange id=" + this.props.id + " checked=" + checked)
        this.setState({ checked : checked }, () => {
            UX.validateComponent(this)
            if (this.props.onChange) {
                this.props.onChange(this, checked)
            }
        })
    }
}

