import { Component } from "react"
import PropTypes from "prop-types"
import EntityList from "/imports/vx/client/EntityList"
import EntityItem from "/imports/vx/client/EntityItem"
import EntityListRoleCheckboxes from "/imports/vx/client/EntityListRoleCheckboxes"

export default class UserEntityList extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        users : PropTypes.array.isRequired,
        selectable : PropTypes.bool,
        chevrons : PropTypes.bool,
        controls : PropTypes.array,
        rightPanel : PropTypes.bool,
        draggable : PropTypes.bool,
        droppable : PropTypes.bool,
        multi : PropTypes.bool,
        roleCheckboxes : PropTypes.bool,
        roleCheckboxesDisabled : PropTypes.bool,
        userRolesChecked : PropTypes.object,
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
                controls={this.props.controls}
                draggable={this.props.draggable}
                droppable={this.props.droppable}
                multi={this.props.multi}
                dropClassName="user-drop-list"
                onDrop={this.handleDrop.bind(this)}>
                {this.renderUserItems()}
            </EntityList>
        )
    }

    renderUserItems() {
        return this.props.users.map(user => (
            <EntityItem id={`${this.props.id}-${user._id}`}
                key={user._id}
                _id={user._id}
                collection={Meteor.users}
                iconUrl={Util.fetchUserPhotoUrl(user)}
                name={Util.fetchFullName(user)}
                description={Util.getUserEmail(user)}
                message={Util.fetchUserPhone(user)}
                rounded={true}
                onSelect={this.handleSelect.bind(this)}>
                {this.props.roleCheckboxes &&
                    <EntityListRoleCheckboxes _id={user._id}
                        className="entity-list-role-checkboxes"
                        rolesChecked={this.props.userRolesChecked[user._id]}
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

    handleUpdateRoleCheckbox(component, value, userRole, userId) {
        if (this.props.roleCheckboxUpdateHandler) {
            this.props.roleCheckboxUpdateHandler(component, value, userRole, userId)
        }
    }

    handleDrop(dropInfo) {
        if (this.props.onDrop) {
            this.props.onDrop(dropInfo)
        }
    }
}
