import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import RightBody from "/imports/vx/client/RightBody"
import RightHeader from "/imports/vx/client/RightHeader"
import EntityListHeader from "/imports/vx/client/EntityListHeader"
import EmptyRightPanel from "/imports/vx/client/EmptyRightPanel"
import RetireModal from "/imports/vx/client/RetireModal"
import FunctionAceEditor from "/imports/functions/client/FunctionAceEditor"
import { setPublishAuthoringFunction } from "/imports/vx/client/code/actions"

export default class FunctionViewRight extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        funktion : PropTypes.object,
    }

    static defaultProps = {
        id : "function-view-right"
    }

    constructor(props) {
        super(props)
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
            UX.registerIosButtonDelegate("ios-button-edit", this.handleEdit.bind(this))
            UX.registerIosButtonDelegate("ios-button-clone", this.handleClone.bind(this))
            UX.registerIosButtonDelegate("ios-button-delete", this.handleDelete.bind(this))
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
                            message={Util.getCodeLocalized("functionType", this.props.funktion.functionType)}/>
                        <EntityListHeader label={Util.i18n("common.label_function_header")}/>
                        <RightBody className="right-body-no-margin">
                            <FunctionAceEditor
                                name="function-ace-editor"
                                value={this.props.funktion.value}
                                readOnly={true}
                                height="100%"
                                className="function-editor-view"
                            />
                        </RightBody>
                    </RightPanel>
                ) : (
                    <EmptyRightPanel emptyMessage={Util.i18n("common.empty_function_rhs_details")}/>
                )}
            </div>
        )
    }

    handleEdit(callback) {
        OLog.debug("FunctionViewRight.jsx handleEdit")
        callback()
        UX.iosMajorPush(null, null, "/function/" + this.props.funktion._id, "RIGHT", "crossfade")
    }

    handleClone(callback) {
        OLog.debug("FunctionViewRight.jsx handleClone")
        callback()
        UX.setLocked(["function-view-left"], true)
        VXApp.cloneFunction(this.props.funktion._id)
    }

    handleDelete(callback) {
        OLog.debug("FunctionViewRight.jsx handleDelete")
        callback()
        UX.showModal(<RetireModal title={Util.i18n("common.label_retire_function")}
            collection={Functions}
            _id={this.props.funktion._id}
            retireMethod="retireFunction"
            publishSetAction={setPublishAuthoringFunction}/>)
    }
}
