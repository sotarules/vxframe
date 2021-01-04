export default function(state = null, action) {
    switch (action.type) {
    case "SET_PUBLISH_AUTHORING_FUNCTION":
        return action.payload
    default:
        return state
    }
}
