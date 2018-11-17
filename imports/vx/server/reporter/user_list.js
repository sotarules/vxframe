EmailTemplates.user_list = {

    path : "reporter/user_list.html",

    helpers : {

        preview() {
            return Util.i18n("reporter.title_user_list", { adminFullName: Util.fetchFullName(this.recipient._id) } )
        },

        title() {
            return Util.i18n("reporter.title_user_list", { adminFullName: Util.fetchFullName(this.recipient._id) } )
        },

        reportDate() {
            return Util.i18n("reporter.title_report_date", { reportDate: moment.tz(this.reportDate, this.timezone).format("D MMM YYYY h:mm A") } )
        },

        timezone() {
            return Util.i18n("reporter.title_time_zone", { timezone: this.timezone.replace("_", " ") } )
        },

        stateName() {
            Util.i18n("codes.state." + this.reportParameters.state)
        },

        reportLine() {
            let users = Util.findUsersInDomain(Util.getCurrentDomainId(this.recipient._id)).fetch()
            let reportLines = []
            _.each(users, user => {
                OLog.debug("user_list.js reportLine user=" + Util.fetchFullName(user) + " state=" + user.profile.state + " criterion=" + this.reportParameters.state)
                if (!this.reportParameters.state || user.profile.state === this.reportParameters.state) {
                    let reportLine = {}
                    reportLine.fullName = Util.fetchFullName(user)
                    reportLine.address1 = Util.getNullAsEmpty(user.profile.address1)
                    reportLine.city = Util.getNullAsEmpty(user.profile.city)
                    reportLine.state = user.profile.state ? Util.i18n("codes.state." + user.profile.state) : ""
                    reportLine.zip = Util.getNullAsEmpty(user.profile.zip)
                    reportLine.phone = FX.phoneUS.render(user.profile.phone, user.profile.country)
                    reportLine.mobile = FX.phoneUS.render(user.profile.mobile, user.profile.country)
                    reportLine.email = Util.getUserEmail(user)
                    reportLines.push(reportLine)
                }
            })
            return reportLines
        }
    }
}
