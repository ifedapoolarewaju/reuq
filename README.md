# Reuq.js
Frontend Javascript framework

Reuq is a frontend Javascript framework built on top of JQuery.

In a world of frontend Javascript where more contemporary/component based frameworks are favonured, some set of
developers still prefer to stick with the old jquery style in order to avoid the complexities and difficulties
of learning a new "not so" JQuery friendly framework.

Reuq.js is for this niche of people but lets them do things more dilligently by taking a lot of responsibilities away
and making you write less DOM manipulation code while you still stick to JQuery, your first love.

## Prerequisites
Requires JQuery

## 1. Getting Started

#### Installation
`npm install reuq` or `bower install reuq`

or load from cdn `CDN URL HERE`

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

**THE MAGIC IS**

by doing this, when the page loads, reuq automatically loads the resource
from the url specified and renders it to the DOM via the template it is tied to.

Load the Page from your browser and watch the Magic happen.

See ADD_DOC_URL_HERE for more on templates.

That's it!!! You are already using reuq, writing less DOM manipulation code. Please view the full doc ADD_DOC_URL_HERE to
see more Magical things that Reuq is capable of.

## 2. The App Object

When instantiating Reuq, it takes in an object as an argument, this object represents your application and is added as an attribute
`app` to the `reuq` instance.

```javascript
var app = {
  ...
}

var reuqInstance = new Reuq(app)

// to access app from reuqInstance
reuqInstance.app
```

This Object should contain all the information you need to pass along to `Reuq` for operation.

The following are the Options that you can pass to the `app` Object before instantiating `Reuq`.

**resources**
This is an Object telling Reuq what external resources (API endpoints) you want to retrieve data from.
Here's an example:

```javascript
{
  ...
  resources: {
    people: {
      url: "http://myap.com/people/"
      ...
    }
    cars: {
     url: "http://myap.com/people/"
    }
  }
}
```

Each resource can contain the following properties:

- `url`: url to the resource. This can be full url or relative.
- `dataKey`: The response object property to access the resource data from. If not set, the entire json response
  object would be stored as the data
- `headers`: Headers to add to every request made to the endpoint. e.g

```javascript
...
headers: {
  Authorization: 'bearer AUTH_KEY_HERE'
}
```

**locals**

This is an object within you can store local data that isn't to an external API url. Here's an example stored local data.

```javascript
{
  ...
  locals: {
    person: {
      name: "Ifedapo Olarewaju"
    },
    cars: ["Lambo", "Mercedes"]
  }
  ...
}
```

To set a local data dynamically you can use the reuq instance of your app like so.

```javascript
app = {
  ...
}

var rq = new Reuq(app);

rq.setLocal("person", {name: "Ifedapo Olarewaju"})
rq.setLocal("cars", ["Lambo", "Mercedes"])
```

This would also automatically render Templates tied to such local data.

To get local data you do:

```javascript
var person = rq.getLocal("person")
```

**dynamicProperties**

Because within a Reuq Template you cannot pass expressions like `[[age * 2]]`, you can only access
properties of the data to which the template is tied.

But sometimes we want to do some formatting or calculation with the data property before we render it. This can
be done with `dynamicProperties`. Here's an example:

```javascript
{
  ...
  dynamicProperties: {
    fullName: function(data) {
      return data.firstName + " " + data.lastName
    }
  }
  ...
  locals: {
    person: {
      firstName: "Ifedapo",
      lastName: "Olarewaju"
    }
  }
}
```

```html
  <div rq-tmpl="personTmpl" rq-local="person">
    <!-- would dislplay "Ifedapo" -->
    <p>[[firstName]]</p>

    <!--  would display "Ifedapo Olarewaju" -->
    <p>[[fullName]]</p>
  </div>
```

**eventHandlers**

In a situation where you are making use of Reuq Templates and you need to add event handlers to elements on the template.
You can easily do this with Reuq events see `ADD_DOC_URL_HERE`. Here's an example

```html
<div rq-tmpl="templateName">
  ...
  <button rq-evt="click showMessage">Show Message</button>
</div>
```

```javascript
{
  ...
  eventHandlers: {
    function(evt) {
      alert("Here's your Message")
    }
  }
}
```

Where `evt` is an object with 2 attributes

- `event`: An instance of jquery event Object.
- `target`: A jquery instance of the target element

<!-- **fn** -->

<!-- **callbacks** -->

## 3. Reuq Templates

With Reuq Templates you can tie data from your javascript to your DOM. This helps you automatically update your
DOM as the data changes. To add a Reuq Template to your html, just add the attribute `rq-tmpl` to the element you
want to tag as a template. e.g

```html
<div rq-tmpl="MyTemplateName">
  ...
</div>
```

To tie a template to javascript data you can do one of the following

- Tie it to a `resource` by adding the `rq-rsrc` attribute. e.g

```html
<div rq-tmpl="MyTemplateName" rq-rsrc="myResource">
  ...
</div>
```

this would automatically tie to resource named `myResource` which you may have declared in your Reuq app object like so.

```javascript
var app = {
  ...
  resources: {
    myResource: {
      url: '/endpoint/'
      ...
    }
  }
}

new Reuq(app);
```

- Tie it to `local` data by adding the `rq-local` attribute. e.g


```html
<div rq-tmpl="MyTemplateName" rq-local="pserson">
  ...
</div>
```

this would automatically tie to local named `pserson` which you may have declared in your Reuq app object like so.

```javascript
var app = {
  ...
  locals: {
    pserson: {
      firstName: "Ifedapo"
      ...
    }
  }
}

new Reuq(app);
```


To access properties of an object data in a template, you surround it with double square brackets.

```html
<div rq-tmpl="MyTemplateName" rq-rsrc="person">
  <p>[[firstName]]</p>
  <p>[[lastName]]</p>
  <p>[[age]]</p>
</div>
```

The Reuq Template comes with the following useful attributes

**rq-iter**

**rq-iter-self**

**rq-rsrc-loading**

**rq-if**

an element with this attribute would be rendered if the data property assigned to the attribute has a truthy value.
e.g:

```javascript
{
  ...
  locals: {
    person: {
      name: "Jane",
      male: false
    }
  }
}
```

```html
<div rq-tmpl="template" rq-local="person">
  ...
  <span rq-if="male">He is a boy</span>
</div>
```

The `span` will not render because in the `javascript` object the `male` property is `false`.

**rq-if-not**

an element with this attribute would be rendered if the data property assigned to the attribute has a falsy value.
e.g:

```javascript
{
  ...
  locals: {
    person: {
      name: "Jane",
      male: false
    }
  }
}
```

```html
<div rq-tmpl="template" rq-local="person">
  ...
  <span rq-if-not="male">She is a girl</span>
</div>
```

The `span` will render because in the `javascript` object the `male` property is `false`.

**rq-src**

**manual-render**

## 4. Working with resources

## 5. Working with locals
