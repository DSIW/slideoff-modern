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
      Slide.current().scrollTo()

  # private

  # go up to element with class "slide" and return its id
  @findSlideId: (node) ->
    while "BODY" isnt node.nodeName and "HTML" isnt node.nodeName
      return node.id if node.classList.contains("slide")
      node = node.parentNode
    null

class Init
  @init: ->
    for slide in $("div.slide")
      Init.initIncremental(slide)
      Init.initPause(slide)
      Init.initTypewriter(slide)

  @initIncremental: (slide) ->
    if $(slide).hasClass('incremental')
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
      #$(slide).find('code.sh').typewriter()

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
    @updateProgress() unless Mode.isListMode()

  scrollTo: -> window.scrollTo 0, @offsetTop()

  @offsetTop: -> document.getElementById(@id)?.offsetTop

  next: -> new Slide(@slideNumber + 1)

  prev: -> new Slide(@slideNumber - 1)

  pushHistory: -> history.pushState null, null, @historyPath()

  replaceHistory: -> history.pushState null, null, @historyPath()

  containsInactive: -> @firstInactiveElement().length > 0

  firstInactiveElement: -> @html().find('.inactive').first()

  removePresentElement: -> @html().find('.present').first().removeClass('present')

  nextInactive: ->
    element = @firstInactiveElement()
    @removePresentElement()
    element.removeClass('inactive').addClass('present')
    @html().removeClass('incremental') unless @containsInactive()

  # private

  slideList: -> Slide.slideList()

  normalizeSlideNumber: (slideNumber) ->
    if 0 > slideNumber
      @slideList().length - 1
    else if @slideList().length <= slideNumber
      0
    else
      slideNumber

  updateProgress: ->
    return unless @progress?
    width = (100 / (@slideList().length - 1) * @slideNumber).toFixed(2)
    @progress.width("#{width}%")

  historyPath: ->
    path = url.pathname
    path += "?full" unless Mode.isListMode()
    path += @getHash()
    path

class UserInterface
  constructor: ->

  #nextStep: ->
  #prevStep: ->


startEventSourceHandler = (uri) ->
  return if window["EventSource"] is `undefined`
  source = new EventSource(uri)
  source.onmessage = (e) ->
    switch e.data
      when "next" then Slide.current().next().goto()
      when "prev" then Slide.current().prev().goto()
      when "up"
        unless Mode.isListMode()
          e.preventDefault()
          Mode.switchToListMode()
      when "down"
        if Mode.isListMode()
          e.preventDefault()
          Mode.switchToSlideMode()
      else
        console.log e

$ ->
  url = window.location

  Init.init()

  # Event handlers
  window.addEventListener "DOMContentLoaded", ->
    unless Mode.isListMode()
      Mode.enterSlideMode()
      slide = Slide.current() || Slide.first()
      slide.replaceHistory()
      slide.updateProgress()
  , false

  window.addEventListener "popstate", (e) ->
    Mode.reload()
  , false

  window.addEventListener "resize", (e) ->
    Transform.scale() unless Mode.isListMode()
  , false

  document.addEventListener "keyup", (e) ->
    # Shortcut for alt, shift and meta keys
    return  if e.altKey or e.ctrlKey or e.metaKey
    switch e.which
      # F5
      when 116, 13 # Enter
        if Mode.isListMode() and Slide.current()?
          e.preventDefault()
          Mode.switchToSlideMode()
      when 27 # Esc
        unless Mode.isListMode()
          e.preventDefault()
          Mode.switchToListMode()
      # PgUp
      # Up
      # Left
      # h
      when 33, 38, 37, 72, 75 # k
        e.preventDefault()
        Slide.current().prev().goto()
      # PgDown
      # Down
      # Right
      # l
      when 34, 40, 39, 76, 74 # j
        e.preventDefault()
        slide = Slide.current()
        if slide.containsInactive()
          slide.nextInactive()
        else
          slide.removePresentElement()
          slide.next().goto()
      when 36 # Home
        e.preventDefault()
        Slide.first().goto()
      when 35 # End
        e.preventDefault()
        Slide.last().goto()
      # Tab = +1; Shift + Tab = -1
      when 9, 32 # Space = +1; Shift + Space = -1
        e.preventDefault()
        method = if e.shiftKey then 'prev' else 'next'
        Slide.current[method]().goto()
  , false

  document.addEventListener "click", Mode.dispatchSingleSlideMode, false
  document.addEventListener "touchend", Mode.dispatchSingleSlideMode, false
  document.addEventListener "touchstart", (e) ->
    unless Mode.isListMode()
      x = e.touches[0].pageX
      method = if x > window.innerWidth / 2 then 'next' else 'prev'
      Slide.current()[method]().goto()
  , false

  document.addEventListener "touchmove", (e) ->
    e.preventDefault() unless Mode.isListMode()
  , false

  window.setTimeout ->
    startEventSourceHandler "/remote/sub/events"
  , 100
