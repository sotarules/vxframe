import { connect } from "react-redux"
import { withTracker } from "meteor/react-meteor-data"
import TemplateViewRight from "/imports/templates/client/TemplateViewRight"

const MeteorContainer = withTracker(() => {

    let template = ContextMaker.templates()
    if (!template) {
        return {}
    }

    return {
        template : template,
        decorationIconClassName : VXApp.getSubsystemStatusDecorationIconClassName("TEMPLATE", template, "medium"),
        decorationColor : VXApp.getSubsystemStatusDecorationColor("TEMPLATE", template),
        decorationTooltip : VXApp.getSubsystemStatusDecorationTooltip("TEMPLATE", template)
    }

})(TemplateViewRight)

const mapStateToProps = state => {
    return {
        publishAuthoringTemplate : state.publishAuthoringTemplate
    }
}

export default connect(
    mapStateToProps
)(MeteorContainer)
