import { Component } from "react"
import PropTypes from "prop-types"
import CheckboxTree from "react-checkbox-tree"
import { expandNodesToLevel } from "react-checkbox-tree"

export default class VXTree extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        nodes : PropTypes.array,
        modal : PropTypes.elementType,
        scrollable : PropTypes.bool,
        zeroHeightHack : PropTypes.bool,
        expandToLevel : PropTypes.number,
        checked: PropTypes.array,
        expanded: PropTypes.array,
        fields: PropTypes.array,
        collection : PropTypes.object,
        record : PropTypes.object,
        checkedDbName : PropTypes.string,
        fieldsDbName : PropTypes.string,
        onClick: PropTypes.func,
        onChecked: PropTypes.func,
        onExpanded: PropTypes.func,
        isDisplayModal: PropTypes.func
    }

    static defaultProps = {
        scrollable : true,
        zeroHeightHack : true
    }

    constructor(props) {
        super(props)
        const expanded = this.props.expandToLevel != null ?
            expandNodesToLevel(this.props.nodes, this.props.expandToLevel) : props.expanded
        this.state = {
            checked: props.checked || [],
            expanded: expanded || [],
            fields: props.fields || []
        }
    }

    componentDidUpdate(prevProps) {
        if (!Util.isDeepEqual(prevProps.checked, this.props.checked)) {
            this.setState({ checked: this.props.checked || [] })
        }
    }

    render() {
        if (!this.props.nodes) {
            return null
        }
        return (
            <div id={this.props.id}
                className={`vx-tree position-relative ${this.scrollableClassName()} ${this.scrollClasses()}`}>
                <CheckboxTree
                    id={`${this.props.id}-checkbox-tree`}
                    nodes={this.props.nodes}
                    checked={this.state.checked}
                    expanded={this.state.expanded}
                    onClick={this.handleClickNode.bind(this)}
                    onCheck={this.handleChecked.bind(this)}
                    onExpand={this.handleExpanded.bind(this)}
                />
            </div>
        )
    }

    scrollableClassName() {
        return this.props.scrollable ? "flexi-grow" : "flexi-fixed"
    }

    scrollClasses() {
        if (this.props.scrollable) {
            return "scroll-both scroll-momentum " + (this.props.zeroHeightHack ? " zero-height-hack" : "")
        }
        return ""
    }

    handleClickNode(nodeInfo) {
        this.setState({nodeInfo})
        let displayModal = true
        if (this.props.isDisplayModal) {
            displayModal = this.props.isDisplayModal(nodeInfo, this)
        }
        if (!displayModal) {
            return
        }
        const Component = this.props.modal
        UX.showModal(<Component {...this.props}
            id={`${this.props.id}-modal`}
            nodeInfo={nodeInfo}/>)
    }

    handleChecked(checked) {
        this.setState({ checked }, () => {
            if (this.props.collection && this.props.record) {
                VXApp.updateHandlerSimple(this.props.collection, this.props.record, this.props.checkedDbName, checked)
            }
            if (this.props.onChecked) {
                this.props.onChecked(checked, this)
            }
        })
    }

    handleExpanded(expanded) {
        this.setState({ expanded }, () => {
            if (this.props.onExpanded) {
                this.props.onExpanded(expanded, this)
            }
        })
    }
}
