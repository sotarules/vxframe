import { Component } from "react"
import TopBarBurgerButton from "/imports/layout/client/TopBarBurgerButton.jsx"
import TopBarLogo from "/imports/layout/client/TopBarLogo.jsx"
import TopBarTitle from "/imports/layout/client/TopBarTitle.jsx"
import TopBarSubsystemStatusLightsContainer from "/imports/layout/client/TopBarSubsystemStatusLightsContainer.jsx"
import TopBarUserPhotoContainer from "/imports/layout/client/TopBarUserPhotoContainer.jsx"

export default class TopBar extends Component {

    render() {
        return (
            <div className="navbar navbar-custom navbar-custom-fixed flexi-fixed">
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
