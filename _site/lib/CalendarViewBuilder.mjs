import { CalendarEvent } from './Models.mjs'

class CalendarViewBuilder {
    #shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    #shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat']
    #position = null
    constructor(view, eventSource, nodeId, position = null) {
        this.view = view ?? new Map()
        this.nodeId = nodeId
        this.#position = position
        this.interval = null
        this.eventSource = eventSource
    }
    findBy (predicate) {
        for (let [key, obj] of this.view.entries()) {
            if (predicate(key, obj)) {
                return obj
            }
        }
        return null
    }
    dayOfTheYear (date) {
        let start = new Date(date.getFullYear(), 0, 0)
        let diff = date - start
        let oneDay = 1000 * 60 * 60 * 24
        return Math.floor(diff / oneDay)
    }
    toMonthDisplay(event) {
        return `${event.dtstart.toLocaleString('default', { month: 'long' })} ${event.dtstart.getFullYear()}`
    }
    toDayDisplay(event) {
        return event.dtstart.getDate()
    }
    toTimeDisplay(event) {
        return `${event.dtstart.toLocaleString('default', { hour: 'numeric', minute: 'numeric', hour12: true })}`
    }
    async start() {
        let interval = window && window.requestAnimationFrame ? window.requestAnimationFrame : setInterval
        this.interval = interval(() => {
            for (let event of this.eventSource.getEvents(this.#position, this.nodeId)) {
                this.apply([event])
                this.#position = event.id
            }
        }, 60)
    }
    async stop() {
        let cancel = window && window.cancelAnimationFrame ? window.cancelAnimationFrame : clearInterval
        cancel(this.interval)
    }
    apply(events) {
        events.reduce((v, event) => {
            return this[event.kind](v, event) // match the event kind to a method
        }, this.view)
        return this.view
    }
    ItemAddedEvent(view, event) {
        view.set(event.id, new CalendarEvent(event.id, event.organizer, event.dtstamp, event.dtstart, event.dtend, event.summary, event.attendees))
        return view
    }
}

export { CalendarViewBuilder }