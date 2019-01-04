export default function(state = "system", action) {
    switch (action.type) {
    case "SET_SETTINGS_TAB":
        return action.payload
    default:
        return state
    }
}
