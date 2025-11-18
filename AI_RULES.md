# AI Rules for DeltaSilicon.Hub Application

This document outlines the core technologies used in the DeltaSilicon.Hub application and provides clear guidelines on which libraries and frameworks to use for specific functionalities.

## Tech Stack Overview

*   **React**: The primary JavaScript library for building the user interface.
*   **TypeScript**: Used for type safety and improved code quality across the entire codebase.
*   **Tailwind CSS**: A utility-first CSS framework for styling components, ensuring a consistent and responsive design.
*   **React Router**: Manages client-side routing, defining navigation paths and rendering components based on the URL.
*   **Supabase**: Provides backend services including authentication, real-time database, and serverless functions (Edge Functions).
*   **TMDB API**: The Movie Database API is used for fetching movie, series, and actor information.
*   **Lucide React**: A library for easily integrating vector icons into React components.
*   **Google Generative AI (Gemini)**: Integrated via Supabase Edge Functions for AI-powered content recommendations.
*   **Vite**: The build tool used for a fast development experience and optimized production builds.
*   **Shadcn/ui**: A collection of re-usable components built with Radix UI and Tailwind CSS.

## Library Usage Rules

To maintain consistency, performance, and best practices, please adhere to the following rules when developing or modifying the application:

*   **UI Components & Styling**:
    *   **Always use Tailwind CSS** for all styling. Avoid inline styles or custom CSS files unless absolutely necessary for global styles (e.g., `index.css`).
    *   **Prioritize Shadcn/ui components** for common UI elements (buttons, forms, modals, etc.). If a specific Shadcn/ui component doesn't exist or doesn't meet requirements, create a new, small, and focused component using Tailwind CSS. Do not modify existing Shadcn/ui component files directly.
    *   Ensure all designs are **responsive** across different screen sizes.

*   **Routing**:
    *   Use **React Router (`react-router-dom`)** for all navigation within the application.
    *   All primary application routes should be defined in `src/App.tsx`.

*   **State Management**:
    *   For local component state, use **React's `useState` and `useReducer` hooks**.
    *   For global or shared state, use **React's Context API (`useContext`)**. Custom contexts like `LanguageContext` and `AuthContext` are already in place.

*   **API Interactions**:
    *   For fetching movie/series/actor data, use the dedicated services in `src/services/tmdbApi.ts`, `src/services/seriesService.ts`, and `src/services/animeService.ts`.
    *   For authentication, database operations (history, favorites, forum), and serverless functions, use the **Supabase client** (`src/lib/supabase.ts`).

*   **Authentication & User Data**:
    *   All user authentication and profile management should leverage **Supabase Auth** and the `AuthContext`.
    *   User-specific data (watch history, favorites) should be stored and retrieved using `src/services/databaseService.ts` (for authenticated users) or `src/services/userService.ts` (for guest users via `localStorage`).

*   **Icons**:
    *   Use **Lucide React** for all icons.

*   **AI Integration**:
    *   All AI-powered features should interact with the **Supabase Edge Functions** (e.g., `ai-recommender`) which in turn use the Google Generative AI API.

*   **Localization**:
    *   Use the custom `LanguageContext` and `useTranslation` hook (`src/contexts/LanguageContext.tsx`) for all text that needs to be localized.

*   **File Structure**:
    *   Keep components in `src/components/`.
    *   Keep pages in `src/pages/`.
    *   Keep services in `src/services/`.
    *   Keep contexts in `src/contexts/`.
    *   Keep utility functions in `src/utils/`.
    *   Directory names must be all lower-case.

*   **Code Quality**:
    *   Adhere to **TypeScript** best practices.
    *   Maintain **clean, readable, and maintainable code**.
    *   Avoid over-engineering; implement the simplest solution that meets the requirements.
    *   Ensure all new components or hooks are created in their own dedicated files.