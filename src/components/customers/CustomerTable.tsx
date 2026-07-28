import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { Customer } from '../../types/customer.types';

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onEdit,
  onDelete,
}) => {


  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-sm text-steel-300">
        <thead className="bg-steel-900/50 text-xs uppercase text-steel-400 border-b border-steel-800">
          <tr>
            <th className="px-6 py-4 font-medium">Code</th>
            <th className="px-6 py-4 font-medium">Company Name</th>
            <th className="px-6 py-4 font-medium">Email</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium text-right w-24">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-steel-800">
          {customers.map((customer) => (
            <tr
              key={customer.id}
              className="hover:bg-steel-800/30 transition-colors group"
            >
              <td className="px-6 py-4 text-steel-200 font-medium">{customer.customer_code}</td>
              <td className="px-6 py-4 text-steel-200">{customer.company_name}</td>
              <td className="px-6 py-4 text-steel-300">{customer.contact_email || '-'}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    customer.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {customer.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(customer)}
                    className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors cursor-pointer focus-ring"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(customer)}
                    className="p-1.5 text-steel-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer focus-ring"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
