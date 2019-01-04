import { Component } from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer"
import DomainUserViewLeftContainer from "/imports/usersdomains/client/DomainUserViewLeftContainer"
import DomainUserViewRightContainer from "/imports/usersdomains/client/DomainUserViewRightContainer"

export default class DomainUserView extends Component {

    render() {
        return (
            <SlidePairContainer leftPanel={(<DomainUserViewLeftContainer/>)}
                rightPanel={(<DomainUserViewRightContainer/>)}
                leftColumnCount={5}
                rightColumnCount={7}/>
        )
    }
}
