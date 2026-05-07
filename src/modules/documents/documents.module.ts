import { Module }                         from '@nestjs/common';
import { MongooseModule }                 from '@nestjs/mongoose';
import { DocumentsController }            from './documents.controller';
import { DocumentsService }               from './documents.service';
import { DocumentEntity, DocumentSchema } from './schemas/document.schema';
import { AuthModule }                     from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentEntity.name, schema: DocumentSchema },
    ]),
    AuthModule,   // expone JwtModule y PassportModule para el guard
  ],
  controllers: [DocumentsController],
  providers:   [DocumentsService],
})
export class DocumentsModule {}
