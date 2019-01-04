import { Component } from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer"
import UserEditLeftContainer from "/imports/users/client/UserEditLeftContainer"
import UserEditRightContainer from "/imports/users/client/UserEditRightContainer"

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
