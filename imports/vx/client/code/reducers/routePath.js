export default function(state = null, action) {
    switch (action.type) {
    case "SET_ROUTE_PATH":
        return action.payload
    default:
        return state
    }
}
