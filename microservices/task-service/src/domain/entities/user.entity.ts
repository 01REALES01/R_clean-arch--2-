export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public password: string,
    public role: UserRole,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(props: {
    id?: string;
    email: string;
    password: string;
    role?: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    const now = new Date();
    return new User(
      props.id || '',
      props.email,
      props.password,
      props.role || UserRole.USER,
      props.createdAt || now,
      props.updatedAt || now,
    );
  }
}
