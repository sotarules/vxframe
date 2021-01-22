import { Component } from "react"
import PropTypes from "prop-types"

export default class VXRadioButtonGroup extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        name : PropTypes.string,
        value : PropTypes.string,
        dbName : PropTypes.string,
        onChange : PropTypes.func,
        updateHandler : PropTypes.func,
        modifyHandler : PropTypes.func
    }

    constructor(props) {
        super(props)
        this.state = { value : "" }
        this.originalState = Object.assign({}, this.state)
    }

    reset() {
        this.setState(this.originalState)
    }

    componentDidMount() {
        UX.register(this)
        const value = Util.getNullAsEmpty(Util.toString(this.props.value))
        this.setState({ value : value }, () => {
            this.originalState = Object.assign({}, this.state)
        })
    }

    componentWillUnmount() {
        UX.unregister(this)
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (UX.isFormReceiveProps(this) && newProps.hasOwnProperty("value")) {
            OLog.debug(`VXRadioButtonGroup.jsx UNSAFE_componentWillReceiveProps componentId=${this.props.id} `  +
                `value=${newProps.value} *update*`)
            this.setState( { value : newProps.value })
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
            <div id={this.props.id}
                className={this.props.className}>
                {UX.augmentChildren(this.props.children,
                    (child) => child.type.displayName === "VXRadioButton", {
                        name : this.props.name,
                        getActiveValue : () => {
                            return this.getValue()
                        },
                        setActiveValue : (value) => {
                            this.setValue(value)
                        }
                    })}
            </div>
        )
    }
}
