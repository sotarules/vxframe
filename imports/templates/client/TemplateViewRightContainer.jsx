import { connect } from "react-redux"
import { withTracker } from "meteor/react-meteor-data"
import TemplateViewRight from "/imports/templates/client/TemplateViewRight"

const MeteorContainer = withTracker(() => {

    let template, decorationIconClassName, decorationColor, decorationTooltip, uploadInProgress
    template = ContextMaker.templates()
    uploadInProgress = VXApp.isUploadInProgress("TEMPLATE")
    if (template) {
        decorationIconClassName = VXApp.getSubsystemStatusDecorationIconClassName("TEMPLATE", template, "medium")
        decorationColor = VXApp.getSubsystemStatusDecorationColor("TEMPLATE", template)
        decorationTooltip = VXApp.getSubsystemStatusDecorationTooltip("TEMPLATE", template)
    }

    return {
        template,
        decorationIconClassName,
        decorationColor,
        decorationTooltip,
        uploadInProgress
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
