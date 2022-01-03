import { Component } from "react"
import PropTypes from "prop-types"

export default class VXTextEditor extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        formGroupClassName : PropTypes.string,
        containerClassName : PropTypes.string,
        className : PropTypes.string,
        label : PropTypes.string,
        star : PropTypes.bool,
        tooltip : PropTypes.string,
        required : PropTypes.bool,
        disabled : PropTypes.bool,
        value : PropTypes.string,
        height: PropTypes.number,
        minHeight: PropTypes.number,
        maxHeight: PropTypes.number,
        disableResizeEditor: PropTypes.bool,
        toolbar : PropTypes.array,
        fontNames : PropTypes.array,
        onChange : PropTypes.func,
        onEnter : PropTypes.func,
        onBlur : PropTypes.func,
        dbName : PropTypes.string,
        fetchHandler : PropTypes.func,
        updateHandler : PropTypes.func,
        invalidHandler : PropTypes.func,
        modifyHandler : PropTypes.func
    }

    static defaultProps = {
        height: null,
        minHeight: null,
        maxHeight: null,
        toolbar: [
            ["color", ["color"]],
            ["style", ["bold", "italic", "underline"]],
            ["para", ["ul", "ol", "paragraph"]],
            ["insert", ["table", "hr"]],
            ["codeview", ["codeview"]],
            ["undo", ["undo", "redo"]]
        ],
        fontNames: [ "Noto Sans", "Arial" ],
        disableResizeEditor : true
    }

    constructor(props) {
        super(props)
        this.state = { value : this.props.value, modified : false }
    }

    reset() {
        this.setState(this.originalState)
    }

    componentDidMount() {
        UX.register(this)
        this.originalState = { ...this.state }
        $(`#${this.props.id}`).summernote({
            height : this.props.height,
            minHeight : this.props.minHeight,
            maxHeight : this.props.maxHeight,
            focus : false,
            toolbar : this.props.toolbar,
            fontNames : this.props.fontNames,
            disableResizeEditor : this.props.disableResizeEditor,
            disableDragAndDrop : true,
            callbacks : {
                onInit: () => {
                    $(".note-editor").addClass("needsclick")
                    $(".note-editable").addClass("needsclick")
                    $(".note-current-color-button").data("value", { backColor: "inherit" } )
                    $(".note-recent-color").css("background-color", "inherit")
                    if (this.props.disableResizeEditor) {
                        $(".note-statusbar").hide()
                    }
                    $(`#${this.props.id}`).summernote(this.props.disabled ? "disable" : "enable")
                    $(`#${this.props.id}`).summernote("code", this.state.value)
                },
                onChange : (contents) => {
                    this.handleChange(contents)
                },
                onEnter : () => {
                    this.handleEnter()
                }
            }
        })
    }

    componentWillUnmount() {
        UX.unregister(this)
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (UX.isFormReceiveProps(this) && newProps.hasOwnProperty("value")) {
            if (this.state.value !== newProps.value) {
                OLog.debug("VXTextEditor.jsx UNSAFE_componentWillReceiveProps value has changed updating summernote")
                this.setState({value: newProps.value }, () => {
                    $(`#${this.props.id}`).summernote("code", newProps.value ? newProps.value : null)
                })
            }
        }
    }

    render() {
        return (
            <div id={`${this.props.id}-editor`}
                className={`form-group flexi-grow ${this.props.formGroupClassName || ""}`}
                onBlur={this.handleBlur.bind(this)}>
                {this.props.label &&
                    <label htmlFor={this.props.id}
                        className="control-label"
                        title={this.props.tooltip}>
                        {this.props.label}{" "}
                        {this.props.star &&
                            <span className="fa fa-star-o icon-required"></span>
                        }
                    </label>
                }
                <div id={this.props.id}
                    className={`flexi-grow ${this.props.className || ""}`}/>
            </div>
        )
    }

    getValue() {
        return this.state.value
    }

    setValue(value) {
        this.setState({ value: value })
    }

    handleChange(contents) {
        if (contents != this.state.value) {
            this.setState({value: contents }, () => {
                if (this.props.onChange) {
                    this.props.onChange(this.getValue(), this)
                }
            })
        }
    }

    handleEnter() {
        if (this.props.onEnter) {
            this.props.onEnter(this.getValue(), this)
        }
    }

    /**
     * We don't want to execute doUpdate if we're bluring, yet remaining within VXTextEditor component. Specifically,
     * the formatting buttons should be considered part of this control and not trigger an update. This is important
     * because doUpdate will cause a "round trip" triggering UNSAFE_componentWillReceiveProps, causing the Summernote
     * editor to refresh at the same time the formatting button is pressed. Depending on timing, the formatting
     * gesture is often clobbered by UNSAFE_componentWillReceiveProps, making the component seem flakey.
     */
    handleBlur(event) {
        const $editor = $(event.relatedTarget).parents(`#${this.props.id}-editor`)
        if (!$editor.exists()) {
            OLog.warn(`VXTextEditor.jsx handleBlur component losing focus value=${this.state.value}`)
            this.doUpdate()
            if (this.props.onBlur) {
                this.props.onBlur(event, this.getValue(), this)
            }
        }
    }

    doUpdate() {
        UX.validateComponent(this)
    }
}
