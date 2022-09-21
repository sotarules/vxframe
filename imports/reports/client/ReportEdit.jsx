import {Component} from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer"
import ReportEditLeftContainer from "/imports/reports/client/ReportEditLeftContainer"
import ReportEditRightContainer from "/imports/reports/client/ReportEditRightContainer"

export default class ReportEdit extends Component {
    render() {
        return (
            <SlidePairContainer leftPanel={(<ReportEditLeftContainer/>)}
                rightPanel={(<ReportEditRightContainer/>)}
                leftColumnCount={6}
                rightColumnCount={6}/>
        )
    }
}
