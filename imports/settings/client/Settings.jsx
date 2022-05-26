import { Component } from "react"
import PropTypes from "prop-types"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer"
import SettingsNavListContainer from "/imports/settings/client/SettingsNavListContainer"
import SettingsPanelContainer from "/imports/settings/client/SettingsPanelContainer"

export default class Settings extends Component {

    static propTypes = {
        user : PropTypes.object.isRequired,
        config : PropTypes.object.isRequired,
        tenant : PropTypes.object.isRequired,
        domain : PropTypes.object.isRequired,
        logLevels : PropTypes.array.isRequired,
        campaignUnits : PropTypes.array.isRequired,
        admins : PropTypes.array.isRequired,
        states : PropTypes.array.isRequired,
        countries : PropTypes.array.isRequired,
        timezones : PropTypes.array.isRequired,
        selectUsers : PropTypes.array.isRequired
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
