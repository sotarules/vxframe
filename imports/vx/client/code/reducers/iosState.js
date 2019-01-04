export default function(state = {}, action) {
    switch (action.type) {
    case "SET_IOS_STATE":
        // Clone state entirely for complex payload. This will ensure
        // that Redux detects the change in lower-level properties.
        return Object.assign({}, action.payload)
    default:
        return state
    }
}
