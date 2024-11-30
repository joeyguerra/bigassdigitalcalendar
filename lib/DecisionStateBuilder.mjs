class DecisionStateBuilder {
    constructor() {
        this.state = new Map()
    }
    apply(events) {
        return this.state
    }
}

export { DecisionStateBuilder }