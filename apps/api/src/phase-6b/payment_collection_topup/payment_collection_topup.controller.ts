import { Controller, Get } from '@nestjs/common';

import { PaymentCollectionTopupService } from './payment_collection_topup.service';

@Controller('phase-6b/payment-collection-topup/scaffold')
export class PaymentCollectionTopupController {
  constructor(private readonly payment_collection_topupService: PaymentCollectionTopupService) {}

  @Get()
  getScaffoldMetadata() {
    return this.payment_collection_topupService.getScaffoldMetadata();
  }
}
