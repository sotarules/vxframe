import {Component} from "react"
import PropTypes from "prop-types"
import VXModal from "/imports/vx/client/VXModal"
import ModalHeaderImage from "/imports/vx/client/ModalHeaderImage"
import ModalBody from "/imports/vx/client/ModalBody"
import ModalFooterConfirm from "/imports/vx/client/ModalFooterConfirm"
import VXForm from "/imports/vx/client/VXForm"
import VXTextArea from "/imports/vx/client/VXTextArea"
import VXCheck from "/imports/vx/client/VXCheck"
import {setReportAttachments, setReportRecipients} from "/imports/vx/client/code/actions"

export default class ReportSendModal extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        title : PropTypes.string.isRequired,
        report : PropTypes.object.isRequired
    }

    static defaultProps = {
        id : "send-report-modal"
    }

    render() {
        const recipients = Store.getState().reportRecipients
        const attachments = Store.getState().reportAttachments
        return (
            <VXModal id={this.props.id} width="550px">
                <ModalHeaderImage imageUrl={`${CX.CLOUDFILES_PREFIX}/img/system/reports1.png`}
                    heading={this.props.title}
                    subheading={Util.i18n("common.label_send_report_email")}/>
                <ModalBody className="modal-body-thin-bottom">
                    <VXForm id={`${this.props.id}-form`}
                        elementType="div"
                        receiveProps={false}
                        ref={(form) => { this.form = form }}>
                        <VXTextArea id={`${this.props.id}-recipients`}
                            label={Util.i18n("common.label_send_report_recipients")}
                            required={true}
                            className="text-area-resize"
                            rows={6}
                            rule={VX.common.emailDistributionList}
                            value={recipients}
                            dbName="recipients"/>
                        <div className="row">
                            <div className="col-sm-12">
                                <VXCheck id={`${this.props.id}-attachments`}
                                    className="checkbox-singlespace"
                                    label={Util.i18n("common.label_attachments")}
                                    checked={attachments}
                                    dbName="attachments"/>
                            </div>
                        </div>
                    </VXForm>
                </ModalBody>
                <ModalFooterConfirm onClickConfirm={this.handleClickConfirm.bind(this)}/>
            </VXModal>
        )
    }

    async handleClickConfirm(callback) {
        try {
            if (!UX.checkForm(this.form)) {
                callback(false)
                return
            }
            const component = UX.findComponentById(`${this.props.id}-recipients`)
            const resultValidation = await UX.validateInstance(component)
            if (!resultValidation.success) {
                UX.notify(resultValidation)
                callback(false)
                return
            }
            const formObject = UX.makeFormObject(this.form)
            const result = await UX.call("sendReportEmail", this.props.report._id, formObject.recipients, formObject.attachments)
            UX.notify(result)
            Store.dispatch(setReportRecipients(formObject.recipients))
            Store.dispatch(setReportAttachments(formObject.attachments))
            callback(true)
        }
        catch (error) {
            UX.notifyForError(error)
            callback(false)
        }
    }
}
