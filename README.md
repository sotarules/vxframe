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
* Declarative two-way data binding to MongoDB 
* Declarative rule-based validation and formatting 
* Supports both client-side and server-side validation 
* Dynamic or deferred database updates (Save/Cancel)
* Flexible database schema (Collection2)
* Parameterized event notifications via email (Mailgun) or SMS (Twilio)
* Logging to database (both client and server)
* Multi-tenant design partitions application into tenants and domains
* User accounts supporting enrollment requests, password reset requests
* User profile including photo images stored on S3, Rackspace or other 
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
| email   | Very convenient way of sending emails (in VXFrame the basic email package is used together with Mailgun).  |
| es5-shim  | Shim and polyfills to improve ECMAScript 5 support.  |
| http | Must-have package to make HTTP calls to remote servers. Enough said.  |
| joshowens:timezone-picker  | VXFrame uses this package not for the picker but to do automatic timezone detection. |
| kadira:blaze-layout  | Layout Manager for Blaze (works well with FlowRouter).  |
| kadira:flow-router   | Carefully Designed Client Side Router for Meteor. |
| kidovate:pnotify   | Beautiful and modern desktop and in-browser notifications.  VXFrame absolutely relies on this.  |
| lepozepo:accounting  | Accounting.js -  number, money and currency formatting - fully localizable, zero dependencies. |
| less  | This is necessary because Bootstrap is the front-end of VXFrame. |
| lookback:emails | Provide the infrastructure for HTML email reports, part of the VXFrame Profile subsystem. |
| meteorhacks:picker  | Server Side Router for Meteor. |
| meteorhacks:subs-manager  | Subscriptions Manager for Meteor. Caching of subscriptions can improve performance. |
| momentjs:moment  | Absolutely must-have package, Moment.js allows you to parse, validate, manipulate, and display dates |
| mrt:jquery-ui-sortable | Reorder elements in a list or grid using the mouse, this supports VXFrame drag/drop processing. |
| mrt:moment-timezone  | Must-have package that fully supports user timezones (sister of Moment.js). |
| pcel:loading  | A beautiful loading splash screen (please-wait + spinkit bundle), VXFrame uses this package to display animation whenever the user chooses a new route (i.e., subsystem) via the off-canvas navigation fly-out.  |
| random   | Random number generator and utilities  |
| react  | Everything you need to use React with Meteor.  |
| reactive-var  | Reactive variables are very handy, particularly in Meteor/React high-level containers.  |
| sacha:spin  | Simple spinner package for Meteor. |
| static-html  | Define static page content in .html files  |
| tsega:bootstrap3-datetimepicker  | Bootstrap 3 DateTime picker.  After evaluating several comparable widgets, I chose this one. It works great and really looks Bootstrap-like.  |

## NPM Dependencies

Best practices for Meteor suggest that whenever possible you use raw NPM packages instead of Atmosphere.  This conversion is a work in progress, but here are the native NPMs used at this time. 

| Package  | Description |
| --- | --- |
| babel-runtime | The compiler for writing next generation JavaScript. |
| bcrypt | Superb library to hash passwords, used by Meteor accounts subsystem. |
| core-js |  Polyfills for ECMAScript 5, ECMAScript 6: promises, symbols and collections. |
| fibers | Support for Fibers and Futures, gives JavaScript the ability to block on the server side, making code look almost normal. Must-have for Meteor applications. |
| html-react-parser | Makes it possible to include HTML tags in dynamically-created strings and have them parsed as honest-to-god React components.  Very useful, particularly for i18n bundles that contain HTML elements for fancy formatting. |
| ladda | Allows buttons to have an operations-in-progress spinner that looks very similar to the one used in iOS.  Gives unambiguous feedback on touch devices where it can sometimes be unclear whether a button has been pressed.  VXFrame uses Ladda-style buttons across the board for consistency. |
| node-sass | Supports lookback:emails package, allowing the system to render and send HTML email reports which are initially rendered on the server side.  Very cool technology.  The report templates have CSS layout rules expressed in SASS; thus VXFrame uses both LESS (Bootstrap front end) and SASS (reports back end).  Call it job security. |
| pkgcloud | Very useful package for uploading files (typically images) to all popular cloud file buckets (e.g., Amazon S3, Rackspace Files).  The developers have made a simple API that works across-the-board, making it much easier to move a VXFrame-based system from one cloud provider to another.  This package is far superior to the original approach Knox, which works only with S3.  We had to move to PkgCloud when one of our partners migrated from AWS to Rackspace. |
| prop-types | React property types metadata, key to allowing components to declare "schemas" which clearly define their property input expections. This allows you to implement design-by-contract-style pre-conditions, incredibly helpful. I've lived without it (painfully) under Blaze, and I'm never going back. |
| react-addons-transition-group | State-of-the-art package for implementing animations on React. It took a lot of time to master this package, but now it handles VXFrame slide and cross-fade animations. Hats off to the developers, they clearly worked their butts off on this package, and I can see that this generalized approach can handle most animation requirements. |
| react-bootstrap | React component wrappers for Bootstrap widgets. Used by VXFrame to deal with overlays such as Bootstrap popovers.  |
| react-fastclick | Gets rid of annoying 350ms delay on touch devices, definitely a must-have package. |
| react-spinjs | General purpose spinner that can be used for any purpose, typically to animate pages while waiting for subscriptions to become ready. |
| redux | Predictable state container, works hand-in-glove with Meteor tracker to control local state. |
| redux-actions | Flux Standard Action utilities for Redux. |
| redux-logger | Helpful logger middleware for Redux - makes debugging easier by logging all state changes. |
| redux-thunk | Thunk middleware for Redux. |
## NPM Developer Dependencies

These NPMs are developer dependencies, particularly for dealing with JSLint in your text editor of choice (see below). 

| Package  | Description |
| --- | --- |
| babel-eslint eslint eslint-config-airbnb  eslint-import-resolver-meteor eslint-plugin-import eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-meteor eslint-plugin-react | These packages help maximize your productivity by enabling JavaScript linting support. I use Sublime Text 3 which has plug-ins that work with these packages to give you the supreme experience, including syntax highlighting, syntax error recognition and missing variable flagging. If you don't have this you're really missing out. It is tricky to get set up, but worth it. |

## Sublime Text 3 Plug-ins

If you're going to work with VMFrame, I strongly recommend you use Sublime Text 3. Coming from the Java community, I was a fan of Eclipse for years, but Sublime Text 3 is far superior, particularly if you take the time to get the JSLint plug-ins working. It has increased my productivity quite a bit.

| Plug-in  | Description |
| --- | --- |
| Babel | Syntax definitions for ES6 JavaScript with React JSX extensions |
| ClearConsole | A hacky way to clear the console in Sublime |
| JavaScriptNext | ES6 Syntax (no further description provided) |
| JsPrettier | JsPrettier is a Sublime Text Plug-in for Prettier, the opinionated code formatter |
| LESS | LESS Syntax highlighting for Sublime Text |
| Oceanic Next Color Scheme | Best color scheme I've found for JavaScript development |
| SublimeGit | GIT integration for Sublime Text 3 |
| SublimeLinter | The code linting framework for Sublime Text 3 |
| SublimeLinter-eslint | The inter plugin for SublimeLinter that provides an interface to ESLint |
| Whitespace | Remove Trailing Whitespace for Sublime Text |

