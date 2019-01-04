export default function(state = "ALL", action) {
    switch (action.type) {
    case "SET_SELECTED_EVENT_TYPE":
        return action.payload
    default:
        return state
    }
}
