import { Component } from "react"
import PropTypes from "prop-types"

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
        this.popoverComponent = null
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
            </FormElement>
        )
    }

    componentDidUpdate() {
        this.updatePopover()
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

    updatePopover() {
        if (this.state.errors.size === 0 && this.popoverComponent) {
            OLog.debug(`VXForm.jsx updatePopover *clear* id=${this.popoverComponent.props.id}`)
            UX.clearPopover($(this.popoverComponent.inputElement))
            this.popoverComponent = null
            return
        }
        const component = Array.from(this.state.errors).pop()
        if (component) {
            if (this.popoverComponent) {
                OLog.debug(`VXForm.jsx updatePopover clear *existing* popover id=${this.popoverComponent.props.id}`)
                UX.clearPopover($(this.popoverComponent.inputElement))
            }
            const popoverContainer = this.popoverContainer()
            const popoverText = component.state.localizedMessage
            OLog.debug(`VXForm.jsx updatePopover *create* id=${component.props.id} popoverContainer=${popoverContainer} ` +
                `popoverPlacement=${component.props.popoverPlacement} popoverText=${popoverText}`)
            UX.createPopover(popoverContainer, $(component.inputElement), popoverText, component.props.popoverPlacement)
            this.popoverComponent = component
        }
    }

    popoverContainer() {
        if (this.props.popoverContainer === "body") {
            return "body"
        }
        if (this.props.popoverContainer === "this") {
            return `#${this.props.id}`
        }
        return false
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
            // OLog.debug("VXForm.jsx unregister componentId=" + component.props.id + " is not registered")
            return
        }
        this.components.splice(index, 1)
    }

    addError(component) {
        this.state.errors.add(component)
        this.setState( { errors : this.state.errors } )
    }

    deleteError(component) {
        this.state.errors.delete(component)
        this.setState( { errors : this.state.errors } )
    }

    reset() {
        this.setState( { errors : new Set() })
    }
}
