import { Component } from "react";

export default class TopBarTitle extends Component {

    render() {
        return (
            <td className="nav-cell-title visible-lg">
                <span className="nav-cell-title-text">{ Util.i18n("navbar.system_title") }</span>
            </td>
        )
    }
}
