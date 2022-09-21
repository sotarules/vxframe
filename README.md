# VXFrame

VXFrame is React/Redux/Meteor/Bootstrap framework for developing multi-tenant SaaS applications. The key design
goals are to reduce development cost and to make the development process fun.

## Features

* Configurable appearance courtesy Bootstrap/Less
* Over 100 lovingly-crafted React components
* Higher-level React components for managing data from reactive data sources
* Responsive and touch-friendly to work beautifully on all devices
* Meticulously-curated third-party packages that work well together
* 100% Flexbox-based to support advanced layouts
* Standardized layouts including top bar and off-canvas navigation (burger button)
* Animations leverage hardware-assisted 3D translation 
* React-based input controls snap together like Lego blocks
* Declarative data binding to MongoDB 
* Declarative rule-based validation and formatting 
* Client-side and server-side validation 
* Dynamic or deferred database updates (Save/Cancel)
* Flexible database schema (Collection2)
* Generalized events system for monitoring and analytics
* Generalized notification system for events (push, SMS, email)
* Generalized logging subsystem logs to MongoDB instead of files
* Multitenant design partitions application into tenants and domains
* Accounts system supports enrollment, password reset
* Two-factor authentication (Google Authenticator, Microsoft Authenticatior, Authy)
* Image upload and cropping of images stored on S3, Rackspace or other
* Comprehensive support for drag-and-drop
* Undo/Redo
* Import from CSV
* Reporting Subsystem
* User-written Functions
* Support for context menus and "hover" controls
* Build and push scripts to facilitate frequent code changes
* Infrastructure for managing health of external systems
* Scalable via Nginx clustering and MongoDB replication
* Internationalization and Localization 
* Secure architecture

## Atmosphere Packages

Although Atmosphere is considered "legacy" now, it is still a very convenient way to incorporate many useful packages into your application.

| Package  | Description |
| --- | --- |
| afruth:bootstrap-touchspin | Touchspin controls are widgets that let you crank a numeric value up and down. In VXFrame, touchspin controls are wrapped by VXSpin components. |
| aldeed:collection2  | Must-have package allows you to define a MongoDB schema. Creating a production system without this is suicide. |
| dsyko:holder  | Holder.js package allows the VXImage component to render a "stand-in" image when the real image has not yet been specified.  |
| ecmascript  | Must-have compiler plugin that supports ES2015+ in all .js files. You want this, trust me. |
| meteor-node-csv | Import subsystem for CSV. |
| dynamic-import  | Runtime support for Meteor 1.5 dynamic import syntax |
| email   | Very convenient way of sending emails (in VXFrame the basic email package is used together with Mailgun).  |
| ejson | Extended library for safely serializing JSON |
| fetch | New-and-improved way of making HTTP calls. |
| jkuester:http | Make HTTP calls to remote services using fetch API. |
| es5-shim  | Shim and polyfills to improve ECMAScript 5 support.  |
| http | Must-have package to make HTTP calls to remote servers. Enough said.  |
| joshowens:timezone-picker  | VXFrame uses this package not for the picker but to do automatic timezone detection. |
| kidovate:pnotify   | Beautiful and modern desktop and in-browser notifications. VXFrame absolutely relies on this.  |
| lepozepo:accounting  | Accounting.js - number, money and currency formatting - fully localizable, zero dependencies. |
| less  | This is necessary because Bootstrap is the front-end of VXFrame. |
| matb33:collection-hooks | Collection hooks to support rule-based back-end behaviors. |
| meteorhacks:picker  | Server Side Router for Meteor. |
| mikowals:batch-insert | Super-fast batch insert for large-scale CSV import. |
| miazzo:user-status | User login/logout tracking. |
| mobile-experience | Packages for a great mobile experience. |
| momentjs:moment  | Absolutely must-have package, Moment.js allows you to parse, validate, manipulate, and display dates |
| mrt:jquery-ui-sortable | Reorder elements in a list or grid using the mouse, this supports VXFrame drag/drop processing. |
| mrt:moment-timezone  | Must-have package that fully supports user timezones (sister of Moment.js). |
| ostrio:files | Full support for upload to S3 and rackspace including progress bars and cancellability. |
| pcel:loading  | A beautiful loading splash screen (please-wait + spinkit bundle), VXFrame uses this package to display animation whenever the user chooses a new route (i.e., subsystem) via the off-canvas navigation fly-out.  |
| random   | Random number generator and utilities  |
| react-meteor-data  | React higher-order component for reactively tracking Meteor data  |
| reactive-var  | Reactive variables are very handy, particularly in Meteor/React high-level containers.  |
| static-html  | Define static page content in .html files  |
| tsega:bootstrap3-datetimepicker  | Bootstrap 3 DateTime picker.  After evaluating several comparable widgets, I chose this one. It works great and really looks Bootstrap-like.  |
| underscore | Swiss army knife of utility functions - a must have. |

## NPM Dependencies

Best practices for Meteor suggest that whenever possible you use raw NPM packages instead of Atmosphere.  This conversion is a work in progress, but here are the native NPMs used at this time. 

| Package                | Description |
|------------------------| --- |
| @babel/runtime         | Allows browser compatibility while coding with cutting edge JavaScript features. |
| ace-builds             | Support for the ACE editor - allows user editing of JavaScript rules. |
| async                  | Support for dealing with queues. |
| aws-sdk                | Permits uploading of images to Amazon S3. |
| bcrypt                 | Superb library to hash passwords, used by Meteor accounts subsystem. |
| core-js                |  Polyfills for ECMAScript 5, ECMAScript 6: promises, symbols and collections. |
| cropperjs              | Support for resizing and cropping uploaded images. |
| fast-safe-stringify    | Does exactly what the package title implies. |
| fast-deep-equal        | Compare two objects for equality. |
| fibers                 | Support for Fibers and Futures, gives JavaScript the ability to block on the server side, making code look almost normal. Must-have for Meteor applications. |
| html-react-parser      | Makes it possible to include HTML tags in dynamically-created strings and have them parsed as honest-to-god React components.  Very useful, particularly for i18n bundles that contain HTML elements for fancy formatting. |
| ladda                  | Allows buttons to have an operations-in-progress spinner that looks very similar to the one used in iOS.  Gives unambiguous feedback on touch devices where it can sometimes be unclear whether a button has been pressed.  VXFrame uses Ladda-style buttons across the board for consistency. |
| lodash                 | Swiss army knife of functions - must have. |
| meteor-node-stubs      | Compatibility layer for Meteor access to Node.js resources. |
| otplib                 | Support for QR codes - part of the 2FA support sibsystem. |
| prop-types             | React property types metadata, key to allowing components to declare "schemas" which clearly define their property input expections. This allows you to implement design-by-contract-style pre-conditions, incredibly helpful. I've lived without it (painfully) under Blaze, and I'm never going back. |
| react                  | React is perhaps the best way to develop modern responsive web applications, at least at the time of this writing. |
| react-ace              | Support for ACE editor - allows user editing of JavaScript rules. |
| react-checkbox-tree    | Checkbox tree with properties modal. |
| react-contextify       | Gives you no-bullshit context menus in React. |
| react-dom              | Important part of React. |
| react-fast-compare     | Allows quick deep comparison of JavaScript objects. |
| react-fastclick        | Gets rid of annoying 350ms delay on touch devices, definitely a must-have package. |
| react-helmet           | Gives you convenient access to HTML header elements with simple React components. |
| react-redux            | Official React bindings for Redux. |
| react-router-dom       | Perhaps best router for React very clean and lets you have ultra-granular routes. |
| react-transition-group | State-of-the-art package for implementing animations on React. It took a lot of time to master this package, but now it handles VXFrame slide and cross-fade animations. Hats off to the developers, they clearly worked their butts off on this package, and I can see that this generalized approach can handle most animation requirements. |
| readable-stream        | Does just what the package title implies. |
| redux                  | Over-engineered and overly-complex browser state management, loved by propeller-heads and barely tolerated by regular developers, works hand-in-glove with Meteor tracker to control local state. |
| redux-actions          | Flux Standard Action utilities for Redux. |
| redux-persist          | Saves and automatically restores Redux in Windows local storage. |
| simpl-schema | Must-have package that checks database updates against a schema. |
| spin.js                | General purpose spinner that can be used for any purpose, typically to animate pages while waiting for subscriptions to become ready. |
## NPM Developer Dependencies

These NPMs are developer dependencies, particularly for dealing with JSLint in your text editor of choice (see below). 

| Package  | Description |
| --- | --- |
| babel-eslint eslint eslint-config-airbnb  eslint-import-resolver-meteor eslint-plugin-import eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-meteor eslint-plugin-react | These packages help maximize your productivity by enabling JavaScript linting support. |

