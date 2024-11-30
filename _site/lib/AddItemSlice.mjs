import { Command, Event } from './EventSource.mjs'

class AddItemCommand extends Command {
    constructor(id, organizer, dtstamp, dtstart, dtend, summary, attendees) {
        super(id)
        this.organizer = organizer
        this.dtstamp = dtstamp
        this.dtstart = dtstart
        this.dtend = dtend
        this.summary = summary
        this.attendees = attendees
    }
}
class ItemAddedEvent extends Event {
    constructor(id, organizer, dtstamp, dtstart, dtend, summary, attendees) {
        super(id)
        this.organizer = organizer
        this.dtstamp = dtstamp
        this.dtstart = dtstart
        this.dtend = dtend
        this.summary = summary
        this.attendees = attendees
    }
}

class AddSlice {
    constructor() {}
    AddItemCommand(state, command) {
        return [
            new ItemAddedEvent(command.id, command.organizer, command.dtstamp, command.dtstart, command.dtend, command.summary, command.attendees)
        ]
    }
}

export { AddSlice, AddItemCommand, ItemAddedEvent }