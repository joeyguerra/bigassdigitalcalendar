import MakeKeyValueObservable from '/lib/MakeKeyValueObservable.mjs'
import { MarkdownConverter } from '/lib/MarkdownConverter.mjs'
import { CalendarEvent } from '/lib/Models.mjs'
import { DecisionStateBuilder } from '/lib/DecisionStateBuilder.mjs'
import { CommandHandler } from '/lib/CommandHandler.mjs'
import { CalendarViewBuilder } from '/lib/CalendarViewBuilder.mjs'
import { CalendarView } from '/lib/CalendarView.mjs'

function uuidBrowser() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16)
    })
}

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
    createElement(tag) {
        return document.createElement(tag)
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

let eventSource = window.localStorage
let queue = []
let initialStateBuilder = new DecisionStateBuilder()
let handler = new CommandHandler(initialStateBuilder, eventSource, queue)
let nodeId = crypto.randomUUID()
let calendarViewBuilder = new CalendarViewBuilder(null, handler, nodeId)

window.addEventListener('DOMContentLoaded', () => {
    let model = MakeKeyValueObservable({date: null})
    let app = new App(model)
    let calendar = new CalendarView(document.querySelector('table'), model, app, calendarViewBuilder)
    app.views.push(new Title(document.querySelector('h2'), model, app))
    app.views.push(calendar)
    app.views.push(new PageTitle(document.querySelector('title'), model, app))
    model.date = new Date(requestedDate(window.location.search)?.year ?? new Date().getFullYear(), 0, 1)
    window.model = model
    window.app = app
    document.querySelector('#fullScreenButton').addEventListener('click', () => {
        calendar.container.requestFullscreen()
    })
    handler.start()
    calendarViewBuilder.start()
})

window.addEventListener('beforeunload', e => {
    handler.stop()
    calendarViewBuilder.stop()
})