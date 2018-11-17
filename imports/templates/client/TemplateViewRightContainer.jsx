import { withTracker } from "meteor/react-meteor-data"
import TemplateViewRight from "/imports/templates/client/TemplateViewRight.jsx"

export default withTracker(( ) => {

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

