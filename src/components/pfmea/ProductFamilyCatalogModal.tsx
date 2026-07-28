import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Plus, Trash2, Edit2, Loader2, Save } from 'lucide-react';
import { productFamilyService, type ProductFamily } from '../../api/productFamilyService';

interface ProductFamilyCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductFamilyCatalogModal: React.FC<ProductFamilyCatalogModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const [families, setFamilies] = useState<ProductFamily[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const loadFamilies = async () => {
    try {
      setIsLoading(true);
      const data = await productFamilyService.list(false);
      setFamilies(data);
    } catch (error) {
      console.error("Failed to load product families", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFamilies();
      setEditingId(null);
      setIsAdding(false);
      setNewName('');
    }
  }, [isOpen]);

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  // Sorting
  const sortedFamilies = [...families].sort((a, b) => a.name.localeCompare(b.name));

  // Pagination
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sortedFamilies.length / ITEMS_PER_PAGE);
  const paginatedFamilies = sortedFamilies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleSaveEdit = async (id: number) => {
    if (!editName.trim()) return;
    try {
      setIsPending(true);
      await productFamilyService.update(id, { name: editName });
      setEditingId(null);
      await loadFamilies();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      setIsPending(true);
      await productFamilyService.create({ name: newName, is_active: true });
      setNewName('');
      setIsAdding(false);
      await loadFamilies();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('common.confirmDelete', '¿Estás seguro de eliminar este elemento?'))) {
      try {
        setIsPending(true);
        await productFamilyService.delete(id);
        await loadFamilies();
      } catch (error) {
        console.error(error);
      } finally {
        setIsPending(false);
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-steel-950/80 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-steel-900 border border-steel-800 rounded-2xl w-full max-w-md pointer-events-auto overflow-hidden flex flex-col shadow-2xl relative z-10"
        >
          <div className="px-6 py-4 border-b border-steel-800/80 flex items-center justify-between bg-steel-950/50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Settings size={20} />
              </div>
              <h3 className="text-lg font-semibold text-steel-100">
                {t('pfmea.catalog.productFamily.title', 'Product Family Catalog')}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-steel-400 hover:bg-steel-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-steel-400 uppercase">
                {t('pfmea.catalog.productFamily.list', 'Familias Registradas')}
              </h4>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  <Plus size={14} /> {t('actions.add', 'Agregar')}
                </button>
              )}
            </div>

            {isAdding && (
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('pfmea.catalog.productFamily.name', 'Nombre de la Familia...')}
                  className="flex-1 bg-steel-950 border border-steel-700 rounded-lg px-3 py-2 text-sm text-steel-100 focus:outline-none focus:border-indigo-500"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <button
                  onClick={handleAdd}
                  disabled={isPending || !newName.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewName('');
                  }}
                  className="p-2 text-steel-400 hover:bg-steel-800 rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-indigo-500" />
              </div>
            ) : sortedFamilies.length === 0 ? (
              <p className="text-sm text-steel-500 text-center py-4">
                {t('common.noData', 'No hay registros')}
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  {paginatedFamilies.map((family) => (
                    <div key={family.id} className="flex items-center justify-between p-3 rounded-lg bg-steel-950 border border-steel-800 group">
                      {editingId === family.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 bg-steel-900 border border-steel-700 rounded px-2 py-1 text-sm text-steel-100 focus:outline-none focus:border-indigo-500"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(family.id)}
                          />
                          <button
                            onClick={() => handleSaveEdit(family.id)}
                            disabled={isPending || !editName.trim()}
                            className="text-green-500 hover:text-green-400 p-1 cursor-pointer"
                          >
                            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-steel-400 hover:text-steel-200 p-1 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-steel-200">{family.name}</span>
                            {!family.is_active && (
                              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                                {t('common.inactive', 'Inactivo')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(family.id, family.name)}
                              className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                              title={t('actions.edit', 'Editar')}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(family.id)}
                              className="p-1.5 text-steel-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title={t('actions.delete', 'Eliminar')}
                              disabled={isPending}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-steel-800">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-xs text-steel-400 hover:text-steel-200 hover:bg-steel-800 rounded disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      Anterior
                    </button>
                    <span className="text-xs text-steel-500">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-xs text-steel-400 hover:text-steel-200 hover:bg-steel-800 rounded disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

