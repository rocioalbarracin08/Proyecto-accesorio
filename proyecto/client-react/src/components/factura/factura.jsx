import { useCarrito } from "../../contexts/CarritoContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./factura.css";

export function Factura() {
  const { state } = useCarrito();
  const { isLogged, user } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [entrega, setEntrega] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");

  useEffect(() => {
    console.log("User from context:", user); 
    console.log("isLogged set to:", isLogged);
  }, [user]);

  // Actualizar email cuando user cambie
  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleEntregaClick = (opcion) => setEntrega(opcion);

  // Función para validar si el formulario está completo
  const isFormValid = useMemo(() => {
    if (!user || !isLogged) return false;
    if (!email.trim()) return false;
    if (!entrega) return false;
    if (!nombre.trim() || !apellido.trim()) return false;
    if (entrega === "envio" && (!direccion.trim() || !ciudad.trim() || !provincia.trim() || !codigoPostal.trim())) {
      return false;
    }
    return true;
  }, [user, isLogged, email, entrega, nombre, apellido, direccion, ciudad, provincia, codigoPostal]);

  const handleFinalizar = () => {
    if (!user) {
      alert("Debes iniciar sesión para finalizar la compra.");
      navigate("/login");
      return;
    }
    if (!email) {
      alert("Por favor ingrese su correo electrónico.");
      return;
    }
    if (!entrega) {
      alert("Por favor seleccione un método de entrega.");
      return;
    }
    if (!nombre || !apellido) {
      alert("Por favor complete nombre y apellido.");
      return;
    }
    if (entrega === "envio" && (!direccion || !ciudad || !provincia || !codigoPostal)) {
      alert("Por favor complete todos los campos de dirección para envío a domicilio.");
      return;
    }
 
    
    // Construir payload para enviar al backend
    const payload = {
      id_factura: Date.now().toString(), // temporal: usar timestamp como id de factura; idealmente el backend debe generar el id
      entrega, // Indicamos la opción seleccionada para que el backend decida qué guardar
      mail: email,
      nombre,
      apellido,
      
      // Enviamos los datos de dirección sólo si el usuario seleccionó envío
      direccion: entrega === "envio" ? direccion : null,
      ciudad: entrega === "envio" ? ciudad : null,
      provincia: entrega === "envio" ? provincia : null,
      codigo_postal: entrega === "envio" ? codigoPostal : null,
      total: state.totalPrice,
      items: Object.entries(state.items).map(([id, item]) => ({
        producto_id: item.producto.id || id,
        nombre_producto: item.producto.nombre || item.producto.name,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio,
        subtotal: (item.cantidad * item.producto.precio),
      })),
    };

    // Enviar al endpoint; el backend actual espera un solo detalle por petición,
    // pero aquí enviamos un lote. Si el backend no acepta lote, puede ajustarse.
    fetch("http://localhost:5000/detalle_factura/insertar/compra", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Error al guardar la factura");
        }
        return res.json();
      })
      .then((data) => {
        alert(data.mensaje || `Pedido enviado a ${email} con entrega: ${entrega}`);
        // Aquí podríamos limpiar el carrito o redirigir
        navigate("/");
      })
      .catch((err) => {
        console.error("Error al enviar factura:", err);
        alert("Ocurrió un error al procesar la compra: " + err.message);
      });
  };

  return (
    <div className="factura-page">
      <h2>Factura de Compra</h2>
      
      {/* Contenedor principal con layout lateral */}
      <div className="factura-container">
        {/* Columna izquierda: Tabla de la factura */}
        <div className="factura-table">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(state.items).map(([id, item]) => (
                <tr key={item.producto.id || id}>
                  <td>{item.producto.nombre || item.producto.name}</td>
                  <td>${item.producto.precio}</td>
                  <td>{item.cantidad}</td>
                  <td>${(item.cantidad * item.producto.precio).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Total: ${state.totalPrice.toFixed(2)}</h3>
        </div>

        {/* Columna derecha: Opciones de entrega o mensaje */}
        <div className="factura-options">
          {isLogged ? (
            <form className="factura-form">
              {/* Botones de entrega siempre visibles */}
              <div className="factura-entrega-buttons">
                <button
                  type="button"
                  onClick={() => handleEntregaClick("sucursal")}
                  style={{
                    backgroundColor: entrega === "sucursal" ? "#f0b6c1" : "#fff",
                  }}
                >
                  Retiro en Sucursal
                </button>
                <button
                  type="button"
                  onClick={() => handleEntregaClick("envio")}
                  style={{
                    backgroundColor: entrega === "envio" ? "#f0b6c1" : "#fff",
                  }}
                >
                  Envío a domicilio
                </button>
              </div>

              {/* Formulario completo solo si se seleccionó un método de entrega */}
              {entrega && (
                <>
                  <label>
                    <input
                    placeholder="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </label>

                  <label>
                    <input 
                    placeholder="Nombre"
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  </label>

                  <label>
                    <input 
                    placeholder="Apellido"
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                    />
                  </label>

               

                  {/* Campos adicionales si selecciona envío */}
                  {entrega === "envio" && (
                    <div className="direccion-section">
                      <label>
                        <input
                        placeholder="Direccion"
                          type="text"
                          value={direccion}
                          onChange={(e) => setDireccion(e.target.value)}
                        />
                      </label>
                      <label>
                        <input
                        placeholder="Ciudad"
                          type="text"
                          value={ciudad}
                          onChange={(e) => setCiudad(e.target.value)}
                        />
                      </label>
                      <label>
                        <input
                        placeholder="Provincia"
                          type="text"
                          value={provincia}
                          onChange={(e) => setProvincia(e.target.value)}
                        />
                      </label>
                      <label>
                        <input
                        placeholder="Codigo postal"
                          type="text"
                          value={codigoPostal}
                          onChange={(e) => setCodigoPostal(e.target.value)}
                        />
                      </label>
                    </div>
                  )}

                  <button 
                    className="btn-finalizar" 
                    onClick={handleFinalizar}
                    disabled={!isFormValid}
                  >
                    Finalizar Compra
                  </button>
                </>
              )}
            </form>
          ) : (
            <p style={{ color: "red" }}>
              Debes iniciar sesión para seleccionar el método de entrega.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}