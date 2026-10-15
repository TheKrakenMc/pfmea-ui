---
name: apg-style
description: PFMEA Industrial Design System and UI/UX guidelines for creating components.
---

# APG Style (PFMEA Industrial Design System)

This skill defines the established UI/UX patterns, design aesthetics, and technical stack used for the PFMEA application interface. When creating or modifying components, adhere to these guidelines to maintain a consistent "Industrial" look and feel.

## 1. Core Stack
- **Styling**: TailwindCSS v4 with class-based Dark Mode (`.dark`).
- **Typography**: `@fontsource/inter` for sans-serif, `JetBrains Mono` (or similar mono) for monospace.
- **Icons**: `lucide-react`.
- **Animations**: `framer-motion` and custom CSS keyframes.
- **Form Handling & Validation**: `react-hook-form` coupled with `@hookform/resolvers/yup` and `yup`.
- **Notifications/Toasts**: `sonner`.

## 2. Color Palette (Theme Variables)
The application uses a custom industrial palette defined in `index.css`. **Never use generic Tailwind colors** (like `gray-500` or `blue-500`); use the semantic variables instead.

- **Background & Structure (Steel)**: 
  - `steel-50` to `steel-950`. Used for backgrounds, borders, and text.
  - **CRITICAL WARNING**: Do NOT use `dark:` variants for structure colors (e.g., `bg-steel-50 dark:bg-steel-950`). The palette is semantic. `steel-950` evaluates to a light background in light mode and a dark background in dark mode. `steel-50` evaluates to dark text/surface in light mode. If you use `bg-steel-50`, it will render dark in light mode, ruining the design.
  - Light Mode background: `steel-950` (`#f8fafc`).
  - Dark Mode background: `steel-950` (`#0a0c10`).
- **Primary Actions (Indigo)**:
  - Use `bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 cursor-pointer` for primary call-to-action buttons.
  - **CRITICAL RULE FOR DISABLED/LOADING STATES**: Always use `disabled:bg-indigo-900/60 disabled:text-indigo-200` for primary buttons to ensure legibility and harmony. Do NOT use generic steel colors like `disabled:text-steel-400` on indigo backgrounds.
- **Primary & Interactive Accent (Indigo/Forge - Base Purple)**: 
  - The project mandates a harmonized purple/indigo aesthetic. `forge-300` to `forge-700` and `indigo-300` to `indigo-700` map to the same base purple (`#4f46e5` / `indigo-600` family).
  - Used for ALL interactive elements, secondary actions, active states, and focus rings. 
  - **CRITICAL WARNING**: Do NOT introduce generic blue accents (like `blue-500`) or mix competing accent colors. Always use `forge` or `indigo` classes for interactive elements to maintain color harmony across the project.
  - Glow effect: `forge-glow` or `shadow-indigo-900/20`.
  - Example: `bg-forge-500/10 text-forge-400`, `bg-indigo-600`.
- **Status Colors**:
  - Critical/Alert (Red): `alert-red`, `alert-red-glow`.
  - Warning/Draft (Amber): `alert-amber`, `alert-amber-glow`.
  - Success/Approved (Green): `success-400`, `success-500`, `success-glow`.
  - Review (Purple): `review-500`, `review-glow`.

## 3. Typography
- **Headings**: Use `Inter` font, semibold or bold (`font-semibold`, `font-bold`).
- **Labels**: Form labels often use a distinct style: `text-[10px] font-bold uppercase tracking-widest text-steel-400`.
- **Monospace**: Use for technical data, part numbers, or IDs (e.g., `font-mono`).

## 4. UI/UX Elements & Patterns
- **Glass Cards (`.glass-card`)**: Use for primary containers and modules. It provides a frosted glass effect with a subtle border.
- **Inputs & Fields**: 
  - Default: `bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium`.
  - Rounded corners: `rounded-lg`.
  - Do NOT use `bg-steel-950/40 dark:bg-steel-950/30` or arbitrary opacities. Keep the standard solid `bg-steel-950`.
- **Background Grid Pattern (`.bg-grid-pattern`)**: An industrial grid texture used in specific structural containers or backgrounds.
- **Status Badges**: Combine pill shapes with dots. 
  - Example (Active/Success): `bg-emerald-500/20 text-emerald-400 border-emerald-500/50`.
  - Example (Inactive/Draft): `bg-slate-500/20 text-slate-400 border-slate-500/50`.
- **Focus Rings**: Use the custom utility `.focus-ring` or Tailwind's `focus:ring-indigo-500`.
- **Scrollbars**: The project defines custom Webkit scrollbars in `index.css`.

### Standardized Tables (PFMEADashboard Pattern)
- **Container**: `bg-steel-900 border border-steel-800 rounded-xl overflow-hidden shadow-2xl`
- **Header (`<thead><tr>`)**: `bg-steel-950/50 text-steel-400 text-xs uppercase tracking-wider border-b border-steel-800`
- **Body (`<tbody>`)**: `divide-y divide-steel-800/50 text-sm`
- **Rows (`<tr>`)**: `hover:bg-steel-800/50 transition-colors group cursor-pointer`
- **Text Contrast**: Use `text-steel-200` for primary columns and `text-steel-400` for secondary data. Avoid `text-steel-100` and `text-steel-700` as they break contrast in light mode.
- **Row Actions**: Ghost icon buttons at the end of the row that appear on hover:
  ```tsx
  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <button className="p-1.5 text-slate-500 hover:text-indigo-400 bg-steel-950 hover:bg-steel-800 rounded-md transition-colors cursor-pointer">
      <Edit className="w-4 h-4" />
    </button>
  </div>
  ```

### Standardized Modals
- **Wrapper**: `bg-steel-900 border border-steel-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]`
- **Header**: `px-6 py-4 border-b border-steel-800/80 flex items-center justify-between bg-steel-950/50`
- **Form Area**: `flex-1 overflow-y-auto p-6 space-y-5`
- **Cancel Button**: `px-4 py-2.5 rounded-lg text-sm text-steel-400 hover:bg-steel-850 transition-colors font-medium cursor-pointer`

## 5. Animations & Transitions
- **Transitions**: Apply `.transition-industrial` (custom bezier curve) or `transition-all duration-200` for smooth hover and state changes.
- **Pulse Glow**: Use `.animate-pulse-glow` for highlighting elements like "Unsaved changes" or critical attention areas.
- **Framer Motion**: Use `<motion.div>` and `<AnimatePresence>` for mounting/unmounting components (like dropdowns, accordions, and modals).
  - Common entry/exit pattern:
    ```jsx
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: 'auto', opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    ```

## 6. Forms & Validation
- Always use `react-hook-form`.
- Define validation schemas using `yup` outside the component.
- Display errors using small, red text under the input field (`text-xs text-red-400`).

### Example Schema & Field Pattern
```tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Hash } from 'lucide-react';

const schema = yup.object().shape({
  part_number: yup.string().required('Requerido'),
});

// Inside component
const { register, formState: { errors } } = useForm({ 
  resolver: yupResolver(schema) 
});

// Field UI Pattern
<div className="flex flex-col gap-1.5 group">
  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400 transition-colors group-focus-within:text-forge-400">
    <Hash size={12} className="text-forge-400" />
    Número de Parte
  </label>
  <input
    {...register('part_number')}
    className="w-full bg-steel-950/40 dark:bg-steel-950/30 border border-steel-700/50 hover:border-steel-600 focus:border-forge-500 rounded-xl px-4 py-2.5 text-sm text-steel-100 transition-all font-mono font-medium focus:outline-none focus:ring-1 focus:ring-forge-500"
  />
  {errors.part_number && <span className="text-xs text-red-400">{errors.part_number.message}</span>}
</div>
```

## 7. Icons
- Standardize on `lucide-react`.
- Common sizes: `size={12}` for small labels/badges, `size={18}` for standard icons, `size={24}` for large actions.
- Icons in labels are often colored specifically (e.g., `text-forge-400`, `text-indigo-400`, `text-amber-400`) to visually differentiate field categories.
