import { Component } from "react";
import PropTypes from "prop-types"
import EntityList from "/imports/vx/client/EntityList";
import EntityItem from "/imports/vx/client/EntityItem";

export default class TenantEntityList extends Component {

    static PropTypes = {
        tenants : PropTypes.array.isRequired,
        selectable : PropTypes.bool,
        chevrons : PropTypes.bool,
        onSelect : PropTypes.func
    }

    render() {
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
            <EntityItem key={tenant._id}
                _id={tenant._id}
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
