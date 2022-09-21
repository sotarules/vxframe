export default function(state = null, action) {
    switch (action.type) {
    case "SET_CURRENT_REPORT_RECORD":
        return action.payload
    default:
        return state
    }
}
