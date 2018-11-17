import { Component } from "react";

export default class TopBarLogo extends Component {

    render() {
        return (
            <td className="nav-cell-logo visible-lg">
                <img className="nav-cell-logo-image" src={ CX.TOP_BAR_LOGO_PATH } />
            </td>
        )
    }
}
