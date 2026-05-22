import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot() {
    return {
      service: 'api',
      status: 'ok',
      message: 'AKTI ERP API scaffold is running',
    };
  }

  getHealth() {
    return {
      service: 'api',
      status: 'healthy',
    };
  }
}
