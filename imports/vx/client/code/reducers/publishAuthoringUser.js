export default function(state = null, action) {
    switch (action.type) {
    case "SET_PUBLISH_AUTHORING_USER":
        return action.payload
    default:
        return state
    }
}
