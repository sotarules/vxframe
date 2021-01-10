export default function(state = null, action) {
    switch (action.type) {
    case "SET_LIST_IMPORT_LAST_PERCENT":
        return action.payload
    default:
        return state
    }
}
