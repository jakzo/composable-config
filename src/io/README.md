# IO Types

Custom `io-ts` types live here. The intention is that over 90% of applications should be able to meet their needs with these types and not have to declare their own custom ones.

`io.ts` contains types from `io-ts` but with conversion from other formats added (eg. instead of failing when passing a string into a `t.number`, it will attempt to cast it to a number).

`ct.ts` contains types which are useful for app configurations (eg. port number and IP address validation).
