// pagina publica de politica de privacidad que google play pide para publicar la app
export const PRIVACY_POLICY_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Política de privacidad · SIPERIL</title>
<style>
  body { margin: 0; background: #f4f2ee; color: #161616; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; }
  header { background: #161616; color: #fff; padding: 28px 20px; border-bottom: 6px solid #e8870a; }
  header h1 { margin: 0; font-size: 1.6rem; }
  header p { margin: 6px 0 0; color: #f0b429; }
  main { max-width: 820px; margin: 0 auto; padding: 24px 20px 56px; }
  h2 { margin-top: 32px; font-size: 1.2rem; border-left: 5px solid #e8870a; padding-left: 10px; }
  li { margin-bottom: 6px; }
  table { border-collapse: collapse; width: 100%; background: #fff; }
  th, td { border: 1px solid #d8d3c8; padding: 8px 10px; text-align: left; vertical-align: top; font-size: 0.95rem; }
  th { background: #161616; color: #fff; }
  small { color: #555; }
</style>
</head>
<body>
<header>
  <h1>Política de privacidad de SIPERIL</h1>
  <p>Industrias SIPERIL S.A.S. · Seguridad industrial</p>
</header>
<main>
  <p><small>Última actualización: 27 de octubre de 2026</small></p>

  <p>
    SIPERIL es una aplicación para registrar y consultar reportes de seguridad industrial: actos y condiciones
    inseguras, accidentes de trabajo, mantenimientos, accidentes viales y daños de equipos de trabajo en alturas.
    Esta política explica qué datos se recogen, para qué se usan y con quién se comparten.
  </p>

  <h2>1. Quién es el responsable</h2>
  <p>
    El responsable del tratamiento es Industrias SIPERIL S.A.S. La aplicación fue publicada por Melissa Saenz.
    Para cualquier consulta sobre tus datos escribe a <strong>lamelainge@gmail.com</strong>.
  </p>

  <h2>2. Qué datos recogemos</h2>
  <table>
    <tr><th>Dato</th><th>Cuándo se recoge</th><th>Para qué se usa</th></tr>
    <tr>
      <td>Nombre, correo, empresa y número de empleado</td>
      <td>Al crear la cuenta</td>
      <td>Identificar al trabajador y asociar sus reportes</td>
    </tr>
    <tr>
      <td>Contraseña</td>
      <td>Al crear la cuenta</td>
      <td>Iniciar sesión. Se guarda cifrada y nadie puede leerla</td>
    </tr>
    <tr>
      <td>Contenido del reporte: tipo, descripción, fecha, hora, turno, lugar y datos del equipo</td>
      <td>Al crear o editar un reporte</td>
      <td>Registrar el incidente y darle seguimiento</td>
    </tr>
    <tr>
      <td>Ubicación (latitud y longitud)</td>
      <td>Solo si pulsas el botón de ubicación del reporte</td>
      <td>Señalar dónde ocurrió el incidente y consultar el clima del lugar</td>
    </tr>
    <tr>
      <td>Fotos de evidencia</td>
      <td>Solo si tomas o eliges una foto en el reporte</td>
      <td>Documentar el incidente</td>
    </tr>
    <tr>
      <td>Fecha de creación de la cuenta y del primer inicio de sesión</td>
      <td>Al registrarte y al entrar por primera vez</td>
      <td>Llevar el registro de ingresos que consulta el administrador</td>
    </tr>
  </table>

  <h2>3. Permisos del dispositivo</h2>
  <ul>
    <li><strong>Cámara y fotos:</strong> para adjuntar la evidencia fotográfica de un reporte. Solo se usan cuando tú los pides.</li>
    <li><strong>Ubicación:</strong> para registrar el lugar del incidente. Solo se usa cuando pulsas el botón de ubicación.</li>
    <li><strong>Internet:</strong> para enviar y consultar los reportes en el servidor.</li>
  </ul>
  <p>Puedes retirar cualquier permiso en los ajustes de tu teléfono. La aplicación sigue funcionando y puedes escribir el lugar a mano.</p>

  <h2>4. Con quién se comparten los datos</h2>
  <p>No vendemos tus datos ni los usamos para publicidad. Para que la aplicación funcione se apoya en estos servicios:</p>
  <ul>
    <li><strong>Render:</strong> aloja el servidor de la aplicación.</li>
    <li><strong>Neon:</strong> almacena la base de datos con las cuentas, los reportes y las fotos.</li>
    <li><strong>EmailJS:</strong> envía un aviso por correo a la empresa cada vez que se crea un reporte, con el resumen del incidente.</li>
    <li><strong>OpenWeather:</strong> recibe las coordenadas del incidente, sin tu nombre, para devolver el clima del lugar.</li>
  </ul>
  <p>Los reportes pueden ser vistos por el administrador de la empresa. Cada trabajador ve únicamente sus propios reportes.</p>

  <h2>5. Seguridad</h2>
  <ul>
    <li>La comunicación entre la aplicación y el servidor viaja cifrada (HTTPS).</li>
    <li>Las contraseñas se guardan con cifrado y no se pueden recuperar.</li>
    <li>El registro de ingresos y el panel de administración solo están disponibles para el administrador.</li>
  </ul>

  <h2>6. Cuánto tiempo se conservan</h2>
  <p>
    Los datos se conservan mientras la cuenta esté activa o mientras la empresa los necesite para el seguimiento de la
    seguridad laboral. Un reporte puede eliminarse desde la aplicación y su foto se elimina junto con él.
  </p>

  <h2>7. Tus derechos</h2>
  <p>
    Puedes pedir acceso, corrección o eliminación de tus datos personales y de tu cuenta escribiendo a
    <strong>lamelainge@gmail.com</strong>. Respondemos en un plazo razonable.
  </p>

  <h2>8. Menores de edad</h2>
  <p>SIPERIL está pensada para trabajadores adultos y no está dirigida a menores de edad.</p>

  <h2>9. Cambios en esta política</h2>
  <p>Si la política cambia, publicaremos la nueva versión en esta misma dirección con su fecha de actualización.</p>
</main>
</body>
</html>
`;
