import { Component } from "react"
import PropTypes from "prop-types"
import ProgressBarClear from "/imports/vx/client/ProgressBarClear"

export default class UploadProgressBar extends Component {

    static propTypes = {
        uploadType: PropTypes.string.isRequired,
        isUploadStats : PropTypes.bool,
        progressBarClass : PropTypes.string,
        progressBarActive : PropTypes.string,
        percentComplete : PropTypes.number,
        uploadProgress : PropTypes.string,
        isUploadEnded : PropTypes.bool,
        uploadErrors : PropTypes.string
    }

    render() {
        if (!this.props.isUploadStats) {
            return null
        }
        return (
            <div id="upload-progress-container" className="upload-progress-container flexi-fixed">
                <div id="upload-progress-bar" className="progress upload-progress-bar">
                    <div className={this.progressBarClasses()}
                        role="progressbar"
                        aria-valuenow={this.props.percentComplete}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        style={this.widthComplete()}>
                        {this.props.uploadProgress}
                    </div>
                    {this.renderClearControl()}
                </div>
            </div>
        )
    }

    progressBarClasses() {
        return `${this.props.progressBarClass} progress-bar upload-progress-text`
    }

    widthComplete() {
        return { width : this.props.percentComplete + "%" }
    }

    renderClearControl() {
        if (!this.props.isUploadEnded) {
            return null
        }
        return (
            <ProgressBarClear
                onClick={this.onClickProgressBarClear.bind(this)}/>
        )
    }

    onClickProgressBarClear() {
        VXApp.setUploadStatus(this.props.uploadType, "CLEARED")
    }
}
