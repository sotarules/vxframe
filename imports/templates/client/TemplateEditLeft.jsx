import { Component } from "react"
import PropTypes from "prop-types"
import RadioButtonGroup from "/imports/vx/client/RadioButtonGroup"
import RadioButton from "/imports/vx/client/RadioButton"
import TemplateEntityList from "/imports/vx/client/TemplateEntityList"
import {setPublishAuthoringTemplate} from "/imports/vx/client/code/actions"

export default class TemplateEditLeft extends Component {

    static propTypes = {
        templates : PropTypes.array.isRequired
    }

    render() {
        return (
            <div className="left-list-container flexi-grow">
                <RadioButtonGroup id="button-group-templates"
                    value="TEMPLATES">
                    <RadioButton id="button-templates"
                        text={Util.i18n("common.label_templates")}
                        value="TEMPLATES"/>
                </RadioButtonGroup>
                <TemplateEntityList id="template-edit-left-list"
                    templates={this.props.templates}
                    selectable={true}
                    chevrons={true}
                    onSelect={this.handleSelectTemplate.bind(this)}/>
            </div>
        )
    }

    handleSelectTemplate(event, component) {
        Store.dispatch(setPublishAuthoringTemplate(VXApp.simplePublishingRequest(component.props.itemId)))
    }
}
