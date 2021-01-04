export default function(state = new Date().toISOString(), action) {
    switch (action.type) {
    case "SET_FUNCTION_UPDATE_TIMESTAMP":
        return action.payload
    default:
        return state
    }
}
