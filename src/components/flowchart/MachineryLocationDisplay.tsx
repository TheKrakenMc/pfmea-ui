import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listMachinery } from '../../services/machineryService';
import { listLocations } from '../../services/locationService';
import type { Machinery } from '../../types/machinery.types';
import type { ManufacturingLocation } from '../../services/locationService';

// Module-level cache to prevent excessive API calls
let machineryCache: Machinery[] | null = null;
let locationCache: ManufacturingLocation[] | null = null;
let fetchPromise: Promise<void> | null = null;

interface MachineryLocationDisplayProps {
  machineryId: number | null | undefined;
}

export function MachineryLocationDisplay({ machineryId }: MachineryLocationDisplayProps) {
  const { t } = useTranslation();
  const [locationName, setLocationName] = useState<string>('');
  
  useEffect(() => {
    async function fetchLocation() {
      if (!machineryId) {
        setLocationName('');
        return;
      }
      
      try {
        if (!fetchPromise) {
          fetchPromise = Promise.all([
            machineryCache ? Promise.resolve() : listMachinery({ limit: 500, is_active: true }).then(m => { machineryCache = m; }),
            locationCache ? Promise.resolve() : listLocations().then(l => { locationCache = l; })
          ]).then(() => {});
        }
        
        await fetchPromise;
        
        const machine = machineryCache?.find(m => m.id === machineryId);
        if (machine && machine.location_id) {
          const loc = locationCache?.find(l => l.id === machine.location_id);
          setLocationName(loc ? loc.location_name : 'N/A');
        } else {
          setLocationName('');
        }
      } catch (error) {
        console.error('Error fetching machinery location', error);
        setLocationName('');
      }
    }
    
    fetchLocation();
  }, [machineryId]);

  return (
    <input
      type="text"
      readOnly
      value={locationName}
      placeholder={t('table.locationPlaceholder', 'Ubicación...')}
      className="focus-ring w-full rounded-lg border border-steel-600 bg-steel-800/50 px-3 py-2 text-left text-sm text-steel-300 cursor-not-allowed outline-none"
    />
  );
}
