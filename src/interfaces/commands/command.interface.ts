import { IHookedResponse } from '../hooked-response.interface';

export interface ICommand<TResponse = any> extends IHookedResponse<TResponse> {}