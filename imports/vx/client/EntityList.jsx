import { Component } from "react"
import PropTypes from "prop-types"

export default class EntityList extends Component {

    static propTypes = {
        id : PropTypes.string,
        className : PropTypes.string,
        selectable : PropTypes.bool,
        chevrons : PropTypes.bool,
        control : PropTypes.bool,
        controlClassName : PropTypes.string,
        controlTooltip : PropTypes.string,
        onClickControl : PropTypes.func,
        rightPanel : PropTypes.bool,
        draggable : PropTypes.bool,
        droppable : PropTypes.bool,
        dragClassName : PropTypes.string,
        dropClassName : PropTypes.string,
        placeholderClassName : PropTypes.string,
        onDrop : PropTypes.func
    }

    static defaultProps = {
        placeholderClassName : "entity-drag-placeholder-conditional"
    }

    componentDidMount() {

        //OLog.debug("EntityList.jsx componentDidMount initializing entity list id=" + this.props.id +
        //    " rightPanel=" + !!this.props.rightPanel +
        //    " draggable=" + !!this.props.draggable +
        //    " droppable=" + !!this.props.droppable)

        if (this.props.draggable) {
            let entitySource = $(`#${this.props.id}`)
            if (entitySource.exists()) {
                OLog.debug("EntityList.jsx componentDidMount configuring drag source id=" + this.props.id)
                entitySource.sortable({
                    helper : "clone",
                    cursor : "move",
                    handle : ".entity-handle",
                    placeholder : this.props.placeholderClassName,
                    change : (event, ui) => {
                        UX.initPlaceholder(ui, this.props.dropClassName)
                    },
                    opacity : ".7",
                    start : (event, ui) => {
                        $(ui.item).show()
                        // If we don't defeat momentum scrolling, the skill helper will
                        // not be visible outside the bounds of the source list:
                        $(`.${this.props.dragClassName}`).removeClass("scroll-momentum")
                    },
                    stop : () => {
                        entitySource.sortable("cancel")
                        // If we don't defeat momentum scrolling, the skill helper will
                        // not be visible outside the bounds of the source list:
                        $(`.${this.props.dragClassName}`).addClass("scroll-momentum")
                    },
                    connectWith : `.${this.props.dropClassName}`,
                    scroll : false
                })
            }
            else {
                OLog.error("EntityList.jsx componentDidMount drag source id=" + this.props.id + " not found")
            }
        }

        if (this.props.droppable) {
            let entityTarget = $(`#${this.props.id}`)
            if (entityTarget.exists()) {
                OLog.debug("EntityList.jsx componentDidMount configuring drop target id=" + this.props.id)
                entityTarget.sortable({
                    handle : ".entity-handle",
                    start : (event, ui) => {
                        $(ui.item).attr("data-previndex", ui.item.index())
                    },
                    stop : (event, ui) => {
                        $(ui.item).removeAttr("data-previndex")
                        $(ui.item).removeAttr("style")
                    },
                    update : (event, ui) => {
                        OLog.debug("EntityList.jsx componentDidMount onDrop id=" + this.props.id)
                        if (this.props.onDrop) {
                            this.props.onDrop(event, entityTarget, ui)
                        }
                    }
                })
            }
            else {
                OLog.error("EntityList.jsx componentDidMount drop target id=" + this.props.id + " not found")
            }
        }
    }

    render() {
        return (
            <ul id={this.props.id} className={this.listClassName()}>
                {UX.augmentChildren(this.props.children,
                    (child) => child.type.displayName === "EntityItem",
                    {
                        chevrons : this.props.chevrons,
                        selectable : this.props.selectable,
                        control : this.props.control,
                        controlClassName : this.props.controlClassName,
                        controlTooltip : this.props.controlTooltip,
                        onClickControl : this.props.onClickControl
                    }
                )}
            </ul>
        )
    }

    listClassName() {
        return "list-group scroll-y scroll-momentum scroll-fix flexi-grow zero-height-hack" +
            (this.props.rightPanel ? " dropzone-container-large" : "") +
            (this.props.draggable ? " " + this.props.dragClassName : "") +
            (this.props.droppable ? " " + this.props.dropClassName : "") +
            (this.props.className ? " " + this.props.className : "")
    }
}
