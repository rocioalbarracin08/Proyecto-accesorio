# Crear entorno virtual
python -m venv .venv

# Activar entorno virtual en PowerShell
.\.venv\Scripts\Activate.ps1

# Instalar dependencias Python
pip install flask
pip install mysql-connector-python
pip install python-dotenv
pip install flask-cors
pip install werkzeug
pip install PyJWT
pip install flask-mail
pip install Flask-Mail

# Instalar dependencias de React
npm install react-leaflet leaflet
