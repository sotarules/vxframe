export default function(state = null, action) {
    switch (action.type) {
    case "SET_SELECTED_EVENT_END_DATE":
        return action.payload
    default:
        return state
    }
}
