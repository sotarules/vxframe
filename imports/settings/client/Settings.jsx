import { Component } from "react"
import PropTypes from "prop-types"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer.jsx"
import SettingsNavListContainer from "/imports/settings/client/SettingsNavListContainer.jsx"
import SettingsPanelContainer from "/imports/settings/client/SettingsPanelContainer.jsx"

export default class Settings extends Component {

    static propTypes = {
        user : PropTypes.object.isRequired,
        config : PropTypes.object.isRequired,
        logLevels : PropTypes.array.isRequired,
        campaignUnits : PropTypes.array.isRequired,
        admins : PropTypes.array.isRequired
    }

    render() {
        return (
            <SlidePairContainer leftPanel={(<SettingsNavListContainer/>)}
                rightPanel={(<SettingsPanelContainer {...this.props}/>)}
                leftColumnCount={3}
                rightColumnCount={9}/>
        )
    }
}
