export default function(state = null, action) {
    switch (action.type) {
    case "SET_REPORT_RECIPIENTS":
        return action.payload
    default:
        return state
    }
}
