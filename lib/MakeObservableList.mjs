class ObservableList extends Array {
    constructor(delegate, ...args) {
      super(...args)
      this.delegate = delegate
      Reflect.defineProperty(this, 'size', {
        get: () => this.length
      })
    }
    pop(){
      let last = super.pop()
      this.delegate.changed('pop', last, null)
      return last
    }
    push(item){
      super.push(item)
      this.delegate.changed('push', null, item)
    }
    shift(){
      let first = super.shift()
      this.delegate.changed('shift', null, first)
      return first
    }
    unshift(...items){
      super.unshift(...items)
      this.delegate.changed('unshift', null, items)
      return items.length
    }
    remove(d){
      let i = 0
      let ubounds = this.length
      let deleted = []
      for(i; i<ubounds;i++){
        if(d(this[i], i)){
          deleted = this.splice(i, 1)
          this.delegate.changed('remove', deleted[0], i)
          break
        }
      }
      return deleted[0]
    }
    removeMany(d){
      let i = this.length-1
      let deleted = []
      for(i; i >= 0;i--){
          if(d(this[i], i)){
              deleted.push(this.splice(i, 1)[0])
              this.delegate.changed('remove', deleted[deleted.length-1], i)
          }
      }
      return deleted
    }
    removeAll(){
      this.clear()
    }
    clear(){
      while(this.length > 0) this.pop()
    }
    observe(key, observer){
      this.delegate.observe(key, observer)
    }
    stopObserving(observer){
      this.delegate.stopObserving(observer)
    }
    last(){
      if(this.length === 0) return undefined
      return this[this.length - 1]
    }
    has(item){
      return this.indexOf(item) > -1
    }
    keys(){
      return this.map((item, i) => i)
    }
  }
  
  const MakeObservableList = (...args) => {
    let observers = {}
    return new ObservableList({
      changed(key, old, v){
        if(observers[key]) observers[key].forEach( o => o.update ? o.update(key, old, v) : o(key, old, v))
      },
      observe(key, observer){
        if(!observers[key]) observers[key] = []
        observers[key].push(observer)
      },
      stopObserving(key, observer){
        if(!observers[key]) return
        observers = observers.splice(observers[key].findIndex( o => o === observer), 1)
      }
    }, ...args)
  }
  
  export default MakeObservableList