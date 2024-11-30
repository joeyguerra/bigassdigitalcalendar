import { MarkdownConverter } from './MarkdownConverter.mjs'

class CellEditor {
    #editor = null
    #converter = null
    constructor(container, model, delegate, converter = new MarkdownConverter()) {
        this.container = container
        this.model = model
        this.delegate = delegate
        this.#converter = converter
        this.container.addEventListener('dblclick', this.#switchToEditMode.bind(this), true)
        this.#editor = this.container.querySelector('.editable')
        this.#editor.addEventListener('blur', this.#save.bind(this), true)
        this.#editor.addEventListener('keydown', this.#keyDown.bind(this), true)
        this.model.observe('summary', this)
    }
    #save (e) {
        e.preventDefault()
        this.#editor.contentEditable = false
        this.model.summary = this.#editor.innerHTML.replace(/<br>/g, '\n')
    }
    #keyDown (e) {
        if (!e.shiftKey && e.key === 'Enter') {
            this.#editor.blur()
        }
    }
    #stripallHtml (html) {
        return html.replace(/<[^>]*>?/gm, '')
    }
    #switchToEditMode () {
        this.#editor.contentEditable = 'plaintext-only'
        this.#editor.innerHTML = this.model.summary.replace(/\n/g, '<br>')
        this.#editor.focus()
    }
    update (key, old, value) {
        this.#editor.innerHTML = this.#converter.toHtml(value)
    }
}

export { CellEditor }