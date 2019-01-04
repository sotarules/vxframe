import { Component } from "react"
import ProfileMain from "/imports/profile/client/ProfileMain"
import ProfileCredentials from "/imports/profile/client/ProfileCredentials"
import ProfileNotifications from "/imports/profile/client/ProfileNotifications"
import ProfilePreferences from "/imports/profile/client/ProfilePreferences"
import ProfileReports from "/imports/profile/client/ProfileReports"

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
