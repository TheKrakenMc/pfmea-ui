import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Plus, Trash2, Edit2, Loader2, Save } from 'lucide-react';
import {
  useTechnologyCategories,
  useCreateTechnologyCategory,
  useUpdateTechnologyCategory,
  useDeleteTechnologyCategory,
} from '../../hooks/useTechnology';

interface TechnologyCategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TechnologyCategoryManager: React.FC<TechnologyCategoryManagerProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { data: categories, isLoading } = useTechnologyCategories();
  const createMutation = useCreateTechnologyCategory();
  const updateMutation = useUpdateTechnologyCategory();
  const deleteMutation = useDeleteTechnologyCategory();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  // Sorting
  const sortedCategories = categories ? [...categories].sort((a, b) => a.name.localeCompare(b.name)) : [];

  // Pagination
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sortedCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = sortedCategories.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleSaveEdit = async (id: number) => {
    if (!editName.trim()) return;
    await updateMutation.mutateAsync({ id, name: editName });
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await createMutation.mutateAsync({ name: newName });
    setNewName('');
    setIsAdding(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('technologies.categories.deleteConfirm', 'Are you sure you want to delete this category?'))) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-steel-950/80 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-steel-900 border border-steel-800 rounded-2xl w-full max-w-md pointer-events-auto overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-steel-800/80 flex items-center justify-between bg-steel-950/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Settings size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-steel-100">
                    {t('technologies.categories.manageTitle', 'Manage Categories')}
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
                    {t('technologies.categories.list', 'Categories List')}
                  </h4>
                  {!isAdding && (
                    <button
                      onClick={() => setIsAdding(true)}
                      className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      <Plus size={14} /> {t('actions.add', 'Add')}
                    </button>
                  )}
                </div>

                {isAdding && (
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={t('technologies.categories.namePlaceholder', 'Category name...')}
                      className="flex-1 bg-steel-950 border border-steel-700 rounded-lg px-3 py-2 text-sm text-steel-100 focus:outline-none focus:border-indigo-500"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                      onClick={handleAdd}
                      disabled={createMutation.isPending || !newName.trim()}
                      className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    </button>
                    <button
                      onClick={() => {
                        setIsAdding(false);
                        setNewName('');
                      }}
                      className="p-2 text-steel-400 hover:bg-steel-800 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-indigo-500" />
                  </div>
                ) : sortedCategories.length === 0 ? (
                  <p className="text-sm text-steel-500 text-center py-4">
                    {t('technologies.categories.empty', 'No categories found.')}
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {paginatedCategories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-steel-950 border border-steel-800 group">
                          {editingId === cat.id ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="flex-1 bg-steel-900 border border-steel-700 rounded px-2 py-1 text-sm text-steel-100 focus:outline-none focus:border-indigo-500"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(cat.id)}
                              />
                              <button
                                onClick={() => handleSaveEdit(cat.id)}
                                disabled={updateMutation.isPending || !editName.trim()}
                                className="text-green-500 hover:text-green-400 p-1"
                              >
                                {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-steel-400 hover:text-steel-200 p-1"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm text-steel-200">{cat.name}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEdit(cat.id, cat.name)}
                                  className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                  title={t('actions.edit')}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(cat.id)}
                                  className="p-1.5 text-steel-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title={t('actions.delete')}
                                  disabled={deleteMutation.isPending}
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
                          className="px-3 py-1 text-xs text-steel-400 hover:text-steel-200 hover:bg-steel-800 rounded disabled:opacity-50 transition-colors"
                        >
                          Anterior
                        </button>
                        <span className="text-xs text-steel-500">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-xs text-steel-400 hover:text-steel-200 hover:bg-steel-800 rounded disabled:opacity-50 transition-colors"
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
        </>
      )}
    </AnimatePresence>
  );
};

export default TechnologyCategoryManager;
