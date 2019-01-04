import { Component } from "react"
import PropTypes from "prop-types"
import GroupBox from "/imports/vx/client/GroupBox"
import SettingsDomainTppCredsRow from "/imports/settings/client/SettingsDomainTppCredsRow"

export default class SettingsDomainTppCreds extends Component {

    static propTypes = {
        domain : PropTypes.object.isRequired
    }

    render() {
        return (
            <GroupBox>
                <div className="row top-groupbox-small-heading">
                    <div className="col-xs-2">
                        <span title={Util.i18n("system_settings.tooltip_domain_tpp_pan_prefix")}>
                        {Util.i18n("system_settings.label_domain_tpp_pan_prefix")}
                        </span>
                    </div>
                    <div className="col-xs-1">
                        <span title={Util.i18n("system_settings.tooltip_domain_tpp_issuer_id")}>
                        {Util.i18n("system_settings.label_domain_tpp_issuer_id")}
                        </span>
                    </div>
                    <div className="col-xs-3">
                        <span title={Util.i18n("system_settings.tooltip_domain_tpp_station_id")}>
                        {Util.i18n("system_settings.label_domain_tpp_station_id")}
                        </span>
                    </div>
                    <div className="col-xs-3">
                        <span title={Util.i18n("system_settings.tooltip_domain_tpp_login_name")}>
                        {Util.i18n("system_settings.label_domain_tpp_login_name")}
                        </span>
                    </div>
                    <div className="col-xs-3">
                        <span title={Util.i18n("system_settings.tooltip_domain_tpp_password")}>
                        {Util.i18n("system_settings.label_domain_tpp_password")}
                        </span>
                    </div>
                </div>
                <div className="row margin-top-10 top-groupbox-small-data">
                    <div className="col-xs-12">
                        {this.renderRows()}
                    </div>
                </div>
            </GroupBox>
        )
    }

    renderRows() {
        return this.makeRowArray().map(row => (
            <SettingsDomainTppCredsRow key={row.index}
                row={row}
                domain={this.props.domain}/>
        ));
    }

    makeRowArray() {
        let rowArray = []
        _.times(10, index => {
            let row = (this.props.domain.tppApiCreds && index < this.props.domain.tppApiCreds.length) ?
                this.props.domain.tppApiCreds[index] : {}
            row.index = index
            rowArray.push(row)
        });
        return rowArray
    }
}
