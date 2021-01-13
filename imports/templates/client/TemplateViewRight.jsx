import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel"
import RightBody from "/imports/vx/client/RightBody"
import RightHeader from "/imports/vx/client/RightHeader"
import VXForm from "/imports/vx/client/VXForm"
import VXFieldBox from "/imports/vx/client/VXFieldBox"
import EmptyRightPanel from "/imports/vx/client/EmptyRightPanel"
import RetireModal from "/imports/vx/client/RetireModal"
import UploadButton from "/imports/vx/client/UploadButton"
import UploadProgressBarContainer from "/imports/vx/client/UploadProgressBarContainer"
import UploadErrorPanelContainer from "/imports/vx/client/UploadErrorPanelContainer"
import { setPublishAuthoringTemplate } from "/imports/vx/client/code/actions"

export default class TemplateViewRight extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        template : PropTypes.object,
        decorationIconClassName : PropTypes.string,
        decorationColor : PropTypes.oneOf(["green", "yellow", "red", "gray"]),
        decorationTooltip : PropTypes.string,
        isUploadInProgress : PropTypes.bool
    }

    static defaultProps = {
        id : "template-view-right"
    }

    constructor(props) {
        super(props)
        this.locked = false
        this.currentUpload = new ReactiveVar(false)
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
        if (this.props.template) {
            UX.registerIosButtonDelegate("ios-button-edit", this.handleEdit.bind(this))
            UX.registerIosButtonDelegate("ios-button-clone", this.handleClone.bind(this))
            UX.registerIosButtonDelegate("ios-button-delete", this.handleDelete.bind(this))
        }
    }

    render() {
        return (
            <div id={this.props.id}
                className="flexi-grow lock-exiting-component">
                {this.props.template ? (
                    <RightPanel>
                        <RightHeader iconUrl={CX.CLOUDFILES_PREFIX + "/img/system/template5.png"}
                            name={this.props.template.name}
                            description={this.props.template.description}
                            message={this.props.template.message}
                            decorationIconClassName={this.props.decorationIconClassName}
                            decorationColor={this.props.decorationColor}
                            decorationTooltip={this.props.decorationTooltip}
                            customComponentRight={this.rightButton()}/>
                        <RightBody className="right-body-no-margin-top">
                            <VXForm id="template-view-right-form"
                                ref={(form) => { this.form = form }}
                                className="right-panel-form flexi-grow">
                                <UploadProgressBarContainer uploadType="TEMPLATE"/>
                                {!this.props.isUploadInProgress &&
                                    <UploadErrorPanelContainer uploadType="TEMPLATE"/>
                                }
                                <div className="flexi-fixed">
                                    <VXFieldBox label={Util.i18n("common.label_subject")}
                                        value={this.props.template.subject}/>
                                </div>
                                <div className="flexi-grow">
                                    <VXFieldBox label={Util.i18n("common.label_body")}
                                        formGroupClassName="flexi-grow"
                                        className="flexi-grow"
                                        dangerous={true}
                                        value={this.props.template.html}/>
                                </div>
                            </VXForm>
                        </RightBody>
                    </RightPanel>
                ) : (
                    <EmptyRightPanel emptyMessage={Util.i18n("common.empty_template_rhs_details")}/>
                )}
            </div>
        )
    }

    rightButton() {
        return (
            <UploadButton id="client-view-upload-button"
                uploadType="TEMPLATE"
                currentUpload={this.currentUpload}
                isUploadInProgress={this.props.uploadInProgress}/>
        )
    }

    handleEdit(callback) {
        OLog.debug("TemplateViewRight.jsx handleEdit")
        callback()
        UX.iosMajorPush(null, null, "/template/" + this.props.template._id,
            "RIGHT", "crossfade")
    }

    handleClone(callback) {
        OLog.debug("TemplateViewRight.jsx handleClone")
        callback()
        UX.setLocked(["template-view-left"], true)
        VXApp.cloneTemplate(this.props.template._id)
    }

    handleDelete(callback) {
        OLog.debug("TemplateViewRight.jsx handleDelete")
        callback()
        UX.showModal(<RetireModal title={Util.i18n("common.label_retire_template")}
            collection={Templates}
            _id={this.props.template._id}
            retireMethod="retireTemplate"
            publishSetAction={setPublishAuthoringTemplate}/>)
    }
}
