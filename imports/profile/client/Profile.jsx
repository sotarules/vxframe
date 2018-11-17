import { Component } from "react"
import PropTypes from "prop-types"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer.jsx"
import ProfileNavList from "/imports/profile/client/ProfileNavList.jsx"
import ProfilePanelContainer from "/imports/profile/client/ProfilePanelContainer.jsx"

export default class Profile extends Component {

    static propTypes = {
        user : PropTypes.object.isRequired,
        states : PropTypes.array.isRequired,
        countries : PropTypes.array.isRequired,
        locales :  PropTypes.array.isRequired,
        timezones : PropTypes.array.isRequired,
        reportFrequencies : PropTypes.array.isRequired,
        timeUnits : PropTypes.array.isRequired,
        eventTypeObjects : PropTypes.array.isRequired,
        preferenceDefinitionObjects : PropTypes.array.isRequired,
        reportDefinitionObjects : PropTypes.array.isRequired
    }

    render() {
        return (
            <SlidePairContainer leftPanel={(<ProfileNavList/>)}
                rightPanel={(<ProfilePanelContainer {...this.props}/>)}
                leftColumnCount={3}
                rightColumnCount={9}/>
        )
    }
}
