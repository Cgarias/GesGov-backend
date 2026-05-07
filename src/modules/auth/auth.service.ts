import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel }  from '@nestjs/mongoose';
import { JwtService }   from '@nestjs/jwt';
import { Model }        from 'mongoose';
import * as bcrypt      from 'bcryptjs';
import { User, UserDoc, UserRole } from './schemas/user.schema';
import { RegisterDto }  from './dto/register.dto';
import { LoginDto }     from './dto/login.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDoc>,
    private readonly jwtService: JwtService,
  ) {}

  // ── Registro ────────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const exists = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (exists) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.userModel.create({
      name:     dto.name,
      email:    dto.email.toLowerCase(),
      password: hashed,
      role:     dto.role ?? UserRole.SECRETARY,
      position: dto.position,
      phone:    dto.phone,
    });

    return this.buildResponse(user);
  }

  // ── Login ───────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    // Incluir password explícitamente (select: false en schema)
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase() })
      .select('+password')
      .exec();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return this.buildResponse(user);
  }

  // ── Perfil ──────────────────────────────────────────────────────────────────
  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.sanitize(user);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  private buildResponse(user: UserDoc) {
    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: this.sanitize(user),
    };
  }

  private sanitize(user: UserDoc) {
    return {
      _id:      user._id,
      name:     user.name,
      email:    user.email,
      role:     user.role,
      position: user.position,
      phone:    user.phone,
    };
  }

  // ── Seed: crear admin por defecto si no existe ──────────────────────────────
  async seedAdmin() {
    const count = await this.userModel.countDocuments();
    if (count > 0) return;

    const hashed = await bcrypt.hash('Admin1234!', SALT_ROUNDS);
    await this.userModel.create({
      name:     'Administrador',
      email:    'admin@alcaldia.gov.co',
      password: hashed,
      role:     UserRole.ADMIN,
      position: 'Administrador del Sistema',
    });
    console.log('✅ Usuario admin creado: admin@alcaldia.gov.co / Admin1234!');
  }
}
