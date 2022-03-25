const { deepEqual, equal, isFalse, isTrue } = require("chai").assert

import {
    access, boolsiness,
    dateFromString,
    extractFromUVCI,
    isDictionary,
    isFalsy,
    isInt,
    isTruthy,
    plusTime
} from "../internals"
import { TimeUnit } from "../typings"


describe("dictionaries",() => {

    it("type predicate function works", () => {
        isFalse(isDictionary(undefined))
        isFalse(isDictionary(null))
        isFalse(isDictionary(42.0))
        isFalse(isDictionary("foo"))
        isFalse(isDictionary(new Date()))
        isFalse(isDictionary([]))
        isFalse(isDictionary([ 1, 2, 3 ]))
        isTrue(isDictionary({}))
        isTrue(isDictionary({ "foo": "bar" }))
    })

})


describe("truthy and falsy", () => {

    it("truthy", () => {
        isFalse(isTruthy(undefined))
        isFalse(isTruthy(null))
        isFalse(isTruthy(false))
        isTrue(isTruthy(true))
        isFalse(isTruthy([]), "empty array")
        isTrue(isTruthy([ "foo" ]), "non-empty array")
        isFalse(isTruthy({}), "empty object")
        isTrue(isTruthy({ foo: "bar" }), "non-empty object")
        isTrue(isTruthy("foo"))
        isFalse(isTruthy(""))
        isTrue(isTruthy(42))
        isFalse(isTruthy(0))
    })

    it("falsy", () => {
        isFalse(isFalsy(undefined))
        isTrue(isFalsy(null))
        isTrue(isFalsy(false))
        isFalse(isFalsy(true))
        isTrue(isFalsy([]), "empty array")
        isFalse(isFalsy([ "foo" ]), "non-empty array")
        isTrue(isFalsy({}), "empty object")
        isFalse(isFalsy({ foo: "bar" }), "non-empty object")
        isFalse(isFalsy("foo"))
        isTrue(isFalsy(""))
        isFalse(isFalsy(42))
        isTrue(isFalsy(0))
    })

    it("boolsiness", () => {
        equal(boolsiness(undefined), undefined)
        equal(boolsiness(null), false)
        equal(boolsiness(false), false)
        equal(boolsiness(true), true)
        equal(boolsiness([]), false)
        equal(boolsiness([ "foo" ]), true)
        equal(boolsiness({}), false)
        equal(boolsiness({ foo: "bar" }), true)
        equal(boolsiness("foo"), true)
        equal(boolsiness(""), false)
        equal(boolsiness(42), true)
        equal(boolsiness(0), false)
    })

})


describe("integers", () => {

    it("type predicate function works", () => {
        isFalse(isInt(undefined))
        isFalse(isInt(null))
        isFalse(isInt({}))
        isFalse(isInt([]))
        isFalse(isInt("foo"))
        isFalse(isInt(new Date()))
        isFalse(isInt(Math.PI))
        isFalse(isInt(NaN))
        isFalse(isInt(Infinity))
        isTrue(isInt(0))
        isTrue(isInt(-1))
        isTrue(isInt(42))
    })

})


describe("parsing of dates/date-times", () => {

    const check = (dateTimeLike: string, expected: string, message?: string) => {
        equal(dateFromString(dateTimeLike).toISOString(), expected, message)
    }

    it("construct a date from a string without time information (compliant with a JSON Schema \"date\" formatted string)", () => {
        check("2021-05-04", "2021-05-04T00:00:00.000Z")
        check("2021-05-04", "2021-05-04T00:00:00.000Z")
    })

    it("construct date-times from strings in RFC 3339 format (compliant with a JSON Schema \"date-time\" formatted string)", () => {
        check("2021-05-04T13:37:42Z", "2021-05-04T13:37:42.000Z")
        check("2021-05-04T13:37:42+00:00", "2021-05-04T13:37:42.000Z")
        check("2021-05-04T13:37:42-00:00", "2021-05-04T13:37:42.000Z")
        check("2021-08-20T12:03:12+02:00", "2021-08-20T10:03:12.000Z")   // (keeps timezone offset)
    })

    it("construct date-times from strings in non-RFC 3339 but ISO 8601 formats", () => {
        check("2021-08-20T12:03:12+02", "2021-08-20T10:03:12.000Z")
        check("2021-05-04T13:37:42+0000", "2021-05-04T13:37:42.000Z")
        check("2021-05-04T13:37:42-0000", "2021-05-04T13:37:42.000Z")
        check("2021-08-20T12:03:12+0200", "2021-08-20T10:03:12.000Z")
    })

    it("construct date-times from strings which also have millisecond info", () => {
        check("2021-08-01T00:00:00.1Z", "2021-08-01T00:00:00.100Z")       // 100 ms
        check("2021-08-01T00:00:00.01Z", "2021-08-01T00:00:00.010Z")      //  10 ms
        check("2021-08-01T00:00:00.001Z", "2021-08-01T00:00:00.001Z")     //   1 ms
        check("2021-08-01T00:00:00.0001Z", "2021-08-01T00:00:00.000Z")    // 100 µs
        check("2021-08-01T00:00:00.00001Z", "2021-08-01T00:00:00.000Z")   //  10 µs
        check("2021-08-01T00:00:00.000001Z", "2021-08-01T00:00:00.000Z")  //   1 µs
    })

    it("construct date-times from strings which lack a timezone offset", () => {
        check("2021-08-01", "2021-08-01T00:00:00.000Z")
        check("2021-08-01T00:00:00", "2021-08-01T00:00:00.000Z")
    })

    it("construct date-times from strings which have a \"short\" timezone offset", () => {
        check("2021-08-01T00:00:00+1:00", "2021-07-31T23:00:00.000Z")
    })

    it("should work for some samples from the QA test data", () => {
        check("2021-05-20T12:34:56+00:00", "2021-05-20T12:34:56.000Z", "SI")
        check("2021-06-29T14:02:07Z", "2021-06-29T14:02:07.000Z", "BE")
    })

    it("should work for short forms of DOBs", () => {
        check("1997", "1997-01-01T00:00:00.000Z")
        check("1997-04", "1997-04-01T00:00:00.000Z")
    })

})


describe("plusTime", () => {

    const check = (dateTimeLike: string, amount: number, unit: TimeUnit, expected: string) => {
        equal(plusTime(dateTimeLike, amount, unit).toISOString(), expected)
    }

    it("works for 1-day offsets", () => {
        check("2021-06-23", 1, "day", "2021-06-24T00:00:00.000Z")
        check("2021-06-23", -1, "day", "2021-06-22T00:00:00.000Z")
    })

    it("works for 1-hour offsets", () => {
        check("2021-06-23T00:00:00.000Z", 1, "hour", "2021-06-23T01:00:00.000Z")
        check("2021-06-23T00:00:00.000Z", -1, "hour", "2021-06-22T23:00:00.000Z")
    })

    it("works for day-offsets in hours", () => {
        check("2021-06-23T00:00:00.000Z", 24, "hour", "2021-06-24T00:00:00.000Z")
        check("2021-06-23T00:00:00.000Z", 48, "hour", "2021-06-25T00:00:00.000Z")
        check("2021-06-23T00:00:00.000Z", 72, "hour", "2021-06-26T00:00:00.000Z")
        check("2021-06-23T00:00:00.000Z", -24, "hour", "2021-06-22T00:00:00.000Z")
        check("2021-06-23T00:00:00.000Z", -48, "hour", "2021-06-21T00:00:00.000Z")
        check("2021-06-23T00:00:00.000Z", -72, "hour", "2021-06-20T00:00:00.000Z")
    })

    it("not affected by DST transitions", () => {
        check("2021-06-23", -180, "day", "2020-12-25T00:00:00.000Z")
    })

    // The assertions with even index coincide with the assertions of the test case "comparisons of date-times constructed using plusTime across DST transitions" in `date-times.json` in the test suite:
    it("yields comparable values", () => {
        isFalse(plusTime("2020-12-24", 0, "day") >= plusTime("2021-06-23T00:00:00Z", -180, "day"), "d1 more than 180 days before d2")
        isFalse(plusTime("2020-12-24", 180, "day") >= plusTime("2021-06-23T00:00:00Z", 0, "day"), "d1 more than 180 days before d2")
        isTrue(plusTime("2020-12-25", 0, "day") >= plusTime("2021-06-23T00:00:00Z", -180, "day"), "d1 exactly 180 days before d2")
        isTrue(plusTime("2020-12-25", 180, "day") >= plusTime("2021-06-23T00:00:00Z", 0, "day"), "d1 exactly 180 days before d2")
        isTrue(plusTime("2020-12-26", 0, "day") >= plusTime("2021-06-23T00:00:00Z", -180, "day"), "d1 less than 180 days before d2")
        isTrue(plusTime("2020-12-26", 180, "day") >= plusTime("2021-06-23T00:00:00Z", 0, "day"), "d1 less than 180 days before d2")
    })

    it("works for month offsets", () => {
        check("2021-02-01T00:00:00.000Z", 0, "month", "2021-02-01T00:00:00.000Z")
        check("2021-02-01T00:00:00.000Z", 1, "month", "2021-03-01T00:00:00.000Z")
        check("2021-12-01T00:00:00.000Z", 1, "month", "2022-01-01T00:00:00.000Z")
        check("2021-12-01T00:00:00.000Z", -12, "month", "2020-12-01T00:00:00.000Z")
        check("2020-02-29T00:00:00.000Z", 1, "month", "2020-03-29T00:00:00.000Z")
    })

    it("works for year offsets", () => {
        check("2021-02-01T00:00:00.000Z", 0, "year", "2021-02-01T00:00:00.000Z")
        check("2021-02-01T00:00:00.000Z", 1, "year", "2022-02-01T00:00:00.000Z")
        check("2021-02-01T00:00:00.000Z", -1, "year", "2020-02-01T00:00:00.000Z")
        check("2021-02-01T00:00:00.000Z", 2, "year", "2023-02-01T00:00:00.000Z")
        check("2020-02-29T00:00:00.000Z", 1, "year", "2021-02-28T00:00:00.000Z")
    })

})


describe("extractFromUVCI", () => {

    it("returns null on null operand", () => {
        equal(extractFromUVCI(null, -1), null)
        equal(extractFromUVCI(null, 0), null)
        equal(extractFromUVCI(null, 1), null)
    })

    it("works correctly on an empty string", () => {
        equal(extractFromUVCI("", -1), null)
        equal(extractFromUVCI("", 0), "")
        equal(extractFromUVCI("", 1), null)
    })

    it("foo/bar::baz#999lizards (without optional prefix)", () => {
        const uvci = "foo/bar::baz#999lizards"
        equal(extractFromUVCI(uvci, -1), null)
        equal(extractFromUVCI(uvci, 0), "foo")
        equal(extractFromUVCI(uvci, 1), "bar")
        equal(extractFromUVCI(uvci, 2), "")      // not null, but still falsy
        equal(extractFromUVCI(uvci, 3), "baz")
        equal(extractFromUVCI(uvci, 4), "999lizards")
        equal(extractFromUVCI(uvci, 5), null)
    })

    it("foo/bar::baz#999lizards (with optional prefix)", () => {
        const uvci = "URN:UVCI:foo/bar::baz#999lizards"
        equal(extractFromUVCI(uvci, -1), null)
        equal(extractFromUVCI(uvci, 0), "foo")
        equal(extractFromUVCI(uvci, 1), "bar")
        equal(extractFromUVCI(uvci, 2), "")      // not null, but still falsy
        equal(extractFromUVCI(uvci, 3), "baz")
        equal(extractFromUVCI(uvci, 4), "999lizards")
        equal(extractFromUVCI(uvci, 5), null)
    })

    // the example from the specification:
    it("each separator adds a fragment", () => {
        const uvci = "a::c/#/f"
        equal(extractFromUVCI(uvci, 0), "a")
        equal(extractFromUVCI(uvci, 1), "")
        equal(extractFromUVCI(uvci, 2), "c")
        equal(extractFromUVCI(uvci, 3), "")
        equal(extractFromUVCI(uvci, 4), "")
        equal(extractFromUVCI(uvci, 5), "f")
    })

})


describe("perform data access", () => {

    const assert = (data: any, path: string, expected: any) =>
        deepEqual(access(data, path), expected)

    it("empty string ~ 'it'", () => {
        assert({}, "", {})
        assert([], "", [])
        assert("", "", "")
        assert(null, "", null)
        assert(undefined, "", undefined)
    })

    it("null stays null", () => {
        assert(null, "x", null)
        assert(null, "10", null)
        assert(null, "x.y", null)
        assert(null, "x.0.z", null)
    })

    it("array access", () => {
        const array = [0, 1, 1, 2, 3, 5]
        assert(array, "5", 5)
        assert(array, "-1", null)
        assert(array, "42", null)
    })

    it("access on non-objects/arrays -> null", () => {
        assert("foo", "x", null)
        assert(42, "x", null)
        assert(true, "x", null)
    })

    it("object access", () => {
        const object = { x: "foo" }
        assert(object, "x", "foo")
    })

    it("nested object access", () => {
        const object = { x: [ { z: "foo" } ] }
        assert(object, "x.0.z", "foo")
    })

})

