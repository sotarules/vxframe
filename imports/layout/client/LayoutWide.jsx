import { Component } from "react"

import PropTypes from "prop-types"
import TransitionGroup from "react-transition-group/TransitionGroup"
import RouteSlidePanel from "/imports/vx/client/RouteSlidePanel"
import OffCanvasNavContainer from "/imports/layout/client/OffCanvasNavContainer"
import TopBar from "/imports/layout/client/TopBar"
import NotAuthorizedPage from "/imports/notfound/client/NotAuthorizedPage"
import LoadingSpinner from "/imports/vx/client/LoadingSpinner"
import VXAnchor from "/imports/vx/client/VXAnchor"

export default class LayoutWide extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        exemptRoute : PropTypes.bool,
        authorizedRoute : PropTypes.bool,
        loading : PropTypes.bool
    }

    static defaultProps = {
        id : "vx-layout-wide"
    }

    render() {
        OLog.debug(`LayoutWide.jsx render id=${this.slidePanelId()} loading=${this.props.loading} ` +
            ` authorizeRoute=${this.props.authorizedRoute}`)
        if (this.props.loading) {
            return (<LoadingSpinner/>)
        }
        if (!this.props.authorizedRoute) {
            return (<NotAuthorizedPage/>)
        }
        return (
            <div id={this.props.id}
                className="flexi-grow">
                <OffCanvasNavContainer/>
                <TopBar/>
                <div className="container-wide nav-canvas flexi-grow">
                    <div className="animation-top flexi-grow">
                        <div className="animation-container notification-container flexi-grow">
                            <TransitionGroup id="layout-transition-group" component="div" className="flexi-grow">
                                <RouteSlidePanel key={this.slidePanelId()}
                                    id={this.slidePanelId()}
                                    location={this.props.location}
                                    className="animation-panel flexi-grow"
                                    getAnimation={this.getAnimation.bind(this)}>
                                    {this.props.children}
                                </RouteSlidePanel>
                            </TransitionGroup>
                        </div>
                    </div>
                </div>
                <VXAnchor/>
            </div>
        )
    }

    slidePanelId() {
        // Pathname fallback is used when page is reloaded and no BroswerHistory is established
        return this.props.location.key || this.props.location.pathname
    }

    getAnimation() {
        return this.animation
    }

    setAnimation(animation) {
        this.animation = animation
    }
}
