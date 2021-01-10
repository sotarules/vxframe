import { withTracker } from "meteor/react-meteor-data"
import UploadProgressBar from "/imports/vx/client/UploadProgressBar"

export default withTracker(props => {

    return {
        isUploadStats : VXApp.isUploadStats(props.uploadType),
        progressBarClass : VXApp.progressBarClass(props.uploadType),
        progressBarActive : VXApp.progressBarActive(props.uploadType),
        percentComplete : VXApp.percentComplete(props.uploadType),
        uploadProgress : VXApp.uploadProgress(props.uploadType),
        isUploadEnded : VXApp.isUploadEnded(props.uploadType),
        uploadErrors : VXApp.uploadErrors(props.uploadType)
    }

})(UploadProgressBar)
