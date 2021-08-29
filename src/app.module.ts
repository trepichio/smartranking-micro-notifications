import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyrmqModule } from './proxyrmq/proxyrmq.module';
import { MailerModule } from '@nestjs-modules/mailer';
import * as nodemailer from 'nodemailer';
import { ClientProxySmartRanking } from './proxyrmq/client-proxy.provider';

const configService = new ConfigService();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, expandVariables: true }),
    ProxyrmqModule,
    MailerModule.forRootAsync({
      useFactory: async () => {
        /**
         * Generate Authentication for SMTP (for Testing purposes only)
         * For production use, use your own credentials
         */
        let testAccount = await nodemailer.createTestAccount();

        /**
         * Setup SMTP transport
         */
        return {
          transport: {
            host: configService.get<string>('MAIL_HOST'),
            port: configService.get<number>('MAIL_PORT'),
            secure: false,
            auth: {
              /* user: configService.get<string>('MAIL_USER'), */
              /* pass: configService.get<string>('MAIL_PASS'), */
              user: testAccount.user, // generated ethereal user
              pass: testAccount.pass, // generated ethereal password
            },
          },
          defaults: {
            from: configService.get<string>('MAIL_FROM'),
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ClientProxySmartRanking],
})
export class AppModule {}
