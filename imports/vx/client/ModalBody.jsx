import { Component } from "react";
import PropTypes from "prop-types";

export default class ModalBody extends Component {

    static propTypes = {
        className : PropTypes.string
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
        return `modal-body scroll-y scroll-momentum ${this.props.className || ""}`
    }
}
