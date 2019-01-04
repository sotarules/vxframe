export default function(state = "en_US", action) {
    switch (action.type) {
    case "SET_CURRENT_LOCALE":
        return action.payload
    default:
        return state
    }
}
