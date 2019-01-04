export default function(state = null, action) {
    switch (action.type) {
    case "SET_PUBLISH_AUTHORING_TEMPLATE":
        return action.payload
    default:
        return state
    }
}
