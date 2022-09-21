import { Component } from "react"
import PropTypes from "prop-types"
import VXButton from "/imports/vx/client/VXButton"

export default class ReportTreeModalFooter extends Component {

    static propTypes = {
        onClickReset : PropTypes.func.isRequired
    }

    render() {
        return (
            <div className="modal-footer"
                ref={element => { this.element = element } }>
                <div className="row">
                    <div className="col-sm-6 modal-button">
                        <VXButton id="button-reset"
                            className="btn btn-block btn-default"
                            iconClass="fa fa-refresh"
                            onClick={this.handleClickReset.bind(this)}>
                            {Util.i18n("common.button_reset")}
                        </VXButton>
                    </div>
                    <div className="col-sm-6 modal-button">
                        <VXButton id="button-ok"
                            className="btn btn-block btn-default"
                            onClick={this.handleClickOK.bind(this)}>
                            {Util.i18n("common.button_ok")}
                        </VXButton>
                    </div>
                </div>
            </div>
        )
    }

    handleClickReset(laddaCallback) {
        laddaCallback()
        if (this.props.onClickReset) {
            this.props.onClickReset(this)
        }
    }

    handleClickOK() {
        const modalId = UX.findModalId(this.element)
        UX.dismissModal(modalId)
        return
    }
}
