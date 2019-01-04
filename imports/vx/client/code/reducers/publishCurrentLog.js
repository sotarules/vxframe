export default function(state = null, action) {
    switch (action.type) {
    case "SET_PUBLISH_CURRENT_LOG":
        return action.payload
    default:
        return state
    }
}
