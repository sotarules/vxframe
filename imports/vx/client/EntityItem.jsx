import { Component } from "react"
import PropTypes from "prop-types"
import Decoration from "/imports/vx/client/Decoration"

export default class EntityItem extends Component {

    static displayName = "EntityItem"

    static propTypes = {
        _id : PropTypes.string.isRequired,
        name : PropTypes.string,
        nameClassName : PropTypes.string,
        description : PropTypes.string,
        descriptionClassName : PropTypes.string,
        message : PropTypes.string,
        messageClassName : PropTypes.string,
        iconUrl : PropTypes.string.isRequired,
        rounded : PropTypes.bool,
        decorationIconClassName : PropTypes.string,
        decorationColor : PropTypes.oneOf(["green", "yellow", "red", "gray", "black", "blue"]),
        decorationTooltip : PropTypes.string,
        iconUrlRight : PropTypes.string,
        roundedRight : PropTypes.bool,
        decorationIconClassNameRight : PropTypes.string,
        decorationColorRight : PropTypes.oneOf(["green", "yellow", "red", "gray", "black", "blue"]),
        decorationTooltipRight : PropTypes.string,
        chevrons : PropTypes.bool,
        selectable : PropTypes.bool,
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
                onFocus={this.handleFocus.bind(this)}
                ref={node => {this.node = node}}>
                <div className="entity-container-small" data-mongo-id={this.props._id}>
                    <table className="entity-table">
                        <tbody>
                            <tr>
                                <td className="entity-left entity-handle">
                                    <div className="decoration-container">
                                        <img className={this.roundedClassName()}
                                            src={this.props.iconUrl}/>
                                        {this.props.decorationIconClassName &&
                                            <Decoration iconClassName={this.decorationIconClassName()}
                                                color={this.props.decorationColor}
                                                size="small"
                                                tooltip={this.props.decorationTooltip}/>
                                        }
                                    </div>
                                </td>
                                <td className="entity-center">
                                    <div className="entity-text">
                                        {this.props.name &&
                                            <div className={`entity-name ${this.props.nameClassName || ""}`}>
                                                {this.props.name}
                                            </div>
                                        }
                                        {this.props.description &&
                                            <div className={`entity-description ${this.props.descriptionClassName || ""}`}>
                                                {this.props.description}
                                            </div>
                                        }
                                        {this.props.message &&
                                            <div className={`entity-message ${this.props.messageClassName || ""}`}>
                                                {this.props.message}
                                            </div>
                                        }
                                    </div>
                                </td>
                                {this.props.children}
                                {this.props.iconUrlRight &&
                                    <td className="entity-right entity-handle">
                                        <div className="decoration-container">
                                            <img className={this.roundedRightClassName()}
                                                src={this.props.iconUrlRight}/>
                                            {this.props.decorationIconClassNameRight &&
                                                <Decoration iconClassName={this.decorationIconClassNameRight()}
                                                    color={this.props.decorationColorRight}
                                                    size="small"
                                                    tooltip={this.props.decorationTooltipRight}/>
                                            }
                                        </div>
                                    </td>
                                }
                                {this.props.chevrons ? (
                                    <td className="chevron-list">
                                        <span className="fa fa-chevron-right"></span>
                                    </td>
                                ) : (
                                    <td className="chevron-list-stand-in">
                                    </td>
                                )}
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

    roundedClassName() {
        return this.props.rounded ? "entity-list-image-rounded" : "entity-list-image"
    }

    roundedRightClassName() {
        return this.props.roundedRight ? "entity-list-image-rounded" : "entity-list-image"
    }

    decorationIconClassName() {
        return `${this.props.decorationIconClassName} entity-decoration-icon-small`
    }

    rightDecorationIconClassName() {
        return `${this.props.decorationIconClassNameRight} entity-decoration-icon-medium`
    }

    handleFocus(event) {
        OLog.debug("EntityItem.jsx handleFocus *focus*")
        this.props.onSelect(event, this)
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
