export default function(state = null, action) {
    switch (action.type) {
    case "SET_PUBLISH_AUTHORING_REPORT":
        return action.payload
    default:
        return state
    }
}
