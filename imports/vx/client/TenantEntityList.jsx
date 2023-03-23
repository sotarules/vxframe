import { Component } from "react"
import PropTypes from "prop-types"
import EmptyEntityList from "/imports/vx/client/EmptyEntityList"
import EntityList from "/imports/vx/client/EntityList";
import EntityItem from "/imports/vx/client/EntityItem";

export default class TenantEntityList extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        tenants : PropTypes.array.isRequired,
        selectable : PropTypes.bool,
        chevrons : PropTypes.bool,
        onSelect : PropTypes.func
    }

    render() {
        if (this.props.tenants.length === 0) {
            return (
                <EmptyEntityList id={this.props.id}
                    emptyMessage={Util.i18n("common.empty_tenants")}/>
            )
        }
        return (
            <EntityList id="tenant-list"
                className="tenant-list"
                selectable={this.props.selectable}
                chevrons={this.props.chevrons}
                isEmpty={this.props.tenants.length === 0}>
                {this.renderEntityItems()}
            </EntityList>
        )
    }

    renderEntityItems() {
        return this.props.tenants.map(tenant => (
            <EntityItem id={`${this.props.id}-${tenant._id}`}
                key={`${this.props.id}-${tenant._id}`}
                itemId={tenant._id}
                iconUrl={Util.fetchTenantIconUrl(tenant._id)}
                decorationIconClassName={Util.isTenantCurrent(tenant._id) ? "entity-decoration-icon-small fa fa-asterisk" : null}
                decorationColor="blue"
                decorationTooltip={Util.i18n("common.tooltip_tenant_decoration_current")}
                name={tenant.name}
                description={tenant.description}
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
}
