import { withTracker } from "meteor/react-meteor-data"
import UploadModalCenter from "./UploadModalCenter"

export default withTracker(props => {
    return {
        uploadType : props.uploadType,
        file : props.file,
        accept : props.accept,
        buttonText : props.buttonText,
        stopButtonText : props.stopButtonText,
        uploadInProgress : VXApp.uploadInProgress(props.uploadType),
        isUploadEnded : VXApp.isUploadEnded(props.uploadType),
        onChangeFile : props.onChangeFile
    }
})(UploadModalCenter)
