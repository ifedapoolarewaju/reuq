"use strict";

function Reuq(app) {
  var rq = this;
  this.templates = {};
  this.app = app;
  this.app.resources = app.resources || {};
  this.app.locals = app.locals || {};
  this.utils = this.getUtils();

  this._storeTemplates();
  // submit
  $('body').on('submit', '[rq-form]:not([rq-tmpl] [rq-form]):not([rq-tmpl][rq-form])', function(e) {
    e.preventDefault();
    rq.utils.submit($(this))
  });

  (function(rq) {
    var resources = rq.app.resources;
    var locals = rq.app.locals || {};

    Object.keys(locals).forEach(function(name) {
      var data = rq.getLocal(name);
      if (typeof data !== 'undefined') {
        rq.setLocal(name, data);
      }
    });
    //load all resources set to autoload
    Object.keys(resources).forEach(function(resourceName) {
      // if autoload is not set, autoload it by default
      if (typeof resources[resourceName].autoload === 'undefined' || resources[resourceName].autoload) {
        rq.getResource(resourceName, true);
        rq.setResource(resourceName, null, true);
      }
    });

    // should this be run 1st inetead?
    if (typeof rq.app.onInit === 'function') {
      rq.app.onInit.apply(rq);
    }
    rq.addEvents(null, true);
  })(this);
}

//render
Reuq.prototype.render = function(templateName, data) {
  var processedTemplate = this._processTemplate(templateName, data);
  this._render(templateName, processedTemplate);
}

Reuq.prototype._processTemplate = function(templateName, data) {
  var rq = this;

  function sanitize(value) {
    var blacklist = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return value.replace(/[&<>"']/g, function(m) {
      return blacklist[m];
    })
  }

  function isDynamicProperty(property) {
    return property[0] === "@";
  }

  function getDynamicPropertyValue(property, data) {
    // remove '@' character
    var expression = property.slice(1)
    return rq.app.dynamicProperties[expression].apply(rq, [data]);
  }

  function getPropertyValue(property, data){
    if (isDynamicProperty(property)) {
      return getDynamicPropertyValue(property, data)
    } else {
      var propertyTree = property.split('.');

      return propertyTree.reduce(function(accumulator, current){
        return accumulator[current]
      }, data);
    }
  }

  function compile(template, data) {
    var $template = $(template)

    //process ifs
    $template.find('[rq-if]').each(function(id, el) {
      var $el = $(el);
      var condition = $el.attr('rq-if');
      $el.removeAttr('rq-if');

      if (!getPropertyValue(condition, data)) {
        $el.remove();
      }
    })

    //process if-nots
    $template.find('[rq-if-not]').each(function(id, el) {
      var $el = $(el);
      var condition = $el.attr('rq-if-not');
      $el.removeAttr('rq-if-not');

      if (getPropertyValue(condition, data)) {
        $el.remove();
      }
    });

    template = $template.prop('outerHTML');

    template = template.replace(/\[\[(\w+(\.\w+)*|@\w+)\]\]/g, function() {
      var expression = arguments[1];
      // parse value to string
      var value = "" + (getPropertyValue(expression, data));
      return sanitize(value);
    });
    return template;
  }

  var templateObj = this.templates[templateName];
  var resourceName = templateObj.resourceName;
  var template = templateObj.html;
  var $template = $(template);

  // process rq-rsrc-loading
  if (resourceName && this.app.resources[resourceName].loading) {
    $template.not('[rq-rsrc-loading], [rq-rsrc-loading] *').remove();
  } else {
    $template.find('[rq-rsrc-loading], [rq-rsrc-loading] *').remove();
  }

  //process iteration
  $template.find('[rq-iter], [rq-iter-self]').each(function(id, el) {
    var $el = $(el);

    if ($el.is("[rq-iter]")) {
      var listKey = $el.attr('rq-iter');
      var list = data[listKey] || [];
    } else {
      // then it's rq-iter-self
      var list = data || [];
    }
    list.forEach(function(listItem) {
      var $compiled = $(compile($el.prop('outerHTML'), listItem));
      $compiled.removeAttr('rq-iter');
      $el.after($compiled);
    });
    $el.remove();
  });

  template = $template.prop('outerHTML');
  $template = $(compile(template, data))

  //process src
  $template.find('[rq-src]').each(function(id, el) {
    var $el = $(el);
    $el.attr('src', $el.attr('rq-src'));
    $el.removeAttr('rq-src');
  })

  return $template.prop('outerHTML');
}

Reuq.prototype._render = function(templateName, processedTemplate) {
  //remove previously rendered template
  $('[from-tmpl=' + templateName + ']').remove();

  var $template = $('[rq-tmpl][rq-tmpl=' + templateName + ']');
  var $newTemplate = $(processedTemplate).removeAttr('hidden').removeAttr('rq-tmpl');
  $newTemplate.attr('from-tmpl', templateName);
  $template.after($newTemplate);
  this.addEvents($newTemplate);
}

Reuq.prototype.cacheIsValid = function(resourceName) {
  var resource = this.app.resources[resourceName]

  if (resource.shouldReload) {
    return false;
  } else {
    var cacheTimeout = resource.cacheTimeout || 10; //minutes
    var timeoutDate = new Date(resource.updatedAt.getTime() + cacheTimeout * 60000);
    return timeoutDate > new Date();
  }
}

Reuq.prototype.invalidateResourceCache = function(resourceName) {
  this.app.resources[resourceName].shouldReload = true;
}

Reuq.prototype.getResource = function(resourceName, force, cb) {
  // coerce optional arguments to appropriate values
  if (arguments.length < 3 && typeof force === 'function') {
    cb = force;
    force = false;
  }
  var rq = this;
  var resource = this.app.resources[resourceName];
  if (resource.data && !force && this.cacheIsValid(resourceName)) {
    cb.apply(this, [resource.data]);
  } else {
    resource.loading = true;

    var url = typeof resource.url === 'function' ? resource.url(this) : resource.url;
    $.ajax({
      url: url,
      dataType: "json",
      beforeSend: function(xhr) {
        Object.keys(resource.headers || {}).forEach(function(header) {
          xhr.setRequestHeader(header, resource.headers[header]);
        })
      },
      success: function(resp) {
        resource.loading = false;
        resource.loaded = true;

        rq.setResource(resourceName, resource.dataKey ? resp[resource.dataKey] : resp);

        if (typeof cb === 'function') {
          cb.apply(rq, [resource.data]);
        }
      }
    })
  }
}

Reuq.prototype.setResource = function(resourceName, data, withoutSubscribers) {
  var rq = this;
  var resource = this.app.resources[resourceName];
  resource.data = data;
  resource.shouldReload = false;
  resource.updatedAt = new Date();

  if (!withoutSubscribers) {
    this.runResourceSubscribers(resourceName, data);
  }

  $('[rq-tmpl][rq-rsrc=' + resourceName + ']:not([manual-render])').each(function(id, el) {
    rq.render($(el).attr('rq-tmpl'), data);
  });
}

Reuq.prototype.runResourceSubscribers = function(resourceName, data) {
  var resource = this.app.resources[resourceName];
  data = data || resource.data;
  this.runSubscribers(resource.subscribers, data, resourceName, 'resource')
}

Reuq.prototype.updateResource = function(resourceName, cb) {
  this.getResource(resourceName, function(data) {
    this.setResource(resourceName, cb.apply(this, [data]));
  });
}

Reuq.prototype.setLocal = function(name, data) {
  var rq = this;
  // add fallback in case it's a newly dynamically set local
  var local = this.app.locals[name] = this.app.locals[name] || {};
  local.data = data;
  this.runLocalSubscribers(name, data);

  $('[rq-tmpl][rq-local=' + name + ']:not([manual-render])').each(function(id, el) {
    rq.render($(el).attr('rq-tmpl'), data);
  });
}

Reuq.prototype.getLocal = function(name) {
  return this.app.locals[name].data;
}

Reuq.prototype.updateLocal = function(name, cb) {
  var data = this.getLocal(name);
  this.setLocal(name, cb.apply(this, [data]));
}

Reuq.prototype.runLocalSubscribers = function(name, data) {
  var local = this.app.locals[name];
  data = data || local.data;
  this.runSubscribers(local.subscribers, data, name, 'local');
}

Reuq.prototype.runSubscribers = function(subscribers, data, source, type) {
  var rq = this;
  if (subscribers) {
    subscribers.forEach(function(subscriber) {
      var fn = rq.app.subscribers[subscriber];
      fn.apply(rq, [data, source, type]);
    })
  }
}

//storeTemplates
Reuq.prototype._storeTemplates = function() {
  var rq = this;
  $('[rq-tmpl]').each(function(id, el) {
    var $el = $(el);
    rq.templates[$el.attr('rq-tmpl')] = {
      html: $el.prop('outerHTML'),
      dom: $el,
      localDataName: $el.attr('rq-local'),
      resourceName: $el.attr('rq-rsrc')
    };
  });
}

Reuq.prototype.addEvents = function($dom, excludeTemplates) {
  $dom = $dom || $('body');
  var rq = this;
  var evtSelector = '[rq-evt]:not([rq-tmpl] [rq-evt]):not([rq-tmpl][rq-evt])';
  if (excludeTemplates) {
    evtSelector += ':not([from-tmpl] [rq-evt]):not([from-tmpl][rq-evt])'
  }

  $dom.find(evtSelector).addBack(evtSelector).each(function(id, el) {
    var $el = $(el);
    var evtConfig = $el.attr('rq-evt').split(' ')
    var evtType = evtConfig[0];
    var evtHandler = rq.app.eventHandlers[evtConfig[1]];
    $el.on(evtType, function(e) {
      var handlerArgs = [{event: e, target: $el}].concat(evtConfig.slice(2))
      evtHandler.apply(rq, handlerArgs);
    })
  });
}

Reuq.prototype.getUtils = function() {
  var rq = this;

  return {
    submit: function(form) {
      var data = form.serialize();
      var url = form.attr('action');
      var type = form.attr('method');

      var beforeSend = function(xhr) {
        var headersKey = form.attr('rq-form-headers');
        if (headersKey) {
          var headers = rq.app.fn[headersKey].apply(rq);
          Object.keys(headers || {}).forEach(function(header) {
            xhr.setRequestHeader(header, headers[header]);
          })
        }
      }

      $.ajax({ type: type, url: url, data: data, beforeSend: beforeSend })
        .done(function(data, status, jqXHR) {
          var cb = form.attr('rq-cb-done');
          if (cb) {
            rq.app.callbacks[cb].apply(rq, [data, status, form]);
          }
        })
        .fail(function(jqXHR, status, error) {
          var cb = form.attr('rq-cb-fail');
          if (cb) {
            rq.app.callbacks[cb](error, status, form, jqXHR);
          }
        });
    }
  }
}

$('head').append('<style type="text/css">[rq-tmpl] {display: none !important;}</style>');
window.Rq = window.Reuq = Reuq;
