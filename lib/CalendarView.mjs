import MakeKeyValueObservable from './MakeKeyValueObservable.mjs'
import { CellEditor } from './CellEditor.mjs'
import { CalendarEvent } from './Models.mjs'

class CalendarView {
    #rows = 12
    #shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    #shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat']
    #year = 2024
    #position = null
    constructor(container, model, delegate, builder) {
        this.container = container
        this.model = model
        this.delegate = delegate
        this.builder = builder
        this.model.observe('date', this.#dateChanged.bind(this))
    }
    #cellUpdated (key, old, value) {
        console.log(key, old, value)
    }
    #dateChanged (key, old, value) {
        this.#year = value.getFullYear()
        this.container.innerHTML = ''
        this.render()
    }
    render () {
        for (let month = 0; month < 12; month++) {
            let date = new Date(this.#year, month, 1)
            let row = this.delegate.createElement('tr')
            let header = this.delegate.createElement('th')
            let monthSpan = this.delegate.createElement('span')
            monthSpan.textContent = this.#shortMonths[month]
            header.appendChild(monthSpan)
            row.appendChild(header)
            while (date.getMonth() === month) {
                let td = this.delegate.createElement('td')
                td.setAttribute('id', `day-${this.builder.dayOfTheYear(date)}`)
                if (date.getDay() === 0 || date.getDay() === 6) {
                    td.className = 'weekend'
                }
                td.innerHTML = '<span>' + date.getDate() + '</span><span>' + this.#shortDays[date.getDay()] + '</span><div class="editable"></div>'
                let e = this.builder.findBy((key, obj) => obj.dtstart.getDate() === date.getDate() && obj.dtstart.getMonth() === date.getMonth())
                let model = MakeKeyValueObservable(new CalendarEvent())
                let cell = new CellEditor(td, model, this)
                model.observe('summary', this.#cellUpdated.bind(this))
                if (e) {
                    model.summary = e.summary
                }
                row.appendChild(cell.container)
                date.setDate(date.getDate() + 1)
            }
            this.container.appendChild(row)
        }
    }
}

export { CalendarView }