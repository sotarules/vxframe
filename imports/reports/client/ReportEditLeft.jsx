import {Component} from "react"
import PropTypes from "prop-types"
import VXTree from "/imports/vx/client/VXTree"
import ReportEditLeftHeader from "./ReportEditLeftHeader"
import ReportTreeModalContainer from "./ReportTreeModalContainer"

export default class ReportEditLeft extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        report : PropTypes.object.isRequired
    }

    static defaultProps = {
        id : "report-edit-left"
    }

    constructor(props) {
        super(props)
        this.locked = false
    }

    shouldComponentUpdate() {
        return !this.locked
    }

    setLocked(locked) {
        this.locked = locked
    }

    render() {
        const nodes = VXApp.makeReportTreeModel(this.props.report)
        return (
            <div id={this.props.id}
                className="flexi-grow lock-exiting-component">
                <ReportEditLeftHeader id={`${this.props.id}-header`}
                    report={this.props.report}/>
                {this.props.report.entityType &&
                    <VXTree id="report-edit-left-tree"
                        nodes={nodes}
                        expandToLevel={0}
                        modal={ReportTreeModalContainer}
                        checked={this.props.report.checked}
                        fields={this.props.report.fields}
                        collection={Reports}
                        record={this.props.report}
                        checkedDbName="checked"
                        fieldsDbName="fields"
                        isDisplayModal={this.isDisplayModal.bind(this)}/>
                }
            </div>
        )
    }

    isDisplayModal(nodeInfo) {
        return nodeInfo.treeDepth === 0 || nodeInfo.isLeaf
    }
}
