import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyrmqModule } from './proxyrmq/proxyrmq.module';
import { MailerModule } from '@nestjs-modules/mailer';
import * as nodemailer from 'nodemailer';
import { ClientProxySmartRanking } from './proxyrmq/client-proxy.provider';

const logger = new Logger('AppModule');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, expandVariables: true }),
    ProxyrmqModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const account = {} as any;
        const isDevMode: boolean =
          configService.get<string>('NODE_ENV') === 'development';

        logger.log(`isDevMode: ${isDevMode}`);

        if (isDevMode) {
          /**
           * Generate Authentication for SMTP (for Testing purposes only)
           * For production use, use your own credentials
           */
          const testAccount = await nodemailer.createTestAccount();
          account.user = testAccount.user; // generated ethereal user
          account.pass = testAccount.pass; // generated ethereal password
        } else {
          /**
           * For production use, use your own credentials
           */
          account.user = configService.get<string>('MAIL_USER');
          account.pass = configService.get<string>('MAIL_PASS');
        }

        /**
         * Setup SMTP transport
         */
        return {
          transport: {
            host: configService.get<string>('MAIL_HOST'),
            port: configService.get<number>('MAIL_PORT'),
            secure: false,
            auth: {
              user: account.user,
              pass: account.pass,
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
