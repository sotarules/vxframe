import { Component } from "react"
import PropTypes from "prop-types"
import Parser from "html-react-parser"

export default class VXSpan extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        elementType : PropTypes.string,
        className : PropTypes.string,
        required : PropTypes.bool,
        editable : PropTypes.bool,
        selectText : PropTypes.bool,
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
        elementType : "span",
        editable : true,
        selectText : false,
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

    UNSAFE_componentWillReceiveProps(newProps) {
        if (UX.isFormReceiveProps(this) && newProps.hasOwnProperty("value")) {
            this.setValue(newProps.value)
        }
    }

    render() {
        const SpanElement = this.props.elementType
        return (
            <SpanElement id={this.props.id}
                tabIndex={this.props.editable && this.state.editing ? "0" : null}
                className={this.className()}
                onDoubleClick={this.handleDoubleClick.bind(this)}
                onKeyDown={this.handleKeyDown.bind(this)}
                onBlur={this.handleBlur.bind(this)}
                ref={inputElement => {this.inputElement = inputElement }}>
                {this.state.editing ? this.state.value : Parser(this.state.value.toString())}
            </SpanElement>
        )
    }

    className() {
        return (this.props.editable ? "span-editable-text" : "span-readonly-text") +
            (this.props.className ? ` ${this.props.className}` : "")
    }

    getValue() {
        return UX.parsedValue(this, UX.strip(this, this.state.value))
    }

    setValue(value) {
        this.setState({value: Util.getNullAsEmpty(Util.toString(UX.render(this, value)))})
    }

    startEditing(selectText) {
        const $element = $(this.inputElement)
        this.setState({ editing : true }, () => {
            UX.startEditing($element, selectText)
        })
    }

    stopEditing(blur) {
        const $element = $(this.inputElement)
        UX.stopEditing($element, blur)
    }

    handleDoubleClick() {
        if (this.props.editable) {
            this.startEditing(this.props.selectText)
        }
    }

    handleKeyDown(event) {
        if (!this.props.editable) {
            return
        }
        if (event.keyCode === 27) {
            const $element = $(event.target)
            $element.text(this.originalState.value)
            this.stopEditing(true)
            this.escape = true
            return false
        }
        if (event.keyCode === 13) {
            this.stopEditing(true)
            return false
        }
        return true
    }

    handleBlur(event) {
        if (!this.props.editable) {
            return
        }
        if (this.escape) {
            this.escape = false
            return
        }
        const $element = $(event.target)
        const value = $.trim($element.text())
        event.persist()
        this.stopEditing()
        this.setState({value: value, editing : false}, () => {
            UX.validateComponent(this)
            if (this.props.onUpdate) {
                this.props.onUpdate(event, this.getValue(), this)
            }
        })
    }
}
