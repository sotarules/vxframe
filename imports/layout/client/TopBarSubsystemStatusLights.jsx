import { Component } from "react";
import PropTypes from "prop-types";
import TopBarSubsystemStatus from "/imports/layout/client/TopBarSubsystemStatus.jsx";

export default class TopBarSubsystemStatusLights extends Component {

    static propTypes = {
        subsystemStatus: PropTypes.array.isRequired
    }

    render() {
        return (
            <td className="nav-cell-space">
                <div className="nav-cell-status pull-right visible-lg">
                    {this.renderSubsystemStatusLights()}
                </div>
            </td>
        );
    }

    renderSubsystemStatusLights() {
        return this.props.subsystemStatus.map(subsystemStatusObject => (
            <TopBarSubsystemStatus
                key={subsystemStatusObject.subsystem}
                name={Util.i18n("codes.subsystemName." + subsystemStatusObject.subsystem)}
                statusIconClass={CX.TOP_BAR_SUBSYSTEM_STATUS_CLASS_MAP[subsystemStatusObject.status]}
                message={Util.i18n(subsystemStatusObject.key, subsystemStatusObject.variables)}/>
        ));
    }
}
