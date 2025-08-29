# AI Triage System

## Overview

This is an AI-powered emergency department triage system that automatically assigns priority levels to patients based on their medical data. The application consists of a React frontend with Express.js backend, using machine learning to predict triage levels (1-5, where 1 is most critical). The system provides real-time queue management, patient intake forms, and statistical dashboards for emergency department staff.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints for patient management and triage operations
- **ML Integration**: Mock ML service with rule-based triage level prediction (placeholder for actual ML model)
- **Data Storage**: In-memory storage with interface for future database integration
- **Session Management**: Express sessions with PostgreSQL session store configuration

### Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Tables**: 
  - Users table for authentication
  - Patients table with comprehensive medical data fields (vitals, symptoms, diagnosis)
- **Schema Validation**: Drizzle-Zod integration for type-safe database operations

### Key Design Patterns
- **Separation of Concerns**: Clear separation between client, server, and shared code
- **Type Safety**: End-to-end TypeScript with shared schema definitions
- **Component Architecture**: Reusable UI components with consistent design system
- **Real-time Updates**: Polling-based data fetching for live queue updates
- **Form Validation**: Client and server-side validation using Zod schemas

### ML Service Architecture
- **Triage Prediction**: Rule-based system that evaluates patient vitals, mental status, pain levels, and diagnosis
- **Priority Levels**: 1 (Critical) to 5 (Non-urgent) based on medical severity indicators
- **Extensible Design**: Interface designed for easy integration with actual ML models

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL with Neon serverless driver
- **Session Store**: connect-pg-simple for PostgreSQL session management
- **Date Handling**: date-fns for date manipulation and formatting

### UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Icons**: Lucide React for consistent iconography
- **Styling**: Tailwind CSS with PostCSS for processing
- **Carousel**: Embla Carousel for interactive components

### Development Tools
- **Build Tool**: Vite with React plugin
- **Database Migrations**: Drizzle Kit for schema management
- **Runtime**: Node.js with ESM modules
- **Type Checking**: TypeScript with strict configuration

### Form and Validation
- **Form Management**: React Hook Form with Hookform Resolvers
- **Schema Validation**: Zod for runtime type checking and validation
- **Class Utilities**: clsx and tailwind-merge for conditional styling

### Development Environment
- **Error Handling**: Replit-specific error overlay and development tools
- **Hot Reload**: Vite HMR for rapid development
- **Path Resolution**: Custom path aliases for clean imports

## Recent Updates - August 2024

### Doctor Assignment System
- **New Page**: Created dedicated doctor assignment interface accessible from the main dashboard
- **Smart Matching**: Intelligent doctor recommendations based on patient symptoms and diagnosis keywords
- **Medical Specialties**: Support for Emergency Medicine, Cardiology, Internal Medicine, Orthopedics, Neurology, and Pulmonology
- **Queue Management**: Automatic patient removal from triage queue when assigned to a doctor
- **Status Tracking**: Patients are marked as "in_treatment" when assigned to doctors

### UI/UX Enhancements
- **Medical Color Scheme**: Professional blue-green gradient design suitable for medical environments
- **Navigation**: Seamless navigation between main dashboard and doctor assignment pages
- **Enhanced Forms**: Improved input styling with medical-themed design and proper validation
- **Professional Footer**: Added comprehensive footer with hospital information and system details
- **Layout Optimization**: Statistics at top, wider intake form, queue at bottom for better workflow

### Technical Improvements
- **Database Schema**: Extended patient records with assigned doctor tracking
- **API Endpoints**: New endpoint for doctor assignment with status updates
- **Form Validation**: Fixed input field warnings and improved form handling
- **Type Safety**: Enhanced TypeScript definitions for doctor assignment functionality