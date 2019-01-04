import { connect } from "react-redux"
import { withTracker } from "meteor/react-meteor-data"
import UserDomainViewRight from "/imports/usersdomains/client/UserDomainViewRight"

const MeteorContainer = withTracker(() => {

    let user = ContextMaker["users-domains"]()
    if (!user) {
        return {}
    }

    let domains = _.pluck(VXApp.findUserDomainList(user._id), "domain")
    let domainRolesChecked = Util.domainRolesMap(domains, user)

    return {
        user : user,
        domains : domains,
        domainRolesChecked : domainRolesChecked,
        currentDomainId : Util.getCurrentDomainId(user._id)
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


