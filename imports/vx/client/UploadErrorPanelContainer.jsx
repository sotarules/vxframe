import { withTracker } from "meteor/react-meteor-data"
import UploadErrorPanel from "/imports/vx/client/UploadErrorPanel"

export default withTracker(props => {

    return {
        isUploadErrors : VXApp.isUploadErrors(props.uploadType),
        uploadErrors : VXApp.uploadErrors(props.uploadType)
    }

})(UploadErrorPanel)
