# cicada-rs

New repo of this project : https://github.com/xieyuheng/cicada

Aims :
- intuitive to formalize mathematics theories
- approachable for both mathematicians and programmers

Features :
- dependently-typed
- logic programming interface
- with nominal subtyping and inheriting
- uses M-expression as meta syntax

Contains :
- [cicada](cicada/README.md) -- the implementation
- [cicada-wasm](cicada-wasm/README.md) -- cicada wasm interface
- (todo) [cicada-db] -- language server and relational database
- [cic](cic/README.md) -- command line interface

## Getting Start

On command line :
- `cargo +nightly install cic --git https://github.com/xieyuheng/cicada-rs`
- `cic <FILE>`

On line notebook -- empowered by rust wasm target :
- [cicada-notebook](https://cicada-notebook.surge.sh) -- interactive UI

Examples : [cicada/examples](cicada/examples)

## This Repo Also Contains ...

Language implementation practice :
- [jojo](jojo/README.md) -- a dynamic language uses S-expression as meta syntax
- [wissen](wissen/README.md) -- an un-typed logic programming language
- [eopl](eopl/README.md) -- << Essentials of Programming Languages >>
- [kanren](kanren/README.md) -- Jason's microkanren and its Yoneda embedding version

Useful libraries and tools :
- [error-report](error-report/README.md) -- error report in context -- for parser and compiler
- [lexing](lexing/README.md) -- zero copy lexer
- [mexp](mexp/README.md) -- M-expression parser and command line tools
- (todo) [parsing] -- a parser generator with type system -- specifies `.gr` and `.tr` formats

## Contributing

We enforce C4 as collaboration protocol :
- [The C4 RFC](https://rfc.zeromq.org/spec:42/C4)
- [Style Guide](STYLE-GUIDE.md) -- observe the style of existing code and respect it
- CI [![Build Status](https://travis-ci.org/xieyuheng/cicada.svg?branch=master)](https://travis-ci.org/xieyuheng/cicada)

## Code Of Conduct

- [Contributor Covenant Code of Conduct](CODE-OF-CONDUCT.md)

## License

- [GPLv3](LICENSE)
