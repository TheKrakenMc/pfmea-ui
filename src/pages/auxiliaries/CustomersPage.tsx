import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Users } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { CustomerTable } from '../../components/customers/CustomerTable';
import { CustomerCard } from '../../components/customers/CustomerCard';
import { CustomerForm } from '../../components/customers/CustomerForm';
import DeleteCustomerConfirmation from '../../components/customers/DeleteCustomerConfirmation';
import { DataLayout } from '../../components/layout/DataLayout';
import { Pagination } from '../../components/ui/Pagination';
import { listCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../services/customerService';
import type { Customer } from '../../types/customer.types';

const CustomersPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => listCustomers(),
  });

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
      handleCloseForm();
    },
    onError: (error) => {
      toast.error('Failed to create customer');
      console.error(error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated successfully');
      handleCloseForm();
    },
    onError: (error) => {
      toast.error('Failed to update customer');
      console.error(error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully');
      setDeletingCustomer(null);
    },
    onError: (error) => {
      toast.error('Failed to delete customer');
      console.error(error);
      setDeletingCustomer(null);
    }
  });

  const handleOpenForm = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
    } else {
      setEditingCustomer(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = (data: any) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setDeletingCustomer(customer);
  };

  const confirmDelete = () => {
    if (deletingCustomer) {
      deleteMutation.mutate(deletingCustomer.id);
    }
  };

  const filtered = customers.filter((item) => {
    const term = search.toLowerCase();
    return item.company_name.toLowerCase().includes(term) || item.customer_code.toLowerCase().includes(term);
  });

  const paginated = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const actionButton = (
    <button
      onClick={() => handleOpenForm()}
      className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-sm shadow-lg shadow-indigo-900/20 cursor-pointer"
    >
      <Plus size={16} /> {t('customers.actions.create', 'Nuevo Cliente')}
    </button>
  );

  return (
    <>
      <DataLayout
        title={t('navbar.auxiliaries.customers', 'Clientes')}
        subtitle={t('customers.subtitle', 'Administrar registros de clientes y datos asociados.')}
        isLoading={isLoading}
        actionButton={actionButton}
        searchValue={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isEmpty={filtered.length === 0}
        gridContent={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map(item => (
              <CustomerCard
                key={item.id}
                customer={item}
                onEdit={handleOpenForm}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        }
        tableContent={
          <CustomerTable
            customers={paginated}
            onEdit={handleOpenForm}
            onDelete={handleDeleteClick}
          />
        }
        pagination={
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        }
      />

      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-steel-950/80 backdrop-blur-sm z-50"
              onClick={handleCloseForm}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-steel-900 border border-steel-800 rounded-2xl w-full max-w-lg pointer-events-auto overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
              >
                <div className="px-6 py-4 border-b border-steel-800/80 flex items-center justify-between bg-steel-950/50">
                  <h2 className="text-lg font-semibold text-steel-100 flex items-center gap-2">
                    <Users className="text-indigo-500" size={20} />
                    {editingCustomer ? 'Edit Customer' : 'New Customer'}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="text-steel-400 hover:text-white hover:bg-steel-700 transition-colors p-1.5 rounded-lg cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <CustomerForm
                    initialData={editingCustomer}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseForm}
                    isSubmitting={createMutation.isPending || updateMutation.isPending}
                  />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {deletingCustomer && (
        <DeleteCustomerConfirmation
          customer={deletingCustomer}
          onClose={() => setDeletingCustomer(null)}
          onConfirm={confirmDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </>
  );
};

export default CustomersPage;
