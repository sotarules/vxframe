import { Component } from "react"
import BasicPanel from "/imports/vx/client/BasicPanel"
import FunctionEditRightContainer from "/imports/functions/client/FunctionEditRightContainer"

export default class FunctionEdit extends Component {
    render() {
        return (
            <BasicPanel id="function-edit-panel">
                <FunctionEditRightContainer/>
            </BasicPanel>
        )
    }
}
