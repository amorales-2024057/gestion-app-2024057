# Gestión-app

## De qué se trata este proyecto

Esta es una aplicación web para que una persona pueda llevar el control de
sus ingresos y egresos personales — nada de hojas de cálculo sueltas ni
apuntes en el teléfono, todo en un solo lugar y organizado.

El proyecto se está construyendo por entregas. Esta primera entrega se
enfoca en dejar **el inicio de sesión completamente funcional y seguro**:
autenticación con JWT, contraseñas hasheadas con bcrypt, y dos roles
definidos (`ADMIN` y `USER`). El resto de la aplicación — el dashboard con
el resumen financiero, el registro de movimientos, los reportes — todavía
no está implementado a propósito: el cliente aún no ha definido cómo quiere
que funcionen esos módulos, así que por ahora el dashboard es solo una
pantalla de "en construcción" que confirma que el login ya está andando.

No hay registro público de usuarios en esta versión. Los únicos dos
usuarios (uno admin, uno user) se cargan mediante un script de seed que se
explica más abajo.

## Con qué está hecho

| Capa       | Tecnología                                                      |
|------------|-------------------------------------------------------------------|
| Backend    | Node.js, Express, TypeScript, PostgreSQL (librería `pg`), JWT, bcryptjs |
| Frontend   | Angular 21 (componentes standalone), TypeScript                   |
| Estilos    | CSS con variables, paleta de marca a medida                       |
| Paquetería | pnpm                                                               |

## Cómo está organizado

```
finanzas-app/
├── backend/
│   ├── db/
│   │   └── init.sql            # Script de creación de la tabla usuarios
│   ├── src/
│   │   ├── config/              # Conexión a PostgreSQL y variables de entorno
│   │   ├── controllers/         # Controladores HTTP
│   │   ├── middlewares/         # Autenticación (JWT) y manejo de errores
│   │   ├── models/               # Tipos e interfaces
│   │   ├── repositories/        # Acceso a datos (queries SQL)
│   │   ├── routes/               # Definición de endpoints
│   │   ├── services/             # Lógica de negocio
│   │   ├── seed.ts               # Carga de usuarios admin/user (idempotente)
│   │   ├── app.ts                # Configuración de Express
│   │   └── server.ts             # Punto de entrada
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/app/
    │   ├── core/
    │   │   ├── config/           # URL base de la API
    │   │   ├── guards/           # authGuard (protección de rutas)
    │   │   ├── interceptors/     # authInterceptor (agrega el token JWT)
    │   │   ├── models/           # Tipos compartidos
    │   │   └── services/         # AuthService
    │   └── features/
    │       ├── login/            # Pantalla de inicio de sesión (funcional)
    │       └── dashboard/        # Placeholder post-login (no funcional aún)
    └── package.json
```

## Lo que NO está en este repositorio (y por qué)

Si acabas de clonar el proyecto y notas que faltan varias carpetas, es
intencional. Hay ciertas cosas que nunca deben subirse a un repositorio de
Git porque son pesadas, se regeneran solas, o son configuración personal de
cada máquina. Esta sección explica exactamente qué falta y cómo recuperarlo.

### 1. Las dependencias (`node_modules/`)

Tanto `backend/` como `frontend/` tienen su propia carpeta `node_modules/`
que **no está en el repositorio**. Ahí es donde viven todas las librerías
que el proyecto usa (Express, Angular, bcryptjs, etc.), y puede pesar
cientos de megabytes — no tiene sentido subir eso a GitHub cuando se puede
regenerar con un solo comando.

Para instalarlas:

```powershell
cd backend
pnpm install

cd ../frontend
pnpm install
```

Con eso, `pnpm` lee el `package.json` de cada carpeta (que sí está en el
repo) y descarga exactamente las versiones necesarias, usando
`pnpm-lock.yaml` (que **tampoco** se excluyó, ese sí va en el repo) para
asegurarse de que sean las mismas versiones exactas con las que se
construyó el proyecto originalmente.

### 2. Las variables de entorno del backend (`.env`)

El archivo `backend/.env` tampoco está en el repositorio, porque ahí van
credenciales reales (usuario y contraseña de tu PostgreSQL local, y el
secreto usado para firmar los tokens JWT). Subir eso sería exponer
credenciales de forma pública, aunque sea un proyecto académico.

Lo que sí está en el repo es `backend/.env.example`, una plantilla sin
datos sensibles. Para crear tu `.env` real:

```powershell
cd backend
copy .env.example .env
```

Y luego edita `backend/.env` con tus datos reales:

```dotenv
PORT=4000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=finanzas_personales
DB_USER=postgres
DB_PASSWORD=tu_contraseña_real_de_postgres

JWT_SECRET=un_secreto_largo_y_dificil_de_adivinar
JWT_EXPIRES_IN=8h

CORS_ORIGIN=http://localhost:4200
```

### 3. Carpetas de compilación (`dist/`, `.angular/`)

`backend/dist/` y `frontend/.angular/` son resultado de compilar el
proyecto — código generado, no código fuente. Se regeneran solas al correr
`pnpm build` (backend) o `pnpm start` / `ng build` (frontend). No hace
falta hacer nada especial con ellas, simplemente no existen hasta que
compilas por primera vez.

### 4. La carpeta `.vscode/` del frontend

A diferencia de las anteriores, esta sí es útil tenerla — trae accesos
directos y configuración de depuración para VS Code — pero como es
configuración del editor y no del proyecto en sí, se dejó fuera del repo.
Si quieres recuperarla, crea la carpeta `frontend/.vscode/` con estos tres
archivos:

**`frontend/.vscode/extensions.json`** — recomienda la extensión oficial de
Angular al abrir el proyecto:

```json
{
  "recommendations": ["angular.ng-template"]
}
```

**`frontend/.vscode/tasks.json`** — define las tareas de `npm start` y
`npm test` para que VS Code las reconozca:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "start",
      "isBackground": true,
      "problemMatcher": {
        "owner": "typescript",
        "pattern": "$tsc",
        "background": {
          "activeOnStart": true,
          "beginsPattern": { "regexp": "Changes detected" },
          "endsPattern": { "regexp": "bundle generation (complete|failed)" }
        }
      }
    },
    {
      "type": "npm",
      "script": "test",
      "isBackground": true,
      "problemMatcher": {
        "owner": "typescript",
        "pattern": "$tsc",
        "background": {
          "activeOnStart": true,
          "beginsPattern": { "regexp": "Changes detected" },
          "endsPattern": { "regexp": "bundle generation (complete|failed)" }
        }
      }
    }
  ]
}
```

**`frontend/.vscode/launch.json`** — permite depurar la app directo desde
VS Code presionando F5 (abre Chrome apuntando a `localhost:4200`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ng serve",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "npm: start",
      "url": "http://localhost:4200/"
    },
    {
      "name": "ng test",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "npm: test",
      "url": "http://localhost:9876/debug.html"
    }
  ]
}
```

> Un archivo que quizás también veas generado localmente es
> `.vscode/mcp.json`. Ese lo genera el propio Angular CLI para integraciones
> de asistentes de IA con las herramientas de Angular — no contiene ninguna
> credencial, pero es opcional y no hace falta para que el proyecto
> funcione, así que se dejó fuera del repo a propósito.

## Instalación completa, paso a paso

Con todo lo anterior explicado, aquí está el flujo completo desde cero:

### Requisitos previos

- Node.js 22 o superior
- pnpm (`npm install -g pnpm`)
- PostgreSQL 14 o superior corriendo localmente
- pgAdmin4 (opcional, pero recomendado para revisar la base de datos visualmente)

### 1. Clonar el repositorio

```powershell
git clone <url-de-tu-repositorio>
cd finanzas-app
```

### 2. Crear la base de datos

Puedes hacerlo desde `psql` o desde pgAdmin4. Con `psql`:

```powershell
psql -U postgres -c "CREATE DATABASE finanzas_personales;"
psql -U postgres -d finanzas_personales -f backend/db/init.sql
```

Si usas pgAdmin4: crea la base `finanzas_personales`, ábrela, entra a Query
Tool y pega ahí el contenido de `backend/db/init.sql`, luego ejecútalo.

### 3. Configurar y levantar el backend

```powershell
cd backend
pnpm install
copy .env.example .env
```

Edita `.env` con tus datos reales (ver la sección anterior).

Carga los dos usuarios base. Sus credenciales no están escritas en ningún
archivo del proyecto — se inyectan como variables de entorno directamente
en la terminal antes de correr el seed, así nunca quedan "quemadas" en el
código ni en el repositorio:

**PowerShell:**
```powershell
$env:SEED_ADMIN_USERNAME="admin"
$env:SEED_ADMIN_PASSWORD="Admin123!"
$env:SEED_ADMIN_NOMBRE="Administrador"
$env:SEED_USER_USERNAME="user"
$env:SEED_USER_PASSWORD="User123!"
$env:SEED_USER_NOMBRE="Usuario"
pnpm seed
```

**CMD:**
```cmd
set SEED_ADMIN_USERNAME=admin
set SEED_ADMIN_PASSWORD=Admin123!
set SEED_ADMIN_NOMBRE=Administrador
set SEED_USER_USERNAME=user
set SEED_USER_PASSWORD=User123!
set SEED_USER_NOMBRE=Usuario
pnpm seed
```

Si corres `pnpm seed` sin definir esas variables primero, el script se
detiene y te dice exactamente cuáles faltan, en vez de fallar en silencio.

Con eso, la tabla `usuarios` queda con:

| Usuario | Contraseña  | Rol   |
|---------|-------------|-------|
| admin   | Admin123!   | ADMIN |
| user    | User123!    | USER  |

Ahora sí, levanta el servidor:

```powershell
pnpm dev
```

El backend queda escuchando en `http://localhost:4000`.

### 4. Configurar y levantar el frontend

En otra terminal:

```powershell
cd frontend
pnpm install
pnpm start
```

La aplicación queda disponible en `http://localhost:4200`. Si en algún
momento cambias el puerto del backend, recuerda actualizar
`frontend/src/app/core/config/api.config.ts`.

## Cómo funciona el login por dentro

1. La persona ingresa `username` y `password` en `/login`.
2. El backend busca el usuario en PostgreSQL y compara la contraseña con
   `bcrypt.compare()` contra el hash guardado — la contraseña real nunca se
   guarda en texto plano, ni siquiera tú puedes verla en pgAdmin4.
3. Si coincide, el backend firma un JWT con `jsonwebtoken` que incluye el
   id, username y rol del usuario, y expira en 8 horas.
4. El frontend guarda ese token, protege la ruta `/dashboard` con
   `authGuard` (si no hay token válido, te manda de regreso al login), y
   agrega el token automáticamente a cada petición saliente mediante
   `authInterceptor`.
5. El `/dashboard` muestra el nombre y rol de quien inició sesión, con un
   botón para cerrar sesión. El resto (ingresos, egresos, reportes) está
   pendiente de definir con el cliente.

## Paleta de colores

| Variable                  | Hex       | Uso                                |
|----------------------------|-----------|--------------------------------------|
| `--color-bg-deep`          | `#010f1f` | Fondo general                        |
| `--color-bg-surface`       | `#051424` | Tarjetas y paneles                   |
| `--color-bg-elevated`      | `#0d1c2d` | Inputs y elementos elevados          |
| `--color-border`           | `#2c3a4c` | Bordes y divisores                   |
| `--color-accent`           | `#0066ff` | Acciones primarias, foco, enlaces    |
| `--color-text-primary`     | `#ffffff` | Texto principal                      |
| `--color-text-secondary`   | `#a0aab8` | Texto secundario                     |

## Qué falta por construir

- Definición y desarrollo del módulo de gestión de usuarios (roles y permisos).
- Módulos de ingresos, egresos y categorías.
- Dashboard con resumen financiero real y reportes.

---

*Este proyecto se construyó con apoyo de Claude (Anthropic) como asistente
de desarrollo. La estructura, el código y las decisiones técnicas fueron
revisadas para el contexto del proyecto académico "Fundación Kinal —
Finanzas Personales".*