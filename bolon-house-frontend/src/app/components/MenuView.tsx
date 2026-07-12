import { useState, useMemo } from 'react';
import { Search, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { menuCategories } from '../data/menu';

export function MenuView() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(menuCategories.map(c => c.id)));

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return menuCategories
      .filter(cat => activeCategory === 'all' || cat.id === activeCategory)
      .map(cat => ({
        ...cat,
        items: search
          ? cat.items.filter(item =>
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.description.toLowerCase().includes(search.toLowerCase())
            )
          : cat.items,
      }))
      .filter(cat => cat.items.length > 0);
  }, [activeCategory, search]);

  const totalItems = menuCategories.reduce((s, c) => s + c.items.length, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Menú</h1>
        <p className="text-gray-400 text-sm mt-0.5">{totalItems} productos en {menuCategories.length} categorías</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveCategory('all'); }}
          placeholder="Buscar producto..."
          className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all"
          style={{ backgroundColor: '#243a45', border: '1px solid #2a4050' }}
          onFocus={e => (e.target.style.borderColor = '#76BC43')}
          onBlur={e => (e.target.style.borderColor = '#2a4050')}
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => { setActiveCategory('all'); setSearch(''); }}
          className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0"
          style={activeCategory === 'all'
            ? { backgroundColor: '#76BC43', color: '#1C2E36' }
            : { backgroundColor: '#243a45', color: '#9ca3af' }
          }
        >
          Todos
        </button>
        {menuCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setSearch(''); }}
            className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5"
            style={activeCategory === cat.id
              ? { backgroundColor: '#76BC43', color: '#1C2E36' }
              : { backgroundColor: '#243a45', color: '#9ca3af' }
            }
          >
            <span>{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Categories */}
      {filtered.length === 0 && (
        <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: '#243a45' }}>
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No se encontraron productos para "{search}"</p>
        </div>
      )}

      {filtered.map(category => {
        const isExpanded = expanded.has(category.id) || !!search;
        return (
          <div key={category.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#243a45' }}>
            {/* Category Header */}
            <button
              onClick={() => toggleExpand(category.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-[#2a4050] transition-colors"
              style={{ borderBottom: isExpanded ? '1px solid #2a4050' : 'none' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{category.emoji}</span>
                <div className="text-left">
                  <h2 className="font-bold text-lg" style={{ color: '#E9C040' }}>{category.name}</h2>
                  {category.subtitle && (
                    <p className="text-gray-500 text-xs">{category.subtitle}</p>
                  )}
                </div>
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#76BC4320', color: '#76BC43' }}>
                  {category.items.length} items
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
              )}
            </button>

            {/* Items Grid */}
            {isExpanded && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 p-5">
                {category.items.map(item => (
                  <div
                    key={item.id}
                    className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.01] group"
                    style={{ backgroundColor: '#1C2E36', border: '1px solid #2a4050' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm leading-snug">{item.name}</p>
                        <p className="text-gray-500 text-xs mt-1 leading-relaxed">{item.description}</p>

                        {item.variants && item.variants.length > 0 && (
                          <div className="mt-2 space-y-0.5">
                            {item.variants.map(v => (
                              <div key={v.label} className="flex items-center gap-1.5">
                                <Tag className="w-3 h-3 text-gray-600 shrink-0" />
                                <p className="text-gray-600 text-xs">
                                  <span className="text-gray-500">{v.label}:</span> {v.options.join(' / ')}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="font-bold text-base" style={{ color: '#76BC43' }}>
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
