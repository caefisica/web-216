# Biblioteca 216

El proyecto utiliza Supabase como sistema de gestión de base de datos. La base de datos de producción no está disponible para desarrollo local por motivos de seguridad, por lo que debes crear tu propia instancia en tu cuenta personal de Supabase (puedes usar tu cuenta de GitHub). Cuando realices commits o crees branches en el repositorio, el CI construirá la aplicación utilizando la base de datos de producción.

## Variables de entorno requeridas

Configura las siguientes variables en el archivo `.env.local`:

- `DATABASE_URL`: La URL de conexión a la base de datos PostgreSQL (e.g., de Supabase).
- `BETTER_AUTH_SECRET`: El secreto para la autenticación (puedes generarlo con `openssl rand -base64 32`).
- `BETTER_AUTH_URL`: La URL base de la aplicación (e.g., `http://localhost:3000` para desarrollo).


## Pasos de configuración

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/caefisica/lib216-beta
cd lib216-beta
bun install
```

Aplica el schema accediendo al panel de control de tu proyecto en Supabase. Navega a "SQL Editor" en la sección Database, haz clic en "+ New query", abre el archivo `supabase/schema.sql` del repositorio clonado, copia todo su contenido, pégalo en el editor SQL de Supabase y haz clic en "RUN". Este proceso crea todas las tablas, funciones y políticas RLS necesarias. Solo debes ejecutarlo una vez por proyecto de Supabase.

Popula la base de datos con datos de prueba ejecutando:

```bash
npm run db:seed
```

Este script elimina datos existentes en las tablas públicas (users, books, etc.) e inserta datos de muestra actualizados, incluyendo usuarios de autenticación para pruebas.

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Una vez completada la configuración, puedes acceder a la aplicación utilizando las credenciales `admin@example.com` con contraseña `password123`.

Si encuentras errores durante la configuración, verifica que todas las variables de entorno estén correctamente definidas en `.env.local`, confirma que el schema se haya aplicado correctamente en Supabase, asegúrate de que el script de seeding se haya ejecutado sin errores y revisa que las dependencias estén instaladas correctamente.
