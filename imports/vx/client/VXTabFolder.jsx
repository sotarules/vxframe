import { Component } from "react"
import PropTypes from "prop-types"
import Parser from "html-react-parser"

export default class VXTabFolder extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        activeTabId : PropTypes.string.isRequired,
        pills : PropTypes.bool,
        onShown : PropTypes.func
    }

    constructor(props) {
        super(props)
        this.state = { activeTabId : props.activeTabId, tabNames: this.computeTabNames(props.activeTabId) }
    }

    componentDidMount() {
        this.registerListeners()
    }

    registerListeners() {
        React.Children.forEach(this.props.children, child => {
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
        React.Children.forEach(this.props.children, child => {
            //OLog.debug(`VXTabFolder.jsx componentWillUnmount unregister listeners shown.bs.tab id=${this.props.id}-${child.props.id}`)
            $(`#tab-${this.props.id}-${child.props.id}`).off("shown.bs.tab")
        })
    }

    render() {
        return (
            <div className="flexi-grow">
                <ul className={`nav ${this.props.pills ? "nav-pills" : "nav-tabs"} flex-section-fixed tab-margin-bottom`}
                    role="tablist">
                    {this.renderTabs()}
                </ul>
                <div className="tab-content tab-content-flex flexi-grow">
                    {this.renderTabPanels()}
                </div>
            </div>
        )
    }

    computeTabSets(activeTabId) {
        const children = React.Children.toArray(this.props.children)
        const tabSets = []
        let group = []
        let groupPrevious
        let active
        for (let childIndex = 0; childIndex < children.length; childIndex++) {
            const child = children[childIndex]
            active = child.props.id === activeTabId
            if (child.props.group && (!groupPrevious || groupPrevious === child.props.group)) {
                group.push({childIndex, active})
            }
            else {
                if (group.length > 0) {
                    tabSets.push({firstName: this.firstName(children, group), active: this.isGroupActive(group), group})
                    group = []
                }
                tabSets.push({firstName: child.props.name, active, group: [{childIndex, active}]})
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

    computeTabNames(activeTabId) {
        const tabSets = this.computeTabSets(activeTabId)
        return tabSets.map(tabSet => {
            return tabSet.firstName
        })
    }

    setTabName(index, tabName) {
        const tabNames = this.state.tabNames
        tabNames[index] = tabName
        this.setState({tabNames: tabNames})
    }

    renderTabs() {
        const children = React.Children.toArray(this.props.children)
        const tabSets = this.computeTabSets(this.state.activeTabId)
        return tabSets.map((tabSet, tabSetIndex) => {
            if (tabSet.group.length === 1) {
                const child = children[tabSet.group[0].childIndex]
                return  (
                    <li key={`${this.props.id}-tab-${tabSetIndex}`}
                        role="presentation"
                        className={`tab-text ${tabSet.active ? "active" : ""}`}>
                        <a id={`tab-${this.props.id}-${child.props.id}`}
                            href={`#${this.props.id}-${child.props.id}`}
                            role="tab"
                            data-toggle="tab">
                            {Parser(child.props.name)}
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
                        {Parser(this.state.tabNames[tabSetIndex])}
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

    renderDropDownItems(tabSet, children) {
        return tabSet.group.map(groupItem => {
            const child = children[groupItem.childIndex]
            return (
                <li key={`drop-down-item-${child.props.id}`}>
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
        return React.Children.map(this.props.children, child => (
            <div id={`${this.props.id}-${child.props.id}`}
                key={`${this.props.id}-${child.props.id}`}
                role="tabpanel"
                className={`tab-pane fade flexi-grow ${child.props.id === this.state.activeTabId ? "in active" : ""}`}>
                {child.props.children}
            </div>
        ))
    }
}
