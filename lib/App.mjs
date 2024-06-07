import MakeKeyValueObservable from '/lib/MakeKeyValueObservable.mjs'
import { MarkdownConverter } from '/lib/MarkdownConverter.mjs'
class PageTitle {
    constructor(container, model, delegate) {
        this.container = container || document.body
        this.model = model
        this.delegate = delegate
        this.model.observe('date', this)
    }
    update (key, old, value) {
        this.container.textContent = value.getFullYear() + ' Calendar'
    }
}
class Title {
    #editor = null
    #title = null
    constructor(container, model, delegate) {
        this.container = container || document.body
        this.model = model
        this.delegate = delegate
        this.container.addEventListener('dblclick', this.#switchToEditMode.bind(this), true)
        this.#editor = this.container.querySelector('span')
        this.#editor.addEventListener('blur', this.#save.bind(this), true)
        this.#editor.addEventListener('keydown', this.#keyDown.bind(this), true)
        this.model.observe('date', this)
    }
    #save (e) {
        e.preventDefault()
        this.model.date = new Date(this.#editor.textContent.trim(), 0)
        this.#editor.contentEditable = false
    }
    #keyDown (e) {
        this.#handleArrowUpAndDown(e.key)
        if (e.key === 'Enter') {
            this.#editor.blur()
        }
    }
    #handleArrowUpAndDown (key) {
        if (key === 'ArrowUp') {
            this.#editor.textContent = new Number(this.#editor.textContent) + 1
        }
        if (key === 'ArrowDown') {
            this.#editor.textContent = new Number(this.#editor.textContent) - 1
        }
    }
    #switchToEditMode () {
        this.#editor.contentEditable = 'plaintext-only'
        this.#editor.focus()
    }
    update (key, old, value) {
        this.#editor.textContent = value.getFullYear()
    }
}
class CellEditor {
    #editor = null
    #body = null
    #converter = null
    constructor(container, model, delegate, converter = new MarkdownConverter()) {
        this.container = container || document.body
        this.model = model
        this.delegate = delegate
        this.#converter = converter
        this.container.addEventListener('dblclick', this.#switchToEditMode.bind(this), true)
        this.#editor = this.container.querySelector('.editable')
        this.#editor.addEventListener('blur', this.#save.bind(this), true)
        this.#editor.addEventListener('keydown', this.#keyDown.bind(this), true)
        this.model.observe('body', this)
    }
    #save (e) {
        e.preventDefault()
        this.#editor.contentEditable = false
        console.log(this.#editor.innerHTML, this.model.body)
        this.model.body = this.#editor.innerHTML.replace(/<br>/g, '\n')
    }
    #keyDown (e) {
        if (!e.shiftKey && e.key === 'Enter') {
            this.#editor.blur()
        }
    }
    #stripAllHtml (html) {
        return html.replace(/<[^>]*>?/gm, '')
    }
    #switchToEditMode () {
        this.#editor.contentEditable = 'plaintext-only'
        console.log('body is = ', this.model.body)
        this.#editor.innerHTML = this.model.body.replace(/\n/g, '<br>')
        this.#editor.focus()
    }
    update (key, old, value) {
        this.#editor.innerHTML = this.#converter.toHtml(value)
    }
}
class Calendar {
    #rows = 12
    #shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    #shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat']
    #year = 2024
    constructor(container, model, delegate) {
        this.container = container || document.body
        this.model = model
        this.delegate = delegate
        this.model.observe('date', this)
    }
    update (key, old, value) {
        this.#year = value.getFullYear()
        this.render()
    }
    render () {
        this.container.innerHTML = ''
        for (let i = 0; i < this.#rows; i++) {
            let date = new Date(this.#year, i, 1)
            let row = document.createElement('tr')
            let header = document.createElement('th')
            let monthSpan = document.createElement('span')
            monthSpan.textContent = this.#shortMonths[i]
            header.appendChild(monthSpan)
            row.appendChild(header)
            // loop over the days of the month
            while (date.getMonth() === i) {
                let td = document.createElement('td')
                if (date.getDay() === 0 || date.getDay() === 6) {
                    td.className = 'weekend'
                }
                // fill cell inner html with the day string (mon, tue, wed, thur, fri, sat, sun) and day number
                td.innerHTML = '<span>' + date.getDate() + '</span><span>' + this.#shortDays[date.getDay()] + '</span><div class="editable"></div>'
                let cell = new CellEditor(td, MakeKeyValueObservable({body: ''}), this)
                row.appendChild(cell.container)
                date.setDate(date.getDate() + 1)
            }

            this.container.appendChild(row)
        }
    }
}
class App {
    constructor (model) {
        this.views = []
        this.model = model
        window.addEventListener('popstate', e => {
            let date = new Date(e.state?.year ?? new Date().getFullYear(), 0, 1)
            model.stopObserving('date', this)
            model.date = date
            model.observe('date', this)
        })
        model.observe('date', this)
    }
    update (key, old, value) {
        if (old && value.getFullYear() === old.getFullYear()) return
        if (value.getFullYear() !== new Date().getFullYear()) {
            window.history.pushState({year: value.getFullYear()}, '', '/?year=' + value.getFullYear())
        } else {
            window.history.pushState({}, '', '/')
        }
    }
}
function requestedDate (search) {
    return search.replace('?', '').split('=').reduce((acc, cur, i, arr) => {
        if (i % 2 === 0) {
            acc[cur] = arr[i + 1]
        }
        return acc
    }, {year: new Date().getFullYear()})
}

window.addEventListener('DOMContentLoaded', () => {
    let model = MakeKeyValueObservable({date: null})
    let app = new App(model)
    let calendar = new Calendar(document.querySelector('table'), model, app)
    app.views.push(new Title(document.querySelector('h2'), model, app))
    app.views.push(calendar)
    app.views.push(new PageTitle(document.querySelector('title'), model, app))
    model.date = new Date(requestedDate(window.location.search)?.year ?? new Date().getFullYear(), 0, 1)
    window.model = model
    window.app = app
    document.querySelector('#fullScreenButton').addEventListener('click', () => {
        calendar.container.requestFullscreen()
    })
})