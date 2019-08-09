import { Component } from "react"
import PropTypes from "prop-types"
import EntityList from "/imports/vx/client/EntityList"
import EntityItem from "/imports/vx/client/EntityItem"
import EntityListRoleCheckboxes from "/imports/vx/client/EntityListRoleCheckboxes"

export default class DomainEntityList extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        domains : PropTypes.array.isRequired,
        currentDomainId : PropTypes.string,
        selectable : PropTypes.bool,
        chevrons : PropTypes.bool,
        control : PropTypes.bool,
        controlClassName : PropTypes.string,
        controlTooltip : PropTypes.string,
        onClickControl : PropTypes.func,
        rightPanel : PropTypes.bool,
        draggable : PropTypes.bool,
        droppable : PropTypes.bool,
        roleCheckboxes : PropTypes.bool,
        roleCheckboxesDisabled : PropTypes.bool,
        domainRolesChecked : PropTypes.object,
        roleCheckboxUpdateHandler : PropTypes.func,
        onSelect : PropTypes.func,
        onDrop : PropTypes.func
    }

    render() {
        return (
            <EntityList id={this.props.id}
                selectable={this.props.selectable}
                chevrons={this.props.chevrons}
                rightPanel={this.props.rightPanel}
                control={this.props.control}
                controlClassName={this.props.controlClassName}
                controlTooltip={this.props.controlTooltip}
                onClickControl={this.props.onClickControl}
                draggable={this.props.draggable}
                droppable={this.props.droppable}
                dragClassName="domain-drag-list"
                dropClassName="domain-drop-list"
                onDrop={this.handleDrop.bind(this)}>
                {this.renderDomainItems()}
            </EntityList>
        )
    }

    renderDomainItems() {
        return this.props.domains.map(domain => (
            <EntityItem key={domain._id}
                _id={domain._id}
                collection={Domains}
                iconUrl={Util.fetchDomainIconUrl(domain)}
                decorationIconClassName={this.props.currentDomainId === domain._id ? "entity-decoration-icon-small fa fa-asterisk" : null}
                decorationColor="blue"
                decorationTooltip={Util.i18n("common.tooltip_domain_decoration_current")}
                name={domain.name}
                description={domain.description}
                onSelect={this.handleSelect.bind(this)}>
                {this.props.roleCheckboxes &&
                    <EntityListRoleCheckboxes _id={domain._id}
                        className="entity-list-role-checkboxes"
                        rolesChecked={this.props.domainRolesChecked[domain._id]}
                        roleCheckboxesDisabled={this.props.roleCheckboxesDisabled}
                        tenantRoles={false}
                        updateHandler={this.handleUpdateRoleCheckbox.bind(this)}/>
                }
            </EntityItem>
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

    handleUpdateRoleCheckbox(component, value, userRole, domainId) {
        if (this.props.roleCheckboxUpdateHandler) {
            this.props.roleCheckboxUpdateHandler(component, value, userRole, domainId)
        }
    }

    handleDrop(event, entityTarget, ui) {
        if (this.props.onDrop) {
            this.props.onDrop(event, entityTarget, ui, this)
        }
    }
}
