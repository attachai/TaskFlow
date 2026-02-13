import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { Category } from '../types';

const Categories: React.FC = () => {
  const { categories, addCategory, deleteCategory, updateCategory } = useStore();
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

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
          // Reset to default color or keep selected? Keep selected for easier batch add
      }
  };

  const startEdit = (cat: Category) => {
      setEditingId(cat.id);
      setEditName(cat.name);
      setEditColor(cat.color);
  };

  const cancelEdit = () => {
      setEditingId(null);
      setEditName('');
      setEditColor('');
  };

  const saveEdit = () => {
      if (editingId && editName.trim()) {
          updateCategory(editingId, { name: editName, color: editColor });
          cancelEdit();
      }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Manage Categories</h1>
            <p className="text-slate-500 mt-1">Organize your tasks with custom categories.</p>
        </div>

        {/* Create Category */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">Create New Category</h2>
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
                                aria-label={`Select color ${c}`}
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

        {/* Categories List */}
        <div className="space-y-4">
             <h2 className="text-lg font-semibold text-slate-800">Your Categories</h2>
             <div className="grid grid-cols-1 gap-3">
                 {categories.map(cat => (
                     <div 
                        key={cat.id} 
                        className={`transition-all bg-white border rounded-lg ${
                            editingId === cat.id 
                                ? 'p-4 border-blue-300 ring-4 ring-blue-50/50 shadow-md' 
                                : 'p-3 border-slate-200 hover:border-slate-300 hover:shadow-sm flex items-center justify-between'
                        }`}
                     >
                         {editingId === cat.id ? (
                             // Edit Mode
                             <div className="space-y-4">
                                 <div className="flex items-center gap-3">
                                     <div className="flex-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Name</label>
                                        <input 
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if(e.key === 'Enter') saveEdit();
                                                if(e.key === 'Escape') cancelEdit();
                                            }}
                                        />
                                     </div>
                                 </div>
                                 
                                 <div>
                                     <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Color</label>
                                     <div className="flex flex-wrap gap-2">
                                         {colors.map(c => (
                                             <button
                                                 key={c}
                                                 onClick={() => setEditColor(c)}
                                                 className={`w-6 h-6 rounded-full ${c} ${editColor === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-70 hover:opacity-100'}`}
                                             />
                                         ))}
                                     </div>
                                 </div>

                                 <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                     <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                         <X size={14} className="mr-1" /> Cancel
                                     </Button>
                                     <Button size="sm" onClick={saveEdit}>
                                         <Check size={14} className="mr-1" /> Save Changes
                                     </Button>
                                 </div>
                             </div>
                         ) : (
                             // View Mode
                             <>
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full ${cat.color}`}></div>
                                    <span className="font-medium text-slate-700">{cat.name}</span>
                                    {cat.isDefault && (
                                        <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Default</span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-1">
                                     <button 
                                        onClick={() => startEdit(cat)}
                                        className="text-slate-400 hover:text-blue-600 p-2 rounded-md hover:bg-blue-50 transition-colors"
                                        title="Rename category"
                                     >
                                         <Edit2 size={16} />
                                     </button>

                                     {!cat.isDefault ? (
                                         <button 
                                            onClick={() => {
                                                if(window.confirm(`Delete category "${cat.name}"? Tasks will remain uncategorized.`)) {
                                                    deleteCategory(cat.id);
                                                }
                                            }}
                                            className="text-slate-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors"
                                            title="Delete category"
                                         >
                                             <Trash2 size={16} />
                                         </button>
                                     ) : (
                                         <div className="w-8 h-8"></div> /* Spacer for alignment */
                                     )}
                                </div>
                             </>
                         )}
                     </div>
                 ))}
             </div>
        </div>
    </div>
  );
};

export default Categories;