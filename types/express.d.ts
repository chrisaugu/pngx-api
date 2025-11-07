import { Request, Response } from 'express';
import { UserRequestBody, UserParams, UserQuery, UserResponse } from './user';

export interface TypedRequestBody<T> extends Request<{}, {}, T> { }
export interface TypedRequestParams<T> extends Request<T> { }
export interface TypedRequestQuery<T> extends Request<{}, {}, {}, T> { }
export interface TypedResponse<T> extends Response<T> { }

export interface UserRequest extends TypedRequestBody<UserRequestBody>, TypedRequestParams<UserParams>, TypedRequestQuery<UserQuery> { }
export interface UserResponseTyped extends TypedResponse<UserResponse> { }