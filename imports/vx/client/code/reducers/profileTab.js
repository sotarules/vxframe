export default function(state = "profile", action) {
    switch (action.type) {
    case "SET_PROFILE_TAB":
        return action.payload
    default:
        return state
    }
}
