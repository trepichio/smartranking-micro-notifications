import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Main');

  const configService = new ConfigService();

  const [
    BROKER_USER,
    BROKER_PASSWORD,
    BROKER_IP,
    BROKER_VIRTUAL_HOST,
    BROKER_PORT,
  ] = [
    configService.get<string>('BROKER_USER'),
    configService.get<string>('BROKER_PASSWORD'),
    configService.get<string>('BROKER_IP'),
    configService.get<string>('BROKER_VIRTUAL_HOST'),
    configService.get<string>('BROKER_PORT'),
  ];

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      protocol: Transport.RMQ,
      urls: [
        `amqp://${BROKER_USER}:${BROKER_PASSWORD}@${BROKER_IP}:${BROKER_PORT}/${BROKER_VIRTUAL_HOST}`,
      ],
      queue: 'notifications-backend',
      noAck: false,
    },
  });

  /**
   * Overwrites toJSON method of Date Object in order to print it
   * in Brazilian format and timezone when it is serialized.
   * Every Date object will be affected with implementation.
   */
  Date.prototype.toJSON = function (): any {
    return this.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      formatMatcher: 'best fit',
    });
  };

  await app.listen();
}
bootstrap();
