// Generated by CoffeeScript 1.7.1
(function() {
  var Mode, Slide, SlideInitializer, Transform, UserInterface, startEventSourceHandler;

  $.fn.extend({
    typewriter: function() {
      this.each(function() {
        var $el, progress, str, timer;
        $el = $(this);
        str = $el.text();
        progress = 0;
        $el.text('');
        return timer = setInterval(function() {
          $el.text(str.substring(0, progress) + '_');
          if (progress >= str.length) {
            clearInterval(timer);
            $el.text(str);
          }
          return progress++;
        }, 130);
      });
      return this;
    }
  });

  Transform = (function() {
    function Transform() {}

    Transform.body = document.body;

    Transform.get = function() {
      var denominator;
      denominator = Math.max(this.body.clientWidth / window.innerWidth, this.body.clientHeight / window.innerHeight);
      return "scale(" + (1 / denominator) + ")";
    };

    Transform.apply = function(transform) {
      this.body.style.WebkitTransform = transform;
      this.body.style.MozTransform = transform;
      this.body.style.msTransform = transform;
      this.body.style.OTransform = transform;
      return this.body.style.transform = transform;
    };

    Transform.scale = function() {
      return Transform.apply(Transform.get());
    };

    Transform.reset = function() {
      return Transform.apply('none');
    };

    return Transform;

  })();

  Mode = (function() {
    function Mode() {}

    Mode.body = document.body;

    Mode.dispatchSingleSlideMode = function(e) {
      var presentSlideId, slide, slideId;
      slideId = Mode.findSlideId(e.target);
      presentSlideId = slideId != null;
      if (presentSlideId && Mode.isListMode()) {
        Mode.enterSlideMode();
        slide = Slide.fromSlideId(slideId);
        slide.goto();
        return slide.replaceHistory();
      }
    };

    Mode.enterSlideMode = function() {
      this.body.className = "full";
      return Transform.scale();
    };

    Mode.enterListMode = function() {
      this.body.className = "list";
      return Transform.reset();
    };

    Mode.isListMode = function() {
      return !this.body.classList.contains("full");
    };

    Mode.isSlideMode = function() {
      return !Mode.isListMode();
    };

    Mode.switchToListMode = function() {
      var slide;
      Mode.enterListMode();
      slide = Slide.current();
      slide.pushHistory();
      return slide.scrollTo();
    };

    Mode.switchToSlideMode = function() {
      var slide;
      Mode.enterSlideMode();
      slide = Slide.current();
      slide.pushHistory();
      return slide.updateProgress();
    };

    Mode.reload = function() {
      var _ref;
      if (window.location.search.substr(1) === 'full') {
        return Mode.enterSlideMode();
      } else {
        Mode.enterListMode();
        return (_ref = Slide.current()) != null ? _ref.scrollTo() : void 0;
      }
    };

    Mode.findSlideId = function(node) {
      while ("BODY" !== node.nodeName && "HTML" !== node.nodeName) {
        if (node.classList.contains("slide")) {
          return node.id;
        }
        node = node.parentNode;
      }
      return null;
    };

    return Mode;

  })();

  SlideInitializer = (function() {
    function SlideInitializer() {}

    SlideInitializer.init = function() {
      var slide, _i, _len, _ref, _results;
      _ref = $("div.slide");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        slide = _ref[_i];
        SlideInitializer.initIncremental(slide);
        SlideInitializer.initPause(slide);
        _results.push(SlideInitializer.initTypewriter(slide));
      }
      return _results;
    };

    SlideInitializer.initIncremental = function(slide) {
      if ($(slide).hasClass('incr')) {
        return $(slide).find('ul > li').addClass('inactive');
      }
    };

    SlideInitializer.initPause = function(slide) {
      var i, last, pause, pauses, wrappable, _i, _len, _results;
      pauses = $(slide).find(".pause");
      _results = [];
      for (i = _i = 0, _len = pauses.length; _i < _len; i = ++_i) {
        pause = pauses[i];
        last = i === pauses.length - 1;
        if (last) {
          wrappable = $(pause).nextAll();
        } else {
          wrappable = $(pause).nextUntil(".pause");
        }
        _results.push(wrappable != null ? wrappable.wrapAll('<div class="inactive"></div>') : void 0);
      }
      return _results;
    };

    SlideInitializer.initTypewriter = function(slide) {
      if ($(slide).hasClass('typewriter')) {
        null;
        return $(slide).find('code.sh').addClass('inactive');
      }
    };

    return SlideInitializer;

  })();

  Slide = (function() {
    function Slide(slideNumber) {
      this.$element = $(this.slideList()[this.slideNumber]);
      this.slideNumber = this.normalizeSlideNumber(slideNumber);
      this.id = this.slideList()[this.slideNumber].id;
      this.progress = $(".progress div").first();
    }

    Slide.slideList = function() {
      var slide, slideList, slides, _i, _len;
      slides = $("div.slide");
      slideList = [];
      for (_i = 0, _len = slides.length; _i < _len; _i++) {
        slide = slides[_i];
        slideList.push({
          id: slide.id
        });
      }
      return slideList;
    };

    Slide.current = function() {
      var id;
      id = window.location.hash.substr(1);
      return Slide.fromSlideId(id);
    };

    Slide.fromSlideId = function(slideId) {
      var index, slide, _i, _len, _ref;
      _ref = Slide.slideList();
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        slide = _ref[index];
        if (slideId === slide.id) {
          return new Slide(index);
        }
      }
      return null;
    };

    Slide.first = function() {
      return new Slide(0);
    };

    Slide.last = function() {
      return new Slide(this.slideList().length - 1);
    };

    Slide.prototype.getHash = function() {
      return "#" + this.id;
    };

    Slide.prototype.html = function() {
      return $(this.getHash());
    };

    Slide.prototype.goto = function() {
      window.location.hash = this.getHash();
      if (Mode.isSlideMode()) {
        return this.updateProgress();
      }
    };

    Slide.prototype.scrollTo = function() {
      return window.scrollTo(0, this.offsetTop());
    };

    Slide.prototype.offsetTop = function() {
      var _ref;
      return (_ref = this.html()) != null ? _ref.offset().top : void 0;
    };

    Slide.prototype.next = function() {
      return new Slide(this.slideNumber + 1);
    };

    Slide.prototype.prev = function() {
      return new Slide(this.slideNumber - 1);
    };

    Slide.prototype.pushHistory = function() {
      return history.pushState(null, null, this.historyPath());
    };

    Slide.prototype.replaceHistory = function() {
      return history.replaceState(null, null, this.historyPath());
    };

    Slide.prototype.containsInactive = function() {
      return this.firstInactiveElement().length > 0;
    };

    Slide.prototype.firstInactiveElement = function() {
      return this.html().find('.inactive').first();
    };

    Slide.prototype.removePresentElement = function() {
      return this.html().find('.present').first().removeClass('present');
    };

    Slide.prototype.nextInactive = function() {
      var element;
      if (!this.containsInactive()) {
        this.html().removeClass('incr');
      }
      element = this.firstInactiveElement();
      this.html().find('.present').first().addClass('visited');
      this.removePresentElement();
      element.removeClass('inactive');
      if (element.is("code.sh")) {
        return element.typewriter();
      } else {
        return element.addClass('present');
      }
    };

    Slide.prototype.slideList = function() {
      return Slide.slideList();
    };

    Slide.prototype.normalizeSlideNumber = function(slideNumber) {
      var firstIndex, lastIndex;
      firstIndex = 0;
      lastIndex = this.slideList().length - 1;
      return Math.min(Math.max(firstIndex, slideNumber), lastIndex);
    };

    Slide.prototype.updateProgress = function() {
      var width;
      if (this.progress == null) {
        return;
      }
      width = (100 / (this.slideList().length - 1) * this.slideNumber).toFixed(2);
      return this.progress.width("" + width + "%");
    };

    Slide.prototype.historyPath = function() {
      var path;
      path = window.location.pathname;
      if (Mode.isSlideMode()) {
        path += "?full";
      }
      path += this.getHash();
      return path;
    };

    return Slide;

  })();

  UserInterface = (function() {
    function UserInterface() {}

    UserInterface.gotoFirstSlide = function() {
      return Slide.first().goto();
    };

    UserInterface.gotoLastSlide = function() {
      return Slide.last().goto();
    };

    UserInterface.nextStep = function() {
      var slide;
      slide = Slide.current();
      if (Mode.isSlideMode() && slide.containsInactive()) {
        return slide.nextInactive();
      } else {
        slide.html().removeClass('incr');
        slide.removePresentElement();
        return slide.next().goto();
      }
    };

    UserInterface.prevStep = function() {
      return Slide.current().prev().goto();
    };

    UserInterface.conditionalStep = function(prev) {
      var method;
      method = prev ? 'prev' : 'next';
      return UserInterface[method + 'Step']();
    };

    UserInterface.resize = function() {
      if (Mode.isSlideMode()) {
        return Transform.scale();
      }
    };

    UserInterface.init = function() {
      var slide;
      if (Mode.isSlideMode()) {
        Mode.enterSlideMode();
        slide = Slide.current() || Slide.first();
        slide.replaceHistory();
        return slide.updateProgress();
      }
    };

    UserInterface.switchToListMode = function(e) {
      if (Mode.isSlideMode()) {
        e.preventDefault();
        return Mode.switchToListMode();
      }
    };

    UserInterface.switchToSlideMode = function(e) {
      if (Mode.isListMode()) {
        e.preventDefault();
        return Mode.switchToSlideMode();
      }
    };

    return UserInterface;

  })();

  startEventSourceHandler = function(uri) {
    var source;
    if (window["EventSource"] == null) {
      return;
    }
    source = new EventSource(uri);
    return source.onmessage = function(e) {
      switch (e.data) {
        case "next":
          return UserInterface.nextStep();
        case "prev":
          return UserInterface.prevStep();
        case "up":
          return UserInterface.switchToListMode(e);
        case "down":
          return UserInterface.switchToSlideMode(e);
        default:
          return console.log(e);
      }
    };
  };

  $(function() {
    SlideInitializer.init();
    window.addEventListener("DOMContentLoaded", function() {
      return UserInterface.init();
    }, false);
    window.addEventListener("popstate", function(e) {
      return Mode.reload();
    }, false);
    window.addEventListener("resize", function(e) {
      return UserInterface.resize();
    }, false);
    document.addEventListener("keyup", function(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) {
        return;
      }
      switch (e.which) {
        case 116:
        case 13:
          if (Slide.current() != null) {
            return UserInterface.switchToSlideMode(e);
          }
          break;
        case 27:
          return UserInterface.switchToListMode(e);
        case 33:
        case 38:
        case 37:
        case 72:
        case 75:
          e.preventDefault();
          return UserInterface.prevStep();
        case 34:
        case 40:
        case 39:
        case 76:
        case 74:
          e.preventDefault();
          return UserInterface.nextStep();
        case 36:
          e.preventDefault();
          return UserInterface.gotoFirstSlide();
        case 35:
          e.preventDefault();
          return UserInterface.gotoLastSlide();
        case 9:
        case 32:
          e.preventDefault();
          return UserInterface.conditionalStep(e.shiftKey);
      }
    }, false);
    document.addEventListener("click", Mode.dispatchSingleSlideMode, false);
    document.addEventListener("touchend", Mode.dispatchSingleSlideMode, false);
    document.addEventListener("touchstart", function(e) {
      var x;
      if (Mode.isSlideMode()) {
        x = e.touches[0].pageX;
        return UserInterface.conditionalStep(x <= window.innerWidth / 2);
      }
    }, false);
    document.addEventListener("touchmove", function(e) {
      if (Mode.isSlideMode()) {
        return e.preventDefault();
      }
    }, false);
    return window.setTimeout(function() {
      return startEventSourceHandler("/remote/sub/events");
    }, 100);
  });

}).call(this);