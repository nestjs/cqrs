import { WithAggregateRoot } from '../mixins';

// Dummy abstract class used as a base for AggregateRoot (since TypeScript does not allow direct mixin application with abstract classes).
abstract class AbstractBase {}

// Just a constant with our mixin applied, to be extended by AggregateRoot.
export const BaseAggregateRoot = WithAggregateRoot(AbstractBase);
