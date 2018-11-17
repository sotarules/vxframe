import { Component } from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer.jsx"
import UserDomainViewLeftContainer from "/imports/usersdomains/client/UserDomainViewLeftContainer.jsx"
import UserDomainViewRightContainer from "/imports/usersdomains/client/UserDomainViewRightContainer.jsx"

export default class UserDomainView extends Component {

    render() {
        return (
            <SlidePairContainer name="UserDomainView.jsx" leftPanel={(<UserDomainViewLeftContainer/>)}
                rightPanel={(<UserDomainViewRightContainer/>)}
                leftColumnCount={5}
                rightColumnCount={7}/>
        )
    }
}
