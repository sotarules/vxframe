import {Component} from "react"
import PropTypes from "prop-types"
import VXFieldBox from "/imports/vx/client/VXFieldBox"
import ButtonBox from "/imports/vx/client/ButtonBox"
import UploadButton from "/imports/vx/client/UploadButton"
import SimpleDiv from "/imports/vx/client/SimpleDiv"
import UploadProgressBarContainer from "/imports/vx/client/UploadProgressBarContainer"
import UploadErrorPanelContainer from "/imports/vx/client/UploadErrorPanelContainer"

export default class UploadModalCenter extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        uploadType : PropTypes.string.isRequired,
        file : PropTypes.object,
        accept : PropTypes.string.isRequired,
        uploadInProgress : PropTypes.bool.isRequired,
        isUploadEnded : PropTypes.bool.isRequired,
        onChangeFile : PropTypes.func.isRequired
    }

    static defaultProps = {
        id : "upload-modal-center"
    }

    constructor(props) {
        super(props)
        this.currentUpload = new ReactiveVar(false)
        this.state = { uploadType: props.uploadType, file: props.file }
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.hasOwnProperty("uploadType") || newProps.hasOwnProperty("file")) {
            this.setState({uploadType: newProps.uploadType, file: newProps.file})
        }
    }

    render() {
        const uploadFacts = this.uploadFacts()
        return (
            <>
                <div className="row margin-bottom-30">
                    <div className="col-sm-12">
                        <ButtonBox id="upload-button-box">
                            <UploadButton id={`${this.props.id}-upload-button`}
                                buttonText={this.props.buttonText}
                                stopButtonText={this.props.stopButtonText}
                                uploadType={this.state.uploadType}
                                accept={this.props.accept}
                                uploadInProgress={this.props.uploadInProgress}
                                onChangeFile={this.handleChangeFile.bind(this)}
                                onUploadStop={this.handleUploadStop.bind(this)}/>
                        </ButtonBox>
                    </div>
                </div>
                {this.state.file &&
                    <>
                        <div className="margin-bottom-20">
                            <div className="row">
                                <div className="col-sm-8">
                                    <VXFieldBox label={Util.i18n("common.label_upload_name")}
                                        formGroupClassName="form-group-first"
                                        value={uploadFacts.name}/>
                                </div>
                                <div className="col-sm-4">
                                    <VXFieldBox label={Util.i18n("common.label_upload_size")}
                                        formGroupClassName="form-group-first"
                                        value={uploadFacts.size}/>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <UploadProgressBarContainer uploadType={this.state.uploadType}/>
                            </div>
                        </div>
                        {!this.props.uploadInProgress && VXApp.isUploadErrors(this.state.uploadType) &&
                            <SimpleDiv id={`${this.props.id}-upload-errors`}
                                className="margin-bottom-20">
                                <UploadErrorPanelContainer uploadType={this.state.uploadType}/>
                            </SimpleDiv>
                        }
                    </>
                }
            </>
        )
    }

    handleChangeUploadType(event) {
        this.setState({uploadType: event.target.value })
    }

    uploadFacts() {
        if (this.state.file) {
            const uploadFacts = {}
            uploadFacts.name = this.state.file.name
            uploadFacts.type = this.state.file.type
            uploadFacts.size = this.state.file.size
            return uploadFacts
        }
        return null
    }

    handleChangeFile(event, file) {
        this.setState({file})
        if (this.props.onChangeFile) {
            this.props.onChangeFile(event, file)
        }
    }

    handleUploadStop(callback) {
        VXApp.uploadStop(this.state.uploadType, this.currentUpload, callback)
    }
}
