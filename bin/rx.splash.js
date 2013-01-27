// Generated by CoffeeScript 1.4.0
(function() {
  var noDispose, noop, sx;

  sx = window.sx = {
    utils: {},
    internal: {},
    binders: {}
  };

  noDispose = {
    dispose: function() {}
  };

  noop = function() {};

  sx.utils.bind = function(obsOrValue, callback) {
    if (obsOrValue.subscribe) {
      return obsOrValue.subscribe(callback);
    }
    return callback(obsOrValue);
  };

  sx.utils.unwrap = function(valueOrBehavior) {
    if (valueOrBehavior.value && valueOrBehavior.subscribe) {
      return valueOrBehavior.value;
    }
    return valueOrBehavior;
  };

  sx.utils.wrap = function(valueOrBehavior) {
    if (valueOrBehavior.value && valueOrBehavior.subscribe) {
      return valueOrBehavior;
    }
    return new Rx.BehaviorSubject(valueOrBehavior);
  };

  sx.bind = function(vm, target) {
    target = $(target || window.document.body);
    return sx.internal.bind(target, {
      vm: vm,
      vmRoot: vm,
      vmParent: void 0
    });
  };

  sx.internal.bind = function(target, context) {
    var bindings;
    bindings = sx.internal.parseBindings(context);
    return context.target.children().each(function() {
      return sx.internal.bind($(this), context);
    });
  };

  sx.internal.parseBindings = function(context) {
    var binding, key, keys, value, values, _ref;
    binding = context.target.attr('data-splash');
    if (!binding) {
      return null;
    }
    keys = ['$data', '$root', '$parent'];
    values = [context.vm, context.vmRoot, context.vmParent];
    _ref = context.vm;
    for (key in _ref) {
      value = _ref[key];
      keys.push(key);
      values.push(value);
    }
    return new Function(keys, "return { " + binding + " };").apply(null, values);
  };

  sx.binders.click = function(target, context, options) {
    return sx.binders.event(target, context, options, 'click');
  };

  sx.binders.css = function(target, context, options) {
    var css, disposable, obsOrValue, _i, _len;
    disposable = new Rx.CompositeDisposeable;
    for (obsOrValue = _i = 0, _len = options.length; _i < _len; obsOrValue = ++_i) {
      css = options[obsOrValue];
      disposable.add(sx.utils.bind(obsOrValue, function(x) {
        target.css(css, x);
      }));
    }
    return disposable;
  };

  sx.binders.event = function(target, context, options, type) {
    var obs;
    if (type == null) {
      type = options.type;
    }
    obs = $(target).onAsObservable(type);
    if (typeof options === 'function') {
      return obs.subscribe(function(e) {
        options({
          context: context,
          e: e
        });
      });
    }
    return obs.subscribe(function(e) {
      options.onNext({
        context: context,
        e: e
      });
    });
  };

  sx.binders.foreach = function(target, context, obsArray) {
    var template;
    template = target.html().trim();
    context.target.empty();
    return obsArray.delay(0).subscribe(function(lifetime) {
      var binding, child, dispose;
      child = $(template).appendTo(target);
      binding = sx.internal.bind({
        vm: lifetime.value,
        vmRoot: context.vmRoot,
        vmParent: context.vm,
        target: child
      });
      dispose = function() {
        child.remove();
        return binding.dispose();
      };
      lifetime.subscribe(noop, dispose, dispose);
    });
  };

  sx.binders.html = function(target, context, obsOrValue) {
    return sx.utils.bind(obsOrValue, function(x) {
      target.html(x);
    });
  };

  sx.binders.text = function(target, context, obsOrValue) {
    return sx.utils.bind(obsOrValue, function(x) {
      target.text(x);
    });
  };

  sx.binders.value = function(target, context, obsOrValue) {
    var blur, focus, get, set;
    if (obsOrValue.subscribe) {
      focus = target.onAsObservable('focus');
      blur = target.onAsObservable('blur');
      obsOrValue = obsOrValue.takeUntil(blur).concat(blur.take(1)).repeat();
    }
    set = sx.utils.bind(obsOrValue, function(x) {
      target.val(x);
    });
    if (obsOrValue.onNext) {
      get = target.onAsObservable('change').subscribe(function(x) {
        obsOrValue.onNext(target.val());
      });
    }
    return new Rx.CompositeDisposable(get, set);
  };

}).call(this);
