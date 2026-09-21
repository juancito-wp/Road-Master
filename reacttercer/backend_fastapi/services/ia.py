"""Servicio de IA del chatbot.

Usa la API de OpenAI (Chat Completions) cuando `OPENAI_API_KEY` está configurada.
Si la clave no existe o el servicio falla, responde con un motor local basado en el
catálogo real de productos, servicios y el proceso de PQR del proyecto.
"""

import json
import os
import unicodedata

from openai import OpenAI, OpenAIError

OPENAI_MODELO = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
TIMEOUT = 25

INSTRUCCIONES = (
    'Eres el asistente virtual de Road Master, concesionario y taller de motos y vehículos de carga. '
    'Atiendes en español, con tono cercano y profesional, respuestas breves (máximo 120 palabras). '
    'Puedes: resolver preguntas frecuentes, orientar sobre productos y servicios del catálogo, '
    'explicar el proceso de compra y cotización, e indicar cómo registrar o consultar una PQR. '
    'Usa únicamente la información del contexto entregado; si no la tienes, invita a contactar a un asesor '
    'o a registrar la consulta como PQR. No inventes precios, plazos ni disponibilidad.'
)


def _sin_acentos(texto: str) -> str:
    return ''.join(c for c in unicodedata.normalize('NFD', texto.lower()) if unicodedata.category(c) != 'Mn')


def respuesta_local(mensaje: str, contexto: dict) -> str:
    """Motor de respaldo sin IA: responde con datos reales del catálogo."""
    texto = _sin_acentos(mensaje)
    productos = contexto.get('productos', [])
    servicios = contexto.get('servicios', [])
    enlaces = contexto.get('enlaces', {})

    if any(p in texto for p in ('hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'buen dia')):
        return ('¡Hola! Soy el asistente virtual de Road Master. Puedo ayudarte con información de '
                'productos, servicios, cotizaciones y PQR. ¿Qué necesitas saber?')

    if any(p in texto for p in ('pqr', 'queja', 'reclamo', 'peticion', 'sugerencia')):
        return ('Para registrar una PQR: inicia sesión como cliente, entra a "Mi cuenta" y abre la sección '
                '"PQR". Allí eliges el tipo (petición, queja, reclamo o sugerencia), escribes el asunto y la '
                f'descripción. Puedes seguir su estado en la misma sección. Detalle: {enlaces.get("pqr", "sección PQR del panel del cliente")}.')

    if any(p in texto for p in ('precio', 'cuanto cuesta', 'costo', 'valor', 'cotizacion', 'cotizar')):
        if productos:
            muestra = ', '.join(f"{p['nombre']} (${p['precio']:,.0f})" for p in productos[:4])
            return (f'Estos son algunos precios de referencia del catálogo: {muestra}. '
                    'Si quieres una cotización formal, abre el modelo que te interesa y usa el botón '
                    '"Cotizar este modelo"; un asesor te contactará.')
        return 'Aún no tengo precios cargados en el catálogo. Registra tu consulta como PQR y un asesor te contactará.'

    if any(p in texto for p in ('servicio', 'mantenimiento', 'revision', 'taller')):
        if servicios:
            muestra = ', '.join(f"{s['nombre']} (${s['precio']:,.0f})" for s in servicios[:5])
            return f'Estos son los servicios disponibles: {muestra}. ¿Te agendo una revisión?'
        return 'Puedo orientarte con los servicios de taller y mantenimiento del concesionario. ¿Cuál necesitas?'

    if any(p in texto for p in ('producto', 'modelo', 'catalogo', 'moto', 'vehiculo', 'comprar', 'compra')):
        if productos:
            muestra = ', '.join(p['nombre'] for p in productos[:6])
            return (f'Del catálogo tengo disponibles: {muestra}. Puedes ver el detalle en '
                    f'{enlaces.get("catalogo", "la sección Modelos")} y enviar tu solicitud o registrar la venta '
                    'desde el panel del administrador.')
        return 'Puedes explorar el catálogo completo de modelos en la sección correspondiente del sitio.'

    if any(p in texto for p in ('contacto', 'telefono', 'whatsapp', 'correo', 'direccion', 'horario')):
        return ('Puedes escribirnos por el botón de WhatsApp del sitio, enviar una solicitud desde la página de '
                'contacto o registrar una PQR desde tu cuenta. Atendemos de lunes a sábado.')

    if any(p in texto for p in ('gracias', 'muchas gracias')):
        return '¡Con mucho gusto! Si necesitas algo más, aquí estoy. 🏍️'

    return ('Puedo ayudarte con: precios y disponibilidad del catálogo, servicios de taller, '
            'cómo comprar o cotizar, información de contacto y registro o consulta de PQR. '
            '¿Sobre cuál de estos temas quieres que te oriente?')


def responder_con_ia(mensaje: str, historial: list[dict], contexto: dict) -> tuple[str, str]:
    """Devuelve (respuesta, fuente) usando OpenAI o el motor local."""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        return respuesta_local(mensaje, contexto), 'local'

    mensajes = [
        {'role': 'system', 'content': f'{INSTRUCCIONES}\n\nContexto del sistema:\n{json.dumps(contexto, ensure_ascii=False)}'},
    ]
    mensajes += [
        {'role': item['rol'], 'content': item['contenido']}
        for item in historial[-10:]
        if item.get('contenido')
    ]
    mensajes.append({'role': 'user', 'content': mensaje})

    try:
        cliente = OpenAI(api_key=api_key, timeout=TIMEOUT)
        respuesta = cliente.chat.completions.create(
            model=OPENAI_MODELO,
            messages=mensajes,
            temperature=0.4,
            max_tokens=500,
        )
        texto = (respuesta.choices[0].message.content or '').strip()
        if texto:
            return texto, 'openai'
    except (OpenAIError, KeyError, ValueError, IndexError):
        pass

    return respuesta_local(mensaje, contexto), 'local'
