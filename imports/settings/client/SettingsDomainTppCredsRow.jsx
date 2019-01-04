import { Component } from "react"
import PropTypes from "prop-types"
import VXInput from "/imports/vx/client/VXInput"

export default class SettingsDomainTppCredsRow extends Component {

    static propTypes = {
        row : PropTypes.object.isRequired,
        domain : PropTypes.object.isRequired
    }

    render() {
        return (
            <div className="row">
                <div className="col-xs-2">
                    <VXInput id={"panPrefix-" + this.props.row.index }
                        className="form-no-label top-groupbox-small-data"
                        modifyHandler={this.handleModifyCell.bind(this)}
                        value={this.props.row.panPrefix}/>
                </div>
                <div className="col-xs-1">
                    <VXInput id={"issuerId-" + this.props.row.index }
                        className="form-no-label top-groupbox-small-data"
                        modifyHandler={this.handleModifyCell.bind(this)}
                        value={this.props.row.issuerId}/>
                 </div>
                <div className="col-xs-3">
                    <VXInput id={"stationId-" + this.props.row.index }
                        className="form-no-label top-groupbox-small-data"
                        modifyHandler={this.handleModifyCell.bind(this)}
                        value={this.props.row.stationId}/>
                </div>
                <div className="col-xs-3">
                    <VXInput id={"loginName-" + this.props.row.index }
                        className="form-no-label top-groupbox-small-data"
                        modifyHandler={this.handleModifyCell.bind(this)}
                        value={this.props.row.loginName}/>
                </div>
                <div className="col-xs-3">
                    <VXInput id={"password-" + this.props.row.index }
                        className="form-no-label top-groupbox-small-data"
                        modifyHandler={this.handleModifyCell.bind(this)}
                        value={this.props.row.password}/>
                </div>
            </div>
        )
    }

    handleModifyCell(component, modifier) {
        let value = component.getValue()
        modifier.$set = modifier.$set || {}
        modifier.$set.tppApiCreds = modifier.$set.tppApiCreds || this.props.domain.tppApiCreds || []
        let id = component.props.id.split("-")[0]
        if (!Util.isNullish(value)) {
            while (modifier.$set.tppApiCreds.length <= this.props.row.index) {
                modifier.$set.tppApiCreds.push({})
            }
            modifier.$set.tppApiCreds[this.props.row.index][id] = value
        }
        else {
            if (this.props.row.index < modifier.$set.tppApiCreds.length) {
                delete modifier.$set.tppApiCreds[this.props.row.index][id]
            }
        }
        modifier.$set.tppApiCreds = Util.removeEmptyRows(modifier.$set.tppApiCreds, ["index"])
    }
}
