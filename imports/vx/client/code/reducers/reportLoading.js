export default function(state = null, action) {
    switch (action.type) {
    case "SET_REPORT_LOADING":
        return action.payload
    default:
        return state
    }
}
