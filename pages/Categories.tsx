import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Trash2, Plus } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';

const Categories: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useStore();
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');

  const colors = [
      'bg-slate-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500',
      'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500',
      'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500',
      'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
      'bg-pink-500', 'bg-rose-500'
  ];

  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if(newCatName.trim()) {
          addCategory(newCatName, selectedColor);
          setNewCatName('');
      }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Manage Categories</h1>
            <p className="text-slate-500 mt-1">Organize your tasks with custom categories.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4">Create New Category</h2>
            <form onSubmit={handleAdd} className="space-y-4">
                <Input 
                    placeholder="Category Name" 
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                />
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Color Label</label>
                    <div className="flex flex-wrap gap-2">
                        {colors.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setSelectedColor(c)}
                                className={`w-8 h-8 rounded-full ${c} transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 ${selectedColor === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={!newCatName.trim()}>
                        <Plus size={16} className="mr-2" />
                        Add Category
                    </Button>
                </div>
            </form>
        </div>

        <div className="space-y-3">
             <h2 className="text-lg font-semibold text-slate-800">Your Categories</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {categories.map(cat => (
                     <div key={cat.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg group hover:shadow-md transition-all">
                         <div className="flex items-center gap-3">
                             <div className={`w-4 h-4 rounded-full ${cat.color}`}></div>
                             <span className="font-medium text-slate-700">{cat.name}</span>
                         </div>
                         
                         {!cat.isDefault && (
                             <button 
                                onClick={() => {
                                    if(window.confirm(`Delete category "${cat.name}"? Tasks will remain uncategorized.`)) {
                                        deleteCategory(cat.id);
                                    }
                                }}
                                className="text-slate-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors"
                             >
                                 <Trash2 size={16} />
                             </button>
                         )}
                         {cat.isDefault && (
                             <span className="text-xs text-slate-400 italic px-2">Default</span>
                         )}
                     </div>
                 ))}
             </div>
        </div>
    </div>
  );
};

export default Categories;