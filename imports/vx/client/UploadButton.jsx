import { Component } from "react"
import PropTypes from "prop-types"
import Parser from "html-react-parser"
import VXButton from "./VXButton"

export default class UploadButton extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        uploadType : PropTypes.string.isRequired,
        accept : PropTypes.string.isRequired,
        onChangeFile : PropTypes.func.isRequired,
        onUploadStop : PropTypes.func.isRequired,
        uploadInProgress : PropTypes.bool.isRequired
    }

    render() {
        if (!this.props.uploadInProgress) {
            return (
                <VXButton id={`${this.props.id}-button-import`}
                    className="btn btn-primary btn-file btn-custom pull-right"
                    fileInput={true}
                    accept={this.props.accept}
                    minimumDuration={2000}
                    onChangeFile={this.handleChangeFile.bind(this)}>
                    {Parser(Util.i18n("common.button_choose_file"))}
                </VXButton>
            )
        }
        return (
            <VXButton id={`${this.props.id}-button-stop-import`}
                className="btn btn-danger btn-custom pull-right"
                onClick={this.handleClickStop.bind(this)}>
                {Parser(Util.i18n("common.button_stop_upload"))}
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
            OLog.error(`UploadButton.jsx handleChangeFile error=${OLog.errorError(error)}`)
            return
        }
    }

    handleClickStop(callback) {
        if (this.props.onUploadStop) {
            this.props.onUploadStop(callback)
        }
    }
}
