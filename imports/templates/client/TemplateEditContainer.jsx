import { withTracker } from "meteor/react-meteor-data"
import TemplateEdit from "/imports/templates/client/TemplateEdit"
import { setPublishCurrentTemplates } from "/imports/vx/client/code/actions"

export default withTracker(() => {

    let result = VXApp.getSubscriptionParameters()
    if (!result.success) {
        OLog.debug("TemplateEditContainer.jsx withTracker subscription parameters not ready result=" + OLog.debugString(result))
        return
    }

    let ready = new ReactiveVar(false)
    let subscriptionParameters = result.subscriptionParameters
    let publishRequest = VXApp.makePublishingRequest("templates", subscriptionParameters, { dateRetired : { $exists: false } }, { sort: { name: 1 } })

    Store.dispatch(setPublishCurrentTemplates(publishRequest.client))

    let handles = []
    handles.push(Meteor.subscribe("templates", publishRequest.server))

    UX.waitSubscriptions(handles, () => {
        ready.set(true)
        UX.clearLoading()
    })

    return {
        ready : !!ready.get()
    }

})(TemplateEdit)
