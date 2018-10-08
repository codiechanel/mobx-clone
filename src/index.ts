const MobxCloneGlobalStack = []

export const MakeObservable = (target: any, key: string) => {
  /**
   * the param will be overwritten if user
   * specified an initial value for the class property
   * why did the key disappeared?
   */

  let value = new ObservableClass(undefined)
  Object.defineProperty(target, key, {
    set: value.set,
    get: value.get,
    enumerable: true
  })
}

class MapHandler {
  observable: ObservableClass
  value: any
  constructor(value) {
    /**
     * we dont need to pass in value
     * in ObservableClass
     */
    this.value = value
    this.observable = new ObservableClass(undefined)
  }
  get = (targetObj, propName, receiverProxy) => {
    let ret = Reflect.get(targetObj, propName, receiverProxy)
    console.log("get(" + propName.toString() + "=" + ret + ")")
    switch (propName.toString()) {
      case "clear":
      case "set":
        console.log("set/clear detected...informing observers")
        this.observable.observers.forEach(o => o.run())
        break
      default:
        if (MobxCloneGlobalStack.length > 0) {
          console.log("adding dependency for map")
          MobxCloneGlobalStack[MobxCloneGlobalStack.length - 1].addDependency(
            this.observable
          )
        }
    }

    if (typeof ret === "function") {
      // ***
      ret = ret.bind(targetObj) // ***
    } // ***
    return ret
  }

  set = (targetObj, propName, propValue, receiverProxy) => {
    console.log("set is called on map")

    console.log("set(" + propName.toString() + "=" + propValue + ")")
    return Reflect.set(targetObj, propName, propValue, receiverProxy)
  }
}
export function observable(value) {
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      const proxyToArray = new Proxy(value, new ArrHandler())
      return proxyToArray
    } else if (isES6Map(value)) {
      //   const proxyToArray = new Proxy(value, new MapHandler(value))
      //   return proxyToArray
      return new ObservableMap(value)
    } else {
      let newObj = {}
      extendObservable(newObj, value)
      return newObj
    }
  } else {
    // lets box it
    let result = new ObservableClass(value)
    return result
  }
}
function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function isES6Map(thing): boolean {
  return thing instanceof Map
}

class ArrHandler {
  value: ObservableClass
  constructor() {
    this.value = new ObservableClass(undefined)
  }
  get = (target, property) => {
    console.log("getting " + property + " for " + target)
    if (MobxCloneGlobalStack.length > 0) {
      MobxCloneGlobalStack[MobxCloneGlobalStack.length - 1].addDependency(
        this.value
      )
    }

    // property is index in this case
    let result = target[property]
    console.log("array result", result)

    return result
  }
  set = (target, property, value, receiver) => {
    console.log("changing the array")

    console.log(
      "setting " + property + " for " + target + " with value " + value
    )
    target[property] = value
    // you have to return true to accept the changes
    /**
     * we filter out this change to avoid double run
     *
     */
    if (property !== "length") {
      this.value.observers.forEach(o => o.run())
    }

    return true
  }
}

function extendObservable(target, source) {
  // source.keys.forEach(key => {
  Object.keys(source).forEach(key => {
    // const value = observable(source[key])
    const value = new ObservableClass(source[key])
    /**
     * we dont need this
     *
     */
    // target[key] = value

    /**
     * this is short hand notation
     * long version is get: get()
     */
    Object.defineProperty(target, key, {
      set: value.set,
      // set(newValue) {
      //   value.set(newValue)
      // },
      get: value.get
      // get() {
      //   return value.get()
      // }
    })
  })
}

export function autorun(thunk) {
  const observing = []
  const reaction = {
    addDependency: observable => {
      observing.push(observable)
    },
    run: function() {
      MobxCloneGlobalStack.push(this)
      observing.splice(0).forEach(o => o.unsubscribe(this))
      thunk()
      observing.forEach(o => {
        o.subscribe(this)
      })
      // MobxCloneGlobalStack.pop(this);
      MobxCloneGlobalStack.pop()
    }
  }
  reaction.run()
}

class ObservableMap {
  value
  observers = []
  subscribe(observer) {
    this.observers.push(observer)
  }
  unsubscribe(observer) {
    this.observers.splice(this.observers.indexOf(observer), 1)
  }
  entries() {
    if (MobxCloneGlobalStack.length > 0) {
      MobxCloneGlobalStack[MobxCloneGlobalStack.length - 1].addDependency(this)
    }

    return this.value.entries()
  }
  replace(newMap) {
    this.value = newMap
    this.observers.forEach(o => o.run())
  }
  // set = newValue => {
  //   console.log("settng value", newValue)

  //   this.value = newValue
  //   this.observers.forEach(o => o.run())
  // }
  // get = () => {
  //   console.log("getting value", this.value)

  //   MobxCloneGlobalStack[MobxCloneGlobalStack.length - 1].addDependency(this)
  //   return this.value
  // }
  constructor(initialValue) {
    this.value = initialValue
  }
}

class ObservableClass {
  value
  observers = []
  subscribe(observer) {
    this.observers.push(observer)
  }
  unsubscribe(observer) {
    this.observers.splice(this.observers.indexOf(observer), 1)
  }
  set = newValue => {
    console.log("settng value", newValue)

    this.value = newValue
    this.observers.forEach(o => o.run())
  }
  get = () => {
    if (MobxCloneGlobalStack.length > 0) {
      MobxCloneGlobalStack[MobxCloneGlobalStack.length - 1].addDependency(this)
    }

    return this.value
  }
  constructor(initialValue) {
    this.value = initialValue
  }
}
