import { Injectable, Logger } from '@nestjs/common';
import { IChallenge } from './interfaces/challenge.interface';
import { MailerService } from '@nestjs-modules/mailer';
import { ClientProxySmartRanking } from './proxyrmq/client-proxy.provider';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { IPlayer } from './interfaces/player.interface';
import markupHTML from './static/html-notification-rival-on-new-challenge';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly mailService: MailerService,
    private readonly clientSmartRanking: ClientProxySmartRanking,
  ) {}

  private clientAdminBackend: ClientProxy =
    this.clientSmartRanking.getClientProxyInstance('admin');

  async sendNotification(challenge: IChallenge) {
    this.logger.log(
      `Sending notification for challenge ${JSON.stringify(
        challenge,
        null,
        2,
      )}`,
    );

    try {
      /**
       * Identify the user to whom the notification is to be sent
       */
      const rivalId = challenge.players.find(
        (player) => player !== challenge.requester,
      );

      /**
       * Get players data
       */
      const rival = await this.clientAdminBackend
        .send('get-players', rivalId)
        .toPromise();

      this.logger.log(`Rival data: ${JSON.stringify(rival, null, 2)}`);

      const requester: IPlayer = await this.clientAdminBackend
        .send('get-players', challenge.requester)
        .toPromise();

      /**
       * Set the notification content
       */
      const notification = {
        title: 'New challenge!',
        body: markupHTML
          .replace(/#RIVAL_NAME#/g, rival.name)
          .replace(/#REQUESTER_NAME#/g, requester.name),
      };

      /**
       * Send the notification
       */
      const sentEmail = await this.mailService.sendMail({
        to: rival.email,
        subject: notification.title,
        html: notification.body,
      });

      this.logger.log(
        `Notification sent to ${rival.name} <${rival.email}> for challenge ${challenge._id}`,
      );

      /**
       * Extract the preview message ID of the sent email from Ethereal and log it
       */
      const regex = /(?<=new MSGID=)(.+[^\]])/g;

      const preview = (sentEmail.response as string).match(regex);
      this.logger.log(`Preview: https://ethereal.email/message/${preview}`);
    } catch (error) {
      this.logger.error(error);
      throw new RpcException(error.message);
    }
  }
}
