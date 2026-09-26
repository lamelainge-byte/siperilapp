import type { Repository } from 'typeorm';
import { AppDataSource } from '../../../../shared/config/data-source.js';
import type { User as UserDomain } from '../../domain/entities/User.js';
import type { NewUser, UserPort, UserUpdates } from '../../domain/ports/UserPort.js';
import { UserModel } from '../persistence/UserModel.js';

export class UserAdapter implements UserPort {
  private readonly userRepository: Repository<UserModel>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(UserModel);
  }

  private toDomain(entity: UserModel): UserDomain {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      passwordHash: entity.passwordHash,
      company: entity.company,
      role: entity.role,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }

  private toEntity(user: NewUser | UserDomain): UserModel {
    const entity = new UserModel();
    if ('id' in user && user.id) {
      entity.id = user.id;
    } else {
      entity.id = crypto.randomUUID();
    }
    entity.name = user.name;
    entity.email = user.email;
    entity.passwordHash = user.passwordHash;
    entity.company = user.company;
    entity.role = user.role;
    entity.status = user.status;
    entity.createdAt = 'createdAt' in user && user.createdAt ? user.createdAt : new Date();
    return entity;
  }

  async createUser(user: NewUser): Promise<string> {
    const saved = await this.userRepository.save(this.toEntity(user));
    return saved.id;
  }

  async updateUser(id: string, user: UserUpdates): Promise<boolean> {
    const existing = await this.userRepository.findOne({ where: { id } });
    if (!existing) {
      return false;
    }
    Object.assign(existing, {
      name: user.name ?? existing.name,
      email: user.email ?? existing.email,
      passwordHash: user.passwordHash ?? existing.passwordHash,
      company: user.company ?? existing.company,
      role: user.role ?? existing.role,
      status: user.status ?? existing.status,
    });
    await this.userRepository.save(existing);
    return true;
  }

  // baja logica: status 0 oculta la cuenta sin borrarla
  async deleteUser(id: string): Promise<boolean> {
    const existing = await this.userRepository.findOne({ where: { id } });
    if (!existing) {
      return false;
    }
    existing.status = 0;
    await this.userRepository.save(existing);
    return true;
  }

  async getUserById(id: string): Promise<UserDomain | null> {
    const row = await this.userRepository.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  // consulta usada por login y registro para buscar el correo
  async getUserByEmail(email: string): Promise<UserDomain | null> {
    const row = await this.userRepository.findOne({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  async getAllUsers(company?: string): Promise<UserDomain[]> {
    // solo cuentas activas, opcionalmente de una empresa
    const rows = await this.userRepository.find({
      where: { status: 1, ...(company ? { company } : {}) },
      order: { createdAt: 'DESC' },
    });
    return rows.map((row) => this.toDomain(row));
  }
}
