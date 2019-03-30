Meteor.i18nMessages.common = _.extend(Meteor.i18nMessages.common || {}, {

    required_fields_incomplete : {
        en : "Please complete all required fields",
        rx : "$Please complete all required fields$"
    },

    errors_on_form : {
        en : "Please correct errors",
        rx : "$Please correct errors$"
    },

    required_field_here : {
        en : "Please enter data here",
        rx : "$Please enter data here"
    },

    not_logged_in : {
        en : "Sorry, unable to proceed because you are not logged in.",
        rx : "$Sorry, unable to proceed because you are not logged in.$",
    },

    button_text_on : {
        en : "ON",
        rx : "$ON$"
    },

    button_text_off : {
        en : "OFF",
        rx : "$OFF$"
    },

    button_confirm : {
        en : "Confirm",
        rx : "$Confirm$"
    },

    button_save : {
        en : "Save",
        rx : "$Save$"
    },

    button_cancel : {
        en : "Cancel",
        rx : "$Cancel$"
    },

    button_previous : {
        en : "Previous",
        rx : "$Previous$"
    },

    button_next : {
        en : "Next",
        rx : "$Next$"
    },

    button_finish : {
        en : "Finish",
        rx : "$Finish$"
    },

    button_yes : {
        en : "Yes",
        rx : "$Yes$"
    },

    button_no : {
        en : "No",
        rx : "$No$"
    },

    button_ok : {
        en : "OK",
        rx : "$OK$"
    },

    button_back : {
        en : "Back",
        rx : "$Back$"
    },

    button_close : {
        en : "Close",
        rx : "$Close$"
    },

    button_sections : {
        en : "Sections",
        rx : "$Sections$"
    },

    button_users : {
        en : "Users",
        rx : "$Users$"
    },

    button_domains : {
        en : "Domains",
        rx : "$Domains$"
    },

    button_my_tenants : {
        en : "Tenants",
        rx : "$Tenants$"
    },

    button_my_domains : {
        en : "Domains",
        rx : "$Domains$"
    },

    button_templates : {
        en : "Templates",
        rx : "$Templates$"
    },

    button_create_template : {
        en : "Create Email Template",
        rx : "$Create Email Template$"
    },

    button_send_test_email : {
        en : "Send Test<br>Email",
        rx : "$Send Test<br>Email$"
    },

    label_logo_title : {
        en: "{{system_name}}",
        rx: "${{system_name}}$"
    },

    label_cancel_changes : {
        en : "Cancel Changes?",
        rx : "$Cancel Changes?$"
    },

    label_confirm_delete : {
        en : "Confirm Delete",
        rx : "$Confirm Delete$"
    },

    label_are_you_sure : {
        en : "Are you sure?",
        rx : "$Are you sure?$"
    },

    label_report_parameters : {
        en : "Parameters",
        rx : "$Parameters$"
    },

    label_users : {
        en : "Users",
        rx : "$Users$"
    },

    label_domains : {
        en : "Domains",
        rx : "$Domains$"
    },

    label_email : {
        en : "Email",
        rx : "$Email$"
    },

    label_phone : {
        en : "Phone",
        rx : "$Phone$"
    },

    label_mobile : {
        en : "Mobile",
        rx : "$Mobile$"
    },

    label_tenant_admin_role : {
        en : "Tenant Admin",
        rx : "$Tenant Admin$"
    },

    label_domain_admin_role : {
        en : "Domain Admin",
        rx : "$Domain Admin$"
    },

    label_billing_address : {
        en : "Address",
        rx : "$Address$"
    },

    label_billing_city : {
        en : "City",
        rx : "$City$"
    },

    label_billing_state : {
        en : "State",
        rx : "$State$"
    },

    label_billing_zip : {
        en : "Zip",
        rx : "$Zip$"
    },

    label_my_tenants : {
        en : "Tenants",
        rx : "$Tenants$"
    },

    label_my_domains : {
        en : "Domains",
        rx : "$Domains$"
    },

    label_your_email_address : {
        en : "Your Email Address",
        rx : "$Your Email Address"
    },

    label_tenant_admin : {
        en : "Tenant Admin",
        rx : "$Tenant Admin$"
    },

    label_test : {
        en : "Test",
        rx : "$Test$"
    },

    label_templates : {
        en : "Email Templates",
        rx : "$Email Templates$"
    },

    label_subject : {
        en : "Subject",
        rx : "$Subject$"
    },

    label_body : {
        en : "Body",
        rx : "$Body$"
    },

    label_send_test_email : {
        en : "Send Test Email",
        rx : "$Send Test Email$"
    },

    label_email_template : {
        en : "Email Template",
        rx : "$Email Template$"
    },

    empty_templates : {
        en : "There are no Email Templates, press Create Email Template to add one",
        rx : "$There are no Email Templates, press Create Email Template to add one$"
    },

    empty_template_rhs_details : {
        en : "The details of your selected Email Template will appear here",
        rx : "$The details of your selected Email Template will appear here$"
    },

    label_name : {
        en : "Name",
        rx : "$Name$"
    },

    label_description : {
        en : "Description",
        rx : "$Description$"
    },

    label_html : {
        en : "HTML",
        rx : "$HTML$"
    },

    switch_on : {
        en : "ON",
        rx : "$ON$"
    },

    switch_off : {
        en : "OFF",
        rx : "$OFF$"
    },

    popup_menu_edit : {
        en : "Edit",
        rx : "$Edit$"
    },

    popup_menu_clone : {
        en : "Clone",
        rx : "$Clone$"
    },

    popup_menu_delete : {
        en : "Delete",
        rx : "$Delete$"
    },

    popup_menu_done_editing : {
        en : "Done Editing",
        rx : "$Done Editing$"
    },

    tooltip_domain_decoration_current : {
        en : "User is currently in this domain",
        rx : "$User is currently in this domain$"
    },

    tooltip_tenant_decoration_current : {
        en : "User is currently in this tenant.",
        rx : "$User is currently in this tenant.$"
    },
})

Meteor.i18nMessages.master = _.extend(Meteor.i18nMessages.master || {}, {

    page_title: {
        en: "{{system_name}}",
        rx: "${{system_name}}$"
    }
})

Meteor.i18nMessages.navbar = _.extend(Meteor.i18nMessages.navbar || {}, {

    system_title: {
        en: "{{system_name}}",
        rx: "${{system_name}}$"
    },

    about: {
        en: "About",
        rx: "$About$"
    },

    signout: {
        en: "Logout",
        rx: "$Logout$"
    },

    log: {
        en: "System Log",
        rx: "$System Log$"
    },

    events: {
        en: "Events",
        rx: "$Events$"
    },

    profile: {
        en: "Profile",
        rx: "$Profile$"
    },

    my_tenants: {
        en: "Tenants",
        rx: "$Tenants$"
    },

    templates: {
        en: "Templates",
        rx: "$Templates$"
    },

    members_domains: {
        en: "Users & Domains",
        rx: "$Users & Domains$"
    },

    settings: {
        en: "Settings",
        rx: "$Settings$"
    }
})

Meteor.i18nMessages.layout = _.extend(Meteor.i18nMessages.layout || {}, {

    label_system_version: {
        en: "Version",
        rx: "$Version$"
    },

    label_system_build_date: {
        en: "Build Timestamp",
        rx: "$Build Timestamp$"
    }
})

Meteor.i18nMessages.footer = _.extend(Meteor.i18nMessages.footer || {}, {
    copyright: {
        en: "Copyright &#169; 2019 SOTA Enterprises - All rights reserved.",
        rx: "$Copyright &#169; 2019 SOTA Enterprises - All rights reserved.$"
    }
})

Meteor.i18nMessages.not_found = _.extend(Meteor.i18nMessages.not_found || {}, {

    heading_page_not_available : {
        en : "Page Not Available",
        rx : "$Page Not Available$"
    },

    heading_not_authorized : {
        en : "Not Authorized",
        rx : "$Not Authorized$"
    },

    heading_record_not_found : {
        en : "Record Not Found",
        rx : "$Record Note Found$"
    },

    subheading_page_not_available : {
        en : "The link you followed may be broken, or the page may have been removed.",
        rx : "$The link you followed may be broken, or the page may have been removed.$"
    },

    subheading_not_authorized : {
        en : "Sorry, you are not authorized to access this subsystem.",
        rx : "$Sorry, you are not authorized to access this subsystem.$"
    },

    subheading_record_not_found : {
        en : "Record doesn't exist or is unavailable via this page.",
        rx : "$Record doesn't exist or is unavailable via this page.$"
    }
})

Meteor.i18nMessages.log = _.extend(Meteor.i18nMessages.log || {}, {

    button_clear_log: {
        en: "Clear Log",
        rx: "$Clear Log$",
    },

    source_client: {
        en: "CLIENT",
        rx: "$CLIENT$",
    },

    source_server: {
        en: "SERVER",
        rx: "$SERVER$",
    },

    option_all : {
        en : "All",
        rx : "$All$"
    },

    placeholder_date : {
        en : "End Date",
        rx : "$End Date$"
    }
})

Meteor.i18nMessages.events = _.extend(Meteor.i18nMessages.events || {}, {

    event_type_all : {
        en : "All",
        rx : "$All$",
    },

    placeholder_date : {
        en : "End Date",
        rx : "$End Date$"
    }
})

Meteor.i18nMessages.login = _.extend(Meteor.i18nMessages.login || {}, {

    email : {
        en : "Email",
        rx : "$Email$"
    },

    password : {
        en : "Password",
        rx : "$Password$"
    },

    confirm_password : {
        en : "Confirm Password",
        rx : "$Confirm Password$"
    },

    create_account : {
        en : "Create Account",
        rx : "$Create Account$"
    },

    sign_in : {
        en : "Sign In",
        rx : "$Sign In$"
    },

    email_missing : {
        en : "Please enter an email address.",
        rx : "$Please enter an email address.$"
    },

    password_missing : {
        en : "Please enter a password.",
        rx : "$Please enter a password.$"
    },

    confirm_password_missing : {
        en : "Please enter a confirmation password.",
        rx : "$Please enter a confirmation password.$"
    },

    create_user_error : {
        en : "Unable to create user. {{error}}",
        rx : "$Unable to create user. {{error}}$"
    },

    create_user_success : {
        en : "New user {{email}} was created successfully, check your email for account verification.",
        rx : "$New user {{email}} was created successfully, check your email for account verification.$"
    },

    verify_user_success : {
        en : "Your new account has been verified. Welcome to {{system_name}}. Please sign in.",
        rx : "$Your new account has been verified. Welcome to {{system_name}}. Please sign in.$"
    },

    forgot_password : {
        en : "Forgot your password?",
        rx : "$Forgot your password?$"
    },

    reset_password_sent : {
        en : "Password reset instructions have been sent to {{email}}.",
        rx : "$Password reset instructions have been sent to {{email}}.$"
    },

    forgot_password_error : {
        en : "Unable to send forgot-password email. {{error}}",
        rx : "$Unable to send forgot-password email. {{error}}$"
    },

    enroll_account_title : {
        en : "{{system_name}} Enrollment",
        rx : "${{system_name}} Enrollment$"
    },

    reset_password_title : {
        en : "Reset Password",
        rx : "$Reset Password$"
    },

    reset_password_success : {
        en : "Your password has been reset. Please sign in using your new password.",
        rx : "$Your password has been reset. Please sign in using your new password.$"
    },

    enrollment_success : {
        en : "Welcome to {{system_name}}! Please sign in using your new password.",
        rx : "$Welcome to {{system_name}}! Please sign in using your new password.$"
    },

    reset_password_error : {
        en : "Unable to reset password. {{error}}",
        rx : "$Unable to reset password. {{error}}$"
    },

    login_error : {
        en : "Unable to login. {{error}}",
        rx : "$Unable to login. {{error}}$"
    },

    invalid_email : {
        en : "Email address is not valid.",
        rx : "$Email address is not valid.$"
    },

    invalid_email_mismatch : {
        en : "Email fields do not match.",
        rx : "$Email fields do not match.$"
    },

    invalid_password_mismatch : {
        en : "Password fields do not match.",
        rx : "$Password fields do not match.$"
    },

    invalid_email_in_use : {
        en : "Email address is already in use.",
        rx : "$Email address is already in use.$"
    },

    button_password_reset : {
        en : "Reset Password",
        rx : "$Reset Password$"
    },

    button_enroll : {
        en : "Enroll",
        rx : "$Enroll$"
    },
})

Meteor.i18nMessages.profile = _.extend(Meteor.i18nMessages.profile || {}, {

    tab_profile : {
        en : "Profile",
        rx : "$Profile$"
    },

    tab_credentials : {
        en : "Credentials",
        rx : "$Credentials$"
    },

    tab_notifications : {
        en : "Notifications",
        rx : "$Notifications$"
    },

    tab_preferences : {
        en : "Preferences",
        rx : "$Preferences$"
    },

    tab_reports : {
        en : "Reports",
        rx : "$Reports$"
    },

    label_country : {
        en : "Country",
        rx : "$Country$"
    },

    label_locale : {
        en : "Language",
        rx : "$Language$"
    },

    label_firstName : {
        en : "First name",
        rx : "$First name$"
    },

    label_middleName : {
        en : "Middle",
        rx : "$Middle$"
    },

    label_lastName : {
        en : "Last name",
        rx : "$Last name$"
    },

    label_address1 : {
        en : "Address 1",
        rx : "$Address 1$"
    },

    label_address2 : {
        en : "Address 2",
        rx : "$Address 2$"
    },

    label_city : {
        en : "City",
        rx : "$City$"
    },

    label_state : {
        en : "State",
        rx : "$State$"
    },

    label_zip : {
        en : "Zip",
        rx : "$Zip$"
    },

    label_phone : {
        en : "Phone number",
        rx : "$Phone number$"
    },

    label_mobile : {
        en : "Mobile number",
        rx : "$Mobile number$"
    },

    label_timezone : {
        en : "Time zone",
        rx : "$Time zone$"
    },

    label_default_page : {
        en : "Default page",
        rx : "$Default page$"
    },

    label_password : {
        en : "Password",
        rx : "$Password$"
    },

    label_confirm_password : {
        en : "Confirm Password",
        rx : "$Confirm Password$"
    },

    tooltip_country : {
        en : "Please select your country from the list.  Required field.",
        rx : "$Please select your country from the list.  Required field.$"
    },

    tooltip_locale : {
        en : "Please select your preferred language from the list.  Required field.",
        rx : "$Please select your preferred language from the list.  Required field.$"
    },

    tooltip_firstName : {
        en : "Please enter your first name.  We'll validate the field to ensure that it doesn't contain punctuation marks.  Required field.",
        rx : "$Please enter your first name.  We'll validate the field to ensure that it doesn't contain punctuation marks.  Required field.$"
    },

    tooltip_middleName : {
        en : "Please enter your middle name or middle initial without punctuation.",
        rx : "$Please enter your middle name or middle initial without punctuation.$"
    },

    tooltip_lastName : {
        en : "Please enter your last name, or your family name.  Required field.",
        rx : "$Please enter your last name, or your family name.  Required field.$"
    },

    tooltip_address1 : {
        en : "Please enter the first (or only) line of your street address, or your post office box number.  Required field.",
        rx : "$Please enter the first (or only) line of your street address, or your post office box number.  Required field.$"
    },

    tooltip_address2 : {
        en : "Please enter the the second line of your address (e.g., apartment number, suite number) if applicable.",
        rx : "$Please enter the the second line of your address (e.g., apartment number, suite number) if applicable.$"
    },

    tooltip_city : {
        en : "Please enter your city or town.  Required field.",
        rx : "$Please enter your city or town.  Required field.$"
    },

    tooltip_state : {
        en : "Please select your state from the list.  Required field.",
        rx : "$Please select your state from the list.  Required field.$"
    },

    tooltip_zip : {
        en : "Please enter your zip code.",
        rx : "$Please enter your zip code.$"
    },

    tooltip_phone : {
        en : "Please enter your home or business phone number with extension.  We promise not to call you or bother you.  Required field.",
        rx : "$Please enter your home or business phone number with extension.  We promise not to call you or bother you.  Required field.$"
    },

    tooltip_mobile : {
        en : "Please enter your cell phone number. We promise not to bother you.  Required field.",
        rx : "$Please enter your cell phone number. We promise not to bother you.  Required field.$"
    },

    tooltip_timezone : {
        en : "Please select your timezone from the list.",
        rx : "$Please select your timezone from the list.$"
    },

    tooltip_default_page : {
        en : "Please select which page you'd like to see whenever you log in.",
        rx : "$Please select which page you'd like to see whenever you log in.$"
    },

    tooltip_password : {
        en : "Please enter a password.",
        rx : "$Please enter a password.$"
    },

    tooltip_confirm_password : {
        en : "Please re-enter the password here to make sure we have it right.",
        rx : "$Please re-enter the password here to make sure we have it right.$"
    },

    tooltip_send_now : {
        en : "Send Now",
        rx : "$Send Now$"
    },

    alert_save_succeeded : {
        en : "Profile data has been saved successfully.",
        rx : "$Profile data has been saved successfully.$"
    },

    label_popup : {
        en : "Pop-up",
        rx : "$Pop-up$"
    },

    label_email : {
        en : "Email",
        rx : "$Email$"
    },

    label_sms : {
        en : "SMS",
        rx : "$SMS$"
    },

    label_send_email : {
        en : "Every",
        rx : "$Every$"
    },

    label_on : {
        en : "on",
        rx : "$on$"
    },

    format_next_date: {
        en : "(next {{nextDate}})",
        rx : "(next {{nextDate}})"
    }
})

Meteor.i18nMessages.system_settings = _.extend(Meteor.i18nMessages.system_settings || {}, {

    tab_system : {
        en : "System Settings",
        rx : "$System Settings$"
    },

    tab_tenant : {
        en : "Tenant Settings",
        rx : "$Tenant Settings$"
    },

    tab_domain : {
        en : "Domain Settings",
        rx : "$Domain Settings$"
    },

    label_system_settings : {
        en : "System Settings",
        rx : "$System Settings$"
    },

    label_tenant_settings : {
        en : "Tenant Settings",
        rx : "$Tenant Settings$"
    },

    label_domain_settings : {
        en : "Domain Settings",
        rx : "$Domain Settings$"
    },

    label_system_server_log_level : {
        en : "Server Log Level",
        rx : "$Server Log Level$"
    },

    label_system_enable_reporter : {
        en : "Enable email reports",
        rx : "$Enable email reports$"
    },

    label_tenant_account_poc : {
        en : "Tenant POC",
        rx : "$Tenant POC$"
    },

    label_tenant_information : {
        en : "Tenant Information",
        rx : "$Tenant Information$"
    },

    label_tenant_name : {
        en : "Name",
        rx : "$Name$"
    },

    label_tenant_country : {
        en : "Country",
        rx : "$Country$"
    },

    label_tenant_description : {
        en : "Description",
        rx : "$Description$"
    },

    label_tenant_address1 : {
        en : "Address 1",
        rx : "$Address 1$"
    },

    label_tenant_address2 : {
        en : "Address 2",
        rx : "$Address 2$"
    },

    label_tenant_city : {
        en : "City",
        rx : "$City$"
    },

    label_tenant_state : {
        en : "State",
        rx : "$State$"
    },

    label_tenant_zip : {
        en : "Zip",
        rx : "$Zip$"
    },

    label_domain_name : {
        en : "Name",
        rx : "$Name$"
    },

    label_domain_description : {
        en : "Description",
        rx : "$Description$"
    },

    label_domain_notification_settings : {
        en : "Notification Settings",
        rx : "$Notification Settings$"
    },

    label_domain_mailgun_test : {
        en : "Mailgun Test Mode",
        rx : "$Mailgun Test Mode$"
    },

    label_domain_mailgun_destination_override : {
        en : "Mailgun Destination Override",
        rx : "$Mailgun Destination Override$"
    },

    label_domain_mailgun_private_api_key : {
        en : "Mailgun Private API Key",
        rx : "$Mailgun Private API Key$"
    },

    label_domain_mailgun_public_api_key : {
        en : "Mailgun Public API Key",
        rx : "$Mailgun Public API Key$"
    },

    label_domain_mailgun_domain : {
        en : "Mailgun Domain",
        rx : "$Mailgun Domain$"
    },

    label_domain_twilio_test : {
        en : "Twilio Test Mode",
        rx : "$Twilio Test Mode$"
    },

    label_domain_twilio_user : {
        en : "Twilio User",
        rx : "$Twilio User$"
    },

    label_domain_twilio_auth_token : {
        en : "Twilio Auth Token",
        rx : "$Twilio Auth Token$"
    },

    label_domain_twilio_from_phone : {
        en : "Twilio From Phone",
        rx : "$Twilio From Phone$"
    },

    label_domain_twilio_destination_override : {
        en : "Twilio Destination Override",
        rx : "$Twilio Destination Override$"
    },

    tooltip_system_server_log_level : {
        en : "Select the level of server-side logging",
        rx : "$Select the level of server-side logging$"
    },

    tooltip_tenant_account_poc : {
        en : "Select the Point-of-Contact for this tenant",
        rx : "$Select the Point-of-Contact for this tenant$"
    },

    tooltip_domain_mailgun_test : {
        en : "Check to enable Mailgun test mode (no mail will actually be sent but will be logged by Mailgun)",
        rx : "$Check to enable Mailgun test mode (no mail will actually be sent but will be logged by Mailgun)$"
    },

    tooltip_domain_mailgun_destination_override : {
        en : "Override email address to use for all out-going email (set to your own email for testing)",
        rx : "$Override email address to use for all out-going email (set to your own email for testing)$"
    },

    tooltip_domain_mailgun_private_api_key : {
        en : "Mailgun Private API Key (access credentials)",
        rx : "$Mailgun Private API Key (access credentials)$"
    },

    tooltip_domain_mailgun_public_api_key : {
        en : "Mailgun Public API Key (access credentials)",
        rx : "$Mailgun Public API Key (access credentials)$"
    },

    tooltip_domain_mailgun_domain : {
        en : "Mailgun Domain (to use for all out-going mail)",
        rx : "$Mailgun Domain (to use for all out-going mail)$"
    },

    tooltip_domain_twilio_test : {
        en : "Check to enable Twilio test mode (no SMS will actually be sent)",
        rx : "$Check to enable Twilio test mode (no SMS will actually be sent)$"
    },

    tooltip_domain_twilio_user : {
        en : "Twilio User (credentials)",
        rx : "$Twilio User (credentials)$"
    },

    tooltip_domain_twilio_auth_token : {
        en : "Twilio Auth Token (credentials)",
        rx : "$Twilio Auth Token (credentials)$"
    },

    tooltip_domain_twilio_from_phone : {
        en : "Twilio From Phone (originating phone number for messages)",
        rx : "$Twilio From Phone (originating phone number for messages)$"
    },

    tooltip_domain_twilio_destination_override : {
        en : "Override SMS phone number to use for all out-going messages (set to your own phone for testing)",
        rx : "$Override SMS phone number to use for all out-going messages (set to your own phone for testing)$"
    }
})

Meteor.i18nMessages.my_tenants = _.extend(Meteor.i18nMessages.my_tenants || {}, {

    label_tenant_name : {
        en : "Tenant name",
        rx : "$Tenant name$"
    },

    label_domains_header : {
        en : "Domains",
        rx : "$Domains$"
    },

    button_create_tenant : {
        en : "Create Tenant",
        rx : "$Create Tenant$"
    }
})

Meteor.i18nMessages.my_domains = _.extend(Meteor.i18nMessages.my_domains || {}, {

    label_users_header : {
        en : "Users",
        rx : "$Users$"
    }
})

Meteor.i18nMessages.user_domain = _.extend(Meteor.i18nMessages.user_domain || {}, {

    button_create_user : {
        en : "Add New User",
        rx : "$Add New User$"
    },

    button_create_domain : {
        en : "Create Domain",
        rx : "$Create Domain$"
    },

    label_users : {
        en : "Users",
        rx : "$Users$"
    },

    label_domains : {
        en : "Domains",
        rx : "$Domains$"
    },

    label_domains_header : {
        en : "Domains",
        rx : "$Domains$"
    },

    label_users_header : {
        en : "Users",
        rx : "$Users$"
    },

    label_email_address : {
        en : "Email Address*",
        rx : "$Email Address*$"
    },

    label_send_enrollment_email : {
        en : "Send Enrollment Email",
        rx : "$Send Enrollment Email$"
    },

    label_send_reset_password_email : {
        en : "Reset Password",
        rx : "$Reset Password$"
    },

    label_work_phone : {
        en : "Work Phone",
        rx : "$Work Phone$"
    },

    label_mobile_phone : {
        en : "Mobile Phone",
        rx : "$Mobile Phone$"
    },

    label_domain_name : {
        en : "Domain Name",
        rx : "$Domain Name$"
    },

    label_domain_description : {
        en : "Domain Description",
        rx : "$Domain Description$"
    },

    label_billing_address : {
        en : "Address",
        rx : "$Address$"
    },

    label_billing_city : {
        en : "City",
        rx : "$City$"
    },

    label_billing_state : {
        en : "State",
        rx : "$State$"
    },

    label_billing_zip : {
        en : "Zip",
        rx : "$Zip$"
    },
})
