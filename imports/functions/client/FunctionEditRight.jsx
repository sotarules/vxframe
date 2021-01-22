import {Component} from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import EmptyRightPanel from "/imports/vx/client/EmptyRightPanel"
import EntityListHeader from "/imports/vx/client/EntityListHeader"
import RightHeader from "/imports/vx/client/RightHeader"
import RightBody from "/imports/vx/client/RightBody"
import VXForm from "/imports/vx/client/VXForm"
import VXInput from "/imports/vx/client/VXInput"
import VXSelect from "/imports/vx/client/VXSelect"
import FunctionAceEditor from "/imports/functions/client/FunctionAceEditor"

export default class FunctionEditRight extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        funktion : PropTypes.object,
    }

    static defaultProps = {
        id : "function-edit-right"
    }

    constructor(props) {
        super(props)
        this.state = {
            value : props.funktion ? props.funktion.value : null,
            valid: false,
            hasErrors : false
        }
        this.locked = false
    }

    shouldComponentUpdate() {
        return !this.locked
    }

    setLocked(locked) {
        this.locked = locked
    }

    componentDidMount() {
        this.registerDelegates()
    }

    componentDidUpdate() {
        this.registerDelegates()
    }

    registerDelegates() {
        UX.unregisterIosButtonDelegates()
        if (this.props.funktion) {
            UX.registerIosButtonDelegate("ios-button-undo", this.handleUndo.bind(this))
            UX.registerIosButtonDelegate("ios-button-redo", this.handleRedo.bind(this))
            UX.registerIosButtonDelegate("ios-button-done-editing", this.handleDoneEditing.bind(this))
        }
    }

    render() {
        return (
            <div id={this.props.id}
                className="flexi-grow lock-exiting-component">
                {this.props.funktion ? (
                    <RightPanel>
                        <RightHeader iconUrl={CX.CLOUDFILES_PREFIX + "/img/system/function.png"}
                            name={this.props.funktion.name}
                            description={this.props.funktion.description}
                            message={Util.getCodeLocalized("functionType", this.props.funktion.functionType)}
                            isShowButton={true}
                            buttonId="test-function"
                            buttonText={Util.i18n("common.button_test_function")}
                            buttonClassName="btn btn-primary btn-custom pull-right"
                            onClickButton={this.handleClickTest.bind(this)}>
                            <VXForm id="function-edit-right-form"
                                ref={(form) => { this.form = form }}
                                className="right-panel-form flexi-fixed"
                                dynamic={true}
                                collection={Functions}
                                _id={this.props.funktion._id}>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <VXInput id="name"
                                            label={Util.i18n("common.label_function_name")}
                                            required={true}
                                            value={this.props.funktion.name}/>
                                    </div>
                                    <div className="col-sm-6">
                                        <VXSelect id="functionType"
                                            codeArray={UX.addBlankSelection(UX.makeCodeArray("functionType"))}
                                            label={Util.i18n("common.label_function_type")}
                                            value={this.props.funktion.functionType}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <VXInput id="description"
                                            label={Util.i18n("common.label_function_description")}
                                            value={this.props.funktion.description}/>
                                    </div>
                                </div>
                            </VXForm>
                        </RightHeader>
                        <EntityListHeader label={Util.i18n("common.label_function_header")}/>
                        <RightBody className="right-body-no-margin">
                            <FunctionAceEditor
                                name="function-ace-editor"
                                value={this.state.value}
                                height="100%"
                                className="function-editor-edit"
                                onChange={this.handleChange.bind(this)}
                                onValidate={this.handleValidate.bind(this)}
                            />
                        </RightBody>
                    </RightPanel>
                ) : (
                    <EmptyRightPanel emptyMessage={Util.i18n("common.empty_edit_record_missing")}/>
                )}
            </div>
        )
    }

    buttonClass(enable) {
        return enable ? "btn-primary" : "btn-default"
    }

    canTest() {
        return this.state.valid && this.state.value && this.state.value.length > 0
    }

    handleChange(value) {
        this.setState({value: value})
    }

    handleValidate(valid, hasErrors) {
        this.setState({ valid: valid, hasErrors : hasErrors })
    }

    handleClickTest(callback) {
        callback()
        VXApp.testFunction(this.state.value)
    }

    handleUndo(callback) {
        callback()
        if (this.props.funktion) {
            VXApp.aceEditor().undo()
        }
    }

    handleRedo(callback) {
        callback()
        if (this.props.funktion) {
            VXApp.aceEditor().redo()
        }
    }

    handleDoneEditing(callback) {
        if (!this.props.funktion) {
            OLog.debug("FunctionEditRight.jsx handleDoneEditing *exit*")
            UX.iosPopAndGo("crossfade")
            return
        }
        if (this.state.hasErrors) {
            callback()
            UX.notify({ success : false, icon : "TRIANGLE", key: "common.alert_function_has_errors" })
            return
        }
        const modifier = {}
        modifier.$set = {}
        modifier.$set.value = this.state.value
        OLog.debug(`FunctionEditRight.jsx handleDoneEditing special update functionId=${this.props.funktion._id} modifier=${modifier}`)
        Functions.update(this.props.funktion._id, modifier, (error) => {
            if (error) {
                UX.notifyForError(error)
                return
            }
            OLog.debug("FunctionEditRight.jsx handleDoneEditing")
            UX.iosPopAndGo("crossfade")
        })
    }
}
