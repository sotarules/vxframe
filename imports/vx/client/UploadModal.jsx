import {Component} from "react"
import PropTypes from "prop-types"
import VXModal from "/imports/vx/client/VXModal"
import VXForm from "/imports/vx/client/VXForm"
import VXSelect from "/imports/vx/client/VXSelect"
import VXAnchor from "/imports/vx/client/VXAnchor"
import ModalHeaderImage from "/imports/vx/client/ModalHeaderImage"
import ModalBody from "/imports/vx/client/ModalBody"
import UploadModalCenterContainer from "./UploadModalCenterContainer"
import UploadModalFooterContainer from "./UploadModalFooterContainer"

export default class UploadModal extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        accept : PropTypes.string.isRequired,
        heading : PropTypes.string.isRequired,
        subheading : PropTypes.string,
        buttonText : PropTypes.string,
        stopButtonText : PropTypes.string
    }

    static defaultProps = {
        id : "upload-modal",
        accept : ".xls, .xlsx",
        heading : Util.i18n("common.label_import")
    }

    constructor(props) {
        super(props)
        this.currentUpload = new ReactiveVar(false)
        this.state = { uploadType: null, file: null }
    }

    render() {
        return (
            <VXModal id={this.props.id} width="550px"
                backdrop="false">
                <ModalHeaderImage imageUrl={`${CX.CLOUDFILES_PREFIX}/img/system/upload.png`}
                    heading={this.props.heading}
                    subheading={this.props.subheading}/>
                <ModalBody className="upload-modal-body">
                    <VXForm id="upload-modal-form"
                        elementType="div"
                        receiveProps={true}
                        ref={(form) => { this.form = form }}>
                        <div className="row margin-bottom-30">
                            <div className="col-sm-12">
                                <VXSelect id={`${this.props.id}-type`}
                                    codeArray={UX.addBlankSelection(UX.makeCodeArray("uploadType"))}
                                    label={Util.i18n("common.label_upload_type")}
                                    value={this.state.uploadType}
                                    dbName="type"
                                    updateHandler={() => false}
                                    onChange={this.handleChangeUploadType.bind(this)}/>
                            </div>
                        </div>
                        {this.state.uploadType &&
                            <UploadModalCenterContainer uploadType={this.state.uploadType}
                                file={this.state.file}
                                buttonText={this.props.buttonText}
                                stopButtonText={this.props.stopButtonText}
                                accept={this.props.accept}
                                onChangeFile={this.handleChangeFile.bind(this)}/>
                        }
                    </VXForm>
                </ModalBody>
                <UploadModalFooterContainer uploadType={this.state.uploadType}
                    file={this.state.file}
                    onClickConfirm={this.handleClickConfirm.bind(this)}/>
                <VXAnchor id="upload-modal-anchor"/>
            </VXModal>
        )
    }

    handleChangeUploadType(event) {
        VXApp.setUploadStatus(this.state.uploadType, "CLEARED")
        this.setState({ uploadType: event.target.value, file: null })
    }

    handleChangeFile(event, file) {
        VXApp.setUploadStatus(this.state.uploadType, "CLEARED")
        this.setState({ file })
    }

    handleClickConfirm(callback) {
        callback(false)
        if (!(this.state.uploadType && this.state.file)) {
            UX.notify({ success: false, icon: "TRIANGLE", key: "common.alert_choose_file_type_and_file" })
            return
        }
        try {
            VXApp.uploadFile(this.state.uploadType, this.currentUpload, this.state.file)
        }
        catch (error) {
            UX.notifyForError(error)
        }
    }
}
