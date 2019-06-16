import { Component } from "react"
import PropTypes from "prop-types"
import Parser from "html-react-parser"

export default class VXSpan extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string,
        required : PropTypes.bool,
        editable : PropTypes.bool,
        style : PropTypes.object,
        value : PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
        supplementalValues : PropTypes.array,
        rule : PropTypes.func,
        format : PropTypes.object,
        popoverPlacement : PropTypes.string,
        bindingType : PropTypes.string,
        extra : PropTypes.array,
        supplement : PropTypes.array,
        siblings : PropTypes.array,
        onUpdate : PropTypes.func,
        tandem : PropTypes.string,
        dbName : PropTypes.string,
        fetchHandler : PropTypes.func,
        updateHandler : PropTypes.func,
        modifyHandler : PropTypes.func,
        invalidHandler : PropTypes.func,
        missingReset : PropTypes.bool
    }

    static defaultProps = {
        editable : true,
        popoverPlacement : "bottom",
        format : FX.trim,
        missingReset : true
    }

    constructor(props) {
        super(props)
        let value = Util.getNullAsEmpty(Util.toString(UX.render(this, props.value, this.props.supplementalValues)))
        this.state = { value : value, error : false, popoverText : null, editing : false }
        this.originalState = Object.assign({}, this.state)
    }

    reset() {
        this.setState(this.originalState)
    }

    componentDidMount() {
        UX.register(this)
        this.setValue(this.props.value)
    }

    componentWillUnmount() {
        UX.unregister(this)
    }

    componentWillReceiveProps(newProps) {
        //OLog.debug("VXSpan.jsx componentWillReceiveProps newProps=" + OLog.debugString(newProps))
        if (UX.isFormReceiveProps(this) && newProps.hasOwnProperty("value")) {
            //OLog.debug("VXSpan.jsx componentWillReceiveProps value=" + newProps.value + " *update*")
            this.setValue(newProps.value)
        }
    }

    render() {
        return (
            <span id={this.props.id}
                tabIndex={this.props.editable ? "0" : null}
                className={this.className()}
                onClick={this.handleClick.bind(this)}
                onKeyPress={this.handleKeyPress.bind(this)}
                onBlur={this.handleBlur.bind(this)}
                ref={inputElement => {this.inputElement = inputElement }}>
                {this.state.editing ? this.state.value : Parser(this.state.value)}
            </span>
        )
    }

    className() {
        return (this.props.editable ? "span-editable-text" : "span-readonly-text") +
            (this.props.className ? " " + this.props.className : "")
    }

    getValue() {
        return UX.parsedValue(this, UX.strip(this, this.state.value))
    }

    setValue(value) {
        this.setState({value: Util.getNullAsEmpty(Util.toString(UX.render(this, value)))})
    }

    handleClick(event) {
        if (!this.props.editable) {
            return
        }
        let $element = $(event.target)
        this.setState({ editing : true }, () => {
            UX.startEditing($element)
        })
    }

    handleKeyPress(event) {
        if (!this.props.editable) {
            return
        }
        if (event.charCode === 13) {
            UX.stopEditing(true)
            return false
        }
        return true
    }

    handleBlur(event) {
        if (!this.props.editable) {
            return
        }
        let $element = $(event.target)
        let value = $.trim($element.text())
        event.persist()
        this.setState({value: value, editing : false}, () => {
            UX.validateComponent(this)
            if (this.props.onUpdate) {
                this.props.onUpdate(event, this.getValue(), this)
            }
        })
    }
}
