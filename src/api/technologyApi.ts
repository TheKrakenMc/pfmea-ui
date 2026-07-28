// ─────────────────────────────────────────────────────────────
//  DEPRECATED — Use services/technologyService.ts instead.
//  This file re-exports from the correct service for backward
//  compatibility with any lingering imports.
// ─────────────────────────────────────────────────────────────

export {
  listTechnologies as fetchTechnologies,
  createTechnology,
  updateTechnology,
  deleteTechnology,
  getTechnologyImpact as fetchTechnologyImpact,
} from '../services/technologyService';
