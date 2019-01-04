import { Component } from "react";
import PropTypes from "prop-types";
import VXButton from "/imports/vx/client/VXButton";

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
            <div id="modal-footer-yes-no" className="modal-footer">
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
        UX.dismissModal(this.props.id)
    }

    handleClickYes(laddaCallback) {
        OLog.debug("ModalFooterYesNo.jsx handleClickYes");
        this.props.onClickYes((success) => {
            laddaCallback()
            if (success) {
                UX.dismissModal(this.props.id)
            }
        })
    }
}
