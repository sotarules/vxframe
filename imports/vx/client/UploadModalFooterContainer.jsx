import { withTracker } from "meteor/react-meteor-data"
import UploadModalFooter from "./UploadModalFooter"

export default withTracker(props => {
    return {
        uploadStatus : VXApp.getUploadStatus(props.uploadType)
    }
})(UploadModalFooter)
