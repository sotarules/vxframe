export default function(state = null, action) {
    switch (action.type) {
    case "SET_EXEMPT_ROUTE":
        return action.payload
    default:
        return state
    }
}
