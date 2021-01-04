import { Component } from "react"
import PropTypes from "prop-types"
import AceEditor from "react-ace"
import ace from "ace-builds/src-noconflict/ace"

import "ace-builds/src-noconflict/mode-javascript"
import "ace-builds/src-noconflict/theme-chrome"

export default class FunctionAceEditor extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        name : PropTypes.string.isRequired,
        readOnly : PropTypes.bool.isRequired,
        className : PropTypes.string,
        height : PropTypes.string,
        value : PropTypes.string,
        onChange : PropTypes.func,
        onValidate : PropTypes.func
    }

    static defaultProps = {
        id : "ace-editor",
        height : "600px",
        readOnly : false
    }

    constructor(props) {
        super(props)
        this.state = { value : props.value }
        this.originalState = Object.assign({}, this.state)
        ace.config.setModuleUrl("ace/mode/javascript_worker", "https://ajaxorg.github.io/ace-builds/src-noconflict/worker-javascript.js")
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        this.setState({ value : newProps.value })
    }

    render() {
        return (
            <div id={this.props.id} className="fill">
                <AceEditor
                    name="function-editor"
                    mode="javascript"
                    theme="chrome"
                    readOnly={this.props.readOnly}
                    highlightActiveLine={!this.props.readOnly}
                    value={this.state.value}
                    width="100%"
                    height={this.props.height}
                    className={this.props.className}
                    fontSize="14px"
                    showGutter={true}
                    showPrintMargin={false}
                    focus={true}
                    onLoad={this.handleLoad.bind(this)}
                    onChange={this.handleChange.bind(this)}
                    onValidate={this.handleValidate.bind(this)}
                    editorProps={{$blockScrolling: true}}
                    ref={reactAce => { this.reactAce = reactAce } }
                />
            </div>
        )
    }

    handleLoad(editor) {
        this.setState({loaded: true})
        Meteor.setTimeout(() => { editor.focus() }, 500)
    }

    handleChange(value) {
        this.setState({value: value})
        if (this.props.onChange) {
            this.props.onChange(value)
        }
    }

    handleValidate(annotations) {
        const hasErrors = _.where(annotations, { type: "error" }).length > 0
        const valid = this.state.loaded && !hasErrors
        this.setState({ valid: valid, hasErrors : hasErrors })
        if (this.props.onValidate) {
            this.props.onValidate(valid, hasErrors, annotations)
        }
    }
}
