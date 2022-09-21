import {Component} from "react"
import SlidePairContainer from "/imports/vx/client/SlidePairContainer"
import ReportViewLeftContainer from "/imports/reports/client/ReportViewLeftContainer"
import ReportViewRightContainer from "/imports/reports/client/ReportViewRightContainer"

export default class ReportView extends Component {
    render() {
        return (
            <SlidePairContainer leftPanel={(<ReportViewLeftContainer/>)}
                rightPanel={(<ReportViewRightContainer/>)}
                leftColumnCount={6}
                rightColumnCount={6}/>
        )
    }
}
