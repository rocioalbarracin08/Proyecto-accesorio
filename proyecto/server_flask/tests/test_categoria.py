def test_categoria_activar_desactivar(client):
    """Test que verifica que el endpoint /categorias/<id_category>/estado
    pueda activar y desactivar una categoría correctamente.
    - Primero desactiva la categoría y verifica el estado.
    - Luego la activa nuevamente y verifica el estado.
    """

    id_category = 1  

    # Obtener estado inicial
    resp_inicial = client.get(f'/categoria/{id_category}')
    assert resp_inicial.status_code == 200
    categoria_inicial = resp_inicial.get_json()
    estado_inicial = categoria_inicial.get("activo")

    # Cambiar el estado
    resp_toggle = client.patch(f'/categoria/{id_category}/estado')
    assert resp_toggle.status_code == 200
    data_toggle = resp_toggle.get_json()

    # Verificar mensaje correcto
    mensaje_esperado = "Categoría desactivada" if estado_inicial == 1 else "Categoría activada"
    assert data_toggle.get("mensaje") == mensaje_esperado

    # Verificar que el estado se invirtió realmente
    resp_final = client.get(f'/categoria/{id_category}')
    assert resp_final.status_code == 200
    categoria_final = resp_final.get_json()
    assert categoria_final.get("activo") != estado_inicial