export default function(state = null, action) {
    switch (action.type) {
    case "SET_PUBLISH_CURRENT_TENANT":
        return action.payload
    default:
        return state
    }
}
