export default function(state = null, action) {
    switch (action.type) {
    case "SET_SUBSCRIPTION_PARAMETERS":
        return action.payload
    default:
        return state
    }
}
