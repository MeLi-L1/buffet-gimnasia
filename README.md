# Buffet 2026 · Gimnasia artística

Aplicación web simple para organizar el buffet de la muestra de fin de año.

## Incluye
- Tareas con responsable, fecha y estado.
- Muro de novedades.
- Lista de compras.
- Registro de compras y gastos directos: concepto, importe y quién pagó.
- Registro separado de mercadería retirada a consignación: producto, cantidad y quién la retiró.
- Resumen de tareas y compras pendientes.

## Probar en tu computadora
1. Descomprimí el ZIP.
2. Abrí `index.html` en Chrome.
3. En modo de prueba, los datos se guardan solo en ese navegador (localStorage).

## Activar datos compartidos con Supabase
1. Creá un proyecto en https://supabase.com/.
2. En el panel, abrí **SQL Editor**, pegá todo el contenido de `schema.sql` y ejecutalo.
3. Andá a **Project Settings > API**.
4. Copiá `Project URL` y la clave `anon` / `publishable`.
5. Abrí `config.js` y completá:
   ```js
   window.APP_CONFIG = {
     SUPABASE_URL: "https://TU-PROYECTO.supabase.co",
     SUPABASE_ANON_KEY: "TU-CLAVE-PUBLICA"
   };
   ```
6. Guardá el archivo.

**Privacidad:** esta primera versión compartida usa acceso público sin inicio de sesión. Cualquier persona que tenga el enlace y la configuración pública puede ver y modificar los registros. No carguen teléfonos, domicilios, datos de niñas, información bancaria ni otros datos sensibles. Si necesitás acceso privado por mamá/usuario, hay que agregar autenticación y restringir las políticas antes de usarla con el grupo.

## Publicar con GitHub Pages
1. Creá un repositorio nuevo en GitHub, por ejemplo `buffet-gimnasia`.
2. Subí `index.html`, `styles.css`, `app.js`, `config.js` y `schema.sql`.
3. En el repositorio, entrá a **Settings > Pages**.
4. En **Build and deployment**, elegí **Deploy from a branch**.
5. Seleccioná `main` y `/ (root)`, y guardá.
6. GitHub te mostrará el enlace público de la aplicación.

No hace falta instalar nada ni usar un servidor propio. GitHub Pages sirve los archivos estáticos.

## Sobre la caja
La caja funciona como un registro compartido, no como un sistema de contabilidad. Las compras y gastos directos se anotan en una lista con importe y persona que pagó. La mercadería a consignación se anota en otra lista con producto, cantidad retirada y persona que la retiró. La aplicación no calcula saldos, reintegros ni ganancias: esos números los pueden resolver entre ustedes al terminar el evento.
