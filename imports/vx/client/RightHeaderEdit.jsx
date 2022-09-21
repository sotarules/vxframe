import { Component } from "react"
import VXForm from "./VXForm"
import VXImage from "./VXImage"
import VXInput from "./VXInput"
import PropTypes from "prop-types"

export default class RightHeaderEdit extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        record : PropTypes.object.isRequired,
        collection : PropTypes.object.isRequired,
        nameDbName : PropTypes.string.isRequired,
        descriptionDbName : PropTypes.string.isRequired,
        namePlaceholder : PropTypes.string,
        descriptionPlaceholder : PropTypes.string,
        editableImage : PropTypes.bool.isRequired,
        imageType : PropTypes.string,
        iconUrlDbName : PropTypes.string,
        iconUrlLeft : PropTypes.string,
        iconUrlRight : PropTypes.string
    }

    static defaultProps = {
        editableImage : true
    }

    render() {
        return (
            <div id={this.props.id}
                className="top-header flexi-fixed">
                <VXForm id={`${this.props.id}-form`}
                    ref={(form) => { this.form = form }}
                    className="right-panel-form flexi-fixed"
                    dynamic={true}
                    collection={this.props.collection}
                    _id={this.props.record._id}>
                    <div className="row">
                        <div className="col-sm-12">
                            <table className="top-table">
                                <tbody>
                                    <tr>
                                        <td className="top-left">
                                            {this.props.editableImage ? (
                                                <VXImage id={`${this.props.id}-icon-url`}
                                                    size="small"
                                                    imageType={this.props.imageType}
                                                    value={this.props.record[this.props.iconUrlDbName]}
                                                    dbName={this.props.iconUrlDbName}/>
                                            ) : (
                                                <img className="top-image"
                                                    src={this.props.iconUrlLeft}/>
                                            )}
                                        </td>
                                        <td className="top-center">
                                            <div className="top-input">
                                                <VXInput id={`${this.props.id}-name`}
                                                    value={this.props.record[this.props.nameDbName]}
                                                    placeholder={this.props.namePlaceholder}
                                                    dbName={this.props.nameDbName}/>
                                                <VXInput id={`${this.props.id}-description`}
                                                    value={this.props.record[this.props.descriptionDbName]}
                                                    placeholder={this.props.descriptionPlaceholder}
                                                    dbName={this.props.descriptionDbName}/>
                                            </div>
                                        </td>
                                        {this.props.iconUrlRight &&
                                           <td className="top-right">
                                               <img className="top-image"
                                                   src={this.props.iconUrlRight}/>
                                           </td>
                                        }
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </VXForm>
                <>
                    {this.props.children}
                </>
            </div>
        )
    }
}
