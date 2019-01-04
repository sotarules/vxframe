export default function(state = null, action) {
    switch (action.type) {
    case "SET_PUBLISH_AUTHORING_DOMAIN":
        return action.payload
    default:
        return state
    }
}
