import { Component } from "react"
import PropTypes from "prop-types"

export default class RadioButtonGroup extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        activeButtonId : PropTypes.string,
        className : PropTypes.string
    }

    constructor(props) {
        super(props)
        this.state = { activeButtonId : props.activeButtonId }
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        this.setState( { activeButtonId : newProps.activeButtonId } )
    }

    render() {
        return (
            <div id={this.props.id}
                className={"btn-group btn-group-justified btn-group-list-header flex-section-fixed " +
                    `${this.props.className || ""}`}
                data-toggle="buttons">
                {UX.augmentChildren(this.props.children, () => true, {
                    getActiveButtonId : () => {
                        return this.state.activeButtonId
                    },
                    setActiveButtonId : (id) => {
                        this.state.activeButtonId = id
                    }
                })}
            </div>
        )
    }
}
