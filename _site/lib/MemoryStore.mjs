import {Store} from 'express-session'

const ONE_DAY = 86400000
export default class MemoryStore extends Store {
    #sessions = new Map()
    constructor(){
        super()
    }
    all(callback = ()=>{}){
        let err = null
        let copy = []
        this.#sessions.forEach((value, key) => copy.push({sessionID: key, ...value}))
        callback(err, copy)
    }
    destroy(sid, callback = err=>{}){
        this.#sessions.delete(sid)
        callback(null)
    }
    clear(callback = err=>{}){
        this.#sessions.clear()
        callback(null)
    }
    length(callback = (err, len)=>{}){
        let err = null
        callback(err, this.#sessions.size)
    }
    get(sid, callback = (err, session)=>{}){
        let session = this.#sessions.get(sid)
        if(this.#hasExpired(session)) session = null
        callback(null, session)
    }
    set(sid, session, callback = err=>{}){
        if(!this.#hasExpired(session)) {
            this.#sessions.set(sid, session)
        }
        callback(null)
    }
    touch(sid, session, callback = err=>{}){
        if(!session) return callback(null)
        const expires = typeof session.cookie.expires == 'string' ? new Date(session.cookie.expires) : session.cookie.expires
        session.cookie.expires = new Date(expires + this.#getTtl(session))
        this.set(sid, session)
        callback(null)
    }
    #hasExpired(session){
        if(!session) return true
        const expires = typeof session.cookie.expires == 'string' ? new Date(session.cookie.expires) : session.cookie.expires
        return expires && expires < Date.now()
    }
    #getTtl(sess){
        const maxAge = (sess && sess.cookie) ? sess.cookie.maxAge : null
        return (typeof maxAge === 'number'
            ? Math.floor(maxAge)
            : ONE_DAY)
    }
}