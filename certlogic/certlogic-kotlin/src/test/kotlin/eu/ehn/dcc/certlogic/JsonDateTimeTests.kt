package eu.ehn.dcc.certlogic

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class JsonDateTimeTests {

    fun check(dateTimeLike: String, expected: String) {
        assertEquals(expected, JsonDateTime.fromString(dateTimeLike).asText())
    }

    @Test
    fun `construct a date from a string without time information (compliant with a JSON Schema "date" formatted string)`() {
        check("2021-05-04", "2021-05-04T00:00:00.000Z")
    }

    @Test
    fun `construct date-times from strings in RFC 3339 format (compliant with a JSON Schema "date-time" formatted string)`() {
        check("2021-05-04T13:37:42Z", "2021-05-04T13:37:42.000Z")
        check("2021-05-04T13:37:42+00:00", "2021-05-04T13:37:42.000Z")
        check("2021-05-04T13:37:42-00:00", "2021-05-04T13:37:42.000Z")
        check("2021-08-20T12:03:12+02:00", "2021-08-20T12:03:12.000+02:00")     // (keeps timezone offset)
    }

    @Test
    fun `construct date-times from strings in non-RFC 3339 but ISO 8601 formats`() {
        check("2021-08-20T12:03:12+02", "2021-08-20T12:03:12.000+02:00")
        check("2021-05-04T13:37:42+0000", "2021-05-04T13:37:42.000Z")
        check("2021-05-04T13:37:42-0000", "2021-05-04T13:37:42.000Z")
        check("2021-08-20T12:03:12+0200", "2021-08-20T12:03:12.000+02:00")
    }

    @Test
    fun `construct date-times from strings which also have millisecond info`() {
        check("2021-08-01T00:00:00.1Z", "2021-08-01T00:00:00.100Z")       // 100 ms
        check("2021-08-01T00:00:00.01Z", "2021-08-01T00:00:00.010Z")      //  10 ms
        check("2021-08-01T00:00:00.001Z", "2021-08-01T00:00:00.001Z")     //   1 ms
        check("2021-08-01T00:00:00.0001Z", "2021-08-01T00:00:00.000Z")    // 100 µs
        check("2021-08-01T00:00:00.00001Z", "2021-08-01T00:00:00.000Z")   //  10 µs
        check("2021-08-01T00:00:00.000001Z", "2021-08-01T00:00:00.000Z")  //   1 µs
    }

}