import { connect } from "react-redux"
import { withTracker } from "meteor/react-meteor-data"
import UserDomainViewRight from "/imports/usersdomains/client/UserDomainViewRight"

const MeteorContainer = withTracker(() => {

    let user, domains, domainRolesChecked, currentDomainId
    user = ContextMaker["users-domains"]()
    if (user) {
        domains = _.pluck(VXApp.findUserDomainList(user._id), "domain")
        domainRolesChecked = Util.domainRolesMap(domains, user)
        currentDomainId = Util.getCurrentDomainId(user._id)
    }

    return {
        user,
        domains,
        domainRolesChecked,
        currentDomainId
    }

})(UserDomainViewRight)

const mapStateToProps = state => {
    return {
        publishAuthoringUser : state.publishAuthoringUser
    }
}

export default connect(
    mapStateToProps
)(MeteorContainer)


