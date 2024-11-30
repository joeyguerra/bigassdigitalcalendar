/**
 * This implementation of the [Hybric Logical Clocks][1] paper was very much based
 * on [this go implementation][2] and [james long's demo][3]
 *
 * [1]: https://muratbuffalo.blogspot.com/2014/07/hybrid-logical-clocks.html
 * [2]: https://github.com/lafikl/hlc/blob/master/hlc.go
 * [3]: https://github.com/jlongster/crdt-example-app/blob/master/shared/timestamp.js
 */

const ONE_MINUTE = 60 * 1000;

class Clock {
    constructor(timeStamp, count, nodeId) {
        this.timeStamp = timeStamp
        this.count = count
        this.nodeId = nodeId
    }
}

class HybridLogicalClock {
    init(now, count, nodeId){
        return new Clock(now, count, nodeId)
    }
    // 13 digits is enough for the next 100 years, so this is probably fine
    serialize(clock = new Clock(0, 0, null)) {
        return `${clock.timeStamp.toString().padStart(15, '0')}:${clock.count.toString(36).padStart(5, '0')}:${clock.nodeId}`
    }
    deserialize(serializedClock) {
        const [timeStamp, count, nodeId] = serializedClock.split(':')
        return new Clock(parseInt(timeStamp), parseInt(count, 36), nodeId)
    }
    compare(local, remote){
        if (local.timeStamp !== remote.timeStamp) {
            return local.timeStamp - remote.timeStamp
        }
        if(local.count !== remote.count) {
            return local.count - remote.count
        }
        if (local.node == remote.node) {
            return 0
        }
        return local.node < remote.node ? -1 : 1
    }
    compareClocks(a, b) {
        if (a.timeStamp !== b.timeStamp) {
            return a.timeStamp - b.timeStamp
        }
        return a.count - b.count
    }
    increment(local, now){
        if (now > local.timeStamp) {
            return new Clock(now, 0, local.nodeId)
        }
        return new Clock(local.timeStamp, local.count + 1, local.nodeId)
    }
    receive(localClock, remoteClock, now){
        const ts = Math.max(localClock.timeStamp, remoteClock.timeStamp, now)
        if (ts == localClock.timeStamp && ts == remoteClock.timeStamp) {
            return new Clock(ts, Math.max(localClock.count, remoteClock.count) + 1, localClock.nodeId)
        }
        if (ts == localClock.timeStamp) {
            return new Clock(ts, localClock.count + 1, localClock.nodeId)
        }
        if (ts == remoteClock.timeStamp) {
            return new Clock(ts, remoteClock.count + 1, localClock.nodeId)
        }
        return new Clock(ts, 0, localClock.nodeId)
    }
    validate(clock, timeStamp, maxDrift = ONE_MINUTE){
        if (clock.count > Math.pow(36,5)) {
            throw new Error('counter-overflow')
        }
        // if a timestamp is more than 1 minute off from our local wall clock, something has gone horribly wrong.
        if (Math.abs(clock.timeStamp - timeStamp) > maxDrift) {
            throw new Error('clock-off')
        }
        return null
    }
}

export {
    HybridLogicalClock,
    Clock
}