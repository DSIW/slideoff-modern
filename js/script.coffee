$.fn.extend
  typewriter: ->
    this.each ->
      $el = $(this)
      str = $el.text()
      progress = 0
      $el.text('')
      timer = setInterval ->
        $el.text(str.substring(0, progress) + '_')
        if progress >= str.length
          clearInterval(timer)
          $el.text(str)
        progress++
      , 130
    this

class Transform
  @body = document.body

  @get: ->
    denominator = Math.max(@body.clientWidth / window.innerWidth, @body.clientHeight / window.innerHeight)
    "scale(" + (1 / denominator) + ")"

  @apply: (transform) ->
    @body.style.WebkitTransform = transform
    @body.style.MozTransform = transform
    @body.style.msTransform = transform
    @body.style.OTransform = transform
    @body.style.transform = transform

  @scale: ->
    Transform.apply(Transform.get())

  @reset: ->
    Transform.apply('none')

class Mode
  @body = document.body

  @dispatchSingleSlideMode: (e) ->
    slideId = Mode.findSlideId(e.target)
    presentSlideId = slideId?
    if presentSlideId and Mode.isListMode()
      Mode.enterSlideMode()
      slide = Slide.fromSlideId(slideId)
      slide.goto()
      slide.replaceHistory()

  @enterSlideMode: ->
    @body.className = "full"
    Transform.scale()

  @enterListMode: ->
    @body.className = "list"
    Transform.reset()

  @isListMode: ->
    !@body.classList.contains("full")

  @isSlideMode: ->
    !Mode.isListMode()

  @switchToListMode: ->
    Mode.enterListMode()
    slide = Slide.current()
    slide.pushHistory()
    slide.scrollTo()

  @switchToSlideMode: ->
    Mode.enterSlideMode()
    slide = Slide.current()
    slide.pushHistory()
    slide.updateProgress()

  @reload: ->
    if window.location.search.substr(1) is 'full'
      Mode.enterSlideMode()
      #Slide.current().updateProgress()
    else
      Mode.enterListMode()
      Slide.current()?.scrollTo()

  # private

  # go up to element with class "slide" and return its id
  @findSlideId: (node) ->
    while "BODY" isnt node.nodeName and "HTML" isnt node.nodeName
      return node.id if node.classList.contains("slide")
      node = node.parentNode
    null

class SlideInitializer
  @init: ->
    $slides = $('.slide')
    totalSize = $slides.length
    for slide in $slides
      SlideInitializer.initSlideNumber(slide, totalSize)
      SlideInitializer.initIncremental(slide)
      SlideInitializer.initPause(slide)
      SlideInitializer.initTypewriter(slide)

  @initSlideNumber: (slide, total) ->
    slideNum = $(slide).index()
    $(slide).attr('data-slide', slideNum).attr('data-slides', total)

  @initIncremental: (slide) ->
    if $(slide).hasClass('incr')
      $(slide).find('ul > li').addClass('inactive')

  @initPause: (slide) ->
    pauses = $(slide).find(".pause")
    for pause, i in pauses
      last = i == pauses.length - 1
      if last
        wrappable = $(pause).nextAll()
      else
        wrappable = $(pause).nextUntil(".pause")
      wrappable?.wrapAll('<div class="inactive"></div>')

  @initTypewriter: (slide) ->
    if $(slide).hasClass('typewriter')
      null
      $(slide).find('code.sh').addClass('inactive')

class Slide
  constructor: (slideNumber) ->
    @$element = $(@slideList()[@slideNumber])
    @slideNumber = @normalizeSlideNumber(slideNumber)
    @id = @slideList()[@slideNumber].id
    @progress = $(".progress div").first()

  @slideList: ->
    slides = $("div.slide")
    slideList = []
    slideList.push id: slide.id for slide in slides
    slideList

  @current: ->
    id = window.location.hash.substr(1)
    Slide.fromSlideId(id)

  @fromSlideId: (slideId) ->
    for slide, index in Slide.slideList()
      return new Slide(index) if slideId is slide.id
    null

  @first: -> new Slide(0)

  @last: -> new Slide(@slideList().length - 1)

  getHash: -> "#" + @id

  html: -> $(@getHash())

  goto: ->
    window.location.hash = @getHash()
    @updateProgress() if Mode.isSlideMode()

  scrollTo: -> window.scrollTo 0, @offsetTop()

  offsetTop: -> @html()?.offset().top

  next: -> new Slide(@slideNumber + 1)

  prev: -> new Slide(@slideNumber - 1)

  pushHistory: -> history.pushState null, null, @historyPath()

  replaceHistory: -> history.replaceState null, null, @historyPath()

  containsInactive: -> @firstInactiveElement().length > 0

  firstInactiveElement: -> @html().find('.inactive').first()

  removePresentElement: -> @html().find('.present').first().removeClass('present')

  nextInactive: ->
    @html().removeClass('incr') unless @containsInactive()
    element = @firstInactiveElement()
    @html().find('.present').first().addClass('visited')
    @removePresentElement()
    element.removeClass('inactive')
    if element.is("code.sh")
      element.typewriter()
    else
      element.addClass('present')

  # private

  slideList: -> Slide.slideList()

  normalizeSlideNumber: (slideNumber) ->
    firstIndex = 0
    lastIndex = @slideList().length - 1
    Math.min(Math.max(firstIndex, slideNumber), lastIndex)

  updateProgress: ->
    return unless @progress?
    width = (100 / (@slideList().length - 1) * @slideNumber).toFixed(2)
    @progress.width("#{width}%")

  historyPath: ->
    path = window.location.pathname
    path += "?full" if Mode.isSlideMode()
    path += @getHash()
    path


class UserInterface
  @gotoFirstSlide: ->
    Slide.first().goto()

  @gotoLastSlide: ->
    Slide.last().goto()

  @nextStep: ->
    slide = Slide.current()
    if Mode.isSlideMode() and slide.containsInactive()
      slide.nextInactive()
    else
      slide.html().removeClass('incr')
      slide.removePresentElement()
      slide.next().goto()

  @prevStep: ->
    Slide.current().prev().goto()

  @conditionalStep: (prev) ->
    method = if prev then 'prev' else 'next'
    UserInterface[method+'Step']()

  @resize: ->
    Transform.scale() if Mode.isSlideMode()

  @init: ->
    if Mode.isSlideMode()
      Mode.enterSlideMode()
      slide = Slide.current() || Slide.first()
      slide.replaceHistory()
      slide.updateProgress()

  @switchToListMode: (e) ->
    if Mode.isSlideMode()
      e.preventDefault()
      Mode.switchToListMode()

  @switchToSlideMode: (e) ->
    if Mode.isListMode()
      e.preventDefault()
      Mode.switchToSlideMode()

startEventSourceHandler = (uri) ->
  return unless window["EventSource"]?
  source = new EventSource(uri)
  source.onmessage = (e) ->
    switch e.data
      when "next" then UserInterface.nextStep()
      when "prev" then UserInterface.prevStep()
      when "up"   then UserInterface.switchToListMode(e)
      when "down" then UserInterface.switchToSlideMode(e)
      else console.log e

$ ->
  SlideInitializer.init()

  # Event handlers
  window.addEventListener "DOMContentLoaded", ->
    UserInterface.init()
  , false

  window.addEventListener "popstate", (e) ->
    Mode.reload()
  , false

  window.addEventListener "resize", (e) ->
    UserInterface.resize()
  , false

  document.addEventListener "keyup", (e) ->
    # Shortcut for alt, shift and meta keys
    return if e.altKey or e.ctrlKey or e.metaKey
    switch e.which
      when 116, 13 # F5, Enter
        UserInterface.switchToSlideMode(e) if Slide.current()?
      when 27 # Esc
        UserInterface.switchToListMode(e)
      when 33, 38, 37, 72, 75 # PgUp, Up, Left, h, k
        e.preventDefault()
        UserInterface.prevStep()
      when 34, 40, 39, 76, 74 # PgDown, Down, Right, l, j
        e.preventDefault()
        UserInterface.nextStep()
      when 36 # Home
        e.preventDefault()
        UserInterface.gotoFirstSlide()
      when 35 # End
        e.preventDefault()
        UserInterface.gotoLastSlide()
      when 9, 32 # Tab/Space = +1; &+Shift = -1
        e.preventDefault()
        UserInterface.conditionalStep(e.shiftKey)
  , false

  document.addEventListener "click", Mode.dispatchSingleSlideMode, false
  document.addEventListener "touchend", Mode.dispatchSingleSlideMode, false
  document.addEventListener "touchstart", (e) ->
    if Mode.isSlideMode()
      x = e.touches[0].pageX
      UserInterface.conditionalStep(x <= window.innerWidth / 2)
  , false

  document.addEventListener "touchmove", (e) ->
    e.preventDefault() if Mode.isSlideMode()
  , false

  window.setTimeout ->
    startEventSourceHandler "/remote/sub/events"
  , 100
