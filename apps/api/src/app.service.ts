import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot() {
    return {
      service: 'api',
      status: 'ok',
      message: 'Esbla Spark API is running',
    };
  }

  getHealth() {
    return {
      service: 'api',
      status: 'healthy',
    };
  }
}
