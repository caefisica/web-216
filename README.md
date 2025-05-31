# Biblioteca 216

El proyecto utiliza Supabase como sistema de gestión de base de datos. La base de datos de producción no está disponible para desarrollo local por motivos de seguridad, por lo que debes crear tu propia instancia en tu cuenta personal de Supabase (puedes usar tu cuenta de GitHub). Cuando realices commits o crees branches en el repositorio, el CI construirá la aplicación utilizando la base de datos de producción.

## Variables de entorno requeridas

Configura las siguientes variables en el archivo `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`.

Para obtener estas variables, accede a tu proyecto en Supabase y haz clic en "Connect" junto al nombre del proyecto. Selecciona "App Frameworks" y copia el contenido del archivo `.env.local` que Supabase genera automáticamente. Para obtener `SUPABASE_SERVICE_ROLE_KEY`, navega a Settings → Project Settings → API keys y copia el valor de "service_role".

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
