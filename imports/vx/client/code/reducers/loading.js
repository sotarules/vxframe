export default function(state = null, action) {
    switch (action.type) {
    case "SET_LOADING":
        return action.payload
    default:
        return state
    }
}
