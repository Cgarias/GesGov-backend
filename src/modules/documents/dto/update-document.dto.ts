import { PartialType }                    from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { CreateDocumentDto }               from './create-document.dto';
import { DocumentStatus }                  from '../../../common/enums/document-status.enum';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  @IsDateString()
  respondedAt?: string;
}
