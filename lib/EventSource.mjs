class Command {
    constructor(id) {
        this.id = id
    }
}
class Event {
    constructor(id) {
        this.id = id
        this.kind = this.constructor.name
    }
}
let clock = null
function getId (hlc, nodeId, counter, today = new Date()) {
    if (!clock) {
        clock = hlc.init(today.getTime().toString(), counter(nodeId, today), nodeId)
    } else {
        clock = hlc.increment(clock, today.getTime())
    }
    return hlc.serialize(clock)
}
export { Command, Event, getId }