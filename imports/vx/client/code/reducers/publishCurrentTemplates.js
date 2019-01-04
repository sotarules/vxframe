export default function(state = null, action) {
    switch (action.type) {
    case "SET_PUBLISH_CURRENT_TEMPLATES":
        return action.payload
    default:
        return state
    }
}
