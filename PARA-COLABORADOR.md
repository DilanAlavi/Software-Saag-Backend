# Instrucciones para correr el proyecto (entorno de staging)

Este archivo es para quien vaya a ayudar a programar/probar el sistema en su propia computadora.

## Qué te deben pasar

Te tienen que dar el archivo **`.env`** (el que dice arriba `✅ STAGING` en un comentario).
**Nunca** el archivo `.env.production` — ese es la base de datos real del negocio, no se toca ni se comparte.

## Pasos

1. Clonar el repositorio del backend (`Software-Saag-Backend`).
2. Poner el archivo `.env` que te pasaron en la raíz del proyecto backend (al lado de `package.json`).
3. Instalar dependencias:
   ```
   npm install
   ```
4. Generar el cliente de Prisma:
   ```
   npx prisma generate
   ```
5. Arrancar el servidor en modo desarrollo:
   ```
   npm run start:dev
   ```
   Esto va a leer el `.env` automáticamente (staging) — **no** hace falta poner nada especial, así arranca por defecto.
6. El backend queda escuchando en `http://localhost:3000`.
7. Clonar el repositorio del frontend (`Software-Saag-Frontend`), `npm install`, y `npm run dev` — por defecto se conecta a `http://localhost:3000`.

## Reglas importantes

- Todo lo que hagas en staging (crear ventas, productos, clientes de prueba) **no afecta el negocio real** — es justo para eso, para romper y probar tranquilo.
- Si en algún momento ves un archivo `.env.production` en el proyecto: **ignoralo, no lo abras, no lo copies a ningún lado.**
- Si necesitás correr una migración de base de datos nueva, avisá antes de aplicarla — staging comparte el mismo historial de migraciones que producción, así que las migraciones sí importan y deben coordinarse.
