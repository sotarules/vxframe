import { Component } from "react"
import PropTypes from "prop-types"

export default class WizardHeaderImage extends Component {

    static propTypes = {
        imageUrl : PropTypes.string,
        heading : PropTypes.string,
        subheading : PropTypes.string,
        className : PropTypes.string
    }

    render() {
        return (
            <div className={`wizard-header hidden-xs ${this.props.className || ""}`}>
                <div className="row">
                    <div className="col-sm-12">
                        <table className="wizard-top-table">
                            <tbody>
                                <tr>
                                    <td className="wizard-top-left">
                                        <img className="wizard-top-image" src={this.props.imageUrl} title={this.props.heading}/>
                                    </td>
                                    <td className="wizard-top-center">
                                        <div className="wizard-top-name">
                                            {this.props.heading}
                                        </div>
                                        <div className="wizard-top-subheading">
                                            {this.props.subheading}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}
