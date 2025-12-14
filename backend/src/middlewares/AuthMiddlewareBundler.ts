import { IAuthenticate } from './Authenticate';
import { IAuthorize } from './Authorize';

export class AuthMiddlewareBundler {
  constructor(
    private authenticate: IAuthenticate,
    private authorize: IAuthorize,
    private role: string,
  ) {}

  verify = () => [
    this.authenticate.verify,
    this.authorize.checkRole(this.role),
  ];
}
