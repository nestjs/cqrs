import { Abstract, Scope, Type, } from "@nestjs/common";

export type ClientProvider<T = any> = {
    useValue: string;
} | {
    useClass: string;
    scope?: Scope;
} | {
    useValue: T;
} | {
    useFactory: (...args: any[]) => T;
    inject?: Array<Type<any> | string | symbol | Abstract<any> | Function>;
    scope?: Scope;
} | {
    useExisting: any;
}
