import {Component} from "react"
import PropTypes from "prop-types"
import {animation, Item, Menu} from "react-contexify"
import "react-contexify/dist/ReactContexify.min.css"

export default class TabFolderContextMenu extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired
    }

    render() {
        return (
            <Menu id={this.props.id}
                animation={animation.fade}>
                <Item onClick={this.handleClickAddTab.bind(this)}
                    disabled={this.isAddTabDisabled.bind(this)}>
                    <span className="context-menu-icon fa fa-fw fa-plus-square" />
                    <span className="context-menu-text">{Util.i18n("common.context_menu_add_tab")}</span>
                </Item>
                <Item onClick={this.handleClickRemoveTab.bind(this)}
                    disabled={this.isRemoveTabDisabled.bind(this)}>
                    <span className="context-menu-icon fa fa-fw fa-minus-square" />
                    <span className="context-menu-text">{Util.i18n("common.context_menu_remove_tab")}</span>
                </Item>
            </Menu>
        )
    }

    handleClickAddTab({ props }) {
        if (props.data.handleClickAddTab) {
            props.data.handleClickAddTab(props.data)
        }
    }

    isAddTabDisabled({ props }) {
        if (props.data.isAddTabDisabled) {
            return props.data.isAddTabDisabled(props.data)
        }
        return false
    }

    handleClickRemoveTab({ props }) {
        if (props.data.handleClickRemoveTab) {
            props.data.handleClickRemoveTab(props.data)
        }
    }

    isRemoveTabDisabled({ props }) {
        if (props.data.isRemoveTabDisabled) {
            return props.data.isRemoveTabDisabled(props.data)
        }
        return false
    }
}
