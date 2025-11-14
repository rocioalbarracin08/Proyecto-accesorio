import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./pago-tarjeta.css";

export default function PagoTarjeta() {
  const { state, search } = useLocation();
  const navigate = useNavigate();

  // obtener valores pasados por navigate o por querystring como fallback
  const qs = new URLSearchParams(search);
  const initial = {
    id_factura: state?.id_factura || qs.get("id_factura") || "",
    id_metodo_pago: state?.id_metodo_pago || qs.get("id_metodo_pago") || "",
    total: state?.total || parseFloat(qs.get("total")) || 0,
  };

  const [idFactura] = useState(initial.id_factura);
  const [idMetodoPago] = useState(initial.id_metodo_pago);
  const [total] = useState(initial.total);

  const [titular, setTitular] = useState("");
  const [numero, setNumero] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idFactura) {
      alert("No se encontró la factura. Regresando al carrito.");
      navigate("/carrito");
    }
  }, [idFactura, navigate]);

  const validar = () => {
    if (!titular.trim()) return "Ingrese el nombre del titular";
    if (!/^\d{13,19}$/.test(numero.replace(/\s+/g, ""))) return "Número de tarjeta inválido";
    if (!/^\d{2}\/\d{2}$/.test(exp)) return "Fecha inválida (MM/AA)";
    if (!/^\d{3,4}$/.test(cvv)) return "CVV inválido";
    return null;
  };

  const handlePago = async (e) => {
    e.preventDefault();
    const err = validar();
    if (err) { alert(err); return; }

    setLoading(true);
    try {
      const payload = {
        id_factura: idFactura,
        id_metodo_pago: idMetodoPago,
        total,
        tarjeta: {
          titular,
          numero: numero.replace(/\s+/g, ""),
          expiracion: exp,
          cvv,
        },
      };

      const res = await fetch("http://localhost:5000/pagos/procesar_tarjeta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Error en el procesamiento del pago");
      }

      const data = await res.json();
      alert(data.mensaje || "Pago procesado correctamente");
      navigate("/compra-confirmada", { state: { id_factura: idFactura } });
    } catch (error) {
      console.error("Error en pago:", error);
      alert("Error al procesar el pago: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pago-tarjeta-page">
      <h2>Pago con Tarjeta</h2>

      <div className="resumen">
        <p>Factura: <strong>{idFactura}</strong></p>
        <p>Método pago: <strong>{idMetodoPago}</strong></p>
        <p>Total: <strong>${Number(total).toFixed(2)}</strong></p>
      </div>

      <form className="pago-form" onSubmit={handlePago}>
        <label>
          Titular
          <input value={titular} onChange={(e) => setTitular(e.target.value)} />
        </label>

        <label>
          Número de tarjeta
          <input
            value={numero}
            onChange={(e) => setNumero(e.target.value.replace(/[^\d\s]/g, ""))}
            placeholder="1234 5678 9012 3456"
          />
        </label>

        <label>
          Expiración (MM/AA)
          <input value={exp} onChange={(e) => setExp(e.target.value)} placeholder="MM/AA" />
        </label>

        <label>
          CVV
          <input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))} maxLength={4} />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Procesando..." : `Pagar $${Number(total).toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}