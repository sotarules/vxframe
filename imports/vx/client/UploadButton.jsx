import { Component } from "react"
import PropTypes from "prop-types"
import Parser from "html-react-parser"
import VXButton from "./VXButton"

export default class UploadButton extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        uploadType : PropTypes.string.isRequired,
        currentUpload : PropTypes.object.isRequired,
        uploadInProgress : PropTypes.bool,
        buttonText : PropTypes.string,
        stopButtonText : PropTypes.string,
        onChangeFile : PropTypes.func
    }

    render() {
        if (!this.props.uploadInProgress) {
            return (
                <VXButton id="button-import-csv"
                    className="btn btn-primary btn-file btn-custom pull-right"
                    fileInput={true}
                    minimumDuration={2000}
                    onChangeFile={this.handleChangeFile.bind(this)}>
                    {Parser(this.props.buttonText || Util.i18n("common.button_choose_file"))}
                </VXButton>
            )
        }
        return (
            <VXButton id="button-stop-import"
                className="btn btn-danger btn-custom pull-right"
                onClick={this.handleClickStop.bind(this)}>
                {Parser(this.props.stopButtonText || Util.i18n("common.button_stop_upload"))}
            </VXButton>
        )
    }

    handleChangeFile(event) {
        try {
            if (this.props.onChangeFile) {
                event.persist()
                this.props.onChangeFile(event, event.currentTarget.files[0])
            }
        }
        catch (error) {
            OLog.error(`UploadButton.jsx handleChangeFile error=${error}`)
            return
        }
    }

    handleClickStop(callback) {
        VXApp.uploadStop(this.props.uploadType, this.props.currentUpload, callback)
    }
}
