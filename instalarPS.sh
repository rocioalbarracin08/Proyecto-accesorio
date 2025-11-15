python -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1

python -m venv .venv
source .venv/bin/activate
pip install flask
pip install mysql-connector-python
pip install python-dotenv
pip install flask-cors
pip install dotenv
pip install werkzeug
pip install PyJWT
pip install Flask-Mail
