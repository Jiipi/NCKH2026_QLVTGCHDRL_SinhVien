/**
 * Teacher Feature Module Index
 * ============================
 * Main entry point for teacher feature (FSD Architecture)
 * 
 * 3-Tier Architecture:
 * - Tier 1 (UI): Pages and Components - Presentation layer
 * - Tier 2 (Model): Hooks and Mappers - Business logic layer
 * - Tier 3 (Services): API Services - Data access layer
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Each file has one purpose
 * - Open/Closed: Extensible via composition
 * - Liskov Substitution: Consistent API contracts
 * - Interface Segregation: Focused exports
 * - Dependency Inversion: Services abstracted via hooks
 * 
 * @module features/teacher
 */

// Tier 1: UI (Presentation Layer)
export * from './ui';

// Tier 2: Model (Business Logic Layer)
export * from './model';

// Tier 3: Services (Data Access Layer)
export * from './services';
