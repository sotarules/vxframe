import { Component } from "react"
import PropTypes from "prop-types"
import Decoration from "/imports/vx/client/Decoration"

export default class EntityItem extends Component {

    static displayName = "EntityItem"

    static propTypes = {
        id: PropTypes.string.isRequired,
        itemId : PropTypes.string,
        dbId : PropTypes.string,
        name : PropTypes.string,
        nameClassName : PropTypes.string,
        description : PropTypes.string,
        descriptionClassName : PropTypes.string,
        message : PropTypes.string,
        messageClassName : PropTypes.string,
        iconUrl : PropTypes.string.isRequired,
        rounded : PropTypes.bool,
        iconTooltip : PropTypes.string,
        decorationIconClassName : PropTypes.string,
        decorationColor : PropTypes.oneOf(["green", "yellow", "red", "gray", "black", "blue"]),
        decorationTooltip : PropTypes.string,
        decorationPosition : PropTypes.oneOf(["upper-left", "upper-right", "lower-left", "lower-right"]),
        iconUrlRight : PropTypes.string,
        roundedRight : PropTypes.bool,
        iconTooltipRight : PropTypes.string,
        decorationIconClassNameRight : PropTypes.string,
        decorationColorRight : PropTypes.oneOf(["green", "yellow", "red", "gray", "black", "blue"]),
        decorationTooltipRight : PropTypes.string,
        decorationPositionRight : PropTypes.oneOf(["upper-left", "upper-right", "lower-left", "lower-right"]),
        chevrons : PropTypes.bool,
        selectable : PropTypes.bool,
        draggable : PropTypes.bool,
        droppable : PropTypes.bool,
        multi : PropTypes.bool,
        controls : PropTypes.array,
        onSelect : PropTypes.func
    }

    render() {
        return (
            <li id={this.props.id}
                data-item-id={this.props.itemId}
                data-db-id={this.props.dbId}
                tabIndex={this.props.selectable ? "0" : null}
                className="vx-list-item list-group-item chevron-list-group-item entity-control-container"
                onFocus={this.handleFocus.bind(this)}
                ref={node => {this.node = node}}>
                <div className="entity-container-small">
                    <table className="entity-table">
                        <tbody>
                            <tr>
                                <td className={`entity-left ${this.conditionalHandle()}`}>
                                    <div className="decoration-container">
                                        <img className={this.roundedClassName()}
                                            src={this.props.iconUrl}
                                            title={this.props.iconTooltip}/>
                                        {this.props.decorationIconClassName &&
                                            <Decoration iconClassName={this.decorationIconClassName()}
                                                color={this.props.decorationColor}
                                                size="small"
                                                tooltip={this.props.decorationTooltip}
                                                position={this.props.decorationPosition}/>
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
                                    <td className={`entity-right  ${this.conditionalHandle()}`}>
                                        <div className="decoration-container">
                                            <img className={this.roundedClassNameRight()}
                                                src={this.props.iconUrlRight}
                                                title={this.props.iconTooltipRight}/>
                                            {this.props.decorationIconClassNameRight &&
                                                <Decoration iconClassName={this.decorationIconClassNameRight()}
                                                    color={this.props.decorationColorRight}
                                                    size="small"
                                                    tooltip={this.props.decorationTooltipRight}
                                                    position={this.props.decorationPositionRight}/>
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
                    {this.renderControls()}
                    {this.renderHandle()}
                </div>
            </li>
        )
    }

    renderHandle() {
        if (!this.props.draggable) {
            return null
        }
        return (
            <a className="row-handle entity-handle fa fa-bars fa-xs"/>
        )
    }

    renderControls() {
        if (!this.props.controls) {
            return null
        }
        return (
            <div className="entity-control-set">
                {this.renderControlRow()}
            </div>
        )
    }

    renderControlRow() {
        return this.props.controls.map((control, index) => {
            return (
                <a className={`entity-control-element fa fa-xs ${this.controlClassName(control.className)}`}
                    id={`${this.props.id}-control-${index}`}
                    key={`${this.props.id}-control-${index}`}
                    data-toggle="tooltip"
                    data-container="body"
                    title={control.tooltip}
                    onClick={this.handleClickControlSet.bind(this)}>
                </a>
            )
        })
    }

    controlClassName(className) {
        return typeof className === "function" ? className(this.props.itemId) : className
    }

    roundedClassName() {
        return this.props.rounded ? "entity-list-image-rounded" : "entity-list-image"
    }

    roundedClassNameRight() {
        return this.props.roundedRight ? "entity-list-image-rounded" : "entity-list-image"
    }

    decorationIconClassName() {
        return `${this.props.decorationIconClassName} entity-decoration-icon-small`
    }

    decorationIconClassNameRight() {
        return `${this.props.decorationIconClassNameRight} entity-decoration-icon-small`
    }

    conditionalHandle() {
        return this.props.draggable ? "entity-handle" : ""
    }

    handleFocus(event) {
        this.props.onSelect(event, this)
    }

    handleClickControlSet(event) {
        const id = $(event.target).attr("id")
        const index = Util.lastToken(id, "-")
        const control = this.props.controls[index]
        if (control.onClick) {
            control.onClick(event, this, index)
        }
    }
}
