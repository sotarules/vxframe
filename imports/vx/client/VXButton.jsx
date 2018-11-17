import React, { Component } from "react"
import PropTypes from "prop-types"
import Ladda from "ladda"

const XS = "xs"
const S = "s"
const L = "l"
const XL = "xl"

const SIZES = [
    XS,
    S,
    L,
    XL,
]

const CONTRACT = "contract"
const CONTRACT_OVERLAY = "contract-overlay"
const EXPAND_LEFT = "expand-left"
const EXPAND_RIGHT = "expand-right"
const EXPAND_UP = "expand-up"
const EXPAND_DOWN = "expand-down"
const SLIDE_LEFT = "slide-left"
const SLIDE_RIGHT = "slide-right"
const SLIDE_UP = "slide-up"
const SLIDE_DOWN = "slide-down"
const ZOOM_IN = "zoom-in"
const ZOOM_OUT = "zoom-out"

const STYLES = [
    CONTRACT,
    CONTRACT_OVERLAY,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,
    EXPAND_DOWN,
    SLIDE_LEFT,
    SLIDE_RIGHT,
    SLIDE_UP,
    SLIDE_DOWN,
    ZOOM_IN,
    ZOOM_OUT,
]

const OMITTED_PROPS = [
    "iconClass",
    "tooltip",
    "minimumDuration",
    "defeat"
]

export default class VXButton extends Component {

    static propTypes = {
        children: PropTypes.node,
        className: PropTypes.string,
        tooltip: PropTypes.string,
        iconClass: PropTypes.string,
        minimumDuration: PropTypes.number,
        // Ladda props
        // eslint-disable-next-line react/no-unused-prop-types
        "data-color": PropTypes.string,
        // eslint-disable-next-line react/no-unused-prop-types
        "data-size": PropTypes.oneOf(SIZES),
        // eslint-disable-next-line react/no-unused-prop-types
        "data-style": PropTypes.oneOf(STYLES),
        // eslint-disable-next-line react/no-unused-prop-types
        "data-spinner-size": PropTypes.number,
        // eslint-disable-next-line react/no-unused-prop-types
        "data-spinner-color": PropTypes.string,
        // eslint-disable-next-line react/no-unused-prop-types
        "data-spinner-lines": PropTypes.number,
    }

    static defaultProps = {
        "data-style" : "zoom-in",
        minimumDuration : 350
    }

    constructor(props) {
        super(props)
        this.state = { loading : false }
    }

    componentWillUnmount() {
        this.stop()
    }

    start() {
        if (this.props.defeat) {
            return
        }
        if (this.state.loading) {
            return
        }
        this.setState({ loading : true }, () => {
            if (!this.laddaInstance) {
                this.laddaInstance = Ladda.create(this.node)
                this.laddaInstance.start()
            }
        })
    }

    stop() {
        if (!this.state.loading) {
            return
        }
        this.setState({ loading : false }, () => {
            if (this.laddaInstance) {
                this.laddaInstance.stop()
                this.laddaInstance.remove()
                this.laddaInstance = null
            }
        })
    }

    render() {
        return (
            <button
            {...UX.omit(this.props, OMITTED_PROPS)}
            type="button"
            className={`ladda-button ${this.props.className || ""}`}
            ref={(node) => {this.node = node}}
            title={this.props.tooltip}
            data-spinner-color={this.dataSpinnerColor()}
            onClick={this.handleClick.bind(this)}>
            <span className="ladda-label">
                {this.props.iconClass &&
                    <i className={this.iconClassName()}></i>
                }
                {UX.parseHtml(this.props.children)}
            </span>
            </button>
        )
    }

    iconClassName() {
        let className = this.props.iconClass
        if (this.props.children) {
            className += " space-after"
        }
        return className
    }

    dataSpinnerColor() {
        return this.props.className && this.props.className.indexOf("btn-default") >= 0 ? "#555555" : null
    }

    handleClick(event) {
        if (!this.props.onClick) {
            return
        }
        event.persist()
        this.start()
        let minimumDuration = this.props.defeat ? 0 : this.props.minimumDuration
        Meteor.setTimeout(() => {
            this.props.onClick(() => {
                this.stop()
            }, event, this)
        }, minimumDuration)
    }
}
