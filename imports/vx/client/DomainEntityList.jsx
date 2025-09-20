import { Component } from "react"
import PropTypes from "prop-types"
import EmptyEntityList from "/imports/vx/client/EmptyEntityList"
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
        controls : PropTypes.array,
        rightPanel : PropTypes.bool,
        draggable : PropTypes.bool,
        droppable : PropTypes.bool,
        multi : PropTypes.bool,
        roleCheckboxes : PropTypes.bool,
        roleCheckboxesDisabled : PropTypes.bool,
        domainRolesChecked : PropTypes.object,
        roleCheckboxUpdateHandler : PropTypes.func,
        onSelect : PropTypes.func,
        onDrop : PropTypes.func
    }

    render() {
        if (this.props.domains.length === 0) {
            return (
                <EmptyEntityList id={this.props.id}
                    emptyMessage={Util.i18n("common.empty_domains")}
                    droppable={true}
                    dropClassName="domain-drop-list"
                    onDrop={this.handleDrop.bind(this)}/>
            )
        }
        return (
            <EntityList id={this.props.id}
                selectable={this.props.selectable}
                chevrons={this.props.chevrons}
                rightPanel={this.props.rightPanel}
                controls={this.props.controls}
                draggable={this.props.draggable}
                droppable={this.props.droppable}
                multi={this.props.multi}
                dropClassName="domain-drop-list"
                onDrop={this.handleDrop.bind(this)}>
                {this.renderDomainItems()}
            </EntityList>
        )
    }

    renderDomainItems() {
        return this.props.domains.map(domain => (
            <EntityItem id={`${this.props.id}-${domain._id}`}
                key={`${this.props.id}-${domain._id}`}
                itemId={domain._id}
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

    handleDrop(dropInfo) {
        if (this.props.onDrop) {
            this.props.onDrop(dropInfo)
        }
    }
}
