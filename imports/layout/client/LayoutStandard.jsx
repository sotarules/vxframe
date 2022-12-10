import { Component } from "react"
import PropTypes from "prop-types"
import { TransitionGroup } from "react-transition-group"
import RouteSlidePanel from "/imports/vx/client/RouteSlidePanel"
import LoadingSpinner from "/imports/vx/client/LoadingSpinner"
import VXAnchor from "/imports/vx/client/VXAnchor"
import OffCanvasNavContainer from "/imports/layout/client/OffCanvasNavContainer"
import TopBar from "/imports/layout/client/TopBar"
import NotAuthorizedPage from "/imports/notfound/client/NotAuthorizedPage"

export default class LayoutStandard extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        exemptRoute : PropTypes.bool,
        authorizedRoute : PropTypes.bool,
        wideRoute : PropTypes.bool,
        loading : PropTypes.bool,
    }

    static defaultProps = {
        id : "vx-layout-standard"
    }

    render() {
        OLog.debug(`LayoutStandard.jsx render id=${this.slidePanelId()} loading=${this.props.loading} ` +
            ` authorizeRoute=${this.props.authorizedRoute}`)
        if (this.props.loading) {
            return (<LoadingSpinner/>)
        }
        return (
            <div id={this.props.id}
                className="flexi-grow">
                <OffCanvasNavContainer/>
                <TopBar/>
                <div className={`${this.containerClassName()} nav-canvas flexi-grow`}>
                    {this.props.authorizedRoute ? (
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
                    ) : (
                        <NotAuthorizedPage/>
                    )}
                </div>
                <VXAnchor/>
            </div>
        )
    }

    containerClassName() {
        return this.props.wideRoute ? "container-wide" : "container container-width-100"
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
