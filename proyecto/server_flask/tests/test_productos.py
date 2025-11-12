def test_productos_por_categoria(client):
    """Test que verifica que el endpoint /productos/categorias devuelva las categorías esperadas.
    - Llama al endpoint pasando una categoría de ejemplo y verifica la estructura de la respuesta.
    - Comprueba campos de paginación y que `productos` sea una lista.
    """

    id_categoria = 1

    # Llamada al endpoint con paginación por defecto
    resp = client.get(f'/productos/por_categoria/{id_categoria}')
    assert resp.status_code == 200

    data = resp.get_json()
    # Verificar que la respuesta tenga la estructura esperada
    assert isinstance(data, dict), "La respuesta debe ser un diccionario JSON"
    assert 'productos' in data, "Debe incluir la clave 'productos'"
    assert isinstance(data['productos'], list), "'productos' debe ser una lista"

    # Campos de paginación esperados
    for campo in ('page', 'per_page', 'total_pages', 'total_productos', 'has_next', 'has_prev'):
        assert campo in data, f"Debe incluir '{campo}'"

    # total_productos debe ser entero >= 0
    assert isinstance(data['total_productos'], int) and data['total_productos'] >= 0

    # Si hay productos, verificar estructura mínima de un elemento
    if data['productos']:
        prod = data['productos'][0]
        assert 'id_producto' in prod or 'id' in prod or 'name' in prod, "Cada producto debe tener al menos id o nombre"