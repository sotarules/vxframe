import { Component } from "react"
import SettingsSystem from "/imports/settings/client/SettingsSystem.jsx"
import SettingsTenant from "/imports/settings/client/SettingsTenant.jsx"
import SettingsDomain from "/imports/settings/client/SettingsDomain.jsx"

export default class SettingsPanel extends Component {

    render() {
        return (
            <div className="row conserve-space fill">
                <div className="col-sm-12 fill">
                    {this.props.tabName === "system" &&
                        <SettingsSystem {...this.props}/>
                    }
                    {this.props.tabName === "tenant" &&
                        <SettingsTenant {...this.props}/>
                    }
                    {this.props.tabName === "domain" &&
                        <SettingsDomain {...this.props}/>
                    }
                </div>
            </div>
        )
    }
}
