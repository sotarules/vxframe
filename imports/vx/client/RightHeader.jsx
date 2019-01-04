import { Component } from "react"
import PropTypes from "prop-types"
import Decoration from "/imports/vx/client/Decoration"
import VXButton from "/imports/vx/client/VXButton"

export default class RightHeader extends Component {

    static propTypes = {
        iconUrl : PropTypes.string.isRequired,
        rounded : PropTypes.bool,
        name : PropTypes.string,
        description : PropTypes.string,
        message : PropTypes.string,
        decorationIconClassName : PropTypes.string,
        decorationColor : PropTypes.oneOf(["green", "yellow", "red", "gray", "black", "blue"]),
        decorationTooltip : PropTypes.string,
        isShowButton : PropTypes.bool,
        buttonId : PropTypes.string,
        buttonText : PropTypes.string,
        buttonClassName : PropTypes.string,
        onClickButton : PropTypes.func
    }

    render() {
        return (
            <div className="top-header flexi-fixed">
                <div className="row">
                    <div className="col-sm-12">
                        <table className="top-table">
                            <tbody>
                                <tr>
                                    <td className="top-left">
                                        <div className="decoration-container">
                                            <img className={this.props.rounded ? "top-image-rounded" : "top-image"}
                                                src={this.props.iconUrl}/>
                                            {this.props.decorationIconClassName &&
                                                <Decoration iconClassName={this.props.decorationIconClassName}
                                                    color={this.props.decorationColor}
                                                    size="medium"
                                                    tooltip={this.props.decorationTooltip}/>
                                            }
                                        </div>
                                    </td>
                                    <td className="top-center">
                                        <div className="top-text">
                                            {this.props.name &&
                                                <div className="top-name">
                                                    {this.props.name}
                                                </div>
                                            }
                                            {this.props.description &&
                                                <div className="top-description">
                                                    {this.props.description}
                                                </div>
                                            }
                                            {this.props.message &&
                                                <div className="top-message">
                                                    {this.props.message}
                                                </div>
                                            }
                                        </div>
                                    </td>
                                    {this.props.isShowButton &&
                                        <td className="top-right-button">
                                            <VXButton id={this.props.buttonId}
                                                className={this.props.buttonClassName}
                                                onClick={this.props.onClickButton}>
                                                {this.props.buttonText}
                                            </VXButton>
                                        </td>
                                    }
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                {this.props.children &&
                    <div>
                        <div id="right-header-collapse"
                            className={`collapse ${UX.expandInClass()}`}>
                            {this.props.children}
                        </div>
                        <a className={`entity-collapse-control fa ${UX.expandChevronClass()} fa-xs`}
                            onClick={this.handleClickCollapse.bind(this)}></a>
                        <div className="entity-collapse-control-hotzone"
                            onTouchStart={this.handleTouchStartCollapse.bind(this)}>
                        </div>
                    </div>
                }
            </div>
        )
    }

    handleClickCollapse(event) {
        OLog.debug("RightHeader.jsx handleClickCollapse")
        if (UX.isHotzoneClick(event, "entity-collapse-control-hotzone")) {
            return
        }
        this.handleCollapse()
    }

    handleTouchStartCollapse(event) {
        OLog.debug("RightHeader.jsx handleTouchStartCollapse")
        UX.armTouchClick(event)
        this.handleCollapse()
    }

    handleCollapse() {
        OLog.debug("RightHeader.jsx handleCollapse")
        UX.toggleCollapse("#right-header-collapse", ".entity-collapse-control")
    }
}
