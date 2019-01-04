export default function(state = null, action) {
    switch (action.type) {
    case "SET_CURRENT_PUBLISHING_MODE":
        return action.payload
    default:
        return state
    }
}
