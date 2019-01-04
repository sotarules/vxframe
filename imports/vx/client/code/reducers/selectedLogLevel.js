export default function(state = "ALL", action) {
    switch (action.type) {
    case "SET_SELECTED_LOG_LEVEL":
        return action.payload
    default:
        return state
    }
}
