// Generated by CoffeeScript 1.7.1
var Mode, Slide, SlideInitializer, Transform, UserInterface, startEventSourceHandler;

Highcharts.setOptions({
  colors: ['#96000F', '#E10019', '#AAA5A0', '#46413C', '#327D91', '#4BBEE1', '#560F32', '#821350', '#006450', '#009682', '#697D19', '#9BC328', '#AA5500', '#FF8200'],
  credits: {
    enabled: true
  },
  legend: {
    enabled: false
  },
  tooltip: {
    enabled: false
  },
  title: {
    text: ''
  },
  chart: {
    backgroundColor: 'rgba(0,0,0,0)',
    plotBackgroundColor: null,
    plotBorderWidth: null,
    plotShadow: false,
    margin: [0, 0, 0, 0],
    style: {
      fontFamily: 'Open Sans Light',
      fontSize: '20px',
      color: 'black'
    }
  }
});

Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function(color) {
  return {
    radialGradient: {
      cx: 0.5,
      cy: 0.3,
      r: 0.7
    },
    stops: [[0, color], [1, Highcharts.Color(color).brighten(-0.3).get('rgb')]]
  };
});

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
      }, 100);
    });
    return this;
  },
  textfill: function(maxFontSize, maxWords) {
    maxFontSize = parseInt(maxFontSize, 10) || 0;
    maxWords = parseInt(maxWords, 10) || 3;
    return this.each(function() {
      var calcSize, fontSize, maxHeight, maxWidth, newText, orgText, self, splittedText, word, words, _i, _len;
      calcSize = function(text) {
        var multiplier, newSize, ourText, scrollHeight;
        ourText = $("<span>" + text + "</span>").appendTo(self);
        multiplier = maxWidth / ourText.width();
        newSize = fontSize * (multiplier - 0.1);
        ourText.css("fontSize", (maxFontSize > 0 && newSize > maxFontSize ? maxFontSize : newSize));
        ourText.css("lineHeight", "1em");
        scrollHeight = self[0].scrollHeight;
        if (scrollHeight > maxHeight) {
          multiplier = maxHeight / scrollHeight;
          newSize = newSize * multiplier;
          ourText.css("fontSize", (maxFontSize > 0 && newSize > maxFontSize ? maxFontSize : newSize));
          ourText.css("lineHeight", "1em");
        }
      };
      self = $(this);
      orgText = self.text();
      fontSize = parseInt(self.css("fontSize"), 10);
      maxHeight = self.height();
      maxWidth = self.width();
      splittedText = self.html().split(/\s+|<.+?>/);
      words = [];
      for (_i = 0, _len = splittedText.length; _i < _len; _i++) {
        word = splittedText[_i];
        if (word && (word.empty == null)) {
          words.push(word);
        }
      }
      self.empty();
      if (words.length > maxWords) {
        while (words.length > 0) {
          newText = words.splice(0, maxWords).join(" ");
          calcSize(newText);
          self.append("<br>");
        }
      } else {
        calcSize(orgText);
      }
    });
  }
});

Transform = (function() {
  function Transform() {}

  Transform.body = document.body;

  Transform.getScaleFactor = function() {
    var denominator;
    denominator = Math.max(this.body.clientWidth / window.innerWidth, this.body.clientHeight / window.innerHeight);
    return 1 / denominator;
  };

  Transform.apply = function(transform) {
    this.body.style.WebkitTransform = transform;
    this.body.style.MozTransform = transform;
    this.body.style.msTransform = transform;
    this.body.style.OTransform = transform;
    return this.body.style.transform = transform;
  };

  Transform.scale = function() {
    return Transform.apply("scale(" + (this.getScaleFactor()) + ")");
  };

  Transform.reset = function() {
    return Transform.apply('none');
  };

  return Transform;

})();

Mode = (function() {
  function Mode() {}

  Mode.body = document.body;

  Mode.slideModeIndicator = "full";

  Mode.listModeIndicator = "list";

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
    this.body.className = this.slideModeIndicator;
    return Transform.scale();
  };

  Mode.enterListMode = function() {
    this.body.className = this.listModeIndicator;
    return Transform.reset();
  };

  Mode.isListMode = function() {
    return !Mode.isSlideMode();
  };

  Mode.isSlideMode = function() {
    return this.body.classList.contains(this.slideModeIndicator);
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
    var $slides, slide, totalSize, _i, _len, _results;
    $slides = $('.slide').not('.disabled');
    totalSize = $slides.length;
    _results = [];
    for (_i = 0, _len = $slides.length; _i < _len; _i++) {
      slide = $slides[_i];
      SlideInitializer.initSlideNumber(slide, totalSize);
      SlideInitializer.initIncremental(slide);
      SlideInitializer.initPause(slide);
      _results.push(SlideInitializer.initTypewriter(slide));
    }
    return _results;
  };

  SlideInitializer.initMouseClick = function() {
    $('body').click(function(e) {
      if (e.which === 1) {
        e.preventDefault();
        return UserInterface.nextStep();
      }
    });
    return $('body').on('contextmenu', function(e) {
      e.preventDefault();
      return UserInterface.prevStep();
    });
  };

  SlideInitializer.initSlideNumber = function(slide, total) {
    var slideNum;
    slideNum = $(slide).index() - $(slide).prevAll('.slide.disabled').length;
    return $(slide).attr('data-slide', slideNum).attr('data-slides', total);
  };

  SlideInitializer.initIncremental = function(slide) {
    var $slide;
    $slide = $(slide);
    if ($slide.hasClass('incr-list')) {
      $slide.find('> div > ul > li:first-child').addClass('current');
      $slide.find('> div > ol > li:first-child').addClass('current');
      $slide.find('> div > ul > li:not(:first-child)').addClass('inactive');
      $slide.find('> div > ol > li:not(:first-child)').addClass('inactive');
    }
    if ($slide.hasClass('incr-code')) {
      $slide.find('pre > code:first-child').addClass('current');
      $slide.find('pre > code:not(:first-child)').addClass('inactive');
    }
    if ($slide.hasClass('incr-table')) {
      $slide.find('table > tbody > tr:first-child').addClass('current');
      return $slide.find('table > tbody > tr:not(:first-child)').addClass('inactive');
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
      return $(slide).find('pre[data-lang=sh] code').addClass('inactive');
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
    slides = $("div.slide").not('.disabled');
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
    if ((id != null) && id.length > 0) {
      return Slide.fromSlideId(id);
    } else {
      return Slide.first();
    }
  };

  Slide.prototype.nextSection = function() {
    var next;
    next = this.nextSectionId();
    return Slide.fromSlideId("slide-" + next + "-0");
  };

  Slide.prototype.prevSection = function() {
    var prev;
    prev = this.prevSectionId();
    return Slide.fromSlideId("slide-" + prev + "-0");
  };

  Slide.prototype.sectionId = function() {
    return parseInt(this.id.replace(/slide-/, '').split('-')[0], 10);
  };

  Slide.prototype.nextSectionId = function() {
    return this.normalizeSectionNumber(this.sectionId() + 1);
  };

  Slide.prototype.prevSectionId = function() {
    return this.normalizeSectionNumber(this.sectionId() - 1);
  };

  Slide.currentSectionId = function() {
    return Slide.current().sectionId();
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
    var hash;
    hash = this.getHash();
    window.location.hash = hash;
    $('body').trigger('goto.slideoff', {
      target: hash
    });
    $('body').trigger(hash + '.goto.slideoff', {
      target: hash
    });
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

  Slide.prototype.containsCurrent = function() {
    return this.firstCurrentElement().length > 0;
  };

  Slide.prototype.containsVisited = function() {
    return this.html().find('.visited').length > 0;
  };

  Slide.prototype.firstInactiveElement = function() {
    return this.html().find('.inactive').first();
  };

  Slide.prototype.firstCurrentElement = function() {
    return this.html().find('.current').first();
  };

  Slide.prototype.prevInteractive = function() {
    this.firstCurrentElement().removeClass('current').addClass('inactive');
    this.html().find('.visited').last().removeClass('visited').addClass('current');
    if (this.html().hasClass('step-0')) {
      return this.decrementStep();
    }
  };

  Slide.prototype.nextInteractive = function() {
    var element;
    this.firstCurrentElement().removeClass('current').addClass('visited');
    element = this.firstInactiveElement();
    element.removeClass('inactive').addClass('current');
    if (element.is("pre[data-lang=sh] code")) {
      return element.typewriter();
    } else {
      return this.incrementStep();
    }
  };

  Slide.prototype.decrementStep = function() {
    var max_steps, step;
    max_steps = this.html().find('.step').length;
    step = max_steps;
    while (step >= 0 && step <= max_steps && !this.html().hasClass("step-" + step)) {
      step = step - 1;
    }
    return this.html().removeClass("step-" + step);
  };

  Slide.prototype.incrementStep = function() {
    var step;
    step = 0;
    while (this.html().hasClass("step-" + step)) {
      step = step + 1;
    }
    return this.html().addClass("step-" + step);
  };

  Slide.prototype.slideList = function() {
    return Slide.slideList();
  };

  Slide.prototype.normalizeSlideNumber = function(slideNumber) {
    var lastIndex;
    lastIndex = this.slideList().length - 1;
    return this.range(0, slideNumber, lastIndex);
  };

  Slide.prototype.normalizeSectionNumber = function(sectionNumber) {
    var lastIndex;
    lastIndex = this.html().data('sections') - 1;
    return this.range(0, sectionNumber, lastIndex);
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

  Slide.prototype.range = function(min, i, max) {
    return Math.min(Math.max(min, i), max);
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
    if (Mode.isSlideMode() && (slide.containsInactive() || slide.containsCurrent())) {
      if (!slide.containsInactive() && slide.containsCurrent()) {
        slide.firstCurrentElement().removeClass('current').addClass('visited');
        return slide.next().goto();
      } else {
        return slide.nextInteractive();
      }
    } else {
      slide.html().removeClass('incr');
      return slide.next().goto();
    }
  };

  UserInterface.prevStep = function() {
    var slide;
    slide = Slide.current();
    if (Mode.isSlideMode() && (slide.containsVisited() || slide.containsCurrent())) {
      if (!slide.containsVisited() && slide.containsCurrent()) {
        slide.firstCurrentElement().removeClass('current').addClass('inactive');
        return slide.prev().goto();
      } else {
        return slide.prevInteractive();
      }
    } else {
      return slide.prev().goto();
    }
  };

  UserInterface.nextBigStep = function() {
    return Slide.current().nextSection().goto();
  };

  UserInterface.prevBigStep = function() {
    return Slide.current().prevSection().goto();
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
    if (window.location.search.substr(1) === 'full') {
      return Mode.switchToSlideMode();
    } else {
      return Mode.switchToListMode();
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
  window.addEventListener("resize", function(e) {
    return UserInterface.resize();
  }, false);
  document.addEventListener("keyup", function(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) {
      return;
    }
    switch (e.which) {
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
        if (e.shiftKey) {
          return UserInterface.prevBigStep();
        } else {
          return UserInterface.prevStep();
        }
        break;
      case 34:
      case 40:
      case 39:
      case 76:
      case 74:
        e.preventDefault();
        if (e.shiftKey) {
          return UserInterface.nextBigStep();
        } else {
          return UserInterface.nextStep();
        }
        break;
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
