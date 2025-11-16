import React from 'react';
import './productStockIndicator.css';

export function ProductStockIndicator({ stock, className = "" }) {
  if (!stock || stock === undefined) {
    return null;
  }

  // Si hay 3 o menos, mostrar cartel de "últimas unidades"
  if (stock > 0 && stock <= 3) {
    return (
      <div className={`stock-indicator last-units ${className}`}>
        <span className="stock-text">Últimas unidades, quedan: {stock}</span>
      </div>
    );
  }

  // Si no hay stock
  if (stock === 0) {
    return (
      <div className={`stock-indicator out-of-stock ${className}`}>
        <span className="stock-text">Sin stock</span>
      </div>
    );
  }

  // Si hay stock normal, no mostrar nada en grilla
  return null;
}

export function ProductStockDetailInfo({ stock, className = "" }) {
  if (stock === undefined || stock === null) {
    return null;
  }

  return (
    <div className={`stock-detail-info ${className}`}>
      <h4>Disponibilidad</h4>
      {stock > 3 ? (
        <p className="stock-available">
          <span className="dot-green"></span>
          En stock: {stock} unidades
        </p>
      ) : stock > 0 ? (
        <p className="stock-last-units">
          <span className="dot-gold"></span>
          ⚠️ Últimas unidades: {stock}
        </p>
      ) : (
        <p className="stock-empty">
          <span className="dot-red"></span>
          Sin stock disponible
        </p>
      )}
    </div>
  );
}
