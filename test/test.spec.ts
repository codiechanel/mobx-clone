import { observable, MakeObservable, autorun } from "../src"
// import { observable, MakeObservable, autorun } from "../dist"
import { assert } from "chai"

// var assert = require("assert")
// describe("Array", function() {
//   describe("#indexOf()", function() {
//     it("should return -1 when the value is not present", function() {
//       assert.equal([1, 2, 3].indexOf(4), -1)
//     })
//   })
// })

describe("Observable Object", function() {
  describe("#observable()", function() {
    it("should be the best", function() {
      class Person {
        nice
        other = "other"
      }
      let person = new Person()
      let p = observable(person)
      assert.equal(p.other, "other", "foo equal `bar`")
      assert.equal(p.nice, undefined, "foo equal `bar`")
      // assert.equal([1, 2, 3].indexOf(4), -1)
      // console.log(p.other)

      // assert.equal([1, 2, 3].indexOf(4), -1)
    })
  })
  describe("#observable.box()", function() {
    it("should be the box", function() {
      let p = observable("cool")
      assert.equal(p.get(), "cool", "is cool")
    })
  })
  describe("#decorator observable", function() {
    it("should decorator be the box", function() {
      class Person {
        nice
        @MakeObservable
        other = "other"
      }
      let person = new Person()
      // console.log(person.other);
      assert.equal(person.other, "other", "is cool")
    })
  })
})
