export default function(state = 50, action) {
    switch (action.type) {
    case "SET_SELECTED_LOG_ROWS":
        return action.payload
    default:
        return state
    }
}
