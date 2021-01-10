import { Component } from "react"
import PropTypes from "prop-types"

export default class UploadErrorPanel extends Component {

    static propTypes = {
        isUploadErrors : PropTypes.bool.isRequired
    }

    render() {
        if (!this.props.isUploadErrors) {
            return null
        }
        return (
            <div className="entity-errors-container flex-section-fixed scroll-both scroll-momentum">
                {this.renderUploadErrors()}
            </div>
        )
    }

    renderUploadErrors() {
        const uploadErrorsArray = this.props.uploadErrors.split("<br>");
        return uploadErrorsArray.map((uploadError, index) => (
            <div key={index.toString()}>
                {uploadError}
                <br/>
            </div>
        ))
    }
}
