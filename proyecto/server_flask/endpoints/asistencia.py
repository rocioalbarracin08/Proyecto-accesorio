from flask import Blueprint, request, send_file, g, jsonify
import pandas as pd
import matplotlib.pyplot as plt
import io
from datetime import datetime, timedelta

bp = Blueprint('asistencia', __name__, url_prefix='/asistencia')

@bp.route('/grafico', methods=['GET'])
def get_asistencia_grafico():
    # Verificar si es dueño (basado en tu AuthContext: si no tiene id_cliente ni id_empleado, es dueño)
    try:
        g.db_cursor.execute("SELECT id_cliente, id_empleado FROM usuarios WHERE id_usuario = %s", (request.cookies.get('user_id'),))  # Asume que tienes user_id en cookies; ajusta si usas JWT
        user = g.db_cursor.fetchone()
        if not user or user['id_cliente'] or user['id_empleado']:
            return jsonify({'error': 'Acceso denegado. Solo para dueños.'}), 403
    except Exception as e:
        return jsonify({'error': 'Error de autenticación'}), 401

    periodo = request.args.get('periodo', 'month')
    if periodo not in ['week', 'month', 'year']:
        return jsonify({'error': 'Período inválido. Usa: week, month, year'}), 400

    # Consulta DB
    query = """
    SELECT a.id_empleado, e.nombre, e.apellido, a.fecha
    FROM asistencia a
    JOIN empleados e ON a.id_empleado = e.id_empleado
    WHERE a.tipo = 'entrada'
    """
    g.db_cursor.execute(query)
    rows = g.db_cursor.fetchall()
    df = pd.DataFrame(rows)

    if df.empty:
        fig, ax = plt.subplots()
        ax.text(0.5, 0.5, 'No hay datos de asistencia', ha='center', va='center')
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
    else:
        df['fecha'] = pd.to_datetime(df['fecha'])
        now = datetime.now()

        # Filtrar por período
        if periodo == 'week':
            start = now - timedelta(days=now.weekday())
            end = start + timedelta(days=6)
        elif periodo == 'month':
            start = now.replace(day=1)
            end = (start + timedelta(days=31)).replace(day=1) - timedelta(days=1)
        elif periodo == 'year':
            start = now.replace(month=1, day=1)
            end = now.replace(month=12, day=31)

        df = df[(df['fecha'] >= start) & (df['fecha'] <= end)]

        # Agrupar y graficar
        asistencia = df.groupby(['id_empleado', 'nombre', 'apellido'])['fecha'].nunique().reset_index()
        asistencia.rename(columns={'fecha': 'dias_asistencia'}, inplace=True)

        fig, ax = plt.subplots(figsize=(10, 6))
        empleados = [f"{row['nombre']} {row['apellido']}" for _, row in asistencia.iterrows()]
        dias = asistencia['dias_asistencia'].tolist()
        ax.bar(empleados, dias, color='skyblue')
        ax.set_title(f'Asistencia de Empleados - {periodo.capitalize()}')
        ax.set_xlabel('Empleados')
        ax.set_ylabel('Días de Asistencia')
        plt.xticks(rotation=45, ha='right')

    # Devolver imagen
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    plt.close(fig)
    return send_file(buf, mimetype='image/png')