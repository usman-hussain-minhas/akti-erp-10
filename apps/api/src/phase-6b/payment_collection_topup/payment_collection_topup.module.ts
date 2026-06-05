import { Module } from '@nestjs/common';

import { PaymentCollectionTopupController } from './payment_collection_topup.controller';
import { PaymentCollectionTopupService } from './payment_collection_topup.service';

@Module({
  controllers: [PaymentCollectionTopupController],
  providers: [PaymentCollectionTopupService],
  exports: [PaymentCollectionTopupService],
})
export class PaymentCollectionTopupModule {}
