import { Component } from "react"
import PropTypes from "prop-types"
import IOSBackButton from "/imports/layout/client/IOSBackButton"
import IOSButton from "/imports/layout/client/IOSButton"

export default class IOSButtonBar extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        iosState : PropTypes.object.isRequired
    }

    static defaultProps = {
        id : "ios-button-bar"
    }

    static getDerivedStateFromProps(newProps) {
        return { isButtonBarVisible : UX.isIosButtonBarVisible(newProps.iosState) }
    }

    constructor(props) {
        super(props)
        this.state = { isButtonBarVisible : UX.isIosButtonBarVisible(props.iosState) }
        this.locked = false
    }

    shouldComponentUpdate() {
        return !this.locked
    }

    setLocked(locked) {
        this.locked = locked
    }

    render() {
        if (this.state.isButtonBarVisible) {
            return (
                <div id={this.props.id}
                    className={`ios-button-bar ${this.className()}`}>
                    {this.renderBackButton()}
                    {this.renderPosition("left")}
                    {this.renderPosition("right")}
                </div>
            )
        }
        return (
            <div id={this.props.id}
                className={`ios-button-bar-placeholder ${this.className()}`}/>
        )
    }

    renderBackButton() {
        if (UX.isIosBackButtonVisible(this.props.iosState)) {
            return (
                <IOSBackButton id="ios-button-back"
                    backLabel={UX.backLabel(this.props.iosState)}/>
            )
        }
        return null
    }

    renderPosition(position) {
        return (
            <div className={`ios-button-group-${position}`}>
                {this.renderPositionButtons(position)}
            </div>
        )
    }

    renderPositionButtons(position) {
        if (!this.isAnyButtonDeclared(position)) {
            return null
        }
        const iosButtonState = this.props.iosState.iosButtonState
        const currentPanel = UX.getCurrentPanel(Util.routePath())
        if (UX.isSlideMode() && position.toUpperCase() !== currentPanel) {
            OLog.warn(`IOSButtonBar.jsx renderPositionButtons position=${position} currentPanel=${currentPanel} ` +
                "no buttons shall be rendered")
            return null
        }
        // Back button takes precedence over left-positioned controls:
        if (UX.isIosBackButtonVisible(this.props.iosState) && position === "left") {
            OLog.warn("IOSButtonBar.jsx renderPositionButtons back button shall take precedence over left controls")
            return null
        }
        const results = []
        Object.keys(iosButtonState).forEach(buttonId => {
            const buttonState = iosButtonState[buttonId]
            if (buttonState.position === position) {
                results.push((
                    <IOSButton id={buttonId}
                        key={buttonId}
                        position={position}
                        iconClass={buttonState.iconClass}
                        iconStyle={buttonState.iconStyle}
                        showLoading={buttonState.showLoading}
                        minimumDuration={buttonState.minimumDuration}
                        title={Util.i18n(buttonState.title)}/>
                ))
            }
        })
        return results
    }

    isAnyButtonDeclared(position) {
        const iosButtonState = this.props.iosState.iosButtonState
        const buttonInfo = _.find(iosButtonState, button => {
            return button.position === position
        })
        return !!buttonInfo
    }

    className() {
        return "flexi-fixed flex-direction-row flex-justify-space-between " +
            "not-selectable hidden-print lock-exiting-component"
    }
}
