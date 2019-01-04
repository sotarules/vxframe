export default function(state = null, action) {
    switch (action.type) {
    case "SET_PUBLISH_CURRENT_USERS":
        return action.payload
    default:
        return state
    }
}
