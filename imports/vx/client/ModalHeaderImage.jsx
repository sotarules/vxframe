import { Component } from "react";
import PropTypes from "prop-types";

export default class ModalHeaderImage extends Component {

    static propTypes = {
        imageUrl : PropTypes.string.isRequired,
        heading : PropTypes.string.isRequired,
        subheading : PropTypes.string,
        className : PropTypes.string
    }

    render() {
        return (
            <div className={`modal-header hidden-xs ${this.props.className || ""}`}>
                <div className="row">
                    <div className="col-sm-12">
                        <table className="modal-top-table">
                            <tbody>
                                <tr>
                                    <td className="modal-top-left">
                                        <img className="modal-top-image" src={this.props.imageUrl} title={this.props.heading}/>
                                    </td>
                                    <td className="modal-top-center">
                                        <div className="modal-top-name">
                                            {this.props.heading}
                                        </div>
                                        <div className="modal-top-subheading">
                                            {this.props.subheading}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}
