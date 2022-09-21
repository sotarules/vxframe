Meteor.i18nMessages.common = _.extend(Meteor.i18nMessages.common || {}, {

    not_logged_in : {
        en : "User is not logged in.",
        rx : "$User is not logged in.$"
    },

    template_subject : {
        en : "{{message}}",
        rx : "${{message}}$"
    },

    label_mail_from : {
        en : "{{system_name}} <{{system_email}}>",
        rx : "${{system_name}} <{{system_email}}>$"
    }
})
