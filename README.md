[![Nest Logo](http://kamilmysliwiec.com/public/nest-logo.png)](http://kamilmysliwiec.com/)

A lightweight **CQRS** module for [Nest](https://github.com/kamilmysliwiec/nest) framework (node.js)

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  
## Installation

```bash
$ npm install nest-cqrs
```
## Introduction & Usage

Why [CQRS](https://martinfowler.com/bliki/CQRS.html)? Let's have a look at the mainstream approach:

1. Controllers layer handle HTTP requests and delegate tasks to the services.
2. Services layer is the place, where the most of the business logic is being done.
3. Services uses Repositories / DAOs to change / persist entities.
4. Entities are our models - just containers for the values, with setters and getters.

Simple, most popular [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) application with layered architecture. Is it good? Yes, sure. In most cases, there is no reason to make small and medium-sized applications more complicated. So we finished with bigger part of logic in the services and models without any behaviour (btw. they are models still? I don't think so). When our application becomes larger it will be harder to maintain and improve.

Let's change our way of thinking.

To make our application easier to understand, each change has to be preceded by **Command**. If any command is dispatched - application react on it. Commands are dispatched from the services and consumed in appropriate **Command Handlers**.

**Service:**
```typescript
@Component()
export class HeroesGameService {
    constructor(private commandBus: CommandBus) {}

    async killDragon(heroId: string, killDragonDto: KillDragonDto) {
        return await this.commandBus.execute(
            new KillDragonCommand(heroId, killDragonDto.dragonId)
        );
    }
}
```

**Command:**
```typescript
export class KillDragonCommand implements ICommand {
    constructor(
        public readonly heroId: string,
        public readonly dragonId: string) {}
}
```

The **Command Bus** is a commands stream.

Each Command has to have corresponding **Command Handler**:

```typescript
@Component()
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
    constructor(private readonly repository: HeroRepository) {}

    execute(command: KillDragonCommand, resolve: (value?) => void) {
        const { heroId, dragonId } = command;
        const hero = this.repository.findOneById(+heroId);
        
        hero.killEnemy(dragonId);
        await this.repository.persist(hero);
        resolve();
    }
}
```

Now, application state change has to be preceded by **Command**.

TBC

## Example

[Nest CQRS Example repository](https://github.com/kamilmysliwiec/nest-cqrs-example)

## People

Author - [Kamil Myśliwiec](http://kamilmysliwiec.com)

## License

[MIT](LICENSE)

[npm-image]: https://badge.fury.io/js/nest-cqrs.svg
[npm-url]: https://npmjs.org/package/nest-cqrs
[downloads-image]: https://img.shields.io/npm/dm/nest-cqrs.svg
[downloads-url]: https://npmjs.org/package/nest-cqrs
