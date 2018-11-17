import { Component } from "react"
import ProfileMain from "/imports/profile/client/ProfileMain.jsx"
import ProfileCredentials from "/imports/profile/client/ProfileCredentials.jsx"
import ProfileNotifications from "/imports/profile/client/ProfileNotifications.jsx"
import ProfilePreferences from "/imports/profile/client/ProfilePreferences.jsx"
import ProfileReports from "/imports/profile/client/ProfileReports.jsx"

export default class ProfilePanel extends Component {

    render() {
        return (
            <div className="row conserve-space fill">
                <div className="col-sm-12 fill">
                    {this.props.tabName === "profile" &&
                        <ProfileMain {...this.props}/>
                    }
                    {this.props.tabName === "credentials" &&
                        <ProfileCredentials {...this.props}/>
                    }
                    {this.props.tabName === "notifications" &&
                        <ProfileNotifications {...this.props}/>
                    }
                    {this.props.tabName === "preferences" &&
                        <ProfilePreferences {...this.props}/>
                    }
                    {this.props.tabName === "reports" &&
                        <ProfileReports {...this.props}/>
                    }
                </div>
            </div>
        )
    }
}
