import { Component } from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer"
import UserDomainViewLeftContainer from "/imports/usersdomains/client/UserDomainViewLeftContainer"
import UserDomainViewRightContainer from "/imports/usersdomains/client/UserDomainViewRightContainer"

export default class UserDomainView extends Component {

    render() {
        return (
            <SlidePairContainer leftPanel={(<UserDomainViewLeftContainer/>)}
                rightPanel={(<UserDomainViewRightContainer/>)}
                leftColumnCount={6}
                rightColumnCount={6}/>
        )
    }
}
