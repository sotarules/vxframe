import { Component } from "react"
import PropTypes from "prop-types"
import VXButton from "./VXButton"

export default class ModalFooterYesNo extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        onClickYes : PropTypes.func.isRequired
    }

    static defaultProps = {
        id : "modal-footer-yes-no"
    }

    render() {
        return (
            <div id="modal-footer-yes-no"
                className="modal-footer"
                ref={element => { this.element = element } }>
                <div className="row">
                    <div className="col-sm-6 modal-button">
                        <VXButton id="button-cancel-no"
                            className="btn btn-block btn-default"
                            onClick={this.handleClickNo.bind(this)}>
                            {Util.i18n("common.button_no")}
                        </VXButton>
                    </div>
                    <div className="col-sm-6 modal-button">
                        <VXButton id="button-cancel-yes"
                            className="btn btn-block btn-primary"
                            onClick={this.handleClickYes.bind(this)}>
                            {Util.i18n("common.button_yes")}
                        </VXButton>
                    </div>
                </div>
            </div>
        )
    }

    handleClickNo(laddaCallback) {
        laddaCallback()
        const modalId = UX.findModalId(this.element)
        UX.dismissModal(modalId)
    }

    handleClickYes(laddaCallback) {
        OLog.debug("ModalFooterYesNo.jsx handleClickYes");
        this.props.onClickYes((success) => {
            laddaCallback()
            if (success) {
                const modalId = UX.findModalId(this.element)
                UX.dismissModal(modalId)
            }
        })
    }
}
