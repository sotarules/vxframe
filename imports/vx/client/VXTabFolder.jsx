import { Component } from "react"
import PropTypes from "prop-types"
import Parser from "html-react-parser"

export default class VXTabFolder extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        activeTabId : PropTypes.string.isRequired
    }

    constructor(props) {
        super(props)
        this.state = { activeTabId : props.activeTabId }
    }

    componentDidMount() {
        _.each(this.props.children, child => {
            $("#tab-" + child.props.id).on("shown.bs.tab", () => {
                this.setState( { activeTabId : child.props.id } )
            })
        })
    }

    componentWillUnmount() {
        _.each(this.props.children, child => {
            $("#tab-" + child.props.id).off("shown.bs.tab")
        })
    }

    render() {
        return (
            <div className="flexi-grow">
                <ul className="nav nav-tabs flex-section-fixed" role="tablist">
                    {this.renderTabs()}
                </ul>
                <div className="tab-content tab-content-flex flexi-grow">
                    {this.renderTabPanels()}
                </div>
            </div>
        )
    }

    renderTabs() {
        return this.props.children.map(child => (
            <li key={child.props.id}
                role="presentation"
                className={`tab-text ${child.props.id === this.state.activeTabId ? "active" : ""}`}>
                <a id={`tab-${child.props.id}`}
                    role="tab"
                    data-toggle="tab">
                {Parser(child.props.name)}
                </a>
            </li>
        ))
    }

    renderTabPanels() {
        return this.props.children.map(child => (
            <div id={child.props.id}
                key={child.props.id}
                role="tabpanel"
                className={`tab-pane flexi-grow ${child.props.id === this.state.activeTabId ? "active" : ""}`}>
                {child.props.children}
            </div>
        ))
    }
}
