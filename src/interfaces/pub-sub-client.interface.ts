import { Observable } from "rxjs";

export interface IPubSubClient {
    send<TResult = any, TInput = any>(pattern: any, data: TInput): Observable<TResult>;
    emit<TResult = any, TInput = any>(pattern: any, data: TInput): Observable<TResult>;
    subscribeToResponseOf(pattern: any);
}
