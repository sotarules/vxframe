import { Component } from "react";
import PropTypes from "prop-types";

export default class ModalBody extends Component {

    static propTypes = {
        className : PropTypes.string,
        scrollable : PropTypes.bool
    }

    static defaultProps = {
        scrollable : true
    }

    render() {
        return (
            <div className={this.className()}>
                <div className="modal-form">
                    {this.props.children}
                </div>
            </div>
        )
    }

    className() {
        return `modal-body ${this.scrollClasses()} ${this.props.className || ""}`
    }

    scrollClasses() {
        return this.props.scrollable ? "scroll-y scroll-momentum" : ""
    }
}
