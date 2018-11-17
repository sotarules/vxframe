import { Component } from "react";
import PropTypes from "prop-types";

export default class IOSButton extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        iconClass : PropTypes.string.isRequired,
        title : PropTypes.string.isRequired,
    }

    render() {
        return (
            <div id={this.props.id}
                className="ios-button-group-member fade-ios flex-section flex-section-fixed"
                title={this.props.title}
                onClick={this.handleClick.bind(this)}>
                <span className={`ios-button-link ios-button-icon fa ${this.props.iconClass}`}/>
                <div className="ios-button-hotzone"/>
            </div>
        )
    }

    registerDelegate(delegate) {
        UXState[this.props.id] = delegate
    }

    handleClick(event) {
        OLog.debug("IOSButton.jsx handleClick id=" + this.props.id)
        if (!_.isFunction(UXState[this.props.id])) {
            OLog.error("IOSButton.jsx handleClick id=" + this.props.id + " no delegate has been registered")
        }
        UX.iosDisable("#" + this.props.id)
        UXState[this.props.id](() => {
            UX.iosEnable("#" + this.props.id)
        }, event, this)
    }
}
