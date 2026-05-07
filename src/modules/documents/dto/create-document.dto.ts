import {
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDocumentDto {

  @IsString()
  @MinLength(3,   { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El título no puede superar 150 caracteres' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe estar en formato ISO 8601' })
  responseDeadline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
