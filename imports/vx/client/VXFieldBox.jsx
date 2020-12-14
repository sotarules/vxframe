import { Component } from "react"
import PropTypes from "prop-types"

export default class VXFieldBox extends Component {

    static propTypes = {
        label : PropTypes.string,
        formGroupClassName : PropTypes.string,
        labelClassName : PropTypes.string,
        className : PropTypes.string,
        tooltip : PropTypes.string,
        format : PropTypes.object,
        dangerous : PropTypes.bool,
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
                {!this.props.dangerous ? (
                    <div className={`top-fieldbox ${this.props.className || ""}`}>
                        {UX.parseHtml(UX.render(this, this.props.value))}
                    </div>
                ) : (
                    <div className={`top-fieldbox ${this.props.className || ""}`}
                        dangerouslySetInnerHTML={{__html: this.props.value}}/>
                )}
            </div>
        )
    }
}
