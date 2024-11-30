import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import { AddItemCommand, ItemAddedEvent } from '../lib/AddItemSlice.mjs'
import { Organizer } from '../lib/Models.mjs'
import { CommandHandler } from '../lib/CommandHandler.mjs'
import { DecisionStateBuilder } from '../lib/DecisionStateBuilder.mjs'
import { CalendarViewBuilder } from '../lib/CalendarViewBuilder.mjs'
import { HybridLogicalClock } from '../lib/HybridLogicalClock.mjs'
import { getId } from '../lib/EventSource.mjs'
import { CellEditor } from '../lib/CellEditor.mjs'
import MakeKeyValueObservable from '../lib/MakeKeyValueObservable.mjs'
import { JSDOM } from 'jsdom'
import { writeFile } from 'node:fs/promises'
import { CalendarView } from '../lib/CalendarView.mjs'

globalThis.window = new JSDOM(`<!doctype html><html><header></header><body><div contenteditable="true" class="about"></div></body></html>`).window
globalThis.document = window.document

class Delegate {
    constructor() {
    }
    createElement(tag) {
        return document.createElement(tag)
    }
}

class LocalStorage {
    constructor() {
        this.data = new Map()
    }
    getItem(key) {
        return this.data.get(key)
    }
    setItem(key, value) {
        this.data.set(key, value)
        this[key] = value
    }
}

describe('EventStore', async () => {
    let queue = []
    let initialStateBuilder = new DecisionStateBuilder()
    let storage = new LocalStorage()
    let handler = null
    let hlc = new HybridLogicalClock()

    beforeEach(() => {
        initialStateBuilder = new DecisionStateBuilder
        storage = new LocalStorage()
        queue = []
        handler = new CommandHandler(initialStateBuilder, storage, queue)
        handler.start()
    })
    afterEach(() => {
        handler.stop()
    })
    it('should add events to the store when handling a command', async () => {
        let i = 0
        let counter = (nodeId, today) => i++
        handler.add(new AddItemCommand(getId(hlc, randomUUID(), counter, new Date()), new Organizer('test tester', 'test@test.com'), new Date(), new Date(), new Date(), 'this is a new meeting', []))
        await handler.delay(80)
        assert.equal(storage.data.size, 1)
    })
    it('should apply the next event to the view builder', async () => {
        let nodeId = randomUUID()
        let i = 0
        let counter = (nodeId, today) => i++
        let ids = [getId(hlc, nodeId, counter, new Date()), getId(hlc, nodeId, counter, new Date()), getId(hlc, nodeId, counter, new Date())]
        let builder = new CalendarViewBuilder(null, handler, nodeId)
        await builder.start()
        handler.add(new AddItemCommand(ids[0], new Organizer('test tester', 'test@test.com'), new Date(), new Date(), new Date(), 'this is a new meeting', []))
        handler.add(new AddItemCommand(ids[1], new Organizer('test tester', 'test@test.com'), new Date(), new Date(), new Date(), 'this is a 2nd meeting', []))
        handler.add(new AddItemCommand(ids[2], new Organizer('test tester', 'test@test.com'), new Date(), new Date(), new Date(), 'this is a 3rd meeting', []))
        await handler.delay(80)
        let actual = builder.view
        assert.equal(actual.size, 3)
        await builder.stop()
    })
    it('should start at the specified position', async () => {
        let nodeId = randomUUID()
        let i = 0
        let counter = (nodeId, today) => i++
        let ids = [getId(hlc, nodeId, counter, new Date()), getId(hlc, nodeId, counter, new Date()), getId(hlc, nodeId, counter, new Date())]
        handler.add(new AddItemCommand(ids[0], new Organizer('test tester', 'test@test.com'), new Date(), new Date(), new Date(), 'position: this is a new meeting', []))
        handler.add(new AddItemCommand(ids[1], new Organizer('test tester', 'test@test.com'), new Date(), new Date(), new Date(), 'position: this is a 2nd meeting', []))
        handler.add(new AddItemCommand(ids[2], new Organizer('test tester', 'test@test.com'), new Date(), new Date(), new Date(), 'position: this is a 3rd meeting', []))
        let builder = new CalendarViewBuilder(null, handler, nodeId, ids[1])
        await builder.start()
        await handler.delay(80)
        let actual = builder.view
        assert.equal(actual.size, 2)
        assert.ok(!actual.has(ids[0]))
        assert.equal(actual.get(ids[1]).summary, 'position: this is a 2nd meeting')
        await builder.stop()
    })
    it('should project an html view of the calendar month', async () => {
        let nodeId = randomUUID()
        let i = 0
        let counter = (nodeId, today) => i++
        let ids = [getId(hlc, nodeId, counter, new Date()), getId(hlc, nodeId, counter, new Date()), getId(hlc, nodeId, counter, new Date())]
        handler.add(new AddItemCommand(ids[0], new Organizer('Joey Guerra', 'joey@joey.com'), new Date(), new Date(2021, 2, 23, 12, 0, 0), new Date(2021, 2, 23, 13, 0, 0), 'Lunch with Joey', []))
        let builder = new CalendarViewBuilder(null, handler, nodeId, ids[0])
        await builder.start()
        await handler.delay(80)
        let actual = new CalendarView(globalThis.document.createElement('table'), MakeKeyValueObservable({date: new Date()}), new Delegate(), builder)
        actual.render()
        assert.equal(actual.container.querySelector('#day-82').textContent, '23SatLunch with Joey')
        await builder.stop()
    })
})
