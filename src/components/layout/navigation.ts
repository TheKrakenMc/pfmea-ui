import { Package, GitBranch, ClipboardList, ShieldCheck, Users, Box, Wrench, Zap, MapPin, Ruler } from 'lucide-react';
export const documentLinks = [
  { path: '/products', key: 'navbar.products', icon: Package },
  { path: '/flowcharts', key: 'navbar.flowchart', icon: GitBranch },
  { path: '/pfmea', key: 'navbar.pfmea', icon: ClipboardList },
  { path: '/control-plans', key: 'navbar.controlPlan', icon: ShieldCheck },
];
export const auxiliaryLinks = [
  { path: '/auxiliaries/customers', key: 'navbar.auxiliaries.customers', icon: Users },
  { path: '/auxiliaries/components', key: 'navbar.auxiliaries.components', icon: Box },
  { path: '/auxiliaries/machinery', key: 'navbar.auxiliaries.machinery', icon: Wrench },
  { path: '/auxiliaries/technologies', key: 'navbar.auxiliaries.technologies', icon: Zap },
  { path: '/auxiliaries/locations', key: 'navbar.auxiliaries.locations', icon: MapPin },
  { path: '/auxiliaries/measurement-units', key: 'navbar.auxiliaries.measurementUnits', icon: Ruler },
];
