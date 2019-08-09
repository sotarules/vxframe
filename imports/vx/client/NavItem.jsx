import { Component } from "react";
import PropTypes from "prop-types";

export default class NavItem extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        iconClass : PropTypes.string.isRequired,
        text : PropTypes.string.isRequired,
        onSelect : PropTypes.func.isRequired
    }

    render() {
        return (
            <li tabIndex="0" id={this.props.id}
                className="list-group-item nav-list-container"
                onFocus={this.handleFocus.bind(this)}
                ref={node => {this.node = node}}>
                <span className={this.iconClasses()}></span>
                <span className="list-group-text">{this.props.text}</span>
            </li>
        )
    }

    iconClasses() {
        return "fa fa-fw " + (this.props.iconClass ? " " + this.props.iconClass : "")
    }

    handleFocus(event) {
        this.props.onSelect(event)
    }
}
