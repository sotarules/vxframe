import { withTracker } from "meteor/react-meteor-data"
import UploadModal from "/imports/vx/client/UploadModal"

export default withTracker(props => {
    return {
        uploadStats : VXApp.findUploadStats(props.uploadType),
        uploadInProgress : VXApp.uploadInProgress(props.uploadType),
        isUploadEnded : VXApp.isUploadEnded(props.uploadType)
    }
})(UploadModal)
