import { Component } from "react"
import PropTypes from "prop-types"
import Parser from "html-react-parser"
import VXButton from "./VXButton"

export default class UploadButton extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        uploadType : PropTypes.string.isRequired,
        currentUpload : PropTypes.object.isRequired,
        isUploadInProgress : PropTypes.bool,
        buttonText : PropTypes.string
    }

    static defaultProps = {
        buttonText : Util.i18n("common.button_import_csv")
    }

    render() {
        if (!this.props.isUploadInProgress) {
            return (
                <td className="top-right-button">
                    <VXButton id="button-import-csv"
                        className="btn btn-primary btn-file btn-custom pull-right"
                        fileInput={true}
                        minimumDuration={2000}
                        onChangeFile={this.handleChangeImport.bind(this)}>
                        {Parser(this.props.buttonText)}
                    </VXButton>
                </td>
            )
        }
        return (
            <td className="top-right-button">
                <VXButton id="button-stop-import"
                    className="btn btn-danger btn-custom pull-right"
                    onClick={this.handleClickStopImport.bind(this)}>
                    {Parser(Util.i18n("common.button_stop_import"))}
                </VXButton>
            </td>
        )
    }

    handleChangeImport(event) {
        try {
            const file = event.currentTarget.files[0]
            VXApp.uploadFile(this.props.uploadType, this.props.currentUpload, file)
        }
        catch (error) {
            OLog.error(`UploadButton.jsx handleChangeImport error=${error}`)
            return
        }
    }

    handleClickStopImport(callback) {
        VXApp.uploadStop(this.props.uploadType, this.props.currentUpload, callback)
    }
}
