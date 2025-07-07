# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for development (with dev mode flags)
npm run build:dev

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

This is an **Artify Auto Create Kit** - a React application that generates social media graphics by combining templates with dynamic content. Built with:

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui components + Tailwind CSS
- **Canvas**: Fabric.js for image manipulation and layout editing
- **Database**: Supabase for templates, teachers, and user data
- **State**: React Hook Form + persistent localStorage + React Query

## Application Flow

### Main Entry Points
1. **src/App.tsx** → Router with auth/main routes
2. **src/pages/Index.tsx** → Main application entry (auth check + UserInterface)
3. **src/components/UserInterface.tsx** → Central state orchestrator
4. **src/components/MainLayout.tsx** → Fixed sidebar + content layout

### User Journey
```
Authentication → Form Input (Event Data) → Template Selection → Canvas Layout → Generate Images → Export ZIP
```

## Core Architecture Components

### 1. Event Data System
**Central data structure** (`EventData` in src/pages/Index.tsx):
```typescript
interface EventData {
  subtitle: string;          // Event title
  date: string;             // Event date
  time: string;             // Event time
  kvImageId: string | null; // Selected template ID
  teacherImages: string[];  // Teacher photo URLs
  platforms: string[];      // Target platforms (Instagram, Facebook, etc.)
  classTheme?: string;      // Theme/subject
  // ... styling options
}
```

### 2. State Management Strategy
- **Form State**: React Hook Form with Zod validation
- **Persistent State**: `usePersistentState` hook (localStorage)
- **Bidirectional Sync**: Form ↔ EventData synchronization in UserInterface.tsx
- **Server State**: React Query for Supabase data

### 3. Layout System (Complex - Needs Attention)
**Multiple competing implementations exist:**
- `LayoutEditor.tsx` - Main wrapper
- `LayoutEditorContainer.tsx` - Legacy implementation
- `LayoutEditorMigrated.tsx` - Migration layer (partially complete)
- `LayoutEditorUnified.tsx` - Newer unified approach
- `LayoutEditorWithPositioning.tsx` - Most recent with positioning system

**Current recommendation**: Use `LayoutEditorWithPositioning.tsx` as it's the most feature-complete.

### 4. Canvas Management (Fabric.js)
**Hook hierarchy:**
- `useUnifiedCanvasManager` - Preferred modern approach
- `useCanvasManager` - Legacy (should be phased out)
- `useLayoutEditorState` - State management
- `usePositionSystem` - Coordinate calculations

**Canvas workflow:**
1. Load template background image
2. Add dynamic elements (text, teacher photos) to canvas
3. Apply layout rules and positioning
4. Export canvas as images for different platforms

## Image Generation Pipeline

### 1. Process Flow
```
EventData → Template Selection → Canvas Setup → Element Placement → Platform Rendering → Export
```

### 2. Key Files
- **src/hooks/useImageGenerator/index.ts** - Main generation orchestrator
- **src/hooks/useImageGenerator/imageGeneration.ts** - Platform-specific rendering
- **src/utils/canvas/** - Canvas utilities (25+ files, needs consolidation)

### 3. Platform System
Each platform (Instagram Story, Facebook Post, etc.) has:
- Specific dimensions (formatDimensions)
- Layout rules (positioning system)
- Export configurations

## Database Schema (Supabase)

### Core Tables
- **templates** - Background images and metadata
- **teachers** - Teacher profiles and photos
- **template_layouts** - Canvas element positions for each template/format
- **template_formats** - Platform-specific dimensions and configs

### Data Hooks
- `useSupabaseTemplates` - Template CRUD operations
- `useSupabaseTeachers` - Teacher management
- `useLayoutEditor` - Layout persistence

## Authentication & Authorization

**Admin vs User roles:**
- **Admin check**: `user.email === VITE_ADMIN_EMAIL`
- **Admin features**: Template manager, teacher manager, layout editor
- **User features**: Form input, image generation, export

**Auth flow:**
1. `AuthGuard` component wraps protected routes
2. `useAuth` hook manages Supabase auth state
3. Admin panel accessible via user type toggle

## Common Development Patterns

### Form Validation
Uses Zod schemas in `src/lib/validators.ts`:
- Real-time validation with React Hook Form
- Custom error messages for required fields
- Bidirectional sync between form and persistent state

### Error Handling
- `ErrorBoundary` components catch React errors
- `useNotifications` provides toast notifications
- Comprehensive logging via `src/utils/logger.ts`

### Canvas Operations
When working with canvas elements:
1. Use unified coordinate system (normalized positions)
2. Scale calculations for responsive display
3. Fabric.js object lifecycle management
4. Memory cleanup for performance

## Known Issues & Technical Debt

### 1. Canvas System Fragmentation
- 4 different layout editor implementations
- 25+ utility files in src/utils/canvas/ (over-fragmented)
- Multiple overlapping hooks managing similar state
- Memory leaks in canvas cleanup

### 2. State Synchronization Complexity
- Form ↔ EventData bidirectional sync is fragile
- Multiple sources of truth for canvas state
- Performance issues with frequent localStorage updates

### 3. Type Safety
- Several `any` types in canvas-related code
- Inconsistent interfaces between old/new systems
- Missing runtime validation in some areas

## Development Guidelines

### When Adding Canvas Features
1. Use `useUnifiedCanvasManager` and `usePositionSystem`
2. Avoid creating new utility files - consolidate existing ones
3. Follow the positioning system patterns in `LayoutEditorWithPositioning.tsx`

### When Modifying State
1. Check both form state AND EventData persistence
2. Use the logger for debugging state changes
3. Test bidirectional sync carefully

### When Working with Templates
1. Always refresh layouts after template changes
2. Handle missing templates gracefully
3. Use the validation helpers before generation

## Testing Strategy
- Focus on the image generation pipeline end-to-end
- Test state synchronization between form and EventData
- Canvas memory management and cleanup
- Cross-platform image generation accuracy

## Performance Considerations
- Canvas operations can be memory-intensive
- Large template images need optimization
- Debounce frequent state updates (sessionStorage)
- Proper cleanup of Fabric.js objects

This application is a complex graphics generation tool that combines form input, canvas manipulation, and multi-platform export capabilities. The main architectural challenge is managing the complex state flow between forms, canvas, and persistent storage while generating high-quality images across multiple social media formats.