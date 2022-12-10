import { Component } from "react"
import TopBarBurgerButton from "/imports/layout/client/TopBarBurgerButton"
import TopBarLogo from "/imports/layout/client/TopBarLogo"
import TopBarTitle from "/imports/layout/client/TopBarTitle"
import TopBarSubsystemStatusLightsContainer from "/imports/layout/client/TopBarSubsystemStatusLightsContainer"
import TopBarUserPhotoContainer from "/imports/layout/client/TopBarUserPhotoContainer"

export default class TopBar extends Component {

    render() {
        const environment = Util.getConfigValue("environment")
        const navbarClass = environment === "development" ? "navbar-custom-development" : "navbar-custom-production"
        return (
            <div className={`navbar navbar-custom ${navbarClass} navbar-custom-fixed flexi-fixed hidden-print`}>
                <table className="nav-table">
                    <tbody>
                        <tr>
                            <TopBarBurgerButton/>
                            <TopBarLogo/>
                            <TopBarTitle/>
                            <TopBarSubsystemStatusLightsContainer/>
                            <TopBarUserPhotoContainer/>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
