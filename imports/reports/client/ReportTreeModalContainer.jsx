import { withTracker } from "meteor/react-meteor-data"
import ReportTreeModal from "./ReportTreeModal"

export default withTracker(() => {
    const report = ContextMaker.report()
    return {
        report
    }
})(ReportTreeModal)


