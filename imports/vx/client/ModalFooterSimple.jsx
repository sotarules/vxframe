import { Component } from "react"
import PropTypes from "prop-types"
import VXButton from "./VXButton"

export default class ModalFooterSimple extends Component {

    static propTypes = {
        buttonText : PropTypes.string,
        buttonClassName : PropTypes.string,
        onClickButton : PropTypes.func,
        minimumDuration : PropTypes.number
    }

    render() {
        return (
            <div className="modal-footer"
                ref={element => { this.element = element } }>
                <VXButton className={this.props.buttonClassName}
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
