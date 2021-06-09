import {Component} from "react"

export default class ModalHeaderBasic extends Component {
    render() {
        return (
            <div className="modal-header-basic"
                ref={element => { this.element = element } }>
                {this.props.children}
            </div>
        )
    }
}
