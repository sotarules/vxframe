import { Component } from "react"
import PropTypes from "prop-types"
import VXButton from "/imports/vx/client/VXButton"

export default class ModalFooterSimple extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        buttonText : PropTypes.string,
        buttonClassName : PropTypes.string,
        onClickButton : PropTypes.func,
        minimumDuration : PropTypes.number
    }

    static defaultProps = {
        id : "modal-footer-simple"
    }

    render() {
        return (
            <div id={this.props.id}
                className="modal-footer"
                ref={element => { this.element = element } }>
                <VXButton id="modal-button"
                    className={this.props.buttonClassName}
                    minimumDuration={this.props.minimumDuration}
                    onClick={this.handleClickButton.bind(this)}>
                    {this.props.buttonText}
                </VXButton>
            </div>
        )
    }

    handleClickButton(laddaCallback) {
        const modalId = UX.findModalId(this.element)
        if (!this.props.onClickButton) {
            UX.dismissModal(modalId)
            return
        }
        this.props.onClickButton((success) => {
            laddaCallback()
            if (success) {
                UX.dismissModal(modalId)
            }
        })
    }
}
