import { Component } from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer.jsx"
import UserEditLeftContainer from "/imports/users/client/UserEditLeftContainer.jsx"
import UserEditRightContainer from "/imports/users/client/UserEditRightContainer.jsx"

export default class UserEdit extends Component {
    render() {
        return (
            <SlidePairContainer leftPanel={(<UserEditLeftContainer/>)}
                rightPanel={(<UserEditRightContainer/>)}
                leftColumnCount={5}
                rightColumnCount={7}/>
        )
    }
}
