[![Nest Logo](http://kamilmysliwiec.com/public/nest-logo.png)](http://kamilmysliwiec.com/)

A lightweight **CQRS** module for [Nest](https://github.com/kamilmysliwiec/nest) framework (node.js)

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  
## Installation

```bash
$ npm install nest-cqrs
```
## Introduction

Why [CQRS](https://martinfowler.com/bliki/CQRS.html)? Let's have a look at the mainstream approach:

1. Controllers layer handle HTTP requests and delegate tasks to the services.
2. Services layer is the place, where the most of the business logic is being done.
3. Services uses Repositories / DAOs to change / persist entities.
4. Entities are our models - just containers for the values, with setters and getters.

Simple, most popular [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) application with layered architecture. Is it good? Yes, sure. In most cases, there is no reason to make small and medium-sized applications more complicated. So we finished with bigger part of logic in the services and models without any behaviour (btw. they are models still? I don't think so). When our application becomes larger it will be harder to maintain, improve and add new features.

Is there another solution? [...]

## People

Author - [Kamil Myśliwiec](http://kamilmysliwiec.com)

## License

[MIT](LICENSE)

[npm-image]: https://badge.fury.io/js/nest-cqrs.svg
[npm-url]: https://npmjs.org/package/nest-cqrs
[downloads-image]: https://img.shields.io/npm/dm/nest-cqrs.svg
[downloads-url]: https://npmjs.org/package/nest-cqrs
