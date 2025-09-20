import { Component } from "react"
import PropTypes from "prop-types"
import VXFieldSet from "./VXFieldSet"

export default class VXVideo extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        className: PropTypes.string
    }

    render() {
        return (
            <div className={`video-container ${this.props.className || ""}`}>
                <VXFieldSet legend={this.props.title}
                    className="margin-top-20"
                    legendClassName="margin-bottom-20">
                    <video
                        controls
                        src={this.props.url}
                        style={{ width: "100%" }}
                        playsInline
                        className="video-player">
                        {Util.i18n("common.label_video_tag_not_supported")}
                    </video>
                </VXFieldSet>
            </div>
        )
    }
}
