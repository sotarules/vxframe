import { Component } from "react";
import PropTypes from "prop-types"
import EmptyEntityList from "/imports/vx/client/EmptyEntityList.jsx"
import EntityList from "/imports/vx/client/EntityList.jsx";
import EntityItem from "/imports/vx/client/EntityItem.jsx";

export default class TemplateEntityList extends Component {

    static PropTypes = {
        id : PropTypes.string.isRequired,
        templates : PropTypes.array.isRequired,
        selectable : PropTypes.bool,
        chevrons : PropTypes.bool,
        rightPanel : PropTypes.bool,
        draggable : PropTypes.bool,
        droppable : PropTypes.bool,
        onSelect : PropTypes.func,
        onDrop : PropTypes.func
    }

    render() {
        if (this.props.templates.length === 0) {
            return (
                <EmptyEntityList id={this.props.id}
                    emptyMessage={Util.i18n("common.empty_templates")}
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
                dragClassName="template-drag-list"
                dropClassName="template-drop-list"
                onDrop={this.handleDrop.bind(this)}>
                {this.renderEntityItems()}
            </EntityList>
        )
    }

    renderEntityItems() {
        return this.props.templates.map(template => (
            <EntityItem key={template._id}
                _id={template._id}
                iconUrl={CX.CLOUDFILES_PREFIX + "/img/system/template5.png"}
                decorationIconClassName={VXApp.getSubsystemStatusDecorationIconClassName("TEMPLATE", template, "small")}
                decorationColor={VXApp.getSubsystemStatusDecorationColor("TEMPLATE", template)}
                decorationTooltip={VXApp.getSubsystemStatusDecorationTooltip("TEMPLATE", template)}
                name={template.name}
                description={template.description}
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

    handleDrop(event, entityTarget, ui) {
        if (this.props.onDrop) {
            this.props.onDrop(event, entityTarget, ui, this)
        }
    }
}
