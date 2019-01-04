export default function(state = null, action) {
    switch (action.type) {
    case "SET_PUBLISH_CURRENT_DOMAIN":
        return action.payload
    default:
        return state
    }
}
