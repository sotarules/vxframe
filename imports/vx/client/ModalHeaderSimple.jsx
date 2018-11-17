import { Component } from "react";
import PropTypes from "prop-types";

export default class ModalHeaderSimple extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        title : PropTypes.string.isRequired,
        iconClass : PropTypes.string,
        closeButton : PropTypes.bool,
        centerTitle : PropTypes.bool,
    }

    static defaultProps = {
        id : "modal-header-simple"
    }

    render() {
        return (
            <div id={this.props.id} className={"modal-header" + (this.props.centerTitle ? " modal-container" : "")}>
                {this.props.closeButton &&
                    <button type="button" className="close" aria-hidden="true" onClick={this.handleClickClose.bind(this)}>
                    &times;
                    </button>
                }
                <span className="modal-title" id="modal-title">
                    {this.props.iconClass &&
                        <span className={this.props.iconClass}></span>
                    }
                    {" "}{this.props.title}
                </span>
            </div>
        )
    }

    handleClickClose() {
        UX.dismissModal(this.props.id)
    }
}
