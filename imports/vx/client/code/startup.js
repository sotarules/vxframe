import initReactFastclick from "react-fastclick"

// This makes it possible to debug even if the user hasn't yet logged in (very helpful for debugging hyperlinks
// such as sign-off actions):
if (Meteor.absoluteUrl().indexOf("sota.ddns.net") >= 0) {
    console.log("startup.js development absoluteUrl=" + Meteor.absoluteUrl() + " so client log level will be DEBUG")
    OLog.setLogLevel(5)
}

Meteor.startup(() => {

    // Compute initial slide mode based on device characteristics:
    UX.updateSlideMode()

    PNotify.prototype.options.styling = "fontawesome"

    // Disable scroll for the document, we'll handle it ourselves
    $(document).on("touchmove", event => {
        event.preventDefault()
    })

    // Dynamic changes in screen size can change the slide-mode state of the system:
    $(window).on("resize", () => {
        UX.updateSlideMode()
    })

    // Anti-rubber-band logic:
    UX.noRubberBand()

    // Capture and log the client version:
    Accounts.onLogin(() => {
        console.log("startup.js Accounts onLogin *fire*")
        Meteor.call("onClientLogin", Meteor.userId(), Meteor.appVersion.version, (error, result) => {
            if (error) {
                console.log("startup.js Accounts onClientLogin callback error=" + error)
                return
            }
        })
    })

    Meteor.Spinner.options = { zIndex : 0, width: 3 }

    // Use React-friendly FastClick:
    initReactFastclick()
})
