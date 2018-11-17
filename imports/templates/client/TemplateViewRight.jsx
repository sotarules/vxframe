import { Component } from "react"
import PropTypes from "prop-types"
import RightPanel from "/imports/vx/client/RightPanel.jsx"
import RightBody from "/imports/vx/client/RightBody.jsx"
import RightHeader from "/imports/vx/client/RightHeader.jsx"
import VXForm from "/imports/vx/client/VXForm.jsx"
import VXFieldBox from "/imports/vx/client/VXFieldBox.jsx"
import EmptyRightPanel from "/imports/vx/client/EmptyRightPanel.jsx"
import RetireModal from "/imports/vx/client/RetireModal.jsx"

export default class TemplateViewRight extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        template : PropTypes.object,
        decorationIconClassName : PropTypes.string,
        decorationColor : PropTypes.oneOf(["green", "yellow", "red", "gray"]),
        decorationTooltip : PropTypes.string,
    }

    static defaultProps = {
        id : "template-view-right"
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
        UX.registerIosButtonDelegate("ios-button-edit", this.handleEdit.bind(this))
        UX.registerIosButtonDelegate("ios-button-clone", this.handleClone.bind(this))
        UX.registerIosButtonDelegate("ios-button-delete", this.handleDelete.bind(this))
    }

    render() {
        return (
            <div id={this.props.id}
                className="flexi-grow">
                {this.props.template ? (
                    <RightPanel>
                        <RightHeader iconUrl={CX.CLOUDFILES_PREFIX + "/img/system/template5.png"}
                            name={this.props.template.name}
                            description={this.props.template.description}
                            message={this.props.template.message}
                            decorationIconClassName={this.props.decorationIconClassName}
                            decorationColor={this.props.decorationColor}
                            decorationTooltip={this.props.decorationTooltip}
                            isShowButton={true}
                            buttonId="button-send-test-email"
                            buttonText={Util.i18n("common.button_send_test_email")}
                            buttonClassName="btn btn-primary btn-custom pull-right"
                            onClickButton={this.handleClickSendTestEmail.bind(this)}/>
                        <RightBody className="right-body-no-margin-top">
                            <VXForm id="template-view-right-form"
                                ref={(form) => { this.form = form }}
                                className="right-panel-form flexi-grow">
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

    handleEdit(callback) {
        OLog.debug("TemplateViewRight.jsx handleEdit")
        callback()
        UX.iosMajorPush(null, null, "/template/" + this.props.template._id, "RIGHT", "crossfade")
    }

    handleClone(callback) {
        OLog.debug("TemplateViewRight.jsx handleClone")
        callback()
        UX.setLocked("template-view-left", true)
        VXApp.cloneTemplate(this.props.template._id)
    }

    handleDelete(callback) {
        OLog.debug("TemplateViewRight.jsx handleDelete")
        callback()
        UX.showModal(<RetireModal title={Util.i18n("common.label_retire_template")}
            collection={Templates}
            _id={this.props.template._id}
            retireMethod="retireTemplate"
            sessionVariable="PUBLISH_AUTHORING_TEMPLATE"/>)
    }

    handleClickSendTestEmail(callback) {
        Meteor.call("sendTestEmail", this.props.template._id, (error, result) => {
            callback()
            UX.notify(result, error)
        })
    }
}
