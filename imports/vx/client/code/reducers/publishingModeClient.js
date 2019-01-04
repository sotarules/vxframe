export default function(state = null, action) {
    switch (action.type) {
    case "SET_PUBLISHING_MODE_CLIENT":
        return action.payload
    default:
        return state
    }
}
