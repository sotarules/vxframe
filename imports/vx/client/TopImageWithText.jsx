import {Component} from "react"
import PropTypes from "prop-types"
import Decoration from "./Decoration"

export default class TopImageWithText extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        className : PropTypes.string,
        name : PropTypes.string,
        nameClassName : PropTypes.string,
        description : PropTypes.string,
        descriptionClassName : PropTypes.string,
        message : PropTypes.string,
        messageClassName : PropTypes.string,
        iconUrl : PropTypes.string,
        rounded : PropTypes.bool,
        decorationIconClassName : PropTypes.string,
        decorationColor : PropTypes.oneOf(["green", "yellow", "red", "gray", "black", "blue"]),
        decorationTooltip : PropTypes.string
    }

    static defaultProps = {
        id : "top-image-with-text"
    }

    render() {
        return (
            <div className={`top-image-with-text ${this.props.className || ""}`}>
                <div className="top-image-with-text-left">
                    <div className="decoration-container">
                        <img className={this.roundedClassName()}
                            src={this.props.iconUrl}/>
                        {this.props.decorationIconClassName &&
                            <Decoration iconClassName={this.decorationIconClassName()}
                                color={this.props.decorationColor}
                                size="medium"
                                tooltip={this.props.decorationTooltip}/>
                        }
                    </div>
                </div>
                <div className="top-image-with-text-right">
                    <div className="top-text">
                        {this.props.name &&
                            <div className={`top-name ${this.props.nameClassName || ""}`}>
                                {this.props.name}
                            </div>
                        }
                        {this.props.description &&
                            <div className={`top-description ${this.props.descriptionClassName || ""}`}>
                                {this.props.description}
                            </div>
                        }
                        {this.props.message &&
                            <div className={`top-message ${this.props.messageClassName || ""}`}>
                                {this.props.message}
                            </div>
                        }
                        {this.props.children}
                    </div>
                </div>
            </div>
        )
    }

    roundedClassName() {
        return this.props.rounded ? "top-image-rounded" : "top-image"
    }

    decorationIconClassName() {
        return `${this.props.decorationIconClassName} fa-lg entity-decoration-icon-medium`
    }
}
