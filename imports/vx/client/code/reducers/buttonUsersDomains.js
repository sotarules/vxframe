export default function(state = "button-users", action) {
    switch (action.type) {
    case "SET_BUTTON_USERS_DOMAINS":
        return action.payload
    default:
        return state
    }
}
