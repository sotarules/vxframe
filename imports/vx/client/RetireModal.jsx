import { Component } from "react"
import PropTypes from "prop-types"
import VXModal from "/imports/vx/client/VXModal.jsx"
import ModalHeaderSimple from "/imports/vx/client/ModalHeaderSimple.jsx"
import ModalBody from "/imports/vx/client/ModalBody.jsx"
import ModalFooterConfirm from "/imports/vx/client/ModalFooterConfirm.jsx"
import VXForm from "/imports/vx/client/VXForm.jsx"
import VXTextArea from "/imports/vx/client/VXTextArea.jsx"

export default class RetireModal extends Component {

    static propTypes = {
        title : PropTypes.string.isRequired,
        collection : PropTypes.object.isRequired,
        _id : PropTypes.string.isRequired,
        retireMethod : PropTypes.string.isRequired,
        sessionVariable : PropTypes.string.isRequired
    }

    render() {
        return (
            <VXModal id="retire-modal"
                contentClass="modal-basic-content">
                <ModalHeaderSimple title={this.props.title}
                    closeButton={false}
                    centerTitle={true}
                    iconClass="fa fa-times"/>
                <ModalBody thinPaddingTop={true}>
                    <VXForm id="retire-modal-form"
                        elementType="div"
                        receiveProps={false}
                        ref={(form) => { this.form = form }}>
                        <VXTextArea id="comment"
                            label={Util.i18n("common.label_enter_comment")}
                            className="text-area-resize modal-basic-comment"
                            rows={4}/>
                    </VXForm>
                </ModalBody>
                <ModalFooterConfirm onClickConfirm={this.handleClickConfirm.bind(this)}/>
            </VXModal>
        )
    }

    handleClickConfirm(callback) {
        let settings = UX.makeFormObject(this.form)
        Session.set(this.props.sessionVariable, undefined)
        Meteor.call(this.props.retireMethod, this.props._id, settings.comment, (error, result) => {
            callback(true)
            UX.notify(result, error, true)
            if (!error && result && result.success) {
                if (UX.isSlideMode(true)) {
                    UX.iosPopAndGo()
                }
            }
        })
    }
}
