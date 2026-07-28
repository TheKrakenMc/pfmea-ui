import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getProductHistory } from '../../services/productService';
import type { DocumentVersion } from '../../types/product.types';

interface ProductHistoryModalProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductHistoryModal: React.FC<ProductHistoryModalProps> = ({
  productId,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, productId]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductHistory(productId);
      setHistory(data);
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(t('productVersioning.errorFetchingHistory', 'Error al cargar el historial.'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {t('productVersioning.historyTitle', 'Historial de Cambios')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          {loading && (
            <div className="text-center text-gray-500 py-8">
              {t('common.loading', 'Cargando...')}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              {t('productVersioning.noHistory', 'No hay historial de cambios disponible.')}
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <div className="space-y-6">
              {history.map((version, index) => (
                <div key={version.id} className="relative pl-6 border-l-2 border-indigo-200 last:border-0 pb-6 last:pb-0">
                  <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1 shadow ring-4 ring-white" />
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="inline-block px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full mb-2">
                          V{version.revision_number}
                        </span>
                        <h4 className="text-sm font-semibold text-gray-800">
                          {version.change_reason}
                        </h4>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(version.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    {version.snapshot_data?.engineering_level && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-gray-700">{t('productVersioning.engineeringLevel', 'Nivel de Ingeniería')}:</span>{' '}
                        {version.snapshot_data.engineering_level}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all"
          >
            {t('common.close', 'Cerrar')}
          </button>
        </div>

      </div>
    </div>
  );
};
