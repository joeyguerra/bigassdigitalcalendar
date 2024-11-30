import { AddSlice, AddItemCommand, ItemAddedEvent } from './AddItemSlice.mjs'
import { HybridLogicalClock } from './HybridLogicalClock.mjs'

class CommandHandler {
    constructor(stateBuilder, storage, queue = []) {
        this.stateBuilder = stateBuilder
        this.storage = storage
        this.queue = queue
        this.interval = null
        this.hlc = new HybridLogicalClock()
        this.minDate = new Date(1970, 1, 1)
    }
    *getEvents(from, nodeId) {
        let right = this.hlc.init(this.minDate.getTime(), 0, nodeId)
        if (from) {
            right = this.hlc.deserialize(from)
        }
        for (let key of Object.keys(this.storage)) {
            let left = this.hlc.deserialize(key)
            if(this.hlc.compareClocks(left, right) >= 0) {
                yield this.storage.getItem(key)
            }
        }
    }
    add(command) {
        this.queue.push(command)
    }
    *handle(state, command) {
        for (let slice of [
            new AddSlice()
        ]){
            for (let event of slice[command.constructor.name](state, command)) {
                yield event
            }
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    start() {
        this.interval = setInterval(() => {
            if(this.queue.length === 0) return
            let command = this.queue.shift()
            let events = this.storage.getItem(command.id)
            let state = this.stateBuilder.apply(events)
            for (let event of this.handle(state, command)) {
                this.storage.setItem(event.id, event)
            }
        }, 10)
    }
    stop() {
        clearInterval(this.interval)
    }
}
export { CommandHandler }