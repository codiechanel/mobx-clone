# mobx-clone

## How mobx works under the hood

```javascript
componentDidMount() {
  autorun(()=>{
    this.render()
  })
}
```

What autorun does is registers itself in some global stack array.

Then when some observable is accessed, it reads the latest entry in the global stack, and calls one of its methods: add dependency.

Now this creates the link between the observable and the observer.

Now whenever user tries to modify the observable, it triggers a call to the observer.

Now what happens when you have multiple autoruns like

```javascript
autorun(()=>{
  someMethod() {
    autorun(()=>{
      someObservable.get()
    }
  }

})
```

Since an observable only reads the latest entry in the global stack, it will only use the second autorun. So the first auto run won't re-trigger when the observable changes.

This is how the computed method works.

```javascript
function computed(thunk) {
  var current = observable(undefined)
  autorun(() => {
    current.set(thunk())
  })
  return current
}
```

Perhaps transactions in mobx also works this way, except that it uses an internal flag to tell the observables not to invoke the `run` method. Then at the end of the transaction, it notifies the autorun that something have changed.

```javascript
autorun(()=>{
  transaction() {
    autorun(()=>{
      /**
       * modify observables here
       */
    }
     /**
       * notify the first autorun
       */
  }

})
```

>

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save mobx-clone
```

## Usage

```tsx
import * as React from "react"

import MyComponent from "mobx-clone"

class Example extends React.Component {
  render() {
    return <MyComponent />
  }
}
```

## License

MIT © [codiechanel](https://github.com/codiechanel)
