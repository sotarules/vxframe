import { Component } from "react"
import PropTypes from "prop-types"
import EmptyEntityList from "/imports/vx/client/EmptyEntityList"
import EntityList from "/imports/vx/client/EntityList"
import EntityItem from "/imports/vx/client/EntityItem"

export default class ReportEntityList extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        reports : PropTypes.array.isRequired,
        selectable : PropTypes.bool,
        chevrons : PropTypes.bool,
        rightPanel : PropTypes.bool,
        draggable : PropTypes.bool,
        droppable : PropTypes.bool,
        onSelect : PropTypes.func,
        onDrop : PropTypes.func
    }

    render() {
        if (this.props.reports.length === 0) {
            return (
                <EmptyEntityList id={this.props.id}
                    emptyMessage={Util.i18n("common.empty_reports")}
                    emptyListSize="large"/>
            )
        }
        return (
            <EntityList id={this.props.id}
                selectable={this.props.selectable}
                chevrons={this.props.chevrons}
                rightPanel={this.props.rightPanel}
                draggable={this.props.draggable}
                droppable={this.props.droppable}
                dropClassName="report-drop-list"
                onDrop={this.handleDrop.bind(this)}>
                {this.renderEntityItems()}
            </EntityList>
        )
    }

    renderEntityItems() {
        return this.props.reports.map(report => (
            <EntityItem id={`${this.props.id}-${report._id}`}
                key={`${this.props.id}-${report._id}`}
                itemId={report._id}
                iconUrl={CX.CLOUDFILES_PREFIX + "/img/system/reports1.png"}
                name={report.name}
                description={report.description}
                onSelect={this.handleSelect.bind(this)}/>
        ))
    }

    handleSelect(event, component) {
        event.persist()
        Meteor.setTimeout(() => {
            if (this.props.onSelect) {
                this.props.onSelect(event, component)
            }
        })
    }

    handleDrop(dropInfo) {
        if (this.props.onDrop) {
            this.props.onDrop(dropInfo)
        }
    }
}
