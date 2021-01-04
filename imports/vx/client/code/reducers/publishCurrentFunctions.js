export default function(state = null, action) {
    switch (action.type) {
    case "SET_PUBLISH_CURRENT_FUNCTIONS":
        return action.payload
    default:
        return state
    }
}
