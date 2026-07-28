import { useQuery } from '@tanstack/react-query';
import { listTechnologies } from '../services/technologyService';
import { listMachinery } from '../services/machineryService';
import { listLocations } from '../services/locationService';

export function useFlowchartLookups() {
  const techQuery = useQuery({
    queryKey: ['technologies', 'flowchart-lookup'],
    queryFn: () => listTechnologies({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const machineryQuery = useQuery({
    queryKey: ['machinery', 'flowchart-lookup'],
    queryFn: () => listMachinery({ limit: 200, is_active: true }),
    staleTime: 5 * 60 * 1000,
  });

  const locationsQuery = useQuery({
    queryKey: ['locations', 'flowchart-lookup'],
    queryFn: () => listLocations(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    technologies: techQuery.data || [],
    machineries: machineryQuery.data || [],
    locations: locationsQuery.data || [],
    isLoading: techQuery.isLoading || machineryQuery.isLoading || locationsQuery.isLoading,
    isError: techQuery.isError || machineryQuery.isError || locationsQuery.isError,
  };
}
