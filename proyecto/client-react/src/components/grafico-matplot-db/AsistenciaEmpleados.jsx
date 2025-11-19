import React, { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import './asistenciaEmpleado.css';

export default function AsistenciaEmpleados() {
  const { isOwner } = useAuthContext();
  const [periodo, setPeriodo] = useState('month');
  const navigate = useNavigate();

  // Redirigir si no es dueño
  if (!isOwner) {
    navigate('/perfil');
    return null;
  }

  return (
    <div className="asistencia-empleados">
      <h1>Asistencia de Empleados</h1>
      <div className="selector-periodo">
        <label>Seleccionar Período:</label>
        <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
          <option value="week">Semana</option>
          <option value="month">Mes</option>
          <option value="year">Año</option>
        </select>
      </div>
      <div className="grafico-container">
        <img 
          src={`http://localhost:5000/asistencia/grafico?periodo=${periodo}`} 
          alt="Gráfico de Asistencia" 
          style={{ maxWidth: '100%', height: 'auto' }} 
        />
      </div>
      <button onClick={() => navigate('/perfil')} className="btn-volver">Volver al Perfil</button>
    </div>
  );
}