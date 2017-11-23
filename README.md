# QSS

**A Simple Query Syntax for CSS Element Queries**

![](https://i.imgur.com/rntpa7l.png)

The goal of QSS is to define a simple syntax for specifying element queries by adding a new ending part between a CSS selector list and the block of rules that help define the breakpoints when those rules are to apply.

Normally in CSS you have something like this:

```css
selectorList { block }
```

We are going to add a new part for our query between the selector list and the block where we will store instructions for when the rule should apply.

```css
selectorList <query> { block }
```

Because this exists as a new part between the selector list and the block of rules, if you have a list of selectors like `h1, h2, h3, h4, h5, h6 {}` you only need to add the query once after the selector list is complete, like `h1, h2, h3, h4, h5, h6 <query> {}` rather than `h1 <query>, h2 <query>, h3 <query>, …`.

This document describes two different formats for expressing element queries for individual CSS rules, one using an `if`-based structure, and another that uses the `@` symbol to declare when it should apply.

## Phrase Formats

### 1) if &lt;condition> &lt;comparator> &lt;breakpoint>

- operator: `if`
- condition: `width` | `height` | `characters` | `children` | `xscroll` | `yscroll`
- comparator: `<` | `below` | `under` | `<=` | `max` | `==` | `equals` | `>=` | `min` | `>` | `above` | `over`
- breakpoint: &lt;number>

#### Examples

```css
div if width above 500 {}
```

```css
input if characters under 1 {}
```

### 2) @ &lt;comparator> &lt;breakpoint> &lt;condition>

- operator: `@`
- comparator: `<` | `below` | `under` | `<=` | `max` | `==` | `equals` | `>=` | `min` | `>` | `above` | `over`
- breakpoint: &lt;number>
- condition: `width` | `height` | `characters` | `children` | `xscroll` | `yscroll`

#### Examples

```css
div @ above 500 width {}
```

```css
input @ under 1 characters {}
```

In both phrase formats the whitespace between tokens is optional, this means that if you prefer to think about these as `@above` or `@min` you can express them that way. The following should all equivalent:

```css
div if width >= 500 {}
div if width >=500 {}
div if width min 500 {}
div @min 500 width {}
div@min500width{}
div @ >=500 width {}
```

## How it works

The queries parsed by QSS would be split into the following pieces:

- selector list
- rule block (or stylesheet?)
- comparator
- condition
- breakpoint

And these could also be used to construct Element Queries for other syntaxes like:

- [EQCSS](https://github.com/eqcss/eqcss)
- [Selectory](https://github.com/tomhodgins/cssplus#selectory-a-selector-resolver)
- and using functions like the [container query mixin](https://gist.github.com/tomhodgins/fc42b334beaafc75a271b1ef7c8e33ee)

Essentially QSS acts as a syntax to abstract away writing these: [Useful Tests for JS-powered Styling](https://codepen.io/tomhodgins/post/useful-tests-for-js-powered-styling)

## Plugin Usage

This repository contains a working proof of concept of a plugin to parse and read QSS syntax. In order to use this plugin you just need to include QSS on the page where you want it to display:

```html
<script src=qss.js></script>
```

Then you're able to add queries written in QSS syntax to your site using one of the following methods: a `<style>` tag, a `<link>` tag with `type=text/qss` set, or a `<script>` tag with a `type` of `text/qss` either inline or linked externally using a `src=""` attribute:

```html
<style type="text/qss"></style>
```

```html
<link type="text/qss" href=stylesheet.qss rel=stylesheet>
```

```html
<script type="text/qss"></script>
```

```html
<script type="text/qss" src=stylesheet.qss></script>
```

## Links

- Website: [tomhodgins.github.io/qss/](http://tomhodgins.github.io/qss/)
- Element Query Demo: [tests/](http://tomhodgins.github.io/qss/tests/element-queries.html)
- Test: [tests/](http://tomhodgins.github.io/qss/tests/)
- [QSS Playground](https://codepen.io/tomhodgins/pen/zPzpVR)