import { withTracker } from "meteor/react-meteor-data"
import TemplateEditRight from "/imports/templates/client/TemplateEditRight"

export default withTracker(( ) => {
    let template, decorationIconClassName, decorationColor, decorationTooltip
    template = ContextMaker.template()
    if (template) {
        decorationIconClassName = VXApp.getSubsystemStatusDecorationIconClassName("TEMPLATE", template, "medium")
        decorationColor = VXApp.getSubsystemStatusDecorationColor("TEMPLATE", template)
        decorationTooltip = VXApp.getSubsystemStatusDecorationTooltip("TEMPLATE", template)
    }
    return {
        template,
        decorationIconClassName,
        decorationColor,
        decorationTooltip
    }
})(TemplateEditRight)

