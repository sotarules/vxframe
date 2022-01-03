import { Component } from "react"
import PropTypes from "prop-types"
import Parser from "html-react-parser"
import VXSpan from "./VXSpan"
import VXTabPanel from "./VXTabPanel"
import ContextMenuCell from "./ContextMenuCell"
import TabFolderContextMenu from "./TabFolderContextMenu"

export default class VXTabFolder extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        activeTabId : PropTypes.string.isRequired,
        className : PropTypes.string,
        pills : PropTypes.bool,
        editable : PropTypes.bool,
        record : PropTypes.object,
        selectText : PropTypes.bool,
        tabDbName : PropTypes.string,
        onShown : PropTypes.func,
        onUpdateTabName : PropTypes.func,
        onClickAddTab : PropTypes.func,
        isAddTabDisabled : PropTypes.func,
        onClickRemoveTab : PropTypes.func,
        isRemoveTabDisabled : PropTypes.func
    }

    constructor(props) {
        super(props)
        this.state = { activeTabId : props.activeTabId, tabNames: this.computeTabNames(props, props.activeTabId) }
    }

    componentDidMount() {
        this.registerListeners()
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.children.length !== this.props.children.length) {
            this.setState({ tabNames: this.computeTabNames(newProps, this.state.activeTabId) })
            return
        }
        const oldChildren = React.Children.toArray(this.props.children)
        const newChildren = React.Children.toArray(newProps.children)
        for (let childIndex = 0; childIndex < oldChildren.length; childIndex++) {
            if (oldChildren[childIndex].props.name !== newChildren[childIndex].props.name) {
                this.setState({ tabNames: this.computeTabNames(newProps, this.state.activeTabId) })
                return
            }
        }
    }

    registerListeners() {
        const children = React.Children.toArray(this.props.children)
        children.forEach(child => {
            //OLog.debug(`VXTabFolder.jsx registerListeners *init* id=${this.props.id}-${child.props.id}`)
            $(`#tab-${this.props.id}-${child.props.id}`).on("shown.bs.tab", (event) => {
                OLog.debug(`VXTabFolder.jsx registerListeners shown.bs.tab id=$${this.props.id}-${child.props.id}`)
                this.setState( { activeTabId : child.props.id } )
                const $li = $(event.target).parents(".dropdown")
                if ($li.exists()) {
                    this.setTabName($li.index(), child.props.name)
                }
                if (this.props.onShown) {
                    this.props.onShown(event, child.props.id, this)
                }
            })
        })
    }

    componentWillUnmount() {
        const children = React.Children.toArray(this.props.children)
        children.forEach(child => {
            //OLog.debug(`VXTabFolder.jsx componentWillUnmount unregister listeners shown.bs.tab id=${this.props.id}-${child.props.id}`)
            $(`#tab-${this.props.id}-${child.props.id}`).off("shown.bs.tab")
        })
    }

    rebuildState(newProps) {
        this.setState({ activeTabId : newProps.activeTabId, tabNames: this.computeTabNames(newProps, newProps.activeTabId) })
    }

    render() {
        return (
            <div className={`flexi-grow ${this.props.className}`}>
                {this.renderTabTop()}
                <div className="tab-content tab-content-flex flexi-grow">
                    {this.renderTabPanels()}
                </div>
            </div>
        )
    }

    computeTabSets(props, activeTabId) {
        const children = React.Children.toArray(props.children)
        const tabSets = []
        let group = []
        let groupPrevious
        let active
        for (let childIndex = 0; childIndex < children.length; childIndex++) {
            const child = children[childIndex]
            active = child.props.id === activeTabId
            if (!child.props.group || groupPrevious !== child.props.group) {
                if (group.length > 0) {
                    tabSets.push({firstName: this.firstName(children, group), active: this.isGroupActive(group), group})
                    group = []
                }
            }
            if (!child.props.group) {
                tabSets.push({firstName: child.props.name, active, group: [{childIndex, active}]})
            }
            else {
                group.push({childIndex, active})
            }
            groupPrevious = child.props.group
        }
        if (group.length > 0) {
            tabSets.push({firstName: this.firstName(children, group), active: this.isGroupActive(group), group})
        }
        return tabSets
    }

    firstName(children, group) {
        const activeGroupObject = _.findWhere(group, { active: true });
        if (!activeGroupObject) {
            return children[group[0].childIndex].props.name
        }
        return children[activeGroupObject.childIndex].props.name
    }

    isGroupActive(group) {
        return !!_.findWhere(group, { active: true })
    }

    computeTabNames(props, activeTabId) {
        const tabSets = this.computeTabSets(props, activeTabId)
        return tabSets.map(tabSet => {
            return tabSet.firstName
        })
    }

    setActiveTabId(activeTabId, callback) {
        this.setState({activeTabId}, callback)
    }

    setTabName(index, tabName, callback) {
        const tabNames = this.state.tabNames
        tabNames[index] = tabName
        this.setState({tabNames: tabNames}, callback)
    }

    renderTabTop() {
        if (!this.props.editable) {
            return this.renderTabTopList()
        }
        return (
            <ContextMenuCell id={`${this.props.id}-context-menu-cell`}
                contextMenuId={`${this.props.id}-context-menu`}
                data={{
                    handleClickAddTab: this.handleClickAddTab.bind(this),
                    isAddTabDisabled : this.props.isAddTabDisabled,
                    handleClickRemoveTab: this.handleClickRemoveTab.bind(this),
                    isRemoveTabDisabled : this.props.isRemoveTabDisabled
                }}>
                {this.renderTabTopList()}
                <TabFolderContextMenu id={`${this.props.id}-context-menu`}/>
            </ContextMenuCell>
        )
    }

    renderTabTopList() {
        return (
            <ul className={`vx-list nav ${this.props.pills ? "nav-pills" : "nav-tabs"} flex-section-fixed tab-margin-bottom`}
                role="tablist">
                {this.renderTabs()}
            </ul>
        )
    }

    renderTabs() {
        const children = React.Children.toArray(this.props.children)
        const tabSets = this.computeTabSets(this.props, this.state.activeTabId)
        return tabSets.map((tabSet, tabSetIndex) => {
            if (tabSet.group.length === 1) {
                const child = children[tabSet.group[0].childIndex]
                return  (
                    <li key={`${this.props.id}-tab-${tabSetIndex}`}
                        data-item-id={child.props.itemId}
                        role="presentation"
                        className={`vx-list-item tab-text ${tabSet.active ? "active" : ""}`}>
                        <a id={`tab-${this.props.id}-${child.props.id}`}
                            href={`#${this.props.id}-${child.props.id}`}
                            role="tab"
                            data-toggle="tab">
                            {this.renderTabName(tabSetIndex)}
                        </a>
                    </li>
                )
            }
            return (
                <li key={`${this.props.id}-tab-${tabSetIndex}`}
                    role="presentation"
                    className={`tab-text dropdown ${tabSet.active ? "active" : ""}`}>
                    <a className="dropdown-toggle"
                        data-toggle="dropdown"
                        role="button">
                        {this.renderTabName(tabSetIndex)}
                        <span>&nbsp;</span>
                        <span className="caret"></span>
                    </a>
                    <ul className="dropdown-menu">
                        {this.renderDropDownItems(tabSet, children)}
                    </ul>
                </li>
            )
        })
    }

    renderTabName(tabSetIndex) {
        if (!this.props.editable) {
            return Parser(this.state.tabNames[tabSetIndex])
        }
        return (
            <VXSpan id={`${this.props.id}-tab-${tabSetIndex}-name`}
                elementType="span"
                editable={true}
                selectText={this.props.selectText}
                updateHandler={this.handleUpdateTabName.bind(this)}
                value={this.state.tabNames[tabSetIndex]}
                dbName={this.props.tabDbName}
                tabSetIndex={tabSetIndex}/>
        )
    }

    renderDropDownItems(tabSet, children) {
        return tabSet.group.map(groupItem => {
            const child = children[groupItem.childIndex]
            return (
                <li key={`drop-down-item-${child.props.id}`}
                    data-item-id={child.props.itemId}>
                    <a id={`tab-${this.props.id}-${child.props.id}`}
                        href={`#${this.props.id}-${child.props.id}`}
                        className="downdown-item tab-text"
                        role="tab"
                        data-toggle="tab">
                        {Parser(child.props.name)}
                    </a>
                </li>
            )
        })
    }

    renderTabPanels() {
        const children = React.Children.toArray(this.props.children)
        return children.map(child => {
            return (
                <VXTabPanel id={`${this.props.id}-${child.props.id}`}
                    key={`${this.props.id}-${child.props.id}`}
                    itemId={child.props.itemId}
                    className={`${child.props.id === this.state.activeTabId ? "in active" : ""}`}>
                    {child.props.children}
                </VXTabPanel>
            )
        })
    }

    tabId(firstOrLast) {
        const children = React.Children.toArray(this.props.children)
        return firstOrLast === "first" ? children[0].props.id : children[children.length - 1].props.id
    }

    handleClickAddTab(data) {
        if (this.props.onClickAddTab) {
            this.props.onClickAddTab(data)
            Meteor.setTimeout(() => {
                const tabId = this.tabId("last")
                this.setActiveTabId(tabId)
            })
        }
    }

    handleClickRemoveTab(data) {
        if (this.props.onClickRemoveTab) {
            this.props.onClickRemoveTab(data)
            Meteor.setTimeout(() => {
                const tabId = this.tabId("first")
                this.setActiveTabId(tabId)
            })
        }
    }

    handleUpdateTabName(component, value) {
        this.setTabName(component.props.tabSetIndex, value, ()=> {
            if (this.props.onUpdateTabName) {
                this.props.onUpdateTabName(component, value, this)
            }
        })
    }
}
