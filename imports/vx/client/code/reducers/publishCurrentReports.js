export default function(state = null, action) {
    switch (action.type) {
    case "SET_PUBLISH_CURRENT_REPORTS":
        return action.payload
    default:
        return state
    }
}
