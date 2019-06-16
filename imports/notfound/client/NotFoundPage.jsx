import { Component } from "react";

export default class NotFoundPage extends Component {

    componentDidMount() {
        UX.fireFade();
    }

    render() {
        return (
            <div className="not-found-wrapper fade-first flexi-grow">
                <div className="not-found-glass fade-second flexi-grow">
                    <div className="not-found-pitch flexi-grow">
                        <img className="not-found-cube" src={ CX.LOGO_PATH }/>
                        <br />
                        <span className="not-found-heading">
                            {Util.i18n("not_found.heading_page_not_available")}
                        </span>
                        <br />
                        <span className="not-found-subheading">
                            {Util.i18n("not_found.subheading_page_not_available")}
                        </span>
                    </div>
                </div>
            </div>
        )
    }
}
