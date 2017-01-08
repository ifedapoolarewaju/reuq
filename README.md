# Reuq.js
Frontend Javascript framework

Reuq is a frontend Javascript framework built on top of JQuery.

Reuq.js is for this niche of people prefer to stick with the old jquery style in order to avoid the complexities and difficulties
of learning a new "not so" JQuery friendly framework. However, Reuq lets you do things more dilligently by taking a lot of responsibilities away from you and making you write less DOM manipulation code while you still stick to JQuery, your first love.

## Prerequisites
Requires JQuery

## 1. Getting Started

#### i. Installation

```sh
$ npm install reuq
```

#### ii. Load Reuq
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
  <script type="text/javascript" src="PATH_TO_REUQ/dist/reuq.min.js" charset="utf-8"></script>
  ...
</html>
```

#### iii. Initiating Reuq
Download the json file from [here](https://raw.githubusercontent.com/ifedapoolarewaju/reuq/master/examples/store/resources/videos.json)
and save it to `resources/videos.json` relative to the project directory.

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
[see](https://github.com/ifedapoolarewaju/reuq#2-the-app-object)

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

The `resources` key makes `reuq` know what API resource endpoints your app will be working with.
In this case we load a json file instead because we don't have an API to make calls to.
But this could as well be a full url like `http://myapi.com/endpoint/` or a relative one like `/endpoint/`

`videos` is the name of the particular resource. You can name it anything you like.

`dataKey` is the JSON object key to access the resource data from. Notice that in `videos.json`
the array of videos is stored under the attribute `data`. To inform Reuq of what key to access data of a resource you add `dataKey`
[see](https://github.com/ifedapoolarewaju/reuq#i-resources).

#### iv. Loading resources to DOM with Reuq Templates

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
[See](https://github.com/ifedapoolarewaju/reuq#3-reuq-templates) for more on templates.

That's it! You are already using reuq, writing less DOM manipulation code. Please read on to see more Magical things that
Reuq is capable of.

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

#### i. resources
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

#### ii. locals

This is an object within you can store local data that isn't to an external API url. Here's an example stored local data.

```javascript
{
  ...
  locals: {
    person: {
      data: {
        name: "Ifedapo Olarewaju"
      }
    },
    cars: {
      data: ["Lambo", "Mercedes"]
    }
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

To update local data you do:

```javascript
rq.updateLocal("person", function(data){
  data.firstName = "John"
  // you must return the newly updated data
  return data
})
```

#### iii. dynamicProperties

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
      data: {
        firstName: "Ifedapo",
        lastName: "Olarewaju"
      }
    }
  }
}
```

```html
  <div rq-tmpl="personTmpl" rq-local="person">
    <!-- would dislplay "Ifedapo" -->
    <p>[[firstName]]</p>

    <!--  would display "Ifedapo Olarewaju" -->
    <p>[[@fullName]]</p>
  </div>
```

The dynamic property is identified by prepending it with a `@` symbol.

#### iv. eventHandlers

In a situation where you are making use of Reuq Templates and you need to add event handlers to elements on the template.
You can easily do this with Reuq events. Here's an example

```html
<div rq-tmpl="templateName">
  ...
  <button rq-evt="click showMessage Ifedapo 18">Show Message</button>
</div>
```

the `rq-evt` takes space separated arguments of the following order:

- event type: In our example it is a `click` event.
- function name: This is the name of the function to call. This is searched from the `eventHandlers` property
of the reuq `app` object(see javascript code below).
- [arguments]: This is an infinite but optional set of arguments(separated by space) to pass along to the event handler
function when called. In our example we passed `Ifedapo` and `18`, please view the javascript code below to see how this is passed
to the handler.

```javascript
{
  ...
  eventHandlers: {
    showMessage: function(evt, name, age) {
      alert("Your name is " + name + " and you are " + age + " years old")
    }
  }
}
```

Where `evt` is an object with 2 attributes

- `event`: An instance of jquery event Object.
- `target`: A jquery instance of the target element

And `name` and `age` are the arguments `Ifedapo` and `18` respectively.

*Note: As of now, passing arguments do not allow you to pass arguments with a value containing a space character itself e.g you can't pass `Ifedapo Olarewaju` as a single argument. It would be separated to 2 argument.*

#### v. subscribers

Sometimes you want a function or a set of functions to always run whenever your data(locals or resources) is updated. You can do this
by adding `subscriber` functions to your `app object` and then attaching the subscribers list to the data object. Here's an example.

```javascript
{
  ...
  subscribers: {
    showCount: function(updatedData) {
      $('.count').text("(" + updatedData.length + ")")
    }
    ...
  }
  ...
  locals: {
    people: {
      data: [
        { firstName: "Ifedapo", lastName: "Olarewaju", male: true, age: 14 },
        { firstName: "Mike", lastName: "Raymond", male: false, age: 23 },
      ],
      subscribers: ['showCount']
    }
  }
}
```

because `['showCount']` is added to `people` `subscribers` list, whenever `rq.setLocal('people', ...)` or
`rq.updateLocal('people', ...)` is called, the subscriber `showCount` is executed with the newly updated data passed as an argument.

Please see this [example project](https://github.com/ifedapoolarewaju/reuq/tree/master/examples/people) for a working implementation.

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
      data: {
        firstName: "Ifedapo"
        ...
      }
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

#### i. rq-iter

This attribute is used to iterate over array properties of data. e.g

```javascript
{
  ...
  person: {
    data: {
      firstName: "Ifedapo"
      phoneNumbers: [{number: "009123455667"}, {number: "008123445678"}]
      ...
    }
  }
}
```

```html
<div rq-tmpl="template" rq-local="person">
  ...
  <ul>
    <!-- would display li for  "009123455667" and "008123445678" -->
    <li rq-iter="phoneNumbers">
      [[number]]
    </li>
  </ul>
</div>
```

as of now, each element in the iterated array is expected to be an object whose attributes would be accessed.

*TODO: make an array with other type elements e.g [1, 2, 4] compatible with req-iter*


#### ii. rq-iter-self
This is the same as `req-iter` but instead of iterating one of the object data properties, it iterates the object itself.
This is useful for when the data tied to the template is an array.
e.g

 ```javascript
{
  ...
  cars: {
    data: [{name: "Lambo"}, {name: "Mercedes"}, {name: "volvo"}]
  }
  ...
  }
}
```

```html
<div rq-tmpl="template" rq-local="cars">
  ...
  <ul>
    <!-- would display li for  "Lambo" and "Mercedes" and "volvo" -->
    <li rq-iter-self>
      [[name]]
    </li>
  </ul>
</div>
```

#### iii. rq-rsrc-loading

While Reuq is fetching a resource from an endpoint, you might want to display a message or an image(e.g loading gif) to
users as interactive feedback. With reuq templates, any element with the attribute `rq-rsrc-loading` will only display
while the resource it is tied to is loading. *Note that this only works with `resources` and it doesn't work with `local data`*

e.g

```html
<div rq-tmpl="templateName" rq-rsrc="resourceName">
  ...
  <!-- will only display while resource is loading -->
  <span rq-rsrc-loading>Loading ...</span>
</div>
```

#### iv. rq-if

an element with this attribute would be rendered if the data property assigned to the attribute has a truthy value.
e.g:

```javascript
{
  ...
  locals: {
    person: {
      data: {
        name: "Jane",
        male: false
      }
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

#### v. rq-if-not

an element with this attribute would be rendered if the data property assigned to the attribute has a falsy value.
e.g:

```javascript
{
  ...
  locals: {
    person: {
      data: {
        name: "Jane",
        male: false
      }
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

#### vi. rq-src

When using elements that have attribute `src` with  reuq Templates, it is advisable to use `rq-src` instead
so the url doesn't unneccessarily load until the template is being rendered.

#### vii. manual-render

On loading of the web page, by default reuq fetches all resources and renders all templates tied with resources and local data
that are available.

If you don't want the template to render automatically

## 4. Working with resources

With the Reuq instance there are a couple of things you can do with a resource.

```javascript
reuqInstance.getResource("person", function(data){
  console.log(data.firstName)
})
```

```javascript
reuqInstance.getResource("person", true, function(data){
  console.log(data.firstName)
})
```

```javascript
reuqInstance.updateResource("person", function(data){
  data.firstName = "John"
  return data
})
```

## 6. Accessing the Reuq instance

For every function within attributes(i.e `dynamicProperties`, `subscribers`, `eventHandlers` etc) of the reuq `app` object,
the reuq instance is passed as context. Hence can be accessed through `this` withing each function. e.g

```javascript
{
  ...
  dynamicProperties: {
    fullName: function(data) {
      console.log(this) // logs the reuq instance
      var people = this.getLocal('people')
      ...
    }
  }
  ...
  subscribers: {
    showCount: function(updatedData) {
      console.log(this) // logs the reuq instance
      var people = this.getLocal('people')
      ...
    }
  }
  ...
  eventHandlers: {
    showMessage: function(evt, name, age) {
      console.log(this) // logs the reuq instance
      var people = this.getLocal('people')
      ...
    }
  }
}
```


## License

[The MIT License](LICENSE).
