/*

# QSS
version 1.0.0

A Simple Query Syntax for CSS Element Queries

The goal of QSS is to define a simple syntax for specifying element queries by adding a new ending part between a CSS selector list and the block of rules that help define the breakpoints when those rules are to apply.

    selectorList <query> { block }

Supported syntax includes:

- Operators: `if`, `@`

- Comparators: `<` | `below` | `under` | `<=` | `max` | `==` | `equals` | `>=` | `min` | `>` | `above` | `over`

- Conditions: condition: `width` | `height` | `characters` | `children` | `xscroll` | `yscroll`

- Breakpoint: <number>

There are two different formats for expressing element queries for individual CSS rules, one using an `if`-based structure, and another that uses the `@` symbol to declare when it should apply.

## If-formatted Query

    <selectorList> `if` <condition> <comparator> <breakpoint> { <block> }

### Examples

    div if width above 500 {}

    input if characters under 1 {}

## At-formatted Query

    <selectorList> `@` <comparator> <breakpoint> <condition> { <block> }

### Examples

    div @ above 500 width {}

    input @ under 1 characters {}

## Info

- license: MIT
- author: Tommy Hogins
- website: https://github.com/tomhodgins/qss

*/

var qss = {}

qss.stylesheets = []

qss.load = function() {

  qss.count = 0

  var script = document.getElementsByTagName('script')

  for (var i=0; i<script.length; i++) {

    if (script[i].getAttribute('data-qss-read') === null && script[i].type === 'text/qss') {

      script[i].setAttribute('data-qss-read', qss.count)

      if (script[i].src) {

        ;(function() {

          var xhr = new XMLHttpRequest;

          xhr.open('GET', script[i].src, true);
          xhr.send(null);
          xhr.onload = function() {

            qss.stylesheets.push(xhr.responseText)

          }

        })()

      } else {

        qss.stylesheets.push(script[i].innerHTML)

        qss.count++

      }

    }

  }

  var link = document.getElementsByTagName('link')

  for (i=0; i<link.length; i++) {

    if (link[i].getAttribute('data-qss-read') === null && link[i].type === 'text/qss') {

      link[i].setAttribute('data-qss-read', qss.count)

      if (link[i].href) {

        ;(function() {

          var xhr = new XMLHttpRequest

          xhr.open('GET', link[i].href, true)
          xhr.send(null)
          xhr.onload = function() {

            qss.stylesheets.push(xhr.responseText)

            qss.count++

          }

        })()

      }

    }

  }

  var style = document.getElementsByTagName('style')

  for (i=0; i<style.length; i++) {

    if (style[i].getAttribute('data-qss-read') === null && style[i].type === 'text/qss') {

      style[i].setAttribute('data-qss-read', qss.count)

      qss.stylesheets.push(style[i].innerHTML)

      qss.count++

    }

  }

  for (var i=0; i<qss.stylesheets.length; i++) {

    qss.process(qss.stylesheets[i], i)

  }

}

qss.process = function(stylesheet, count) {

  var tag = document.querySelector('style[data-qss="' + count + '"]')

  if (!tag) {
    tag = document.createElement('style')
    tag.setAttribute('data-qss', count)
    document.head.appendChild(tag)
  }

  tag.innerHTML = qss.apply(
                    qss.query(
                      qss.parser(
                        qss.lexer(stylesheet))))

}

qss.lexer = function(code) {

  // Split string into characters
  var stream = code.split('')

  // Prepare to read characters
  var tokens = []

  // Known characters and types
  var syntax = {
    whitespace: ` 	\n⭿`,
    word: `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,;.:()[]_"'!`,
    number: `1234567890`,
    block: `{}`,
    punctuation: ``,
    operator: `+-*/=<>^%@#&|`
  }

  // Consume stream
  stream.forEach(data => {

    for (type in syntax) {

      if (syntax[type].indexOf(data) !== -1) {

        tokens.push({
          data: data,
          type: type
        })

      }

    }

  })

  return tokens

}

qss.parser = function(tokens) {

  var ast = []

  var blockOpen = false
  var selector = []
  var block = []

  // lump adjacent types together
  tokens.forEach(token => {

    if (blockOpen) {

      if (selector.length > 0) {

        ast.push({
          type: 'selector',
          data: selector
        })
        selector = []

      }

      if (token.type === 'block') {

        ast.push({
          type: 'block',
          data: block
        })

        block = []

      } else {

        block.push(token)

      }

    } else {

      if (token.type !== 'block') {

        selector.push(token)

      }

    }

    if (token.type === 'block') {

      blockOpen = blockOpen ? false : true

    }

  })

  ast = qss.consolidate(ast)

  return ast

}

qss.consolidate = function(ast) {

  var grouped = []

  ast.forEach(token => {

    var current = []

    if (token.type === 'selector') {

      for (var i=0; i<token.data.length; i++) {

        if (current.length && token.data[i].type === current[current.length-1].type) {

          current[current.length-1].data += token.data[i].data

        } else {

          current.push(token.data[i])

        }

      }

      grouped.push({
        type: 'selector',
        data: current
      })

    } else if (token.type === 'block') {

      grouped.push({
        type: 'block',
        data: token
      })

    }

  })

  return grouped

}

qss.query = function(grouped) {

  var selector = ''
  var breakpoint = 0
  var comparator = ''
  var condition = ''
  var conditions = ['width', 'height', 'characters', 'children', 'xscroll', 'yscroll',]
  var comparators = ['<', 'below', 'under', '<=', 'max', '==', 'equals', '>=', 'min', '>', 'above', 'over']
  var queries = []

  grouped.forEach(item => {

    if (item.type === 'selector') {

      selector = ''

      // Strip Whitespace
      var data = qss.stripWhitespace(item.data)
      var end = data.length

      // IF <condition> <comparator> <breakpoint>
      if (

        // If last item is a <breakpoint>
        data[end-1].type === 'number'

        // And second-last item is a <comparator>
        && (

          // Operator
          (data[end-2].type === 'operator' && comparators.indexOf(data[end-2].data) !== -1)

          // Word
          || (data[end-2].type === 'word' && comparators.indexOf(data[end-2].data) !== -1)

        )

        // And third-last item is a <condition>
        && (data[end-3].type === 'word' && conditions.indexOf(data[end-3].data) !== -1)

        // And fourth-last item is 'if'
        && (data[end-4].type === 'word' && data[end-4].data === 'if')

      ) {

        // If query found!
        for (var i=0; i<end-4; i++) {

          selector += data[i].data

        }

        breakpoint = data[end-1].data

        comparator = data[end-2].data

        condition = data[end-3].data

      }

      // @ <comparator> <breakpoint> <condition>
      if (

        // If last item is a <condition>
        (data[end-1].type === 'word' && conditions.indexOf(data[end-1].data) !== -1)

        // And second-last item is a <breakpoint>
        && data[end-2].type === 'number'

        // And third-last item is a <comparator>
        && (

          // Operator
          (data[end-3].type === 'operator' && comparators.indexOf(data[end-3].data) !== -1)

          // Word
          || (data[end-3].type === 'word' && comparators.indexOf(data[end-3].data) !== -1)

        )

        // And fourth-last item is '@'
        && (data[end-4].type === 'operator' && data[end-4].data === '@')

      ) {

        // If query found!
        for (var i=0; i<end-4; i++) {

          selector += data[i].data

        }

        condition = data[end-1].data

        breakpoint = data[end-2].data

        comparator = data[end-3].data

      }

    } else if (selector !== null && item.type === 'block') {

      var rule = ''

      for (var i=0; i<item.data.data.length; i++) {

        rule += item.data.data[i].data.replace(/\n/g, '')

      }

      switch (condition) {

        case 'width':
          condition = 'el.offsetWidth'
          break;

        case 'height':
          condition = 'el.offsetHeight'
          break;

        case 'characters':
          condition = '(el.value === undefined ? el.textContent.length : el.value.length)'
          break;

        case 'children':
          condition = 'el.children.length'
          break;

        case 'xscroll':
          condition = 'el.scrollLeft'
          break;

        case 'yscroll':
          condition = 'el.scrollTop'
          break;

      }

      switch (comparator) {

        case 'below':
        case 'under':
          comparator = '<'
          break;

        case 'max':
          comparator = '<='
          break;

        case 'equals':
          comparator = '=='
          break;

        case 'min':
          comparator = '>='
          break;

        case 'above':
        case 'over':
          comparator = '>'
          break;
      }

      queries.push(`qss.elementQuery('${selector}', el => ${condition} ${comparator} ${breakpoint}, '${rule}')\n`)

    }

  })

  return queries

}

qss.stripWhitespace = function(ast) {

  for (var i=0; i<ast.length; i++) {

    if (
      // If whitespace token
      ast[i].type === 'whitespace'

      // Or an empty word
      || ast[i].type === 'word' && ast[i].data.replace(/\s/g, '') === ''
    ) {

      ast.splice(i, 1)

    }

  }

  return ast

}

qss.apply = function(queries) {

  var style = ''

  queries.forEach(command => {

    style += new Function('return ' + command)()

  })

  return style

}

qss.elementQuery = function(selector, test, rule) {

  var tag = document.querySelectorAll(selector)
  var style = ''
  var count = 0

  for (var i=0; i<tag.length; i++) {

    var attr = (selector+test).replace(/\W+/g, '')

    if (test(tag[i])) {

      tag[i].setAttribute(`data-${attr}`, count)
      style += `[data-${attr}="${count}"] { ${rule} }`
      count++

    } else {

      tag[i].setAttribute(`data-${attr}`, '')

    }

  }

  return style

}

window.addEventListener('load', qss.load)
window.addEventListener('resize', qss.load)
window.addEventListener('input', qss.load)
window.addEventListener('click', qss.load)