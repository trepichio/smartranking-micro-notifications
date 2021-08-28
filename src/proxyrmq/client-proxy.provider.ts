import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class ClientProxySmartRanking {
  private clientProxyAdminInstance: ClientProxy;
  private clientProxyChallengesInstance: ClientProxy;
  private clientProxyRankingsInstance: ClientProxy;
  private configService = new ConfigService();

  private getClientProxyAdminBackendInstance(): ClientProxy {
    if (!this.clientProxyAdminInstance) {
      this.clientProxyAdminInstance = this.createClientProxy('admin-backend');
    }
    return this.clientProxyAdminInstance;
  }

  private getClientProxyChallengesBackendInstance(): ClientProxy {
    if (!this.clientProxyChallengesInstance) {
      this.clientProxyChallengesInstance =
        this.createClientProxy('challenges-backend');
    }
    return this.clientProxyChallengesInstance;
  }

  private getClientProxyRankingsBackendInstance(): ClientProxy {
    if (!this.clientProxyRankingsInstance) {
      this.clientProxyRankingsInstance =
        this.createClientProxy('rankings-backend');
    }
    return this.clientProxyRankingsInstance;
  }

  private createClientProxy(queueName: string): ClientProxy {
    const [
      BROKER_USER,
      BROKER_PASSWORD,
      BROKER_IP,
      BROKER_VIRTUAL_HOST,
      BROKER_PORT,
    ] = [
      this.configService.get<string>('BROKER_USER'),
      this.configService.get<string>('BROKER_PASSWORD'),
      this.configService.get<string>('BROKER_IP'),
      this.configService.get<string>('BROKER_VIRTUAL_HOST'),
      this.configService.get<number>('BROKER_PORT'),
    ];

    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${BROKER_USER}:${BROKER_PASSWORD}@${BROKER_IP}:${BROKER_PORT}/${BROKER_VIRTUAL_HOST}`,
        ],
        queue: queueName,
      },
    });
  }

  getClientProxyInstance(serviceName: string): ClientProxy {
    switch (serviceName) {
      case 'admin':
        return this.getClientProxyAdminBackendInstance();
      case 'challenges':
        return this.getClientProxyChallengesBackendInstance();
      case 'rankings':
        return this.getClientProxyRankingsBackendInstance();
    }
  }
}
