import { Component } from "react"

export default class TopBarTitle extends Component {

    render() {
        return (
            <td className="visible-lg">
                <span className="nav-cell-title-text">
                    {this.topBarTitle()}
                </span>
            </td>
        )
    }

    topBarTitle() {
        const domainId = Util.getCurrentDomainId()
        return Util.fetchDomainName(domainId)
    }
}
