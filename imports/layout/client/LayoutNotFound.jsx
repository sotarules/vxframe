import {Component} from "react"
import OffCanvasNavContainer from "/imports/layout/client/OffCanvasNavContainer"
import TopBar from "/imports/layout/client/TopBar"
import VXAnchor from "/imports/vx/client/VXAnchor"
import NotFoundPage from "/imports/notfound/client/NotFoundPage"

export default class LayoutNotFound extends Component {

    render() {
        return (
            <div className="flexi-grow">
                <OffCanvasNavContainer/>
                <TopBar/>
                <div className="nav-canvas notification-container not-found-container flexi-grow">
                    <NotFoundPage/>
                </div>
                <VXAnchor/>
            </div>
        )
    }
}
