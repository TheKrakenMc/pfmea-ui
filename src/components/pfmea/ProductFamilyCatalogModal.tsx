import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Plus, Trash2, Edit2, Loader2, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { productFamilyService } from '../../api/productFamilyService';
import { backdropVariants, modalCardVariants } from '../../utils/motion';

interface ProductFamilyCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductFamilyCatalogModal: React.FC<ProductFamilyCatalogModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  const {
    data: families = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['families', 'catalog'],
    queryFn: () => productFamilyService.list(false),
    enabled: isOpen,
  });
  const [isPending, setIsPending] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const loadFamilies = async () => {
    await refetch();
  };

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
  const paginatedFamilies = sortedFamilies.slice(
    (Math.min(currentPage, Math.max(1, totalPages)) - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-steel-950/75 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />
          <motion.div
            variants={modalCardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-[var(--ui-surface)] text-[var(--ui-ink)] border border-[var(--ui-line)] rounded-[var(--ui-panel-radius)] w-full max-w-md pointer-events-auto overflow-hidden flex flex-col shadow-[var(--ui-shadow-popover)] relative z-10"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--ui-line)] flex items-center justify-between bg-[var(--ui-surface-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className="detail-spec-icon" style={{ width: 36, height: 36 }}>
                  <Settings size={18} />
                </div>
                <h3 className="text-base font-semibold text-[var(--ui-ink)]">
                  {t('pfmea.catalog.productFamily.title', 'Product Family Catalog')}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="ui-icon-button"
                aria-label={t('common.close', 'Cerrar')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto bg-[var(--ui-surface)]">
              <div className="flex justify-between items-center mb-1">
                <h4 className="detail-label uppercase tracking-wider text-xs">
                  {t('pfmea.catalog.productFamily.list', 'Familias Registradas')}
                </h4>
                {!isAdding && (
                  <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="text-xs flex items-center gap-1 text-[var(--ui-accent)] hover:underline font-medium cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>{t('actions.add', 'Agregar')}</span>
                  </button>
                )}
              </div>

              {isAdding && (
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder={t('pfmea.catalog.productFamily.name', 'Nombre de la Familia...')}
                    className="ui-input param-input-compact flex-1"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  />
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={isPending || !newName.trim()}
                    className="ui-button ui-button-success"
                    style={{ minHeight: 38, padding: '8px 12px' }}
                  >
                    {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setNewName('');
                    }}
                    className="ui-icon-button"
                    style={{ minHeight: 38, width: 38, padding: 8 }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center py-6 text-[var(--ui-muted)]">
                  <Loader2 className="animate-spin text-[var(--ui-accent)]" size={20} />
                </div>
              ) : sortedFamilies.length === 0 ? (
                <p className="text-sm text-[var(--ui-muted)] text-center py-6">
                  {t('common.noData', 'No hay registros')}
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {paginatedFamilies.map(family => (
                      <div
                        key={family.id}
                        className="flex items-center justify-between p-3 rounded-[var(--ui-radius)] bg-[var(--ui-surface-subtle)] border border-[var(--ui-line)] group transition-colors hover:border-[var(--ui-line-strong)]"
                      >
                        {editingId === family.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              className="ui-input param-input-compact flex-1"
                              autoFocus
                              onKeyDown={e => e.key === 'Enter' && handleSaveEdit(family.id)}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(family.id)}
                              disabled={isPending || !editName.trim()}
                              className="ui-button ui-button-success"
                              style={{ minHeight: 36, padding: '6px 10px' }}
                            >
                              {isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Save size={14} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="ui-icon-button"
                              style={{ minHeight: 36, width: 36, padding: 6 }}
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm text-[var(--ui-ink)] font-medium truncate">
                                {family.name}
                              </span>
                              {!family.is_active && (
                                <span className="text-[10px] bg-[var(--ui-danger-bg)] text-[var(--ui-danger)] border border-[var(--ui-danger-border)] px-2 py-0.5 rounded-full font-medium">
                                  {t('common.inactive', 'Inactivo')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleEdit(family.id, family.name)}
                                className="ui-icon-button"
                                style={{ minHeight: 32, width: 32, padding: 6 }}
                                title={t('actions.edit', 'Editar')}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(family.id)}
                                className="ui-icon-button param-delete-btn"
                                style={{ minHeight: 32, width: 32, padding: 6 }}
                                title={t('actions.delete', 'Eliminar')}
                                disabled={isPending}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--ui-line)] text-xs text-[var(--ui-muted)] tabular-nums">
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="ui-icon-button"
                        style={{ minHeight: 30, width: 30, padding: 5 }}
                        aria-label="Anterior"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="document-card-id">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="ui-icon-button"
                        style={{ minHeight: 30, width: 30, padding: 5 }}
                        aria-label="Siguiente"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
