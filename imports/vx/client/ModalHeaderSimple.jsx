import { Component } from "react";
import PropTypes from "prop-types";

export default class ModalHeaderSimple extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        title : PropTypes.string.isRequired,
        subtitle : PropTypes.string,
        iconClass : PropTypes.string,
        centerTitle : PropTypes.bool,
    }

    static defaultProps = {
        id : "modal-header-simple"
    }

    render() {
        return (
            <div id={this.props.id}
                className={`modal-header flexi-fixed ${this.props.centerTitle ? "modal-title-container" : ""}`}
                ref={element => { this.element = element } }>
                <div id={`${this.props.id}-title`}
                    className="modal-title">
                    {this.props.iconClass &&
                        <span className={this.props.iconClass}></span>
                    }
                    {" "}{this.props.title}
                </div>
                {this.props.subtitle &&
                    <div  id={`${this.props.id}-subtitle`}
                        className="modal-subtitle">
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
