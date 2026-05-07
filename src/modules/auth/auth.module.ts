import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule }    from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService }    from './auth.service';
import { JwtStrategy }    from './strategies/jwt.strategy';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:      config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '8h' as const },
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers:   [AuthService, JwtStrategy],
  exports:     [JwtModule, PassportModule, MongooseModule],
})
export class AuthModule implements OnModuleInit {
  constructor(private readonly authService: AuthService) {}

  // Crea el usuario admin por defecto al arrancar si la BD está vacía
  async onModuleInit() {
    await this.authService.seedAdmin();
  }
}
