export default function(state = { currentIndex : 0 }, action) {
    switch (action.type) {
    case "SET_WIZARD_STATE":
        // Clone state entirely for complex payload. This will ensure
        // that Redux detects the change in lower-level properties.
        return Object.assign({}, action.payload)
    default:
        return state
    }
}
