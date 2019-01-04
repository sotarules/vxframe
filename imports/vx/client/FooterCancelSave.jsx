import { Component } from "react"
import PropTypes from "prop-types"
import VXButton from "/imports/vx/client/VXButton"
import CancelChangesModal from "/imports/vx/client/CancelChangesModal"

export default class FooterCancelSave extends Component {

    static propTypes = {
        onReset : PropTypes.func.isRequired,
        onSave : PropTypes.func.isRequired
    }

    render() {
        return (
            <div className="right-footer flex-section-fixed">
                <div className="form-actions-well">
                    <div className="row">
                        <div className="col-sm-12">
                            <VXButton id="button-cancel"
                                className="btn btn-default btn-custom btn-bottom btn-margin-right"
                                onClick={this.handleClickCancel.bind(this)}>
                                {Util.i18n("common.button_cancel")}
                            </VXButton>
                            <VXButton id="button-save"
                                className="btn btn-primary btn-custom btn-bottom"
                                onClick={this.handleClickSave.bind(this)}>
                                {Util.i18n("common.button_save")}
                            </VXButton>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    handleClickCancel(laddaCallback) {
        OLog.debug("FooterCancelSave.jsx handleClickCancel user=" + Util.getUserEmail())
        laddaCallback()
        UX.showModal(<CancelChangesModal id="cancel-changes-modal"
            onClickYes={this.handleClickCancelYes.bind(this)}/>)
    }

    handleClickSave(laddaCallback) {
        OLog.debug("FooterCancelSave.jsx handleClickSave user=" + Util.getUserEmail() + " delegate to onSave callback")
        this.props.onSave(laddaCallback)
    }

    handleClickCancelYes(callback) {
        OLog.debug("FooterCancelSave.jsx handleClickCancelYes user=" + Util.getUserEmail() + " revert form")
        this.props.onReset()
        callback(true)
    }
}
