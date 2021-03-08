import {Component} from "react"
import PropTypes from "prop-types"
import EmptyEntityList from "/imports/vx/client/EmptyEntityList"
import EntityList from "/imports/vx/client/EntityList"
import EntityItem from "/imports/vx/client/EntityItem"

export default class FunctionEntityList extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        functions : PropTypes.array.isRequired,
        selectable : PropTypes.bool,
        chevrons : PropTypes.bool,
        rightPanel : PropTypes.bool,
        onSelect : PropTypes.func,
    }

    render() {
        if (this.props.functions.length === 0) {
            return (
                <EmptyEntityList id={this.props.id}
                    emptyMessage={Util.i18n("common.empty_functions")}
                    emptyListSize="large"/>
            )
        }
        return (
            <EntityList id={this.props.id}
                selectable={this.props.selectable}
                chevrons={this.props.chevrons}
                rightPanel={this.props.rightPanel}>
                {this.renderEntityItems()}
            </EntityList>
        )
    }

    renderEntityItems() {
        return this.props.functions.map(funktion => (
            <EntityItem id={`function-entity-list-${funktion._id}`}
                key={funktion._id}
                _id={funktion._id}
                iconUrl={CX.CLOUDFILES_PREFIX + "/img/system/function.png"}
                name={funktion.name}
                description={funktion.description}
                message={Util.getCodeLocalized("functionType", funktion.functionType)}
                onSelect={this.handleSelect.bind(this)}/>
        ))
    }

    handleSelect(event, funktion) {
        event.persist()
        Meteor.setTimeout(() => {
            if (this.props.onSelect) {
                this.props.onSelect(event, funktion)
            }
        })
    }
}
