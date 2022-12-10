import { Component } from "react"
import PropTypes from "prop-types"

export default class RadioButtonGroup extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        value : PropTypes.string,
        className : PropTypes.string,
        dbName : PropTypes.string,
        onChange : PropTypes.func,
        updateHandler : PropTypes.func,
        modifyHandler : PropTypes.func
    }

    constructor(props) {
        super(props)
        this.state = { value : props.value }
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
                className={"btn-group btn-group-justified btn-group-list-header flex-section-fixed " +
                    `${this.props.className || ""}`}
                data-toggle="buttons">
                {UX.augmentChildren(this.props.children,
                    (child) => child.type.displayName === "RadioButton", {
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
