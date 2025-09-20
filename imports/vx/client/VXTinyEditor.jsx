import { Component } from "react"
import PropTypes from "prop-types"
import { Editor } from "@tinymce/tinymce-react"

export default class VXTinyEditor extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        formGroupClassName : PropTypes.string,
        required : PropTypes.bool,
        disabled : PropTypes.bool,
        value : PropTypes.string,
        height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        onChange : PropTypes.func,
        dbName : PropTypes.string,
        fetchHandler : PropTypes.func,
        updateHandler : PropTypes.func,
        invalidHandler : PropTypes.func,
        modifyHandler : PropTypes.func
    }

    static defaultProps = {
        height: "100%"
    }

    constructor(props) {
        super(props)
        this.state = { value : this.props.value, renderTrigger: 0, modified: false }
        this.handleInit = this.handleInit.bind(this)
        this.handleEditorChange = this.handleEditorChange.bind(this)
        this.handleBlur = this.handleBlur.bind(this)
    }

    reset() {
        this.setState(this.originalState)
    }

    componentDidMount() {
        UX.register(this)
        this.originalState = { ...this.state }
    }

    componentWillUnmount() {
        UX.unregister(this)
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (UX.isFormReceiveProps(this) && newProps.hasOwnProperty("value")) {
            if (this.state.value !== newProps.value) {
                if (!this.state.modified) {
                    this.setState({ value: newProps.value })
                    return
                }
                OLog.warn("VXTinyEditor.jsx UNSAFE_componentWillReceiveProps value changed but not updating because modified")
            }
        }
    }

    render() {
        return (
            <div id={this.props.id}
                className={`vx-tiny-editor form-group flexi-grow ${this.props.formGroupClassName || ""}`}>
                <Editor
                    id={`${this.props.id}-tinymce`}
                    key={this.state.renderTrigger}
                    tinymceScriptSrc="/tinymce/js/tinymce/tinymce.min.js"
                    value={this.state.value || ""}
                    disabled={this.props.disabled}
                    init={UX.tinyMCEConfig(this.props.disabled, this.props.height)}
                    onInit={this.handleInit}
                    onEditorChange={this.handleEditorChange}
                    onBlur={this.handleBlur}
                />
            </div>
        )
    }

    reinitializeTinyMCE() {
        this.setState({ renderTrigger: Math.random() })
    }

    toolbar() {
        return !this.props.disabled ?
            "bold italic forecolor | alignleft aligncenter " +
             "alignright alignjustify | bullist numlist outdent indent | blocks | " +
             "removeformat fontfamily fontsize | code | undo redo" : false
    }

    handleInit() {
        const iFrameContents = $(".tox-edit-area__iframe").contents()
        const tinyMCEBody = iFrameContents.find("#tinymce")
        tinyMCEBody.addClass("scroll-momentum")
    }

    getValue() {
        return this.state.value
    }

    setValue(value) {
        this.setState({ value: value })
    }

    handleEditorChange(value) {
        this.setState({value, modified: true})
    }

    handleBlur() {
        OLog.warn(`VXTinyEditor.jsx handleBlur value=${this.state.value}`)
        UX.validateComponent(this)
        if (this.props.onChange) {
            this.props.onChange(this.state.value, this)
        }
        this.setState({modified: false})
    }
}
