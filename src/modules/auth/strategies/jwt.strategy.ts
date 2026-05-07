import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService }                      from '@nestjs/config';
import { InjectModel }                        from '@nestjs/mongoose';
import { PassportStrategy }                   from '@nestjs/passport';
import { ExtractJwt, Strategy }               from 'passport-jwt';
import { Model }                              from 'mongoose';
import { User, UserDoc }                      from '../schemas/user.schema';

export interface JwtPayload {
  sub:   string;   // user _id
  email: string;
  role:  string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDoc>,
  ) {
    super({
      jwtFromRequest:   ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:      config.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userModel.findById(payload.sub).exec();
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Sesión inválida o usuario inactivo');
    }
    // El objeto retornado se adjunta a request.user
    return { _id: user._id, email: user.email, name: user.name, role: user.role };
  }
}
