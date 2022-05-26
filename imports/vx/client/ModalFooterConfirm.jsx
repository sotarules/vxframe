import { Component } from "react"
import PropTypes from "prop-types"
import VXButton from "./VXButton"

export default class ModalFooterConfirm extends Component {

    static propTypes = {
        diableConfirm : PropTypes.bool,
        onClickConfirm : PropTypes.func.isRequired,
        onClickCancel : PropTypes.func
    }

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="modal-footer"
                ref={element => { this.element = element } }>
                <div className="row">
                    <div className="col-xs-6 modal-button">
                        <VXButton id="modal-button-cancel"
                            className="btn btn-block btn-default"
                            onClick={this.handleClickCancel.bind(this)}>
                            {Util.i18n("common.button_cancel")}
                        </VXButton>
                    </div>
                    <div className="col-xs-6 modal-button">
                        <VXButton id="modal-button-confirm"
                            disabled={this.props.disableConfirm}
                            className="btn btn-block btn-primary"
                            onClick={this.handleClickConfirm.bind(this)}>
                            {Util.i18n("common.button_confirm")}
                        </VXButton>
                    </div>
                </div>
            </div>
        )
    }

    handleClickCancel(callback) {
        callback()
        const modalId = UX.findModalId(this.element)
        UX.dismissModal(modalId)
        if (this.props.onClickCancel) {
            this.props.onClickCancel()
        }
    }

    handleClickConfirm(callback, event) {
        this.props.onClickConfirm(success => {
            callback()
            if (success) {
                const modalId = UX.findModalId(this.element)
                UX.dismissModal(modalId)
            }
        }, event)
    }
}
