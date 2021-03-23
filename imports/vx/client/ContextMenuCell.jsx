import {Component} from "react"
import PropTypes from "prop-types"
import {contextMenu} from "react-contexify"

export default class ContextMenuCell extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string,
        contextMenuId : PropTypes.string.isRequired,
        data : PropTypes.object,
        onClick : PropTypes.func,
        onDoubleClick : PropTypes.func
    }

    constructor(props) {
        super(props)
        this.handleButtonPress = this.handleButtonPress.bind(this)
        this.handleButtonRelease = this.handleButtonRelease.bind(this)
    }

    render() {
        return (
            <div id={this.props.id}
                className={`context-menu-cell ${this.props.className || ""}`}
                onTouchStart={this.handleButtonPress}
                onTouchEnd={this.handleButtonRelease}
                onTouchMove={this.handleButtonRelease}
                onClick={this.handleClick.bind(this)}
                onDoubleClick={this.handleDoubleClick.bind(this)}
                onContextMenu={this.handleContextMenu.bind(this)}>
                {this.props.children}
            </div>
        )
    }

    handleButtonPress(event) {
        if (!UX.isTouch()) {
            return
        }
        if ($(event.target).closest(".entity-handle").length > 0) {
            OLog.debug("ContextMenuCell.jsx handleButtonPress entity handle pressed *ignored*")
            return
        }
        event.persist()
        this.buttonPressTimer = setTimeout(() => {
            const fakeEvent = UX.makeContextEvent(event)
            this.showContextMenu(event, fakeEvent)
        }, 500)
    }

    handleButtonRelease() {
        if (!UX.isTouch()) {
            return
        }
        clearTimeout(this.buttonPressTimer)
    }

    handleContextMenu(event) {
        if (event.ctrlKey && event.shiftKey) {
            return
        }
        event.preventDefault()
        event.stopPropagation()
        this.showContextMenu(event, event)
    }

    showContextMenu(realEvent, realOrFakeEvent) {
        const data = VXApp.makeContextCellData(realEvent)
        const props = { }
        props.data = { ...data, ...this.props.data }
        contextMenu.show({ id: this.props.contextMenuId, event : realOrFakeEvent, props : props })
    }

    handleClick(event) {
        if (this.props.onClick) {
            const data = VXApp.makeContextCellData(event)
            this.props.onClick(event, this, { ...data, ...this.props.data })
        }
    }

    handleDoubleClick(event) {
        if (this.props.onDoubleClick) {
            const data = VXApp.makeContextCellData(event)
            this.props.onDoubleClick(event, this, { ...data, ...this.props.data })
        }
    }
}
