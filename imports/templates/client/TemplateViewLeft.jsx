import { Component } from "react"
import PropTypes from "prop-types"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup"
import RadioButton from "/imports/vx/client/RadioButton"
import TemplateEntityList from "/imports/vx/client/TemplateEntityList"
import BottomButton from "/imports/vx/client/BottomButton"
import { setPublishAuthoringTemplate } from "/imports/vx/client/code/actions"

export default class TemplateViewLeft extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        templates : PropTypes.array.isRequired
    }

    static defaultProps = {
        id : "template-view-left"
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

    render() {
        return (
            <div id={this.props.id}
                className="left-list-container flexi-grow">
                <RadioButtonGroup id="button-group-templates"
                    value="TEMPLATES">
                    <RadioButton id="button-templates"
                        text={Util.i18n("common.label_templates")}
                        value="TEMPLATES"/>
                </RadioButtonGroup>
                <TemplateEntityList id="template-view-left-list"
                    templates={this.props.templates}
                    selectable={true}
                    chevrons={true}
                    onSelect={this.handleSelectEntity.bind(this)}/>
                <BottomButton id="button-create-template"
                    className="btn-primary"
                    text={Util.i18n("common.button_create_template")}
                    onClick={this.handleClickCreate.bind(this)}/>
            </div>
        )
    }

    handleSelectEntity(event, component) {
        const publishAuthoringTemplate = {}
        publishAuthoringTemplate.criteria = { _id : component.props.itemId }
        Store.dispatch(setPublishAuthoringTemplate(publishAuthoringTemplate))
        if (UX.isSlideMode()) {
            UX.iosMinorPush("common.button_templates", "RIGHT")
        }
    }

    handleClickCreate(callback) {
        callback()
        UX.setLocked(["template-view-left", "template-view-right"], true)
        Templates.insert({ }, (error, templateId) => {
            if (error) {
                OLog.error("TemplateViewLeft.jsx error attempting to create template=" + error)
                UX.notifyForDatabaseError(error)
                return
            }
            const publishAuthoringTemplate = {}
            publishAuthoringTemplate.criteria = { _id : templateId }
            Store.dispatch(setPublishAuthoringTemplate(publishAuthoringTemplate))
            if (UX.isSlideMode()) {
                UX.iosMajorPush("common.button_templates", "common.button_templates", `/template/${templateId}`, "RIGHT")
            }
            else {
                UX.iosMajorPush(null, null, `/template/${templateId}`, "RIGHT", "crossfade")
            }
        })
    }
}
