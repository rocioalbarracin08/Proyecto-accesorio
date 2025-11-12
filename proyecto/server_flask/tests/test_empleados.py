def test_toggle_empleado_activo(client):
   """
   Test que verifica que el endpoint PATCH /empleados/desactivar/<id> alterne
   el estado `activo` de un empleado. Se loguea primero como dueño para
   obtener la cookie de autenticación usada por el decorador `solo_dueno`.
   Este test asume que existe un empleado con id_empleado = 1 en la DB.
   """
   #Loguea como dueño (usar credenciales existentes en la DB de test, no te deja hcer el test si no sos el dueño ya que solo el puede activar/desactivar)
   login_payload = {"email": "dueño@gmail.com", "password": "ro123"} 
   
   #cambiar al de dueño
   login_resp = client.post("/usuarios/login", json=login_payload)
   assert login_resp.status_code == 200

   token_cookie = login_resp.headers.get("Set-Cookie")
   assert token_cookie is not None

   #Obtiene la lista de empleados y buscar el empleado con id 9, que es el de dueño
   resp = client.get("/empleados/listar", headers={"Cookie": token_cookie})
   assert resp.status_code == 200
   empleados = resp.get_json()
   empleado = next((e for e in empleados if e.get('id_empleado') == 9), None)
   assert empleado is not None, "No se encontró empleado con id_empleado = 9"

   inicial_activo = empleado.get('activo') #aca veo si está activo o no
   assert inicial_activo in (0, 1)

   #Llama al endpoint para alternar el estado
   patch_resp = client.patch('/empleados/desactivar/9', headers={"Cookie": token_cookie})
   assert patch_resp.status_code == 200
   data = patch_resp.get_json()

   # Mensaje esperado según el estado inicial
   esperado = "Empleado desactivado" if inicial_activo == 1 else "Empleado activado"
   assert data.get('mensaje') == esperado

   #Volver a listar y comprobar que el estado cambió
   resp2 = client.get("/empleados/listar", headers={"Cookie": token_cookie})
   assert resp2.status_code == 200
   empleados2 = resp2.get_json()
   empleado2 = next((e for e in empleados2 if e.get('id_empleado') == 9), None)
   assert empleado2 is not None

   esperado_activo = 0 if inicial_activo == 1 else 1
   assert empleado2.get('activo') == esperado_activo

