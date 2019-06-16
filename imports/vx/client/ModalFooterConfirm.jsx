import { Component } from "react"
import PropTypes from "prop-types"
import VXButton from "/imports/vx/client/VXButton"

export default class ModalFooterConfirm extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        onClickConfirm : PropTypes.func.isRequired,
        onClickCancel : PropTypes.func,
        anchorSelector : PropTypes.string
    }

    static defaultProps = {
        id : "modal-footer-confirm",
        anchorSelector : "#vx-anchor"
    }

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div id={this.props.id} className="modal-footer">
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
        UX.dismissModal(this.props.id, this.props.anchorSelector)
        if (this.props.onClickCancel) {
            this.props.onClickCancel()
        }
    }

    handleClickConfirm(callback, event) {
        this.props.onClickConfirm(success => {
            callback()
            if (success) {
                UX.dismissModal(this.props.id, this.props.anchorSelector)
            }
        }, event)
    }
}
