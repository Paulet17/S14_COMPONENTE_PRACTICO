# Bolón House — Sistema de Ventas

Sistema de ventas para un local de desayunos (bolones, tigrillos, tortas, tortillas, especiales,
patacones, bebidas y extras), construido con React + Node.js/Express + MongoDB + JWT.

## Estructura del proyecto

```
bolon-house-backend/   -> API REST (Node + Express + MongoDB + JWT)
bolon-house-frontend/  -> Aplicacion React (login, dashboard, menu, pedidos, usuarios, inventario)
```

## 1. Backend

```bash
cd bolon-house-backend
npm install
cp .env.example .env      # y edita MONGO_URI / JWT_SECRET si hace falta
npm run seed               # crea el menu, el inventario y el usuario admin de prueba
npm run dev                # corre en http://localhost:5000
```

Usuario admin de prueba creado por el seed:
- **email:** admin@bolonhouse.com
- **password:** admin123

## 2. Frontend

```bash
cd bolon-house-frontend
npm install
npm run dev                # corre en http://localhost:5173 (o el puerto que indique Vite)
```

El frontend ya viene configurado para apuntar a `http://localhost:5000/api` (archivo `.env`).
Si el backend corre en otra URL, edita `VITE_API_URL` en ese archivo.

## 3. Flujo para probar

1. Corre el backend y el frontend en paralelo.
2. Entra a la app, inicia sesion con el usuario admin (o registra uno nuevo).
3. Revisa el **Menu**, crea un **Nuevo Pedido**, muévelo entre estados en **Pedidos**.
4. Como admin, entra a **Productos**, **Usuarios** e **Inventario** para probar el CRUD completo.

## 4. Postman

Importa la coleccion de Postman (endpoints documentados abajo) para probar la API por separado
del frontend, tal como pide la rubrica.

### Endpoints principales

| Método | Ruta | Acceso |
|---|---|---|
| POST | /api/auth/register | público |
| POST | /api/auth/login | público |
| POST | /api/auth/logout | privado |
| GET  | /api/auth/me | privado |
| GET  | /api/auth/usuarios | admin |
| PUT  | /api/auth/usuarios/:id | admin |
| DELETE | /api/auth/usuarios/:id | admin |
| GET  | /api/productos | público |
| POST | /api/productos | admin |
| PUT  | /api/productos/:id | admin |
| DELETE | /api/productos/:id | admin |
| GET  | /api/pedidos | privado |
| POST | /api/pedidos | privado |
| PUT  | /api/pedidos/:id | privado |
| DELETE | /api/pedidos/:id | admin |
| GET  | /api/inventario | privado |
| POST | /api/inventario | admin |
| PUT  | /api/inventario/:id | admin |
| DELETE | /api/inventario/:id | admin |

## 5. Nota sobre el Menú vs Productos administrados

La pantalla **Menú** y **Nuevo Pedido** usan el catálogo visual original del diseño (con variantes
de relleno/masa). Cada ítem está vinculado a su producto real en MongoDB mediante un campo
`codigoMenu`, así que los pedidos que se crean sí quedan guardados con datos reales del backend.
La pantalla **Productos** (panel admin) sí lee y escribe directamente contra la API — ahí puedes
crear, editar o eliminar productos y ver el CRUD completo en acción.
