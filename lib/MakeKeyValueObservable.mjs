const MakeKeyValueObservable = obj=>{
    const observers = {}
    const everyKeyObservers = []
    const api = {
        changed(key, old, value){
            if(everyKeyObservers.length > 0) {
                everyKeyObservers.forEach(o=>{
                    o.observer.update ? o.observer.update(key, old, value) : o.observer(key, old, value)
                })
            }
            if(!observers[key]) return
            observers[key].forEach(o=>{
                o.observer.update ? o.observer.update(key, old, value) : o.observer(key, old, value)
            })
        },
        observe(key, observer){
            if(typeof key == 'function') {
                everyKeyObservers.push({key, observer})
                return
            }
            if(!observers[key]) observers[key] = []
            observers[key].push({key, observer})
        },
        stopObserving(key, observer){
            if(typeof key === 'function') {
                const i = everyKeyObservers.findIndex(o => o.key === key)
                if(i == -1) return
                everyKeyObservers.splice(i, 1)
                return
            }
            if(!observers[key]) return
            const i = observers[key].findIndex(o => o.observer === observer)
            if(i == -1) return
            observers[key].splice(i, 1)
        },
        release () {
            Object.keys(observers).forEach(key => {
                observers[key].splice(0, observers[key].length)
            })
            everyKeyObservers.splice(0, everyKeyObservers.length)
        }
    }
    const cached = Object.assign({}, obj)
    const target = {}
    Object.keys(obj).forEach(key=>{
        Reflect.defineProperty(target, key, {
            get(){
                return cached[key]
            },
            set(value){
                const old = cached[key]
                cached[key] = value
                api.changed(key, old, value)
            },
            enumerable: true
        })
    })
    return Object.assign(target, api)
}
export default MakeKeyValueObservable