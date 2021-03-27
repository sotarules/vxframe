import { Component } from "react"
import PropTypes from "prop-types"
import VXModal from "/imports/vx/client/VXModal"
import ModalHeaderSimple from "/imports/vx/client/ModalHeaderSimple"
import ModalBody from "/imports/vx/client/ModalBody"
import ModalFooterConfirm from "/imports/vx/client/ModalFooterConfirm"
import VXForm from "/imports/vx/client/VXForm"
import VXTextArea from "/imports/vx/client/VXTextArea"

export default class RetireModal extends Component {

    static propTypes = {
        title : PropTypes.string.isRequired,
        subtitle : PropTypes.string,
        collection : PropTypes.object.isRequired,
        _id : PropTypes.string.isRequired,
        retireMethod : PropTypes.string.isRequired,
        publishSetAction : PropTypes.func.isRequired,
        comment : PropTypes.bool.isRequired,
        beforeCallback : PropTypes.func,
        afterCallback : PropTypes.func
    }

    static defaultProps = {
        comment : true
    }

    render() {
        return (
            <VXModal id="retire-modal" width="350px">
                <ModalHeaderSimple title={this.props.title}
                    subtitle={this.props.subtitle}
                    centerTitle={true}
                    iconClass="fa fa-times"/>
                {this.props.comment &&
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
                }
                <ModalFooterConfirm onClickConfirm={this.handleClickConfirm.bind(this)}/>
            </VXModal>
        )
    }

    handleClickConfirm(callback) {
        if (this.props.beforeCallback) {
            this.props.beforeCallback(this.props._id)
        }
        const comment = this.props.comment ? UX.makeFormObject(this.form).comment : null
        Meteor.call(this.props.retireMethod, this.props._id, comment, (error, result) => {
            callback(true)
            UX.notify(result, error, true)
            if (!error && result && result.success) {
                if (this.props.afterCallback) {
                    this.props.afterCallback(this.props._id)
                }
                Store.dispatch(this.props.publishSetAction(null))
                if (UX.isSlideMode()) {
                    UX.iosPopAndGo()
                }
            }
        })
    }
}
