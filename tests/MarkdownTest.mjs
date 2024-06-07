import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

import { MarkdownConverter } from '../lib/MarkdownConverter.mjs'

describe('Markdown', () => {
  beforeEach(async () => {
  })
  afterEach(() => {
  })
  it('converts markdown to html', async () => {
      const converter = new MarkdownConverter()
      const markdown = '# Hello, World!\n\nThis is a paragraph with *emphasis* and [a link](https://example.com).\n\n![An image](https://example.com/image.jpg)'
      let html = converter.toHtml(markdown)
      assert.equal(html, '<h1>Hello, World!</h1>\n<p>This is a paragraph with <em>emphasis</em> and <a href="https://example.com">a link</a>.</p><p><img src="https://example.com/image.jpg" alt="An image" /></p>')
  })
  it('converts html to markdown', async () => {
      const converter = new MarkdownConverter()
      const html = '<h1>Hello, World!</h1><p>This is a paragraph with <em>emphasis</em> and <a href="https://example.com">a link</a>.</p><img src="https://example.com/image.jpg" alt="An image" />'
      const markdown = converter.toMarkdown(html)
      assert.equal(markdown, '# Hello, World!\n\nThis is a paragraph with *emphasis* and [a link](https://example.com).\n\n![An image](https://example.com/image.jpg)')
  })
  it('converts p html tags to correct markdown', async () => {
    let converter = new MarkdownConverter()
    let html = '<p>Hello, World!</p>'
    let markdown = converter.toMarkdown(html)
    assert.equal(markdown, 'Hello, World!')
  })
  it('converts p html tags correctly to markdown when it is part of other html tags like h1', async () => {
    let converter = new MarkdownConverter()
    let html = '<h1>Hello, World!</h1><p>Like this</p>'
    let markdown = converter.toMarkdown(html)
    assert.equal(markdown, '# Hello, World!\n\nLike this')
  })
  it('converts markdown lines to p tags correctly', async () => {
    let converter = new MarkdownConverter()
    let markdown = 'Hello, World!\n\nLike this\n\n'
    let html = converter.toHtml(markdown)
    assert.equal(html, '<p>Hello, World!</p><p>Like this</p>')
  })
  it('converts markdown list to html li', async () => {
    let converter = new MarkdownConverter()
    let markdown = `# Testing Header

- Hello
- World
- !`
    let html = converter.toHtml(markdown)
    assert.equal(html, '<h1>Testing Header</h1>\n<ul><li>Hello</li>\n<li>World</li>\n<li>!</li></ul>')
  })
  it('converts a markdown list with * to html li', async () => {
    let converter = new MarkdownConverter()
    let markdown = `* Hello
* World
* !`
    let html = converter.toHtml(markdown)
    assert.equal(html, '<ul><li>Hello</li>\n<li>World</li>\n<li>!</li></ul>')
  })
  it('converts an html list to markdown list with -', async () => {
    let converter = new MarkdownConverter()
    let html = '<ul><li>Hello</li>\n<li>World</li>\n<li>!</li></ul>'
    let markdown = converter.toMarkdown(html)
    assert.equal(markdown, '- Hello\n- World\n- !')
  })
})