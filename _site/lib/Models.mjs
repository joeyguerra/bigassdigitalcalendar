class Organizer {
    constructor(name, email) {
        this.name = name
        this.email = email
    }
}
class CalendarEvent {
    constructor(uid, organizer, dtstamp, dtstart, dtend, summary, attendees = []) {
        this.uid = uid
        this.organizer = organizer
        this.dtstamp = dtstamp
        this.dtstart = dtstart
        this.dtend = dtend
        this.summary = summary ?? ''
        this.attendees = attendees
    }
    static fromBasicFormat(dateString /* '20240101T000000Z' */) {
        let year = Number(dateString.slice(0, 4));
        let month = Number(dateString.slice(4, 6)) - 1; // Months are 0-indexed in JavaScript
        let day = Number(dateString.slice(6, 8));
        let hours = Number(dateString.slice(9, 11));
        let minutes = Number(dateString.slice(11, 13));
        let seconds = Number(dateString.slice(13, 15));
        return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
    }
    static toBasicFormat(date /* new Date() */) {
        let year = date.getUTCFullYear();
        let month = String(date.getUTCMonth() + 1).padStart(2, '0');
        let day = String(date.getUTCDate()).padStart(2, '0');
        let hours = String(date.getUTCHours()).padStart(2, '0');
        let minutes = String(date.getUTCMinutes()).padStart(2, '0');
        let seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    }
    toICS() {
        let attendeesString = this.attendees.map(attendee => `ATTENDEE;CN=${attendee.name}:MAILTO:${attendee.email}`).join('\n');
        return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//War Hammer, Inc./bigassdigitalcalendar//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${this.uid}
DTSTAMP:${this.dtstamp}
ORGANIZER;CN=${this.organizer.name}:MAILTO:${this.organizer.email}
${attendeesString}
DTSTART:${this.dtstart}
DTEND:${this.dtend}
SUMMARY:${this.summary}
END:VEVENT
END:VCALENDAR`
    }
    static fromICS(icsString) {
        let lines = icsString.split('\n')
        let uid = lines.find(line => line.startsWith('UID:')).split(':')[1]
        let dtstamp = lines.find(line => line.startsWith('DTSTAMP:')).split(':')[1]
        let dtstart = lines.find(line => line.startsWith('DTSTART:')).split(':')[1]
        let dtend = lines.find(line => line.startsWith('DTEND:')).split(':')[1]
        let summary = lines.find(line => line.startsWith('SUMMARY:')).split(':')[1]
        let organizerLine = lines.find(line => line.startsWith('ORGANIZER;'))
        let organizerName = organizerLine.split('=')[1].split(':')[0]
        let organizerEmail = organizerLine.split(':')[1].replace('MAILTO:', '')
        let attendeesLines = lines.filter(line => line.startsWith('ATTENDEE;'))
        let attendees = attendeesLines.map(line => {
            let name = line.split('=')[1].split(':')[0]
            let email = line.split(':')[1].replace('MAILTO:', '')
            return {name, email}
        })
        return new CalendarEvent(uid, {name: organizerName, email: organizerEmail}, dtstamp, dtstart, dtend, summary, attendees)
    }
}

export { Organizer, CalendarEvent }