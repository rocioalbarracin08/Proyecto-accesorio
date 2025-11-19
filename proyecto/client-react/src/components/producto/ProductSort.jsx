import React, { useState } from 'react';
import { FaSort } from 'react-icons/fa';
import './productSort.css';

/**
 * Componente para ordenar productos
 * Permite ordenar por:
 * - Mayor a menor precio
 * - Menor a mayor precio
 * - Alfabético A-Z
 * - Alfabético Z-A
 */
export function ProductSort({ onSortChange, currentSort }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const sortOptions = [
    { id: 'price-high', label: 'Mayor a menor precio', value: 'price-desc' },
    { id: 'price-low', label: 'Menor a mayor precio', value: 'price-asc' },
    { id: 'name-asc', label: 'A - Z (Alfabético)', value: 'name-asc' },
    { id: 'name-desc', label: 'Z - A (Alfabético)', value: 'name-desc' },
  ];

  const handleSort = (sortValue) => {
    onSortChange(sortValue);
    setShowDropdown(false);
  };

  const getCurrentLabel = () => {
    const current = sortOptions.find(opt => opt.value === currentSort);
    return current ? current.label : 'Ordenar productos';
  };

  return (
    <div className="product-sort-container">
      <button
        className="sort-button"
        onClick={() => setShowDropdown(!showDropdown)}
        title="Ordenar productos"
      >
        <FaSort className="sort-icon" />
        <span className="sort-label">{getCurrentLabel()}</span>
      </button>

      {showDropdown && (
        <div className="sort-dropdown">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              className={`sort-option ${currentSort === option.value ? 'active' : ''}`}
              onClick={() => handleSort(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
