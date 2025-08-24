# Overview

This is a modern 3D modeling application built with React, Three.js, and Express. The application provides an interactive 3D environment where users can create, manipulate, and visualize 3D objects through both natural language commands and traditional UI controls. It features an AI assistant that can interpret natural language instructions to perform 3D modeling operations, making 3D design accessible to users without technical expertise.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the main UI framework
- **Vite** as the build tool and development server with hot module replacement
- **Three.js ecosystem** for 3D rendering:
  - `@react-three/fiber` for React integration with Three.js
  - `@react-three/drei` for useful 3D components and helpers
  - `@react-three/postprocessing` for visual effects
- **Tailwind CSS** for styling with a custom design system
- **Radix UI** components for accessible, unstyled UI primitives
- **Zustand** for client-side state management with subscription middleware
- **TanStack Query** for server state management and API caching

## Backend Architecture
- **Express.js** server with TypeScript
- **ESM modules** throughout the application
- **Hot reload** development setup with Vite middleware integration
- **Modular route structure** with separated concerns for storage and routing
- **In-memory storage** implementation with interface for easy database migration
- **Request logging middleware** for API monitoring

## Data Storage Solutions
- **Drizzle ORM** configured for PostgreSQL with schema-first approach
- **Neon Database** serverless PostgreSQL for production
- **In-memory storage** fallback for development and testing
- **Database migrations** managed through Drizzle Kit
- **Shared schema** between client and server using Zod validation

## State Management Architecture
- **Zustand stores** for different application domains:
  - `useModeling` - 3D object creation, selection, and manipulation
  - `useAudio` - Sound effects and music control
  - `useGame` - Application phase management
- **Subscription-based updates** for reactive state changes
- **Type-safe state** with TypeScript interfaces

## 3D Scene Architecture
- **Component-based 3D objects** with shared interfaces
- **Object manipulation system** supporting move, rotate, and scale operations
- **Material system** with multiple material types and properties
- **Model import system** supporting GLTF, GLB, OBJ, and FBX formats
- **Scene management** with object hierarchy and selection

## AI Integration
- **Natural language processing** for 3D modeling commands
- **Command parsing system** with type-safe action definitions
- **AI response generation** with contextual suggestions
- **Command history** and suggestion system

## Audio System
- **HTML5 Audio** integration with Zustand state management
- **Sound effect system** for user interactions
- **Mute/unmute controls** with persistent state
- **Audio asset management** through Vite's asset pipeline

# External Dependencies

## Core Framework Dependencies
- **React 18** - UI framework with concurrent features
- **Three.js** - 3D graphics library
- **Express.js** - Node.js web application framework
- **TypeScript** - Type safety and development experience
- **Vite** - Fast build tool and development server

## Database and ORM
- **Drizzle ORM** - Type-safe database toolkit
- **@neondatabase/serverless** - Serverless PostgreSQL client
- **PostgreSQL** - Primary database (configured but may be added later)

## UI and Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **@fontsource/inter** - Typography

## State Management
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management
- **React Hook Form** - Form state management

## 3D Graphics
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for react-three-fiber
- **@react-three/postprocessing** - Post-processing effects

## Development Tools
- **tsx** - TypeScript execution for Node.js
- **esbuild** - Fast JavaScript bundler
- **@replit/vite-plugin-runtime-error-modal** - Development error handling
- **vite-plugin-glsl** - GLSL shader support

## Validation and Utilities
- **Zod** - Schema validation
- **date-fns** - Date utility library
- **clsx** - Conditional className utility
- **class-variance-authority** - Component variant management