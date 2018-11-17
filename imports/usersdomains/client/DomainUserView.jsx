import { Component } from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer.jsx"
import DomainUserViewLeftContainer from "/imports/usersdomains/client/DomainUserViewLeftContainer.jsx"
import DomainUserViewRightContainer from "/imports/usersdomains/client/DomainUserViewRightContainer.jsx"

export default class DomainUserView extends Component {

    render() {
        return (
            <SlidePairContainer name="DomainUserView.jsx" leftPanel={(<DomainUserViewLeftContainer/>)}
                rightPanel={(<DomainUserViewRightContainer/>)}
                leftColumnCount={5}
                rightColumnCount={7}/>
        )
    }
}
