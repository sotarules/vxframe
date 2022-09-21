import {Component} from "react"
import PropTypes from "prop-types"
import Page from "/imports/vx/client/Page"

export default class PrintPreview extends Component {

    static propTypes = {
        id : PropTypes.string.isRequired,
        scrollable : PropTypes.bool.isRequired,
        onPrint : PropTypes.func
    }

    static defaultProps = {
        scrollable : true
    }

    constructor(props) {
        super(props)
        this.mediaQueryList = window.matchMedia("print")
        this.printHandler = this.printHandler.bind(this)
    }

    componentDidMount() {
        this.mediaQueryList.addListener(this.printHandler)
    }

    componentWillUnmount() {
        this.mediaQueryList.removeListener(this.printHandler)
    }

    render() {
        return (
            <div id={`${this.props.id}-container`}
                className="print-preview-container flexi-grow">
                <ul id={this.props.id}
                    className={this.listClassName()}>
                    <Page id={`${this.props.id}-page`}>
                        {this.props.children}
                    </Page>
                </ul>
            </div>
        )
    }

    listClassName() {
        let classes = "list-group dropzone-container-large flexi-grow"
        if (this.props.scrollable) {
            classes += " scroll-y scroll-momentum zero-height-hack"
        }
        return classes
    }

    printHandler(mql) {
        if (mql.matches) {
            OLog.debug("PrintPreview.jsx *print* invoking printFunction")
            if (this.props.onPrint) {
                this.props.onPrint(this)
            }
        }
    }
}
