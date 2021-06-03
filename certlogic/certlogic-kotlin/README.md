# CertLogic in Kotlin

This module contains the reference implementation of CertLogic, written in Kotlin/Java.

Apart from test sources, it consists of two files:

* [CertLogic type defs and evaluator](./src/main/kotlin/eu/ehn/dcc/certlogic/certlogic.kt)
* A [JsonDateTime](./src/main/kotlin/eu/ehn/dcc/certlogic/JsonDateTime.java) Java class which is used to represent datetimes, as if they were just another type of JSON values.

The implementation relies on Jackson's types to represent JSON values.
