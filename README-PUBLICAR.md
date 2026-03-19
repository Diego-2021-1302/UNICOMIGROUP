# Publicar My Town Map

## Opción más fácil: Netlify
1. Entra a Netlify y crea una cuenta.
2. Descomprime este proyecto si todavía está en ZIP.
3. Sube la carpeta completa `my-town-map-google-premium` en el publicador manual.
4. Netlify te dará un link público que termina en `.netlify.app`.

## Opción con GitHub Pages
1. Sube estos archivos a un repositorio de GitHub.
2. En Settings > Pages, publica desde la rama `main` y la carpeta `/root`.
3. GitHub te dará un link público.

## Opción con Vercel
1. Crea una cuenta en Vercel.
2. Importa el proyecto o súbelo con drag-and-drop/CLI.
3. Vercel te dará un link público.

## Importante antes de publicar
Este proyecto usa Google Maps y la API key está en `config.js`.
Antes de publicar:
- usa tu propia API key
- restrínge la key a tu dominio o a los dominios de prueba
- habilita solo las APIs que realmente uses

## Dominios recomendados para restringir la key mientras pruebas
- `http://localhost:*`
- `https://*.netlify.app/*`
- `https://*.vercel.app/*`
- tu dominio final cuando lo tengas
