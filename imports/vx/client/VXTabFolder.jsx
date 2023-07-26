import {Component} from "react"
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
        fade : PropTypes.bool,
        draggable : PropTypes.bool,
        droppable : PropTypes.bool,
        dropClassName : PropTypes.string,
        placeholderClassName : PropTypes.string,
        placeholderWidthMax : PropTypes.number,
        placeholderHeighthMax : PropTypes.number,
        record : PropTypes.object,
        selectText : PropTypes.bool,
        tabDbName : PropTypes.string,
        onShown : PropTypes.func,
        onUpdateTabName : PropTypes.func,
        onClickAddTab : PropTypes.func,
        isAddTabDisabled : PropTypes.func,
        onClickRemoveTab : PropTypes.func,
        isRemoveTabDisabled : PropTypes.func,
        onDrop : PropTypes.func
    }

    static defaultProps = {
        placeholderClassName : "tab-drag-placeholder-conditional",
        fade : true
    }

    constructor(props) {
        super(props)
        this.mustInitializeSortable = true
        this.state = { activeTabId : props.activeTabId, tabNames: this.computeTabNames(props, props.activeTabId) }
    }

    componentDidMount() {
        this.registerListeners()
        if (this.props.draggable && this.props.droppable) {
            this.initSelectionAndDragAndDrop()
        }
    }

    componentDidUpdate() {
        if (this.props.draggable && this.props.droppable) {
            this.initSelectionAndDragAndDrop()
        }
    }

    initSelectionAndDragAndDrop() {
        if (this.mustInitializeSortable) {
            UX.makeDraggableDroppable(this, this.handleAfterDrop.bind(this))
            this.mustInitializeSortable = false
        }
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        const activeTabId = !this.isValidTabId(newProps.activeTabId) ?
            newProps.activeTabId : this.state.activeTabId
        if (newProps.children.length !== this.props.children.length) {
            this.setState({activeTabId, tabNames: this.computeTabNames(newProps, activeTabId) })
            return
        }
        const oldChildren = React.Children.toArray(this.props.children)
        const newChildren = React.Children.toArray(newProps.children)
        for (let childIndex = 0; childIndex < oldChildren.length; childIndex++) {
            if (oldChildren[childIndex].props.name !== newChildren[childIndex].props.name) {
                this.setState({activeTabId, tabNames: this.computeTabNames(newProps, activeTabId) })
                return
            }
        }
    }

    registerListeners() {
        const children = React.Children.toArray(this.props.children)
        children.forEach(child => {
            //OLog.debug(`VXTabFolder.jsx registerListeners *init* id=${this.props.id}-${child.props.id}`)
            $(`#${this.props.id}-${child.props.id}`).on("shown.bs.tab", (event) => {
                OLog.warn(`VXTabFolder.jsx registerListeners shown.bs.tab id=${this.props.id}-${child.props.id}`)
                this.setState( { activeTabId : child.props.id } )
                const $li = $(event.target).closest(".dropdown")
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
            $(`#${this.props.id}-${child.props.id}`).off("shown.bs.tab")
        })
    }

    rebuildState(newProps) {
        this.setState({ activeTabId : newProps.activeTabId, tabNames: this.computeTabNames(newProps, newProps.activeTabId) })
    }

    render() {
        return (
            <div className={`flexi-grow ${this.props.className || ""}`}>
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
                    tabSets.push({firstName: this.firstName(children, group), active: this.isGroupActive(group), group,
                        id: this.formatTabId(groupPrevious)})
                    group = []
                }
            }
            if (!child.props.group) {
                tabSets.push({firstName: child.props.name, active, group: [{childIndex, active}],
                    id: this.formatTabId(child.props.id)})
            }
            else {
                group.push({childIndex, active, id: this.formatTabId(child.props.id)})
            }
            groupPrevious = child.props.group
        }
        if (group.length > 0) {
            tabSets.push({firstName: this.firstName(children, group), active: this.isGroupActive(group), group,
                id: this.formatTabId(groupPrevious)})
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
        OLog.warn(`VXTabFolder.jsx setActiveTabId id=${this.props.id} activeTabId=${activeTabId}`)
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
            <ul id={this.props.id}
                className={`vx-list tab-drop-list nav ${this.props.pills ? "nav-pills" : "nav-tabs"} flex-section-fixed vx-tab-container`}
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
                    <li id={tabSet.id}
                        key={tabSet.id}
                        data-item-id={child.props.itemId}
                        data-tab-id={child.props.id}
                        role="presentation"
                        className={`vx-list-item tab-text ${tabSet.active ? "active selected" : ""}`}>
                        <a id={`${tabSet.id}-anchor`}
                            data-target={`#${tabSet.id}-panel`}
                            role="tab"
                            data-toggle="tab"
                            className="vx-tab-anchor">
                            {this.props.draggable && this.props.droppable &&
                                <i className="tab-icon fa fa-bars entity-handle"
                                    onMouseDown={this.handleHandleMouseDown.bind(this)}/>
                            }
                            {this.renderTabName(tabSet, tabSetIndex)}
                        </a>
                    </li>
                )
            }
            return (
                <li id={tabSet.id}
                    key={tabSet.id}
                    role="presentation"
                    className={`tab-text dropdown ${tabSet.active ? "active selected" : ""}`}>
                    <a id={`${tabSet.id}-anchor`}
                        className="dropdown-toggle"
                        data-toggle="dropdown"
                        role="button">
                        {this.renderTabName(tabSet, tabSetIndex)}
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

    renderTabName(tabSet, tabSetIndex) {
        if (!this.props.editable) {
            return Parser(this.state.tabNames[tabSetIndex])
        }
        return (
            <VXSpan id={`${tabSet.id}-name`}
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
                <li id={groupItem.id}
                    key={groupItem.id}
                    data-item-id={child.props.itemId}
                    data-tab-id={child.props.id}>
                    <a id={`${groupItem.id}-anchor`}
                        data-target={`#${groupItem.id}-panel`}
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
        children.sort((childA, childB) => {
            return Util.safeCompare(childA.props.itemId, childB.props.itemId)
        })
        return children.map(child=> {
            return (
                <VXTabPanel id={this.formatTabPanelId(child.props.id)}
                    key={child.props.id}
                    itemId={child.props.itemId}
                    className={`${child.props.id === this.state.activeTabId ? "in active" : ""}`}
                    fade={this.props.fade}>
                    {child.props.children}
                </VXTabPanel>
            )
        })
    }

    tabId(firstOrLast) {
        const children = React.Children.toArray(this.props.children)
        return firstOrLast === "first" ? children[0].props.id : children[children.length - 1].props.id
    }

    handleHandleMouseDown(event) {
        const elementFocused = document.activeElement
        elementFocused.blur()
        const $listItem = $(event.target).closest(".vx-list-item")
        const tabId = $listItem.attr("data-tab-id")
        OLog.warn(`VXTabFolder.jsx handleHandleMouseDown tabId=${tabId}`)
        $listItem.tab("show")
        $listItem.focus()
    }

    handleClickAddTab(data) {
        if (this.props.onClickAddTab) {
            this.props.onClickAddTab(data)
            this.selectLastTab()
        }
    }

    handleClickRemoveTab(data) {
        if (this.props.onClickRemoveTab) {
            this.props.onClickRemoveTab(data)
            this.selectLastTab()
        }
    }

    selectLastTab() {
        Meteor.setTimeout(() => {
            const tabId = this.tabId("last")
            this.setActiveTabId(tabId)
        }, 50)
    }

    handleUpdateTabName(component, value) {
        value = value || Util.i18n("common.label_variable_undefined")
        this.setTabName(component.props.tabSetIndex, value, ()=> {
            if (this.props.onUpdateTabName) {
                this.props.onUpdateTabName(component, value, this)
            }
        })
    }

    handleAfterDrop(dropInfo) {
        const dataItemId = dropInfo["data-item-id"]
        const $droppedItem = dropInfo.$entityTarget.find(`.vx-list-item[data-item-id=${dataItemId}]`)
        const activeTabId = $droppedItem.attr("data-tab-id")
        this.setState({activeTabId})
    }

    formatTabId(tabId) {
        return `${this.props.id}-${tabId}`
    }

    formatTabPanelId(tabId) {
        return `${this.props.id}-${tabId}-panel`
    }

    isValidTabId(tabId) {
        const children = React.Children.toArray(this.props.children)
        return children.some(child => {
            return child.props.id === tabId
        })
    }
}
