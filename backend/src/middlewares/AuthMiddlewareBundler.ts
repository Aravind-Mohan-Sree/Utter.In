import { IAuthenticate } from './Authenticate';
import { IAuthorize } from './Authorize';

export class AuthMiddlewareBundler {
  constructor(
    private _authenticate: IAuthenticate,
    private _authorize: IAuthorize,
    private _role: string,
  ) {}

  verify = () => [
    this._authenticate.verify,
    this._authorize.checkRole(this._role),
  ];
}
