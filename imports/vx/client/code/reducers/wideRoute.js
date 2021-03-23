export default function(state = null, action) {
    switch (action.type) {
    case "SET_WIDE_ROUTE":
        return action.payload
    default:
        return state
    }
}
