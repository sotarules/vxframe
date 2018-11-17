import { Component } from "react";
import PropTypes from "prop-types";
import VXModal from "/imports/vx/client/VXModal.jsx"
import ModalHeaderSimple from "/imports/vx/client/ModalHeaderSimple.jsx"
import ModalFooterYesNo from "/imports/vx/client/ModalFooterYesNo.jsx"

export default class CancelChangesModal extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        onClickYes : PropTypes.func.isRequired
    }

    static defaultProps = {
        id : "cancel-changes-modal"
    }

    render() {
        return (
            <VXModal id={this.props.id} contentClass="modal-cancel-changes-content">
                <ModalHeaderSimple title={Util.i18n("common.label_cancel_changes")}
                    closeButton={false}
                    centerTitle={true}/>
                <ModalFooterYesNo onClickYes={this.props.onClickYes}/>
            </VXModal>
        )
    }
}
