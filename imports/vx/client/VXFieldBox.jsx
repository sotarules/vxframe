import { Component } from "react"
import PropTypes from "prop-types"

export default class VXFieldBox extends Component {

    static LINKTYPE_TO_PROTOCOL = {
        email: "mailto:",
        phone: "tel:",
        web: ""
    }

    static propTypes = {
        label : PropTypes.string,
        formGroupClassName : PropTypes.string,
        labelClassName : PropTypes.string,
        className : PropTypes.string,
        tooltip : PropTypes.string,
        format : PropTypes.object,
        dangerous : PropTypes.bool,
        onClick : PropTypes.func,
        linkType : PropTypes.oneOf(["email", "phone", "web"]),
        value :  PropTypes.oneOfType([ PropTypes.string, PropTypes.number]),
    }

    static defaultProps = {
        format : FX.trim
    }

    render() {
        return (
            <div className={`form-group ${this.props.formGroupClassName || ""}`}>
                {this.props.label &&
                    <label htmlFor={this.props.id}
                        className={`control-label ${this.props.labelClassName || ""}`}
                        title={this.props.tooltip}>
                        {this.props.label}
                    </label>
                }
                {this.renderBody()}
            </div>
        )
    }

    renderBody() {
        if (this.props.dangerous) {
            return  (
                <div className={`top-fieldbox ${this.props.className || ""}`}
                    dangerouslySetInnerHTML={{__html: this.props.value}}/>
            )
        }
        if (this.props.linkType && this.props.value) {
            const protocol = VXFieldBox.LINKTYPE_TO_PROTOCOL[this.props.linkType]
            if (protocol != null) {
                return (
                    <div className={`top-fieldbox top-fieldbox-link ${this.props.className || ""}`}>
                        <a href={this.renderHref(protocol)}
                            onClick={this.handleClick.bind(this)}>
                            {UX.parseHtml(UX.render(this, this.props.value))}
                        </a>
                    </div>
                )
            }
        }
        return (
            <div className={`top-fieldbox ${this.props.className || ""}`}>
                {UX.parseHtml(UX.render(this, this.props.value))}
            </div>
        )
    }

    renderHref(protocol) {
        switch (this.props.linkType) {
        case "email": return `${protocol}${this.props.value}`
        case "phone": return `${protocol}${this.renderHrefPhone()}`
        case "web" : return `${protocol}${this.props.value}`
        }
    }

    renderHrefPhone() {
        return this.props.value.split("X")[0]
    }

    handleClick(event) {
        if (this.props.onClick) {
            this.props.onClick(event, this)
            return
        }
        if (this.props.linkType === "web") {
            $(event.target).blur()
            OLog.debug(`VXFieldBox handleClick shall open web page url=${this.props.value}`)
            UX.openWebPage(this.props.value, event)
        }
    }
}
