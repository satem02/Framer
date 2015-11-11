// Generated by CoffeeScript 1.9.1
(function() {
  var EventMappers, Events, Layer, Utils, _, wrapComponent,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require("../Underscore")._;

  Utils = require("../Utils");

  Layer = require("../Layer").Layer;

  Events = require("../Events").Events;

  "ScrollComponent\n\ncontent <Layer>\ncontentSize <{width:n, height:n}>\ncontentInset <{top:n, right:n, bottom:n, left:n}> TODO\ncontentOffset <{x:n, y:n}> TODO\nscrollFrame <{x:n, y:n, width:n, height:n}>\nscrollPoint <{x:n, y:n}>\nscrollHorizontal <bool>\nscrollVertical <bool>\nspeedX <number>\nspeedY <number>\ndelaysContentTouches <bool> TODO\nloadPreset(<\"ios\"|\"android\">) TODO\nscrollToPoint(<{x:n, y:n}>, animate=true, animationOptions={})\nscrollToLayer(contentLayer, originX=0, originY=0)\nscrollFrameForContentLayer(<x:n, y:n>) <{x:n, y:n, width:n, height:n}> TODO\nclosestContentLayer(<x:n, y:n>) <Layer> TODO\n\nScrollComponent Events\n\n(all of the draggable events)\nScrollStart -> DragStart\nScrollWillMove -> DragWillMove\nScrollDidMove -> DragDidMove\nscroll -> DragMove (html compat)\nScrollEnd -> DragEnd";

  Events.ScrollStart = "scrollstart";

  Events.Scroll = "scroll";

  Events.ScrollMove = Events.Scroll;

  Events.ScrollEnd = "scrollend";

  Events.ScrollAnimationDidStart = "scrollanimationdidstart";

  Events.ScrollAnimationDidEnd = "scrollanimationdidend";

  EventMappers = {};

  EventMappers[Events.Move] = Events.Move;

  EventMappers[Events.ScrollStart] = Events.DragStart;

  EventMappers[Events.ScrollMove] = Events.DragMove;

  EventMappers[Events.ScrollEnd] = Events.DragEnd;

  EventMappers[Events.ScrollAnimationDidStart] = Events.DragAnimationDidStart;

  EventMappers[Events.ScrollAnimationDidEnd] = Events.DragAnimationDidEnd;

  EventMappers[Events.DirectionLockDidStart] = Events.DirectionLockDidStart;

  exports.ScrollComponent = (function(superClass) {
    extend(ScrollComponent, superClass);

    ScrollComponent.define("velocity", ScrollComponent.proxyProperty("content.draggable.velocity", {
      importable: false
    }));

    ScrollComponent.define("scrollHorizontal", ScrollComponent.proxyProperty("content.draggable.horizontal"));

    ScrollComponent.define("scrollVertical", ScrollComponent.proxyProperty("content.draggable.vertical"));

    ScrollComponent.define("speedX", ScrollComponent.proxyProperty("content.draggable.speedX"));

    ScrollComponent.define("speedY", ScrollComponent.proxyProperty("content.draggable.speedY"));

    ScrollComponent.define("isDragging", ScrollComponent.proxyProperty("content.draggable.isDragging", {
      importable: false
    }));

    ScrollComponent.define("isMoving", ScrollComponent.proxyProperty("content.draggable.isMoving", {
      importable: false
    }));

    ScrollComponent.define("propagateEvents", ScrollComponent.proxyProperty("content.draggable.propagateEvents"));

    ScrollComponent.define("directionLock", ScrollComponent.proxyProperty("content.draggable.directionLock"));

    ScrollComponent.define("directionLockThreshold", ScrollComponent.proxyProperty("content.draggable.directionLockThreshold"));

    ScrollComponent.define("content", {
      importable: false,
      exportable: false,
      get: function() {
        return this._content;
      }
    });

    ScrollComponent.define("mouseWheelSpeedMultiplier", ScrollComponent.simpleProperty("mouseWheelSpeedMultiplier", 1));

    function ScrollComponent(options) {
      if (options == null) {
        options = {};
      }
      this._onMouseWheel = bind(this._onMouseWheel, this);
      this.updateContent = bind(this.updateContent, this);
      if (options.clip == null) {
        options.clip = true;
      }
      if (options.mouseWheelEnabled == null) {
        options.mouseWheelEnabled = false;
      }
      if (options.backgroundColor == null) {
        options.backgroundColor = null;
      }
      ScrollComponent.__super__.constructor.call(this, options);
      this._contentInset = options.contentInset || Utils.rectZero();
      this.setContentLayer(new Layer);
      this._applyOptionsAndDefaults(options);
      this._enableMouseWheelHandling();
      if (options.hasOwnProperty("wrap")) {
        wrapComponent(this, options.wrap);
      }
    }

    ScrollComponent.prototype.calculateContentFrame = function() {
      var contentFrame, size;
      contentFrame = this.content.contentFrame();
      return size = {
        x: 0,
        y: 0,
        width: Math.max(this.width, contentFrame.x + contentFrame.width),
        height: Math.max(this.height, contentFrame.y + contentFrame.height)
      };
    };

    ScrollComponent.prototype.setContentLayer = function(layer) {
      if (this.content) {
        this._content.destroy();
      }
      this._content = layer;
      this._content.superLayer = this;
      this._content.name = "content";
      this._content.clip = false;
      this._content.draggable.enabled = true;
      this._content.draggable.momentum = true;
      this._content.on("change:subLayers", this.updateContent);
      this.on("change:width", this.updateContent);
      this.on("change:height", this.updateContent);
      this.updateContent();
      this.scrollPoint = {
        x: 0,
        y: 0
      };
      return this._content;
    };

    ScrollComponent.prototype.updateContent = function() {
      var constraintsFrame, contentFrame;
      if (!this.content) {
        return;
      }
      contentFrame = this.calculateContentFrame();
      contentFrame.x = contentFrame.x + this._contentInset.left;
      contentFrame.y = contentFrame.y + this._contentInset.top;
      this.content.frame = contentFrame;
      constraintsFrame = this.calculateContentFrame();
      constraintsFrame = {
        x: -constraintsFrame.width + this.width - this._contentInset.right,
        y: -constraintsFrame.height + this.height - this._contentInset.bottom,
        width: constraintsFrame.width + constraintsFrame.width - this.width + this._contentInset.left + this._contentInset.right,
        height: constraintsFrame.height + constraintsFrame.height - this.height + this._contentInset.top + this._contentInset.bottom
      };
      this.content.draggable.constraints = constraintsFrame;
      if (this.content.subLayers.length) {
        if (this.content.backgroundColor === Framer.Defaults.Layer.backgroundColor) {
          return this.content.backgroundColor = null;
        }
      }
    };

    ScrollComponent.define("scroll", {
      exportable: false,
      get: function() {
        return this.scrollHorizontal === true || this.scrollVertical === true;
      },
      set: function(value) {
        if (!this.content) {
          return;
        }
        if (value === false) {
          this.content.animateStop();
        }
        return this.scrollHorizontal = this.scrollVertical = value;
      }
    });

    ScrollComponent.prototype._calculateContentPoint = function(scrollPoint) {
      var point;
      scrollPoint.x -= this.contentInset.left;
      scrollPoint.y -= this.contentInset.top;
      point = this._pointInConstraints(scrollPoint);
      return Utils.pointInvert(point);
    };

    ScrollComponent.define("scrollX", {
      get: function() {
        if (!this.content) {
          return 0;
        }
        return 0 - this.content.x + this.contentInset.left;
      },
      set: function(value) {
        if (!this.content) {
          return;
        }
        this.content.draggable.animateStop();
        return this.content.x = this._calculateContentPoint({
          x: value,
          y: 0
        }).x;
      }
    });

    ScrollComponent.define("scrollY", {
      get: function() {
        if (!this.content) {
          return 0;
        }
        return 0 - this.content.y + this.contentInset.top;
      },
      set: function(value) {
        if (!this.content) {
          return;
        }
        this.content.draggable.animateStop();
        return this.content.y = this._calculateContentPoint({
          x: 0,
          y: value
        }).y;
      }
    });

    ScrollComponent.define("scrollPoint", {
      importable: true,
      exportable: false,
      get: function() {
        var point;
        return point = {
          x: this.scrollX,
          y: this.scrollY
        };
      },
      set: function(point) {
        if (!this.content) {
          return;
        }
        this.scrollX = point.x;
        return this.scrollY = point.y;
      }
    });

    ScrollComponent.define("scrollFrame", {
      importable: true,
      exportable: false,
      get: function() {
        var rect;
        rect = this.scrollPoint;
        rect.width = this.width;
        rect.height = this.height;
        return rect;
      },
      set: function(value) {
        return this.scrollPoint = value;
      }
    });

    ScrollComponent.define("contentInset", {
      get: function() {
        return _.clone(this._contentInset);
      },
      set: function(contentInset) {
        this._contentInset = Utils.rectZero(Utils.parseRect(contentInset));
        return this.updateContent();
      }
    });

    ScrollComponent.define("direction", {
      importable: false,
      exportable: false,
      get: function() {
        var direction;
        direction = this.content.draggable.direction;
        if (direction === "down") {
          return "up";
        }
        if (direction === "up") {
          return "down";
        }
        if (direction === "right") {
          return "left";
        }
        if (direction === "left") {
          return "right";
        }
        return direction;
      }
    });

    ScrollComponent.define("angle", {
      importable: false,
      exportable: false,
      get: function() {
        if (!this.content) {
          return 0;
        }
        return -this.content.draggable.angle;
      }
    });

    ScrollComponent.prototype.scrollToPoint = function(point, animate, animationOptions) {
      var contentPoint;
      if (animate == null) {
        animate = true;
      }
      if (animationOptions == null) {
        animationOptions = {
          curve: "spring(500,50,0)"
        };
      }
      contentPoint = this._calculateContentPoint(point);
      this.content.draggable.animateStop();
      if (animate) {
        point = {};
        if (contentPoint.hasOwnProperty("x")) {
          point.x = contentPoint.x;
        }
        if (contentPoint.hasOwnProperty("y")) {
          point.y = contentPoint.y;
        }
        animationOptions.properties = point;
        this.content.animateStop();
        return this.content.animate(animationOptions);
      } else {
        return this.content.point = contentPoint;
      }
    };

    ScrollComponent.prototype.scrollToTop = function(animate, animationOptions) {
      if (animate == null) {
        animate = true;
      }
      if (animationOptions == null) {
        animationOptions = {
          curve: "spring(500,50,0)"
        };
      }
      return this.scrollToPoint({
        x: 0,
        y: 0
      }, animate, animationOptions);
    };

    ScrollComponent.prototype.scrollToLayer = function(contentLayer, originX, originY, animate, animationOptions) {
      var scrollPoint;
      if (originX == null) {
        originX = 0;
      }
      if (originY == null) {
        originY = 0;
      }
      if (animate == null) {
        animate = true;
      }
      if (animationOptions == null) {
        animationOptions = {
          curve: "spring(500,50,0)"
        };
      }
      if (contentLayer && contentLayer.superLayer !== this.content) {
        throw Error("This layer is not in the scroll component content");
      }
      if (!contentLayer || this.content.subLayers.length === 0) {
        scrollPoint = {
          x: 0,
          y: 0
        };
      } else {
        scrollPoint = this._scrollPointForLayer(contentLayer, originX, originY);
        scrollPoint.x -= this.width * originX;
        scrollPoint.y -= this.height * originY;
      }
      this.scrollToPoint(scrollPoint, animate, animationOptions);
      return contentLayer;
    };

    ScrollComponent.prototype.scrollToClosestLayer = function(originX, originY, animate, animationOptions) {
      var closestLayer;
      if (originX == null) {
        originX = 0;
      }
      if (originY == null) {
        originY = 0;
      }
      if (animate == null) {
        animate = true;
      }
      if (animationOptions == null) {
        animationOptions = {
          curve: "spring(500,50,0)"
        };
      }
      closestLayer = this.closestContentLayer(originX, originY, animate, animationOptions);
      if (closestLayer) {
        this.scrollToLayer(closestLayer, originX, originY);
        return closestLayer;
      } else {
        if (!closestLayer) {
          this.scrollToPoint({
            x: 0,
            y: 0
          });
        }
        return null;
      }
    };

    ScrollComponent.prototype.closestContentLayer = function(originX, originY) {
      var scrollPoint;
      if (originX == null) {
        originX = 0;
      }
      if (originY == null) {
        originY = 0;
      }
      scrollPoint = Utils.framePointForOrigin(this.scrollFrame, originX, originY);
      return this.closestContentLayerForScrollPoint(scrollPoint, originX, originY);
    };

    ScrollComponent.prototype.closestContentLayerForScrollPoint = function(scrollPoint, originX, originY) {
      if (originX == null) {
        originX = 0;
      }
      if (originY == null) {
        originY = 0;
      }
      return _.first(this._contentLayersSortedByDistanceForScrollPoint(scrollPoint, originX, originY));
    };

    ScrollComponent.prototype._scrollPointForLayer = function(layer, originX, originY, clamp) {
      if (originX == null) {
        originX = 0;
      }
      if (originY == null) {
        originY = 0;
      }
      if (clamp == null) {
        clamp = true;
      }
      return Utils.framePointForOrigin(layer, originX, originY);
    };

    ScrollComponent.prototype._contentLayersSortedByDistanceForScrollPoint = function(scrollPoint, originX, originY) {
      if (originX == null) {
        originX = 0;
      }
      if (originY == null) {
        originY = 0;
      }
      return Utils.frameSortByAbsoluteDistance(scrollPoint, this.content.subLayers, originX, originY);
    };

    ScrollComponent.prototype._pointInConstraints = function(point) {
      var maxX, maxY, minX, minY, ref;
      ref = this.content.draggable._calculateConstraints(this.content.draggable.constraints), minX = ref.minX, maxX = ref.maxX, minY = ref.minY, maxY = ref.maxY;
      point = {
        x: -Utils.clamp(-point.x, minX, maxX),
        y: -Utils.clamp(-point.y, minY, maxY)
      };
      return point;
    };

    ScrollComponent.prototype.addListener = function() {
      var eventName, eventNames, i, j, len, listener, results;
      eventNames = 2 <= arguments.length ? slice.call(arguments, 0, i = arguments.length - 1) : (i = 0, []), listener = arguments[i++];
      ScrollComponent.__super__.addListener.apply(this, arguments);
      results = [];
      for (j = 0, len = eventNames.length; j < len; j++) {
        eventName = eventNames[j];
        if (indexOf.call(_.keys(EventMappers), eventName) >= 0) {
          results.push(this.content.on(EventMappers[eventName], listener));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    ScrollComponent.prototype.removeListener = function() {
      var eventName, eventNames, i, j, len, listener, results;
      eventNames = 2 <= arguments.length ? slice.call(arguments, 0, i = arguments.length - 1) : (i = 0, []), listener = arguments[i++];
      ScrollComponent.__super__.removeListener.apply(this, arguments);
      results = [];
      for (j = 0, len = eventNames.length; j < len; j++) {
        eventName = eventNames[j];
        if (indexOf.call(_.keys(EventMappers), eventName) >= 0) {
          results.push(this.content.off(EventMappers[eventName], listener));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    ScrollComponent.prototype.on = ScrollComponent.prototype.addListener;

    ScrollComponent.prototype.off = ScrollComponent.prototype.removeListener;

    ScrollComponent.define("mouseWheelEnabled", {
      get: function() {
        return this._mouseWheelEnabled;
      },
      set: function(value) {
        this._mouseWheelEnabled = value;
        return this._enableMouseWheelHandling(value);
      }
    });

    ScrollComponent.prototype._enableMouseWheelHandling = function(enable) {
      if (enable) {
        return this.on(Events.MouseWheel, this._onMouseWheel);
      } else {
        return this.off(Events.MouseWheel, this._onMouseWheel);
      }
    };

    ScrollComponent.prototype._onMouseWheel = function(event) {
      var maxX, maxY, minX, minY, point, ref;
      if (!this._mouseWheelScrolling) {
        this._mouseWheelScrolling = true;
        this.emit(Events.ScrollStart, event);
      }
      this.content.animateStop();
      ref = this.content.draggable._calculateConstraints(this.content.draggable.constraints), minX = ref.minX, maxX = ref.maxX, minY = ref.minY, maxY = ref.maxY;
      point = {
        x: Utils.clamp(this.content.x + (event.wheelDeltaX * this.mouseWheelSpeedMultiplier), minX, maxX),
        y: Utils.clamp(this.content.y + (event.wheelDeltaY * this.mouseWheelSpeedMultiplier), minY, maxY)
      };
      this.content.point = point;
      this.emit(Events.Scroll, event);
      return this._onMouseWheelEnd(event);
    };

    ScrollComponent.prototype._onMouseWheelEnd = Utils.debounce(0.3, function(event) {
      this.emit(Events.ScrollEnd, event);
      return this._mouseWheelScrolling = false;
    });

    ScrollComponent.prototype.copy = function() {
      var contentLayer, copy;
      copy = ScrollComponent.__super__.copy.apply(this, arguments);
      contentLayer = _.first(_.without(copy.subLayers, copy.content));
      copy.setContentLayer(contentLayer);
      copy.props = this.props;
      return copy;
    };

    ScrollComponent.wrap = function(layer, options) {
      return wrapComponent(new this(options), layer, options);
    };

    return ScrollComponent;

  })(Layer);

  wrapComponent = function(instance, layer, options) {
    var i, j, len, len1, propKey, ref, ref1, screenFrame, scroll, subLayer, subLayerIndex, wrapper;
    if (options == null) {
      options = {
        correct: true
      };
    }
    scroll = instance;
    if (options.correct === true) {
      if (layer.subLayers.length === 0) {
        wrapper = new Layer;
        wrapper.name = "ScrollComponent";
        wrapper.frame = layer.frame;
        layer.superLayer = wrapper;
        layer.x = layer.y = 0;
        layer = wrapper;
        console.log("Corrected the scroll component without sub layers");
      }
    }
    ref = ["frame", "image", "name"];
    for (i = 0, len = ref.length; i < len; i++) {
      propKey = ref[i];
      scroll[propKey] = layer[propKey];
    }
    if (options.correct === true) {
      screenFrame = scroll.screenFrame;
      if (screenFrame.x < Screen.width) {
        if (screenFrame.x + screenFrame.width > Screen.width) {
          scroll.width = Screen.width - screenFrame.x;
          console.log("Corrected the scroll width to " + scroll.width);
        }
      }
      if (screenFrame.y < Screen.height) {
        if (screenFrame.y + screenFrame.height > Screen.height) {
          scroll.height = Screen.height - screenFrame.y;
          console.log("Corrected the scroll height to " + scroll.height);
        }
      }
    }
    ref1 = layer.subLayers;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      subLayer = ref1[j];
      subLayerIndex = subLayer.index;
      subLayer.superLayer = scroll.content;
      subLayer.index = subLayerIndex;
    }
    scroll.superLayer = layer.superLayer;
    scroll.index = layer.index;
    layer.destroy();
    return scroll;
  };

}).call(this);

//# sourceMappingURL=ScrollComponent.js.map
