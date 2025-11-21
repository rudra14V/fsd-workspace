import React from 'react';

// Simple reusable search + category filter component
export default function SearchFilter({ search, category, categories = [], onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
      <input
        type="search"
        placeholder="Search items..."
        value={search}
        onChange={(e) => onChange({ search: e.target.value, category })}
        style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd', flex: 1 }}
      />
      <select
        value={category || ''}
        onChange={(e) => onChange({ search, category: e.target.value })}
        style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
