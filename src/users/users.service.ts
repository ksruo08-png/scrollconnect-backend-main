import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, MoreThanOrEqual, Repository } from 'typeorm';
import { User } from './user.entity';
import { QueryUsersDto } from './dto/query-users.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<User>) {
    return this.repo.save(this.repo.create(data));
  }
  async findAll(q: QueryUsersDto) {
  const base: any = {};
  if (q.createdAfter) {
    base.createdAt = MoreThanOrEqual(new Date(q.createdAfter));
  }

  // search: name YA email match (array = OR)
  const where = q.search
    ? [
        { ...base, name: Like(`%${q.search}%`) },
        { ...base, email: Like(`%${q.search}%`) },
      ]
    : base;

  const [data, total] = await this.repo.findAndCount({
    where,
    select: { id: true, name: true, email: true, createdAt: true }, // password nahi
    order: { [q.sortBy]: q.order },
    skip: (q.page - 1) * q.limit,
    take: q.limit,
  });

  return {
    data,
    meta: {
      total,
      page: q.page,
      limit: q.limit,
      totalPages: Math.ceil(total / q.limit),
    },
  };
}
}