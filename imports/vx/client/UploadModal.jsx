import {Component} from "react"
import PropTypes from "prop-types"
import VXModal from "/imports/vx/client/VXModal"
import ModalHeaderImage from "/imports/vx/client/ModalHeaderImage"
import ModalBody from "/imports/vx/client/ModalBody"
import ModalFooterConfirm from "/imports/vx/client/ModalFooterConfirm"
import VXForm from "/imports/vx/client/VXForm"
import VXAnchor from "/imports/vx/client/VXAnchor"
import VXFieldBox from "/imports/vx/client/VXFieldBox"
import ButtonBox from "/imports/vx/client/ButtonBox"
import UploadButton from "/imports/vx/client/UploadButton"
import SimpleDiv from "/imports/vx/client/SimpleDiv"
import UploadProgressBarContainer from "/imports/vx/client/UploadProgressBarContainer"
import UploadErrorPanelContainer from "/imports/vx/client/UploadErrorPanelContainer"

export default class UploadModal extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        uploadStats : PropTypes.object.isRequired,
        uploadType : PropTypes.string.isRequired,
        heading : PropTypes.string.isRequired,
        subheading : PropTypes.string,
        buttonText : PropTypes.string,
        stopButtonText : PropTypes.string,
        uploadInProgress : PropTypes.bool,
        isUploadEnded : PropTypes.bool
    }

    static defaultProps = {
        id : "upload-modal"
    }

    constructor(props) {
        super(props)
        this.currentUpload = new ReactiveVar(false)
        this.state = { file: null, disableConfirm: true }
    }

    render() {
        return (
            <VXModal id={this.props.id} width="750px"
                backdrop="false">
                <ModalHeaderImage imageUrl={`${CX.CLOUDFILES_PREFIX}/img/system/upload.png`}
                    heading={this.props.heading}
                    subheading={this.props.subheading}/>
                <ModalBody className="upload-modal-body">
                    <VXForm id="upload-modal-form"
                        elementType="div"
                        receiveProps={true}
                        ref={(form) => { this.form = form }}>
                        {this.renderBody()}
                    </VXForm>
                </ModalBody>
                <ModalFooterConfirm disableConfirm={this.state.disableConfirm}
                    onClickConfirm={this.handleClickConfirm.bind(this)}/>
                <VXAnchor id="upload-modal-anchor"/>
            </VXModal>
        )
    }

    renderBody() {
        const uploadFacts = this.uploadFacts()
        return (
            <>
                <div className="row margin-bottom-20">
                    <div className="col-sm-12">
                        <ButtonBox id="upload-button-box">
                            <UploadButton id={`${this.props.id}-upload-button`}
                                buttonText={this.props.buttonText}
                                stopButtonText={this.props.stopButtonText}
                                uploadType={this.props.uploadType}
                                currentUpload={this.currentUpload}
                                uploadInProgress={this.props.uploadInProgress}
                                onChangeFile={this.handleChangeFile.bind(this)}/>
                        </ButtonBox>
                    </div>
                </div>
                {uploadFacts &&
                    <div className="row margin-bottom-20">
                        <div className="col-sm-5">
                            <VXFieldBox label={Util.i18n("common.label_upload_name")}
                                value={uploadFacts.name}/>
                        </div>
                        <div className="col-sm-5">
                            <VXFieldBox label={Util.i18n("common.label_upload_type")}
                                value={uploadFacts.type}/>
                        </div>
                        <div className="col-sm-2">
                            <VXFieldBox label={Util.i18n("common.label_upload_size")}
                                value={uploadFacts.size}/>
                        </div>
                    </div>
                }
                <div className="row">
                    <div className="col-sm-12">
                        <UploadProgressBarContainer uploadType={this.props.uploadType}/>
                    </div>
                </div>
                {!this.props.uploadInProgress && VXApp.isUploadErrors(this.props.uploadType) &&
                    <SimpleDiv id="client-view-right-upload-errors"
                        className="margin-bottom-20">
                        <UploadErrorPanelContainer uploadType={this.props.uploadType}/>
                    </SimpleDiv>
                }
            </>
        )
    }

    uploadFacts() {
        if (this.state.file) {
            const uploadFacts = {}
            uploadFacts.name = this.state.file.name
            uploadFacts.type = this.state.file.type
            uploadFacts.size = this.state.file.size
            return uploadFacts
        }
        if (this.props.uploadStats && this.props.uploadStats.originalFileName) {
            const uploadFacts = {}
            uploadFacts.name = this.props.uploadStats.originalFileName
            uploadFacts.type = this.props.uploadStats.fileType
            uploadFacts.size = this.props.uploadStats.totalSize
            return uploadFacts
        }
        return null
    }

    handleChangeFile(event, file) {
        this.setState({ file, disableConfirm: false })
    }

    handleClickConfirm(callback) {
        callback(false)
        this.setState({ disableConfirm: true })
        try {
            VXApp.uploadFile(this.props.uploadType, this.currentUpload, this.state.file)
        }
        catch (error) {
            UX.notifyForError(error)
        }
    }
}
