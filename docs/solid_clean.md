Cấu Trúc Dự Án Web Full-Stack Tuân Theo SOLID & Clean Code
Tác giả: Clean Architecture Guide
Ngôn ngữ: Node.js/Express (Backend), React/Vue (Frontend)
Mục đích: Xây dựng hệ thống dễ bảo trì, mở rộng, dễ đọc và tuân theo SOLID principles
________________________________________
📋 Mục Lục
1.	Giới thiệu
2.	Kiến trúc tổng quan
3.	Cấu trúc Backend
4.	Cấu trúc Frontend
5.	Áp dụng SOLID Principles
6.	Clean Code Practices
7.	Ví dụ thực tế
8.	Best Practices
________________________________________
Giới Thiệu
Tại sao cần cấu trúc này?
•	Maintainability (Dễ bảo trì): Code được tổ chức rõ ràng, dễ tìm và sửa lỗi
•	Scalability (Dễ mở rộng): Thêm feature mới không ảnh hưởng code cũ
•	Testability (Dễ test): Tách logic ra, dễ viết unit tests
•	Collaboration (Dễ hợp tác): Team members hiểu code dễ dàng
•	SOLID Compliance: Tuân theo 5 nguyên tắc thiết kế phần mềm
Các SOLID Principles[1]
1.	S - Single Responsibility Principle (SRP): Mỗi class/module chỉ có một trách nhiệm
2.	O - Open/Closed Principle (OCP): Mở để mở rộng, đóng để thay đổi
3.	L - Liskov Substitution Principle (LSP): Subclass có thể thay thế parent class
4.	I - Interface Segregation Principle (ISP): Nhiều interface nhỏ thay vì interface lớn
5.	D - Dependency Inversion Principle (DIP): Phụ thuộc vào abstraction, không concrete
________________________________________
Kiến Trúc Tổng Quan
Mô hình tầng (Layered Architecture)
┌─────────────────────────────────┐
│ Presentation Layer (UI) │ ← Frontend
├─────────────────────────────────┤
│ Application Layer (Routes) │
├─────────────────────────────────┤
│ Domain Layer (Business Logic) │ ← Backend
├─────────────────────────────────┤
│ Data Access Layer (Database) │
└─────────────────────────────────┘
Separation of Concerns
Backend (Node.js + Express)
├── Controllers → Handle HTTP requests/responses
├── Services → Business logic
├── Repositories → Data access (Database)
├── Domain Models → Entity definitions
└── Middlewares → Cross-cutting concerns
Frontend (React/Vue)
├── Pages/Views → Route components
├── Components → Reusable UI components
├── Custom Hooks → Business logic (React)
├── Services → API communication
└── Utils → Helper functions
________________________________________
Cấu Trúc Backend
Thư mục chính
```
backend/
├── src/
│ ├── config/ # Configuration files
│ │ ├── database.ts # Database setup
│ │ ├── env.ts # Environment variables
│ │ └── constants.ts # App constants
│ │
│ ├── domain/ # Business entities & interfaces
│ │ ├── entities/ # Pure business objects
│ │ │ └── User.ts
│ │ │ └── Product.ts
│ │ └── interfaces/ # Contracts (interfaces)
│ │ ├── IUserRepository.ts
│ │ ├── IAuthService.ts
│ │ └── IEmailService.ts
│ │
│ ├── application/ # Use cases & adapters
│ │ ├── use-cases/
│ │ │ ├── user/
│ │ │ │ ├── CreateUserUseCase.ts
│ │ │ │ ├── GetUserUseCase.ts
│ │ │ │ └── UpdateUserUseCase.ts
│ │ │ ├── auth/
│ │ │ │ ├── LoginUseCase.ts
│ │ │ │ └── RegisterUseCase.ts
│ │ │ └── product/
│ │ │ ├── CreateProductUseCase.ts
│ │ │ └── GetProductsUseCase.ts
│ │ ├── dto/ # Data Transfer Objects
│ │ │ ├── CreateUserDto.ts
│ │ │ └── LoginDto.ts
│ │ └── ports/ # External interfaces
│ │ └── IEventEmitter.ts
│ │
│ ├── infrastructure/ # External implementations
│ │ ├── repositories/ # Database access
│ │ │ ├── UserRepository.ts
│ │ │ ├── ProductRepository.ts
│ │ │ └── BaseRepository.ts
│ │ ├── services/ # 3rd-party services
│ │ │ ├── EmailService.ts
│ │ │ ├── HashService.ts
│ │ │ ├── JwtService.ts
│ │ │ └── StorageService.ts
│ │ ├── database/
│ │ │ ├── models/ # Database schemas
│ │ │ │ ├── userModel.ts
│ │ │ │ └── productModel.ts
│ │ │ └── migrations/ # Database migrations
│ │ └── http/ # HTTP clients
│ │ └── ApiClient.ts
│ │
│ ├── presentation/ # Controllers & routes
│ │ ├── controllers/
│ │ │ ├── UserController.ts
│ │ │ ├── AuthController.ts
│ │ │ └── ProductController.ts
│ │ ├── routes/
│ │ │ ├── authRoutes.ts
│ │ │ ├── userRoutes.ts
│ │ │ ├── productRoutes.ts
│ │ │ └── index.ts
│ │ ├── middleware/
│ │ │ ├── errorHandler.ts
│ │ │ ├── authMiddleware.ts
│ │ │ ├── validationMiddleware.ts
│ │ │ ├── corsMiddleware.ts
│ │ │ └── loggingMiddleware.ts
│ │ └── presenters/ # Format response
│ │ └── ApiPresenter.ts
│ │
│ ├── shared/ # Shared utilities
│ │ ├── utils/
│ │ │ ├── validators.ts
│ │ │ ├── helpers.ts
│ │ │ └── formatters.ts
│ │ ├── errors/
│ │ │ ├── AppError.ts
│ │ │ ├── ValidationError.ts
│ │ │ └── NotFoundError.ts
│ │ ├── logger/
│ │ │ └── Logger.ts
│ │ └── types/
│ │ └── common.types.ts
│ │
│ ├── di/ # Dependency Injection
│ │ └── container.ts # IoC container (awilix, etc)
│ │
│ └── app.ts # Express app setup
│
├── tests/
│ ├── unit/
│ │ ├── domain/
│ │ ├── application/
│ │ └── infrastructure/
│ ├── integration/
│ └── e2e/
│
├── .env.example
├── .env.development
├── .env.production
├── package.json
├── tsconfig.json
└── server.ts # Entry point
```
Chi tiết từng layer
1. Domain Layer (Tầng miền)
Trách nhiệm: Chứa business entities và interfaces, không phụ thuộc framework
User.ts - Entity (Pure business object)
```typescript
export class User {
constructor(
private id: string,
private email: string,
private password: string,
private name: string,
private createdAt: Date
) {}
static create(email: string, password: string, name: string): User {
if (!this.isValidEmail(email)) {
throw new Error('Invalid email format');
}
return new User(
this.generateId(),
email,
password,
name,
new Date()
);
}
private static isValidEmail(email: string): boolean {
const emailRegex = /[\s@]+@[\s@]+\.[\s@]+$/;
return emailRegex.test(email);
}
private static generateId(): string {
return user_${Date.now()};
}
// Getters
getId(): string { return this.id; }
getEmail(): string { return this.email; }
getName(): string { return this.name; }
}
```
Interfaces/IUserRepository.ts - Contract for data access
```typescript
import { User } from '../entities/User';
export interface IUserRepository {
save(user: User): Promise<void>;
findById(id: string): Promise<User | null>;
findByEmail(email: string): Promise<User | null>;
update(user: User): Promise<void>;
delete(id: string): Promise<void>;
}
```
2. Application Layer (Tầng ứng dụng)
Trách nhiệm: Use cases, DTO, orchestration logic
CreateUserUseCase.ts - Use case for creating user
```typescript
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { CreateUserDto } from '../dto/CreateUserDto';
export class CreateUserUseCase {
constructor(
private userRepository: IUserRepository,
private hashService: IHashService
) {}
async execute(dto: CreateUserDto): Promise<{ id: string }> {
// Check if user already exists
const existingUser = await this.userRepository.findByEmail(dto.email);
if (existingUser) {
throw new Error('User with this email already exists');
}
// Create user entity
const user = User.create(
  dto.email,
  await this.hashService.hash(dto.password),
  dto.name
);

// Save to repository
await this.userRepository.save(user);

return { id: user.getId() };

}
}
```
CreateUserDto.ts - Data Transfer Object
```typescript
export class CreateUserDto {
email!: string;
password!: string;
name!: string;
static fromRequest(body: any): CreateUserDto {
const dto = new CreateUserDto();
dto.email = body.email?.trim().toLowerCase();
dto.password = body.password;
dto.name = body.name?.trim();
return dto;
}
}
```
3. Infrastructure Layer (Tầng cơ sở hạ tầng)
Trách nhiệm: Implementations của interfaces, database, external services
UserRepository.ts - Implementation of IUserRepository
```typescript
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { UserModel } from '../database/models/userModel';
export class UserRepository implements IUserRepository {
async save(user: User): Promise<void> {
const userData = {
id: user.getId(),
email: user.getEmail(),
name: user.getName(),
password: user.getPassword(),
createdAt: new Date()
};
await UserModel.create(userData);
}
async findById(id: string): Promise<User | null> {
const data = await UserModel.findById(id);
if (!data) return null;
return this.toDomain(data);
}
async findByEmail(email: string): Promise<User | null> {
const data = await UserModel.findOne({ email });
if (!data) return null;
return this.toDomain(data);
}
private toDomain(raw: any): User {
return new User(
raw.id,
raw.email,
raw.password,
raw.name,
raw.createdAt
);
}
}
```
HashService.ts - External service
```typescript
import bcrypt from 'bcrypt';
export interface IHashService {
hash(plainText: string): Promise<string>;
compare(plainText: string, hashed: string): Promise<boolean>;
}
export class HashService implements IHashService {
async hash(plainText: string): Promise<string> {
const saltRounds = 10;
return bcrypt.hash(plainText, saltRounds);
}
async compare(plainText: string, hashed: string): Promise<boolean> {
return bcrypt.compare(plainText, hashed);
}
}
```
4. Presentation Layer (Tầng trình bày)
Trách nhiệm: Controllers, routes, middleware
UserController.ts - Handle HTTP requests
```typescript
import { Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from '../../application/use-cases/user/CreateUserUseCase';
import { CreateUserDto } from '../../application/dto/CreateUserDto';
import { ApiPresenter } from '../presenters/ApiPresenter';
export class UserController {
constructor(
private createUserUseCase: CreateUserUseCase,
private presenter: ApiPresenter
) {}
async create(req: Request, res: Response, next: NextFunction): Promise<void> {
try {
const dto = CreateUserDto.fromRequest(req.body);
const result = await this.createUserUseCase.execute(dto);
res.status(201).json(this.presenter.success(result, 'User created'));
} catch (error) {
next(error);
}
}
}
```
userRoutes.ts - Route definitions
```typescript
import express from 'express';
import { UserController } from '../controllers/UserController';
import { validateUser } from '../middleware/validationMiddleware';
export function createUserRoutes(userController: UserController) {
const router = express.Router();
router.post('/', validateUser, (req, res, next) =>
userController.create(req, res, next)
);
return router;
}
```
5. Dependency Injection Setup
di/container.ts - IoC Container
```typescript
import { createContainer, asClass, asValue } from 'awilix';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { HashService } from '../infrastructure/services/HashService';
import { CreateUserUseCase } from '../application/use-cases/user/CreateUserUseCase';
import { UserController } from '../presentation/controllers/UserController';
export function setupContainer() {
const container = createContainer();
// Register repositories
container.register({
userRepository: asClass(UserRepository).singleton(),
});
// Register services
container.register({
hashService: asClass(HashService).singleton(),
});
// Register use cases
container.register({
createUserUseCase: asClass(CreateUserUseCase).singleton(),
});
// Register controllers
container.register({
userController: asClass(UserController).singleton(),
});
return container;
}
```
________________________________________
Cấu Trúc Frontend
Thư mục chính
```
frontend/
├── src/
│ ├── pages/ # Page components (Route level)
│ │ ├── HomePage/
│ │ │ └── HomePage.tsx
│ │ ├── AuthPage/
│ │ │ └── AuthPage.tsx
│ │ └── NotFoundPage/
│ │ └── NotFoundPage.tsx
│ │
│ ├── features/ # Feature-based organization
│ │ ├── auth/
│ │ │ ├── components/
│ │ │ │ ├── LoginForm.tsx
│ │ │ │ └── RegisterForm.tsx
│ │ │ ├── hooks/
│ │ │ │ ├── useAuth.ts
│ │ │ │ └── useLogin.ts
│ │ │ ├── services/
│ │ │ │ └── authService.ts
│ │ │ ├── types/
│ │ │ │ └── auth.types.ts
│ │ │ └── store/ # State management (Redux/Zustand)
│ │ │ └── authSlice.ts
│ │ ├── user/
│ │ │ ├── components/
│ │ │ ├── hooks/
│ │ │ ├── services/
│ │ │ └── types/
│ │ └── product/
│ │ ├── components/
│ │ ├── hooks/
│ │ ├── services/
│ │ └── types/
│ │
│ ├── components/ # Shared components
│ │ ├── common/
│ │ │ ├── Button.tsx
│ │ │ ├── Modal.tsx
│ │ │ ├── Input.tsx
│ │ │ ├── Card.tsx
│ │ │ └── Layout.tsx
│ │ ├── layout/
│ │ │ ├── Header.tsx
│ │ │ ├── Sidebar.tsx
│ │ │ └── Footer.tsx
│ │ └── forms/
│ │ ├── FormInput.tsx
│ │ └── FormSubmit.tsx
│ │
│ ├── hooks/ # Custom hooks (shared)
│ │ ├── useFetch.ts
│ │ ├── useForm.ts
│ │ ├── useLocalStorage.ts
│ │ └── usePagination.ts
│ │
│ ├── services/ # API communication
│ │ ├── api.ts # Axios/Fetch setup
│ │ ├── userService.ts
│ │ ├── authService.ts
│ │ └── productService.ts
│ │
│ ├── store/ # Global state management
│ │ ├── store.ts # Store setup
│ │ ├── slices/
│ │ │ ├── authSlice.ts
│ │ │ └── userSlice.ts
│ │ └── selectors/
│ │ └── authSelector.ts
│ │
│ ├── types/ # TypeScript type definitions
│ │ ├── index.ts
│ │ ├── api.types.ts
│ │ ├── user.types.ts
│ │ └── auth.types.ts
│ │
│ ├── utils/ # Helper functions
│ │ ├── validators.ts
│ │ ├── formatters.ts
│ │ ├── converters.ts
│ │ └── constants.ts
│ │
│ ├── styles/ # Global styles
│ │ ├── global.css
│ │ ├── variables.css
│ │ └── themes.css
│ │
│ ├── config/
│ │ ├── apiConfig.ts
│ │ └── routes.ts
│ │
│ ├── App.tsx
│ ├── App.css
│ └── index.tsx
│
├── public/
│ ├── index.html
│ └── favicon.ico
│
├── .env.example
├── .env.development
├── .env.production
├── package.json
├── tsconfig.json
└── vite.config.ts (or webpack.config.js)
```
Chi tiết Frontend Architecture
1. Custom Hooks (Tách logic khỏi UI)
useAuth.ts - Custom hook for auth logic
```typescript
import { useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../types/auth.types';
interface UseAuthReturn {
user: User | null;
isLoading: boolean;
error: string | null;
login: (email: string, password: string) => Promise<void>;
logout: () => void;
register: (email: string, password: string, name: string) => Promise<void>;
}
export function useAuth(): UseAuthReturn {
const [user, setUser] = useState<User | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
// Check if user is already logged in
useEffect(() => {
checkAuthStatus();
}, []);
const checkAuthStatus = useCallback(async () => {
try {
setIsLoading(true);
const currentUser = await authService.getCurrentUser();
setUser(currentUser);
setError(null);
} catch (err) {
setUser(null);
setError(null); // Not an error, just not logged in
} finally {
setIsLoading(false);
}
}, []);
const login = useCallback(async (email: string, password: string) => {
try {
setIsLoading(true);
setError(null);
const result = await authService.login(email, password);
setUser(result.user);
} catch (err) {
setError(err instanceof Error ? err.message : 'Login failed');
throw err;
} finally {
setIsLoading(false);
}
}, []);
const logout = useCallback(() => {
authService.logout();
setUser(null);
setError(null);
}, []);
const register = useCallback(
async (email: string, password: string, name: string) => {
try {
setIsLoading(true);
setError(null);
const result = await authService.register(email, password, name);
setUser(result.user);
} catch (err) {
setError(err instanceof Error ? err.message : 'Registration failed');
throw err;
} finally {
setIsLoading(false);
}
},
[]
);
return {
user,
isLoading,
error,
login,
logout,
register,
};
}
```
2. Services (API Communication)
authService.ts - Authentication service
```typescript
import { api } from './api';
import { User, LoginResponse } from '../types/auth.types';
class AuthService {
private static readonly BASE_URL = '/api/auth';
async login(email: string, password: string): Promise<LoginResponse> {
const response = await api.post<LoginResponse>(
${AuthService.BASE_URL}/login,
{ email, password }
);
this.saveToken(response.data.token);
return response.data;
}
async register(
email: string,
password: string,
name: string
): Promise<LoginResponse> {
const response = await api.post<LoginResponse>(
${AuthService.BASE_URL}/register,
{ email, password, name }
);
this.saveToken(response.data.token);
return response.data;
}
async getCurrentUser(): Promise<User> {
const response = await api.get<User>(
${AuthService.BASE_URL}/me
);
return response.data;
}
logout(): void {
this.removeToken();
// Optional: call logout endpoint
}
private saveToken(token: string): void {
localStorage.setItem('authToken', token);
}
private removeToken(): void {
localStorage.removeItem('authToken');
}
getToken(): string | null {
return localStorage.getItem('authToken');
}
}
export const authService = new AuthService();
```
3. Components (UI Layer)
LoginForm.tsx - Smart component using custom hook
```typescript
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FormInput } from '../forms/FormInput';
import { Button } from '../common/Button';
import styles from './LoginForm.module.css';
export const LoginForm: React.FC = () => {
const { login, isLoading, error } = useAuth();
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
try {
await login(email, password);
// Redirect or show success message
} catch (err) {
// Error is already handled in hook
}
};
return (

<FormInput
label="Email"
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
/>
<FormInput
label="Password"
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
/>
{error &&
{error}
}

{isLoading ? 'Logging in...' : 'Login'}

);
};
```
Button.tsx - Presentational component (Pure UI)
```typescript
import React from 'react';
import styles from './Button.module.css';
interface ButtonProps
extends React.ButtonHTMLAttributes<HTMLButtonElement> {
variant?: 'primary' | 'secondary' | 'danger';
size?: 'sm' | 'md' | 'lg';
isLoading?: boolean;
children: React.ReactNode;
}
export const Button: React.FC<ButtonProps> = ({
variant = 'primary',
size = 'md',
isLoading = false,
className,
children,
disabled,
...props
}) => {
return (
<button
className={[
styles.button,
styles[variant-${variant}],
styles[size-${size}],
className,
]
.filter(Boolean)
.join(' ')}
disabled={disabled || isLoading}
{...props}
>
{isLoading ? 'Loading...' : children}
</button>
);
};
```
________________________________________
Áp Dụng SOLID Principles
1. Single Responsibility Principle (SRP)
✅ Đúng:
```typescript
// UserRepository - chỉ có trách nhiệm truy cập dữ liệu
export class UserRepository implements IUserRepository {
async findById(id: string): Promise<User | null> {
// Only database operations
}
}
// HashService - chỉ có trách nhiệm mã hóa
export class HashService implements IHashService {
async hash(plainText: string): Promise<string> {
// Only hashing logic
}
}
// UserController - chỉ có trách nhiệm handle HTTP
export class UserController {
async create(req: Request, res: Response): Promise<void> {
// Only HTTP handling
}
}
```
❌ Sai:
```typescript
// UserController có quá nhiều trách nhiệm
export class UserController {
async create(req: Request, res: Response): Promise<void> {
// Validation
if (!req.body.email.includes('@')) throw new Error();
// Business logic
const hash = await bcrypt.hash(req.body.password, 10);

// Database operations
await db.query('INSERT INTO users...');

// Response
res.json({ success: true });

}
}
```
2. Open/Closed Principle (OCP)
✅ Đúng:
```typescript
// Interface định nghĩa contract
export interface IAuthService {
authenticate(credentials: Credentials): Promise<Token>;
}
// Có thể thay thế bằng JWT implementation
export class JwtAuthService implements IAuthService {
async authenticate(credentials: Credentials): Promise<Token> {
// JWT logic
}
}
// Hoặc OAuth implementation mà không cần thay đổi code khác
export class OAuthService implements IAuthService {
async authenticate(credentials: Credentials): Promise<Token> {
// OAuth logic
}
}
// Controller sử dụng interface, không phụ thuộc implementation
export class AuthController {
constructor(private authService: IAuthService) {}
async login(req: Request, res: Response): Promise<void> {
const token = await this.authService.authenticate(req.body);
res.json({ token });
}
}
```
3. Liskov Substitution Principle (LSP)
✅ Đúng:
```typescript
export interface IRepository<T> {
save(item: T): Promise<void>;
findById(id: string): Promise<T | null>;
}
// UserRepository có thể thay thế IRepository<User>
export class UserRepository implements IRepository<User> {
async save(user: User): Promise<void> {
// implementation
}
async findById(id: string): Promise<User | null> {
// implementation
}
}
// ProductRepository cũng có thể thay thế
export class ProductRepository implements IRepository<Product> {
async save(product: Product): Promise<void> {
// implementation
}
async findById(id: string): Promise<Product | null> {
// implementation
}
}
// Service có thể sử dụng bất kỳ repository nào
export class GenericService<T> {
constructor(private repository: IRepository<T>) {}
async getItem(id: string): Promise<T | null> {
return this.repository.findById(id);
}
}
```
4. Interface Segregation Principle (ISP)
✅ Đúng:
```typescript
// Nhiều interface nhỏ, focused
export interface IUserReader {
findById(id: string): Promise<User | null>;
findByEmail(email: string): Promise<User | null>;
}
export interface IUserWriter {
save(user: User): Promise<void>;
update(user: User): Promise<void>;
delete(id: string): Promise<void>;
}
// Client chỉ implement interface cần thiết
export class UserQueryService implements IUserReader {
async findById(id: string): Promise<User | null> {
// read logic
}
async findByEmail(email: string): Promise<User | null> {
// read logic
}
}
export class UserCommandService implements IUserWriter {
async save(user: User): Promise<void> {
// write logic
}
async update(user: User): Promise<void> {
// write logic
}
async delete(id: string): Promise<void> {
// delete logic
}
}
```
❌ Sai:
```typescript
// Một interface lớn, không cần thiết
export interface IUserRepository {
findById(id: string): Promise<User | null>;
findByEmail(email: string): Promise<User | null>;
find(filters: any): Promise<User[]>;
save(user: User): Promise<void>;
update(user: User): Promise<void>;
delete(id: string): Promise<void>;
bulkInsert(users: User[]): Promise<void>;
bulkDelete(ids: string[]): Promise<void>;
}
// Service chỉ cần read nhưng phải implement tất cả
export class UserQueryService implements IUserRepository {
// Phải implement cả write methods không cần thiết
}
```
5. Dependency Inversion Principle (DIP)
✅ Đúng:
```typescript
// Module cấp cao phụ thuộc vào abstraction
export class AuthUseCase {
constructor(
private userRepository: IUserRepository, // Interface
private hashService: IHashService // Interface
) {}
async login(email: string, password: string): Promise<Token> {
const user = await this.userRepository.findByEmail(email);
if (!user) throw new Error('User not found');
const isValid = await this.hashService.compare(password, user.password);
if (!isValid) throw new Error('Invalid password');

return this.generateToken(user);

}
}
// Injection container
const container = createContainer();
container.register({
userRepository: asClass(UserRepository), // Concrete implementation
hashService: asClass(HashService), // Concrete implementation
authUseCase: asClass(AuthUseCase), // Depends on interfaces
});
```
❌ Sai:
```typescript
// Module cấp cao phụ thuộc vào concrete implementation
export class AuthUseCase {
private userRepository = new UserRepository(); // Direct dependency
private hashService = new HashService(); // Direct dependency
async login(email: string, password: string): Promise<Token> {
// Khó test, khó thay đổi implementation
}
}
```
________________________________________
Clean Code Practices
1. Naming Conventions
✅ Đúng:
```typescript
// Classes sử dụng PascalCase
export class UserService {}
// Functions/methods sử dụng camelCase
export function validateEmail(email: string): boolean {}
// Constants sử dụng UPPER_SNAKE_CASE
export const MAX_LOGIN_ATTEMPTS = 5;
// Interfaces bắt đầu với I
export interface IEmailService {}
// Boolean fields sử dụng is/has prefix
const isValidEmail = true;
const hasPermission = false;
// Functions trả về boolean sử dụng is/has
function isValidPassword(password: string): boolean {}
function hasUserRole(user: User, role: string): boolean {}
```
2. Function Design
✅ Đúng - Hàm làm một việc tốt:
```typescript
// Nhỏ, có tên rõ ràng, làm một việc
function isValidEmail(email: string): boolean {
const regex = /[\s@]+@[\s@]+\.[\s@]+$/;
return regex.test(email);
}
function isValidPassword(password: string): boolean {
return password.length >= 8;
}
function validateUserInput(email: string, password: string): void {
if (!isValidEmail(email)) {
throw new Error('Invalid email');
}
if (!isValidPassword(password)) {
throw new Error('Password must be 8+ characters');
}
}
```
❌ Sai - Hàm quá lớn, làm nhiều việc:
```typescript
// Quá dài, khó maintain, khó test
function handleUserRegistration(
email: string,
password: string,
firstName: string,
lastName: string,
company: string,
phone: string,
address: string,
city: string,
country: string
): void {
// Validation
if (!email.includes('@')) throw new Error('Invalid email');
if (password.length < 8) throw new Error('Password too short');
// Hash password
const hash = bcrypt.hashSync(password, 10);
// Save to database
db.query('INSERT INTO users...');
// Send email
sendEmail(email, 'Welcome!');
// Log
console.log('User registered');
}
```
3. DRY (Don't Repeat Yourself)
✅ Đúng:
```typescript
// Tách logic chung
abstract class BaseRepository<T> {
protected abstract tableName: string;
async findById(id: string): Promise<T | null> {
return this.db.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
}
async save(item: T): Promise<void> {
// Common save logic
}
}
export class UserRepository extends BaseRepository<User> {
protected tableName = 'users';
async findByEmail(email: string): Promise<User | null> {
return this.db.query('SELECT * FROM users WHERE email = ?', [email]);
}
}
export class ProductRepository extends BaseRepository<Product> {
protected tableName = 'products';
}
```
4. Error Handling
✅ Đúng:
```typescript
// Custom error classes
export class ValidationError extends Error {
constructor(message: string) {
super(message);
this.name = 'ValidationError';
}
}
export class NotFoundError extends Error {
constructor(resource: string, id: string) {
super(`${resource} with id ${id} not found`);
this.name = 'NotFoundError';
}
}
// Usage
async function getUser(id: string): Promise<User> {
const user = await userRepository.findById(id);
if (!user) {
throw new NotFoundError('User', id);
}
return user;
}
// Error middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
if (err instanceof ValidationError) {
res.status(400).json({ error: err.message });
} else if (err instanceof NotFoundError) {
res.status(404).json({ error: err.message });
} else {
res.status(500).json({ error: 'Internal Server Error' });
}
});
```
5. Comment & Documentation
✅ Đúng - Comments giải thích TÍNH:
```typescript
// Tại sao sử dụng 10 rounds salt?
// Tăng rounds = tăng bảo mật nhưng giảm performance
// 10 là cân bằng tốt giữa security và speed
const saltRounds = 10;
/**
•	Validates email format
•	@param email - Email string to validate
•	@returns true if email is valid, false otherwise
•	@example
•	isValidEmail('user@example.com') // true
•	isValidEmail('invalid-email') // false
*/
function isValidEmail(email: string): boolean {
const regex = /[\s@]+@[\s@]+\.[\s@]+$/;
return regex.test(email);
}
```
❌ Sai - Comments rõ ràng từ code:
```typescript
// Increment counter
let i = i + 1;
// Check if email contains @
if (email.includes('@')) {
// Email is valid
}
```
________________________________________
Ví Dụ Thực Tế
Complete User Registration Flow
Backend - Layered Architecture
1. Domain Layer - Entities
```typescript
// src/domain/entities/User.ts
export class User {
constructor(
private id: string,
private email: string,
private passwordHash: string,
private name: string,
private createdAt: Date
) {}
static create(email: string, passwordHash: string, name: string): User {
return new User(
this.generateId(),
email,
passwordHash,
name,
new Date()
);
}
private static generateId(): string {
return user_${Date.now()}_${Math.random()};
}
// Getters only - immutable
getId(): string { return this.id; }
getEmail(): string { return this.email; }
getPasswordHash(): string { return this.passwordHash; }
getName(): string { return this.name; }
getCreatedAt(): Date { return this.createdAt; }
}
```
2. Domain Layer - Interfaces
```typescript
// src/domain/interfaces/IUserRepository.ts
import { User } from '../entities/User';
export interface IUserRepository {
save(user: User): Promise<void>;
findByEmail(email: string): Promise<User | null>;
}
// src/domain/interfaces/IHashService.ts
export interface IHashService {
hash(plainText: string): Promise<string>;
compare(plainText: string, hash: string): Promise<boolean>;
}
// src/domain/interfaces/IEmailService.ts
export interface IEmailService {
sendWelcomeEmail(email: string, name: string): Promise<void>;
}
```
3. Application Layer - Use Case
```typescript
// src/application/use-cases/RegisterUserUseCase.ts
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { IHashService } from '../../domain/interfaces/IHashService';
import { IEmailService } from '../../domain/interfaces/IEmailService';
import { RegisterUserDto } from '../dto/RegisterUserDto';
export class RegisterUserUseCase {
constructor(
private userRepository: IUserRepository,
private hashService: IHashService,
private emailService: IEmailService
) {}
async execute(dto: RegisterUserDto): Promise<{ userId: string }> {
// 1. Validate - check if user exists
const existingUser = await this.userRepository.findByEmail(dto.email);
if (existingUser) {
throw new Error('User with this email already exists');
}
// 2. Hash password
const passwordHash = await this.hashService.hash(dto.password);

// 3. Create entity
const user = User.create(dto.email, passwordHash, dto.name);

// 4. Persist
await this.userRepository.save(user);

// 5. Send welcome email
await this.emailService.sendWelcomeEmail(dto.email, dto.name);

return { userId: user.getId() };

}
}
```
4. Application Layer - DTO
```typescript
// src/application/dto/RegisterUserDto.ts
import { ValidationError } from '../../shared/errors/ValidationError';
export class RegisterUserDto {
email!: string;
password!: string;
name!: string;
static fromRequest(body: unknown): RegisterUserDto {
// Validate input
if (typeof body !== 'object' || !body) {
throw new ValidationError('Invalid request body');
}
const { email, password, name } = body as Record<string, unknown>;

if (typeof email !== 'string' || !email.includes('@')) {
  throw new ValidationError('Invalid email format');
}

if (typeof password !== 'string' || password.length < 8) {
  throw new ValidationError('Password must be at least 8 characters');
}

if (typeof name !== 'string' || name.trim().length === 0) {
  throw new ValidationError('Name is required');
}

const dto = new RegisterUserDto();
dto.email = email.toLowerCase().trim();
dto.password = password;
dto.name = name.trim();

return dto;

}
}
```
5. Infrastructure Layer - Repositories
```typescript
// src/infrastructure/repositories/UserRepository.ts
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { UserModel } from '../database/models/userModel';
export class UserRepository implements IUserRepository {
async save(user: User): Promise<void> {
try {
await UserModel.create({
id: user.getId(),
email: user.getEmail(),
passwordHash: user.getPasswordHash(),
name: user.getName(),
createdAt: user.getCreatedAt(),
});
} catch (error) {
throw new Error(`Failed to save user: ${error}`);
}
}
async findByEmail(email: string): Promise<User | null> {
try {
const record = await UserModel.findOne({ email });
if (!record) return null;
return this.mapToDomain(record);
} catch (error) {
throw new Error(`Failed to find user: ${error}`);
}
}
private mapToDomain(raw: any): User {
return new User(
raw.id,
raw.email,
raw.passwordHash,
raw.name,
raw.createdAt
);
}
}
```
6. Infrastructure Layer - Services
```typescript
// src/infrastructure/services/HashService.ts
import bcrypt from 'bcrypt';
import { IHashService } from '../../domain/interfaces/IHashService';
export class HashService implements IHashService {
private readonly saltRounds = 10;
async hash(plainText: string): Promise<string> {
return bcrypt.hash(plainText, this.saltRounds);
}
async compare(plainText: string, hash: string): Promise<boolean> {
return bcrypt.compare(plainText, hash);
}
}
// src/infrastructure/services/EmailService.ts
import { IEmailService } from '../../domain/interfaces/IEmailService';
import nodemailer from 'nodemailer';
export class EmailService implements IEmailService {
private transporter = nodemailer.createTransport({
// Config
});
async sendWelcomeEmail(email: string, name: string): Promise<void> {
await this.transporter.sendMail({
to: email,
subject: 'Welcome!',
html: `
Welcome, ${name}!
`,
});
}
}
```
7. Presentation Layer - Controller
```typescript
// src/presentation/controllers/AuthController.ts
import { Request, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUserUseCase';
import { RegisterUserDto } from '../../application/dto/RegisterUserDto';
export class AuthController {
constructor(private registerUserUseCase: RegisterUserUseCase) {}
async register(req: Request, res: Response, next: NextFunction): Promise<void> {
try {
const dto = RegisterUserDto.fromRequest(req.body);
const result = await this.registerUserUseCase.execute(dto);
res.status(201).json({
success: true,
data: result,
message: 'User registered successfully',
});
} catch (error) {
next(error);
}
}
}
```
8. Presentation Layer - Routes
```typescript
// src/presentation/routes/authRoutes.ts
import express from 'express';
import { AuthController } from '../controllers/AuthController';
export function createAuthRoutes(authController: AuthController) {
const router = express.Router();
router.post('/register', (req, res, next) =>
authController.register(req, res, next)
);
return router;
}
```
9. DI Container Setup
```typescript
// src/di/container.ts
import { createContainer, asClass, asValue } from 'awilix';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { HashService } from '../infrastructure/services/HashService';
import { EmailService } from '../infrastructure/services/EmailService';
import { RegisterUserUseCase } from '../application/use-cases/RegisterUserUseCase';
import { AuthController } from '../presentation/controllers/AuthController';
export function setupContainer() {
const container = createContainer();
// Repositories
container.register({
userRepository: asClass(UserRepository).singleton(),
});
// Services
container.register({
hashService: asClass(HashService).singleton(),
emailService: asClass(EmailService).singleton(),
});
// Use Cases
container.register({
registerUserUseCase: asClass(RegisterUserUseCase).singleton(),
});
// Controllers
container.register({
authController: asClass(AuthController).singleton(),
});
return container;
}
```
10. Main App Setup
```typescript
// src/app.ts
import express from 'express';
import { setupContainer } from './di/container';
import { createAuthRoutes } from './presentation/routes/authRoutes';
import { errorHandler } from './presentation/middleware/errorHandler';
export function createApp() {
const app = express();
const container = setupContainer();
// Middleware
app.use(express.json());
// Routes
const authController = container.resolve('authController');
app.use('/api/auth', createAuthRoutes(authController));
// Error handling
app.use(errorHandler);
return app;
}
// src/server.ts
import { createApp } from './app';
const app = createApp();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
```
Frontend - Component with Custom Hook
1. Custom Hook - Business Logic
```typescript
// src/features/auth/hooks/useRegister.ts
import { useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { RegisterFormData } from '../types/auth.types';
interface UseRegisterReturn {
isLoading: boolean;
error: string | null;
success: boolean;
register: (data: RegisterFormData) => Promise<void>;
resetError: () => void;
}
export function useRegister(): UseRegisterReturn {
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);
const register = useCallback(async (data: RegisterFormData) => {
try {
setIsLoading(true);
setError(null);
setSuccess(false);
  await authService.register(
    data.email,
    data.password,
    data.name
  );

  setSuccess(true);
} catch (err) {
  const message = err instanceof Error ? err.message : 'Registration failed';
  setError(message);
  throw err;
} finally {
  setIsLoading(false);
}

}, []);
const resetError = useCallback(() => {
setError(null);
}, []);
return {
isLoading,
error,
success,
register,
resetError,
};
}
```
2. Service - API Communication
```typescript
// src/features/auth/services/authService.ts
import { api } from '../../../services/api';
import { LoginResponse } from '../types/auth.types';
class AuthService {
private static readonly BASE_URL = '/api/auth';
async register(
email: string,
password: string,
name: string
): Promise<LoginResponse> {
const response = await api.post<LoginResponse>(
`${AuthService.BASE_URL}/register`,
{ email, password, name }
);
this.saveToken(response.data.token);
return response.data;
}
private saveToken(token: string): void {
localStorage.setItem('authToken', token);
}
}
export const authService = new AuthService();
```
3. Component - UI Layer
```typescript
// src/features/auth/components/RegisterForm.tsx
import React, { useState, useEffect } from 'react';
import { useRegister } from '../hooks/useRegister';
import { useNavigate } from 'react-router-dom';
import { FormInput } from '../../../components/forms/FormInput';
import { Button } from '../../../components/common/Button';
import styles from './RegisterForm.module.css';
export const RegisterForm: React.FC = () => {
const navigate = useNavigate();
const { isLoading, error, success, register, resetError } = useRegister();
const [formData, setFormData] = useState({
email: '',
password: '',
name: '',
});
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const { name, value } = e.target;
setFormData((prev) => ({
...prev,
[name]: value,
}));
resetError();
};
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
try {
await register(formData);
} catch (err) {
// Error is already handled in hook
}
};
useEffect(() => {
if (success) {
setTimeout(() => {
navigate('/dashboard');
}, 1500);
}
}, [success, navigate]);
return (
<form onSubmit={handleSubmit} className={styles.form}>
Register
  <FormInput
    name="email"
    label="Email"
    type="email"
    value={formData.email}
    onChange={handleChange}
    required
    disabled={isLoading}
  />

  <FormInput
    name="name"
    label="Name"
    type="text"
    value={formData.name}
    onChange={handleChange}
    required
    disabled={isLoading}
  />

  <FormInput
    name="password"
    label="Password"
    type="password"
    value={formData.password}
    onChange={handleChange}
    required
    disabled={isLoading}
  />

  {error && <div className={styles.error}>{error}</div>}
  {success && <div className={styles.success}>Registration successful!</div>}

  <Button
    type="submit"
    disabled={isLoading}
    className={styles.button}
  >
    {isLoading ? 'Registering...' : 'Register'}
  </Button>
</form>

);
};
```
________________________________________
Best Practices
Backend
1.	Use TypeScript - Static typing prevents errors
```typescript
// Tốt: Type checking
function createUser(email: string, name: string): User {}
// Không tốt: Runtime errors possible
function createUser(email, name) {}
```
2.	Environment Variables
```bash
.env.example
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
EMAIL_SERVICE=gmail
NODE_ENV=development
```
3.	Error Handling Middleware
```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
logger.error(err);
res.status(500).json({ error: 'Internal Server Error' });
});
```
4.	Logging - Use structured logging
```typescript
logger.info('User registered', { userId, email });
logger.error('Database error', { error: err.message });
```
5.	Testing - Write unit tests
```typescript
describe('RegisterUserUseCase', () => {
it('should register new user', async () => {
const result = await useCase.execute(dto);
expect(result.userId).toBeDefined();
});
});
```
Frontend
1.	Component Composition - Reuse components
```typescript


```
2.	State Management - Keep state as local as possible
```typescript
// Local state in component
const [isOpen, setIsOpen] = useState(false);
// Global state in Redux/Zustand
const user = useSelector(state => state.auth.user);
```
3.	CSS Modules - Avoid style conflicts
```typescript
import styles from './RegisterForm.module.css';
// styles.form, styles.input, styles.button
```
4.	Type Safety - Use TypeScript interfaces
```typescript
interface User {
id: string;
email: string;
name: string;
}
```
5.	API Client - Centralized API calls
```typescript
const api = axios.create({
baseURL: 'http://localhost:3000/api',
timeout: 10000,
});
```
________________________________________
Tổng Kết
Key Takeaways
1.	Layered Architecture - Tách concerns rõ ràng
o	Domain (Business logic)
o	Application (Use cases)
o	Infrastructure (External services)
o	Presentation (HTTP handling)
2.	SOLID Principles
o	SRP: Mỗi class một trách nhiệm
o	OCP: Mở rộng mà không sửa code cũ
o	LSP: Subclass có thể thay thế parent
o	ISP: Interface nhỏ, focused
o	DIP: Phụ thuộc abstraction, không concrete
3.	Clean Code
o	Tên có nghĩa
o	Hàm nhỏ
o	Không lặp code (DRY)
o	Xử lý error tốt
o	Test được
4.	Dependency Injection - Loosely coupled, dễ test
5.	Frontend - Custom hooks tách logic khỏi UI
Checklist Trước Khi Deploy
•	[ ] Code tuân theo SOLID
•	[ ] Tất cả tests pass
•	[ ] Không có console errors/warnings
•	[ ] Environment variables configured
•	[ ] Database migrations applied
•	[ ] Error handling in place
•	[ ] Logging setup
•	[ ] Security checks (input validation, SQL injection)
•	[ ] Performance optimized
•	[ ] Documentation updated
________________________________________
References
[1] SOLID Principles - Robert C. Martin (Uncle Bob)
Clean Architecture - Robert C. Martin
Clean Code - Robert C. Martin
Design Patterns - Gang of Four
Dependency Injection Principles, Practices, and Patterns - Steven van Deursen & Mark Seemann
