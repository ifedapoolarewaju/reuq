"use strict";

function Reuq(controller) {
  this.templates = {};
  this.controller = controller;

  //render
  this.render = function(templateName, data) {
    var processedTemplate = this._processTemplate(templateName, data);
    this._render(templateName, processedTemplate);
  }

  this._processTemplate = function(templateName, data) {
    var this_ = this;

    function compile(template, data) {
      template = template.replace(/\[\[(\w+)\]\]/g, function(){
        var expression = arguments[1];
        return data[expression] || this_.controller.fn[expression].apply(data);
      });
      return template;
    }

    var template = this.templates[templateName].html;
    var $template = $(template);

    //process iteration
    $template.find('[lib-iter]').each(function(id, el) {
      var $el = $(el);
      var listKey = $el.attr('lib-iter');
      var list = data[listKey] || [];
      list.forEach(function(listItem) {
        var $compiled = $(compile($el.prop('outerHTML'), listItem));
        $compiled.removeAttr('lib-iter');
        $el.after($compiled);
      });
      $el.remove();
    });

    //process ifs
    $template.find('[lib-if]').each(function(id, el) {
      var $el = $(el);
      var condition = $el.attr('lib-if');
      if (!data[condition]) {
        $el.remove();
      }
    })

    //process if-nots
    $template.find('[lib-if-not]').each(function(id, el) {
      var $el = $(el);
      var condition = $el.attr('lib-if-not');
      if (data[condition]) {
        $el.remove();
      }
    });

    template = $template.prop('outerHTML');
    $template = $(compile(template, data))

    //process src
    $template.find('[lib-src]').each(function(id, el) {
      var $el = $(el);
      $el.attr('src', $el.attr('lib-src'));
      $el.removeAttr('lib-src');
    })

    return $template.prop('outerHTML');
  }

  this._render = function(templateName, processedTemplate) {
    //remove previously rendered template
    $('[from-tmpl=' + templateName + ']').remove();

    var $template = $('[lib-tmpl][lib-tmpl=' + templateName + ']');
    var $newTemplate = $(processedTemplate).removeAttr('hidden').removeAttr('lib-tmpl');
    $newTemplate.attr('from-tmpl', templateName);
    $template.after($newTemplate);
    this.addEvents($newTemplate);
  }

  //renderEach
  this.renderEach = function(templateName, dataList) {
    var subTemplates = dataList.map(function(data) {
      return lib._processTemplate(templateName, data);
    });
    this._render(templateName, subTemplates.join(''));
  }

  //renderData
  //TODO automatically subscribe templates to resource changes
  this.renderData = function(templateName, data) {
    if (Array.isArray(data)) {
      this.renderEach(templateName, data);
    } else {
      this.render(templateName, data);
    }
  }

  this.cacheIsValid = function(resourceName) {
    var resource = this.controller.resources[resourceName]

    if (resource.shouldReload) {
      return false;
    } else {
      var cacheTimeout = resource.cacheTimeout || 10; //minutes
      var timeoutDate = new Date(resource.updatedAt.getTime() + cacheTimeout * 60000);
      return timeoutDate > new Date();
    }
  }

  this.invalidateResourceCache = function(resourceName) {
    this.controller.resources[resourceName].shouldReload = true;
  }

  this.getResource = function(resourceName, force, cb) {
    // coerce optional arguments to appropriate values
    if (arguments.length < 3 && typeof force === 'function') {
      cb = force;
      force = false;
    }
    var this_ = this;
    var resource = this.controller.resources[resourceName];
    if (resource.data && !force && this.cacheIsValid(resourceName)) {
      cb(resource.data);
    } else {
      var url = typeof resource.url === 'function' ? resource.url(this) : resource.url;
      $.ajax({
        url: url,
        beforeSend: function(xhr) {
          Object.keys(resource.headers || {}).forEach(function(header){
            xhr.setRequestHeader(header, resource.headers[header]);
          })
        },
        success: function(resp) {
          this_.setResource(resourceName, resp[resource.dataKey]);

          if (typeof cb === 'function') {
            cb(resource.data);
          }
        }
      })
    }
  }

  this.setResource = function(resourceName, data) {
    var resource = this.controller.resources[resourceName];
    resource.data = data;
    resource.shouldReload = false;
    resource.updatedAt = new Date();
    this.runResourceSubscribers(resourceName, data);

    $('[lib-tmpl][lib-rsrc=' + resourceName + ']:not([manual-render])').each(function(id, el) {
      window.lib.renderData($(el).attr('lib-tmpl'), data);
    });
  }

  this.runResourceSubscribers = function(resourceName, data) {
    var resource = this.controller.resources[resourceName];
    data = data || resource.data;
    this.runSubscribers(resource.subscribers, data)
  }

  this.updateResource = function(resourceName, cb) {
    var this_ = this;
    this.getResource(resourceName, function(data) {
      this_.setResource(resourceName, cb(data));
    });
  }

  this.setLocal = function(name, data) {
    var local = this.controller.locals[name];
    local.data = data;
    this.runLocalSubscribers(name, data);

    $('[lib-tmpl][lib-local=' + name + ']:not([manual-render])').each(function(id, el) {
      window.lib.renderData($(el).attr('lib-tmpl'), data);
    });
  }

  this.getLocal = function(name) {
    return this.controller.locals[name].data;
  }

  this.updateLocal = function(name, cb) {
    var data = this.getLocal(name);
    this.setLocal(name, cb(data));
  }

  this.runLocalSubscribers = function(name, data) {
    var local = this.controller.locals[name];
    data = data || local.data;
    this.runSubscribers(local.subscribers, data);
  }

  this.runSubscribers = function(subscribers, data) {
    var this_ = this;
    if (subscribers) {
      subscribers.forEach(function(subscriber) {
        var path = subscriber.split('.');
        var fn = this_.controller[path[0]][path[1]];
        fn.apply(this_, [data]);
      })
    }
  }

  //storeTemplates
  this._storeTemplates = function() {
    $('[lib-tmpl]').each(function(id, el) {
      var $el = $(el);
      lib.templates[$el.attr('lib-tmpl')] = {
        html: $el.prop('outerHTML'),
        dom: $el,
        dataKey: $el.attr('lib-data'),
        resourceName: $el.attr('lib-rsrc')
      };
    });
  }

  this.addEvents = function($dom) {
    $dom = $dom || $('body');
    var this_ = this;
    var evtSelector = '[lib-evt]:not([lib-tmpl] [lib-evt]):not([lib-tmpl][lib-evt])';
    $dom.find(evtSelector).addBack(evtSelector).each(function(id, el) {
      var $el = $(el);
      var evtConfig = $el.attr('lib-evt').split(' ')
      var evtType = evtConfig[0];
      var evtHandler = this_.controller.eventHandlers[evtConfig[1]];
      $el.on(evtType, function(e) {
        var handlerArgs = [$el].concat(evtConfig.slice(2))
        evtHandler.apply(this_, handlerArgs);
      })
    });
  }

  this.utils = {
    submit: function(form) {
      var data = form.serialize();
      var url = form.attr('action');
      var type = form.attr('method');

      $.ajax({ type: type, url: url, data: data })
        .done(function(data, status, jqXHR) {
          var cb = form.attr('lib-cb-done');
          if (cb) {
            window.lib.controller.callbacks[cb](data, status, form);
          }
        })
        .fail(function(jqXHR, status, error) {
          var cb = form.attr('lib-cb-fail');
          if (cb) {
            window.lib.controller.callbacks[cb](error, status, form, jqXHR);
          }
        });
    }
  }

  window.lib = this; //we should use bind for this instead


  this._storeTemplates();
  // submit
  $('body').on('submit', '[lib-form]:not([lib-tmpl] [lib-form]):not([lib-tmpl][lib-form])', function(e) {
    e.preventDefault();
    window.lib.utils.submit($(this))
  });

  (function(self) {
    var resources = self.controller.resources;
    var locals = self.controller.locals || {};

    Object.keys(locals).forEach(function(name) {
      self.setLocal(name, self.getLocal(name));
    });
    //load all resources set to autoload
    Object.keys(resources).forEach(function(resourceName) {
      // if autoload is not set, autoload it by default
      if (resources[resourceName]['autoload'] === undefined || resources[resourceName]['autoload']) {
        self.getResource(resourceName, true);
      }
    });

    self.addEvents();
    // should this be run 1st inetead?
    if (typeof self.controller.onInit === 'function') {
      self.controller.onInit.apply(self);
    }
  })(this);
}

$('head').append('<style type="text/css">[lib-tmpl] {display: none !important;}</style>');
window.Rq = window.Reuq = Reuq;
