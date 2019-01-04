import { withTracker } from "meteor/react-meteor-data"
import TemplateEditRight from "/imports/templates/client/TemplateEditRight"

export default withTracker(( ) => {

    let template = ContextMaker.template()

    OLog.debug("TemplateEditRightContainer.jsx template=" + OLog.debugString(template))

    return {
        template : template,
        decorationIconClassName : VXApp.getSubsystemStatusDecorationIconClassName("TEMPLATE", template, "medium"),
        decorationColor : VXApp.getSubsystemStatusDecorationColor("TEMPLATE", template),
        decorationTooltip : VXApp.getSubsystemStatusDecorationTooltip("TEMPLATE", template)
    }

})(TemplateEditRight)

