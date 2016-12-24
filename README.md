# reuq
Frontend Javascript framework

Reuq is a frontend Javascript framework built on top of JQuery.

In a world of frontend Javascript where more contemporary/component based frameworks are favonured, some set of
developers still prefer to stick with the old jquery style in order to avoid the complexities and difficulties
of learning a new "not so" JQuery friendly framework.

Reuq.js is for this niche of people but lets them do things more dilligently by taking a lot of responsibilities away
and making you write less DOM manipulation code while you still stick to JQuery, your first love.

## Prerequisites
Requires JQuery

## Getting Started

#### Installation
`npm install reuq`

or

`bower install reuq`

or load from cdn

`CDN URL HERE`

#### Load Reuq
Create a file `index.html`
On our html file we'll need to load `reuq.js` and its dependencies

*index.html*
```html
<html>
  <head>
    ...
  </head>
  <body>
    ...
  </body>
  <script type="text/javascript" src="PATH_TO_JQUERY/jquery.min.js" charset="utf-8"></script>
  <script type="text/javascript" src="PATH_TO_REUQ/reuq.min.js" charset="utf-8"></script>
  ...
</html>
```

#### Initiating Reuq
Download the json file from ADD VIDEOS URLS HERE and save it to `resources/videos.json` relative
to the project directory.

Create a javascript file `app.js`

load it on your `index.html`

*index.html*
```html
  ...
  <script type="text/javascript" src="PATH_TO_JQUERY/jquery-1.11.1.js" charset="utf-8"></script>
  <script type="text/javascript" src="PATH_TO_REUQ/reuq.min.js" charset="utf-8"></script>
  ...
  <script type="text/javascript" src="PATH_TO_JS/app.js"></script>
</html>
```

To initiate the application with Reuq you do:
`new Reuq(app)` where `app` is an object containing everything Reuq needs to operate
see ADD DOC LINK HERE

In your  `app.js` add the following code

```javascript
var app = {
  resources: {
    videos: {
      url:"resources/videos.json",
      dataKey: "data"
    }
  }
}

$(function() {
  new Reuq(app);
})
```

The `resources` key in line ADD_LINE_NUMBER_HERE makes `reuq` know what API resource endpoints your app
will be working with. In this case we load a json file instead because we don't have an API to make calls to.
But this could as well be a full url like "http://myapi.com/endpoint/" or a relative one like "/endpoint/"

on line ADD_LINE_NUMBER_HERE `videos` is the name of the particular resource. You can name it anything you like

on line ADD_LINE_NUMBER_HERE `dataKey` is the JSON object key to access the resource data from. Notice that in `videos.json`
the array of videos is stored under the attribute `data`. To inform Reuq of what key to access data of a resource you add `dataKey`
see ADD_DOC_URL_HERE for more.

#### Loading resources to DOM with Reuq Templates

Make `index.html` to become this

```html
  ...
  <body>
    <ul rq-tmpl='videosList' rq-rsrc='videos'>
      <span rq-rsrc-loading> loading ... </span>
      <li rq-iter-self>
        =================================
        <p title="[[name]]">Name: [[name]]</p>
        <p title="[[uri]]">URL: [[uri]]</p>
        <p title="[[uri]]">Length: [[duration]]</p>
      </li>
    </ul>
  </body>
  ...
```
`rq-tmpl='videosList'` tells reuq the name of them template. All templates on a DOM must have unique names.
`rq-rsrc='videos'` tells reuq what resource this template is tied to. In this case we are tying it to the `videos`
resource we declared in our `app.js`.

**THE MAGIC IS** by doing this, when the page loads, reuq automatically loads the resource
from the url specified and renders it to the DOM via the template it is tied to.

Load the Page from your browser and watch the Magic happen.

See ADD_DOC_URL_HERE for more on templates.

That's it!!! You are already using reuq, writing less DOM manipulation code. Please view the full doc ADD_DOC_URL_HERE to
see more Magical things that Reuq is capable of.
