import { IHookedResponse } from '../hooked-response.interface';

export interface IQuery<T = any> extends IHookedResponse<T> {}
