import { Component } from "react";
import PropTypes from "prop-types";

export default class ModalHeaderSimple extends Component {

    static propTypes = {
        title : PropTypes.string.isRequired,
        subtitle : PropTypes.string,
        iconClass : PropTypes.string,
        centerTitle : PropTypes.bool,
    }

    render() {
        return (
            <div className={`modal-header flexi-fixed ${this.props.centerTitle ? "modal-title-container" : ""}`}
                ref={element => { this.element = element } }>
                <div className="modal-title">
                    {this.props.iconClass &&
                        <span className={this.props.iconClass}></span>
                    }
                    {" "}{this.props.title}
                </div>
                {this.props.subtitle &&
                    <div className="modal-subtitle">
                        {this.props.subtitle}
                    </div>
                }
            </div>
        )
    }

    handleClickClose() {
        const modalId = UX.findModalId(this.element)
        UX.dismissModal(modalId)
    }
}
