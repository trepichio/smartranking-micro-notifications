import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private readonly logger = new Logger(AppController.name);

  @EventPattern('notification-new-challenge')
  async onNewChallenge(
    @Payload() payload: any,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      this.appService.sendNotification(payload.challenge);
      await channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
