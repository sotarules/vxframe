export default function(state = null, action) {
    switch (action.type) {
    case "SET_PUBLISH_CURRENT_UPLOAD_STATSCURRENT_UPLOAD":
        return action.payload
    default:
        return state
    }
}
