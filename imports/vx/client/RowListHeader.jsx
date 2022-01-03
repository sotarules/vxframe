import { Component } from "react"
import PropTypes from "prop-types"
import Decoration from "/imports/vx/client/Decoration"

export default class RowListHeader extends Component {

    static propTypes = {
        name : PropTypes.string,
        nameClassName : PropTypes.string,
        description : PropTypes.string,
        descriptionClassName : PropTypes.string,
        draggable : PropTypes.bool,
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
        customComponentRight: PropTypes.element
    }

    render() {
        return (
            <div className="row">
                <div className="col-sm-12">
                    <table className="top-table">
                        <tbody>
                            <tr>
                                <td className={`entity-left ${this.conditionalHandle()}`}>
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
                                {this.props.iconUrlRight &&
                                    <td className={`top-right ${this.conditionalHandle()}}`}>
                                        <div className="decoration-container">
                                            <img className={this.roundedRightClassName()}
                                                src={this.props.iconUrlRight}/>
                                            {this.props.decorationIconClassNameRight &&
                                            <Decoration iconClassName={this.rightDecorationIconClassName()}
                                                color={this.props.decorationColorRight}
                                                size="medium"
                                                tooltip={this.props.decorationTooltipRight}/>
                                            }
                                        </div>
                                    </td>
                                }
                                {this.props.customComponentRight}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
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
        return `${this.props.decorationIconClassNameRight} entity-decoration-icon-small`
    }

    conditionalHandle() {
        return this.props.draggable ? "entity-handle" : ""
    }
}
