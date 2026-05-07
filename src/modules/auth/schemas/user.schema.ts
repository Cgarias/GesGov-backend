import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document }                    from 'mongoose';

export type UserDoc = User & Document;

export enum UserRole {
  ADMIN     = 'ADMIN',
  SECRETARY = 'SECRETARY',
  VIEWER    = 'VIEWER',
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })   // select:false → no se devuelve por defecto
  password: string;

  @Prop({ enum: UserRole, default: UserRole.SECRETARY })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ trim: true, maxlength: 80 })
  position?: string;   // Cargo / puesto

  @Prop({ trim: true, maxlength: 20 })
  phone?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
