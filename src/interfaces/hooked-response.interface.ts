const responseType = Symbol('responseType');

export type IHookedResponse<out TResponse = any> = {
    [responseType]?: TResponse
}

export type HookedResponse<T extends IHookedResponse> =
    unknown extends Required<T>[typeof responseType]
    ? any
    : Required<T>[typeof responseType];