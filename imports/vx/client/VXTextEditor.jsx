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
        this.state = { value : "", modified : false }
    }

    reset() {
        this.setState(this.originalState)
    }

    componentDidMount() {
        UX.register(this)
        this.setState({ value : this.props.value }, () => {
            this.originalState = { ...this.state }
        })
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
                this.setState({value: newProps.value }, () => {
                    $(`#${this.props.id}`).summernote("code", newProps.value ? newProps.value : null)
                })
            }
        }
    }

    render() {
        return (
            <div className={`form-group flexi-grow ${this.props.formGroupClassName || ""}`}>
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
                this.doUpdate()
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

    handleBlur() {
    }

    doUpdate() {
        UX.validateComponent(this)
    }
}
