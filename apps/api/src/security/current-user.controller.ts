import { Controller, Get, Headers } from '@nestjs/common';

import { CurrentUserService } from './current-user.service';
import { HeaderRecord, resolveTrustedRequestContext } from './request-context';

@Controller('platform/access')
export class CurrentUserController {
  constructor(private readonly currentUserService: CurrentUserService) {}

  @Get('me')
  getCurrentUser(@Headers() headers: HeaderRecord) {
    const context = resolveTrustedRequestContext(headers);
    return this.currentUserService.getCurrentUserProfile(context);
  }
}
