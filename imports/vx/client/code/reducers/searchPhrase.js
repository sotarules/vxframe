export default function(state = null, action) {
    switch (action.type) {
    case "SET_SEARCH_PHRASE":
        return action.payload
    default:
        return state
    }
}
