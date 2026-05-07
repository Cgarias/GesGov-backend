import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument }            from 'mongoose';
import { DocumentStatus }              from '../../../common/enums/document-status.enum';

export type DocumentDoc = HydratedDocument<DocumentEntity>;

@Schema({ timestamps: true, collection: 'documents' })
export class DocumentEntity {

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop()
  responseDeadline?: Date;

  @Prop({
    type:    String,
    enum:    DocumentStatus,
    default: DocumentStatus.PENDIENTE,
  })
  status: DocumentStatus;

  @Prop()
  respondedAt?: Date;

  @Prop({ trim: true })
  notes?: string;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentEntity);
