import { Component } from "react"
import PropTypes from "prop-types"
import Decoration from "/imports/vx/client/Decoration"

export default class EntityItem extends Component {

    static displayName = "EntityItem"

    static propTypes = {
        _id : PropTypes.string.isRequired,
        iconUrl : PropTypes.string.isRequired,
        name : PropTypes.string,
        description : PropTypes.string,
        message : PropTypes.string,
        decorationIconClassName : PropTypes.string,
        decorationColor : PropTypes.oneOf(["green", "yellow", "red", "gray", "black", "blue"]),
        decorationTooltip : PropTypes.string,
        chevrons : PropTypes.bool,
        selectable : PropTypes.bool,
        rounded : PropTypes.bool,
        control : PropTypes.bool,
        controlClassName : PropTypes.string,
        controlTooltip : PropTypes.string,
        onSelect : PropTypes.func,
        onClickControl : PropTypes.func
    }

    render() {
        return (
            <li tabIndex={this.props.selectable ? "0" : null}
                className="list-group-item entity-control-container chevron-list-group-item"
                onClick={this.handleClick.bind(this)}
                onFocus={this.handleFocus.bind(this)}
                onTouchStart={this.handleTouchStart.bind(this)}
                ref={node => {this.node = node}}>
                <div className="entity-container-small" data-mongo-id={this.props._id}>
                    <table className="entity-table">
                        <tbody>
                            <tr>
                                <td className="entity-left entity-handle">
                                    <div className="decoration-container">
                                        <img className={this.props.rounded ? "entity-list-image-rounded" : "entity-list-image"}
                                            src={this.props.iconUrl}/>
                                        {this.props.decorationIconClassName &&
                                            <Decoration iconClassName={this.props.decorationIconClassName}
                                                color={this.props.decorationColor}
                                                size="small"
                                                tooltip={this.props.decorationTooltip}/>
                                        }
                                    </div>
                                </td>
                                <td className="entity-center">
                                    <div className="entity-text">
                                        {this.props.name &&
                                            <div className="entity-name">
                                                {this.props.name}
                                            </div>
                                        }
                                        {this.props.description &&
                                            <div className="entity-description">
                                                {this.props.description}
                                            </div>
                                        }
                                        {this.props.message &&
                                            <div className="entity-message">
                                                {this.props.message}
                                            </div>
                                        }
                                    </div>
                                </td>
                                {this.props.children}
                                {this.props.chevrons &&
                                    <td className="chevron-list">
                                        <span className="fa fa-chevron-right"></span>
                                    </td>
                                }
                            </tr>
                        </tbody>
                    </table>
                    {this.props.control &&
                        <div>
                            <a className={`entity-control fa fa-xs ${this.props.controlClassName}`}
                                data-toggle="tooltip"
                                data-container="body"
                                title={this.props.controlTooltip}
                                onClick={this.handleClickControl.bind(this)}>
                            </a>
                            <div className="entity-control-hotzone"
                                onTouchStart={this.handleTouchStartControl.bind(this)}/>
                        </div>
                    }
                </div>
            </li>
        )
    }

    handleClick() {
        // Click function now NO-OP due to improvements in React 16 (focus will suffice)
    }

    handleFocus(event) {
        this.props.onSelect(event, this)
    }

    handleTouchStart() {
        UX.armTouchClick(event)
        this.node.focus()
    }

    handleClickControl(event) {
        if (UX.isTouchClick(event)) {
            OLog.debug("EntityItem.jsx handleClickControl *touchclick* ignored")
            return
        }
        this.handleControl(event)
    }

    handleTouchStartControl(event) {
        UX.armTouchClick(event)
        this.handleControl(event)
    }

    handleControl(event) {
        if (this.props.onClickControl) {
            this.props.onClickControl(event, this)
        }
    }
}
