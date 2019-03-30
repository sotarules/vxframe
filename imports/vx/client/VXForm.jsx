import { Component } from "react"
import PropTypes from "prop-types"
import { Overlay, Popover } from "react-bootstrap"

export default class VXForm extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        style : PropTypes.object,
        autocomplete : PropTypes.string,
        collection : PropTypes.object,
        _id : PropTypes.string,
        updateHandler : PropTypes.func,
        dynamic : PropTypes.bool,
        elementType : PropTypes.string,
        popoverContainer : PropTypes.string,
        receiveProps : PropTypes.bool,
        redux : PropTypes.bool,
        settings : PropTypes.object
    }

    static defaultProps = {
        elementType : "div",
        id : "vx-form",
        popoverContainer : "this",
        receiveProps : true
    }

    constructor(props) {
        super(props)
        this.state = { errors : new Set() }
        this.components = []
    }

    render() {
        const FormElement = this.props.elementType
        return (
            <FormElement id={this.props.id}
                role="form"
                className={`position-relative ${this.props.className || ""}`}
                autoComplete={this.props.autoComplete}
                style={this.props.style}
                onSubmit={()=>false}>
                {this.makeChildren(this.props.children)}
                {this.renderPopover()}
            </FormElement>
        )
    }

    makeChildren(children) {
        if (!this.props.redux) {
            return children
        }
        let newChildren = React.Children.map(children, child => {
            if (!React.isValidElement(child)) {
                return child
            }
            let value = this.props.settings[child.props.id]
            if (value) {
                child = React.cloneElement(child, { value : value })
            }
            if (child.props.children) {
                let newChildren = this.makeChildren(child.props.children)
                child = React.cloneElement(child, { children : newChildren })
            }
            return child
        })
        return newChildren
    }

    renderPopover() {
        if (this.state.errors.size === 0) {
            return null
        }
        let component = Array.from(this.state.errors).pop()
        OLog.debug("VXForm.jsx renderPopover id=" + component.props.id + " error=" + this.popoverText(component))
        return (
            <Overlay show={true}
                placement={component.props.popoverPlacement}
                containerPadding={20}
                target={component.inputElement}
                container={this.popoverContainer()}>
                <Popover id="popover-contained">
                    {this.popoverText(component)}
                </Popover>
            </Overlay>
        )
    }

    popoverContainer() {
        if (this.props.popoverContainer === "body") {
            return document.body
        }
        let containerId = this.props.popoverContainer === "this" ? this.props.id : this.props.popoverContainer
        let $form = $("#" + containerId)
        if (!$form.exists()) {
            OLog.error("VXForm.jsx popoverContainer unable to find containerId=" + containerId)
            return
        }
        let element = $form[0]
        return element
    }

    popoverText(component) {
        return component.state.localizedMessage
    }

    register(component) {
        if (component.uuid) {
            OLog.debug("VXForm.jsx register componentId=" + component.props.id + " uuid=" + component.uuid)
        }
        if (_.contains(this.components, component)) {
            OLog.error("VXForm.jsx register componentId=" + component.props.id + " is already registered")
            return
        }
        this.components.push(component)
    }

    unregister(component) {
        if (component.uuid) {
            OLog.debug("VXForm.jsx unregister componentId=" + component.props.id + " uuid=" + component.uuid)
        }
        let index = this.components.indexOf(component)
        if (index < 0) {
            OLog.debug("VXForm.jsx unregister componentId=" + component.props.id + " is not registered")
            return
        }
        this.components.splice(index, 1)
    }

    addError(component) {
        OLog.debug("VXForm.jsx addError id=" + component.props.id + " localizedMessage=" + component.state.localizedMessage)
        this.state.errors.add(component)
        this.setState( { errors : this.state.errors } )
    }

    deleteError(component) {
        OLog.debug("VXForm.jsx deleteError id=" + component.props.id)
        this.state.errors.delete(component)
        this.setState( { errors : this.state.errors } )
    }

    reset() {
        this.setState( { errors : new Set() })
    }
}
