export default function(state = null, action) {
    switch (action.type) {
    case "SET_REPORT_DATA":
        return action.payload
    default:
        return state
    }
}
