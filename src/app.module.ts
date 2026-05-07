import { Module }                      from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule }              from '@nestjs/mongoose';
import { DocumentsModule }             from './modules/documents/documents.module';
import { AuthModule }                  from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),

    AuthModule,
    DocumentsModule,
  ],
})
export class AppModule {}
