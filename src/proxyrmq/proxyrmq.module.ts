import { Module } from '@nestjs/common';
import { ClientProxySmartRanking } from './client-proxy.provider';

@Module({
  imports: [ClientProxySmartRanking],
  exports: [ClientProxySmartRanking],
})
export class ProxyrmqModule {}
