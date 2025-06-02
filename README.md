# Biblioteca virtual del 216

| Publicación y CI | Calidad del código | Monitoreo |
| --- | --- | --- |
| [![Cloudflare](https://img.shields.io/endpoint?url=https://cloudflare-pages-badges.cae.workers.dev/?projectName=216)](https://dash.cloudflare.com/?to=/:account/pages/view/caefisica/) |  | 

| | |
| - | - |
| ¿Eres desarrollador? | [/docs/01-getting-started.md](/docs/01-getting-started.md)
| ¿Cómo contribuir? | [./docs/09-contributing.md](./docs/09-contributing.md)

**Este repositorio es mantenido por estudiantes voluntarios.** Este repositorio contiene el código fuente detrás del sitio web [216.caefisica.com](https://216.caefisica.com/). El sitio web implemente un sistema para gestionar la colección de libros la Biblioteca de Estudiantes de la E.P. de Física de la Facultad de Ciencias Físicas de UNMSM. La biblioteca se encuentra en el ambiente 216 del pabellón de pregrado. Esta implementación se realizó con facilitar el acceso y búsqueda de recursos académicos a estudiantes y simplifica la administración para los estudiantes voluntarios encargados (en adelante, bibliotecarios) de administrar la biblioteca y sus libros.

## Contexto y necesidad 🤔

**El problema fundamental que observamos** es que los estudiantes de nuestra escuela tienen acceso a una biblioteca con +300 libros y un espacio donde utilizar, sin embargo, a veces no saben 1. que la biblioteca existe o 2. incluso si saben, no saben si el libro que necesitan se encuentra disponible. En muchas ocasiones un estudiante ni siquiera sabe qué libro está buscando para un curso en particular.

Desconozco personalmente el origen de la biblioteca. Al hacer revisión del stock de los libros de la biblioteca he encontrado libros de hasta alrededor de 1990 sellados bajo el nombre del Centro Federado de la Facultad de Ciencias Físicas.

Me voy por las ramas pero es necesario aclarar un par de cosas:

> [!NOTE]  
> Un Centro Federado es un gremio formado por estudiantes a nivel de facultad.
> Nuestra facultad tiene dos escuelas: Física (EPF) e Ingeniería de Mecánica de Fluidos (EPIMF).
> El gremio formado por estudiantes de una escuela es conocido como Centro de Estudiantes.
> A la fecha que escribo esto (06/2025) no existe un Centro de Estudiantes de Física (CEFIS). La última Junta Directiva para un CEFIS renunció alrededor de febrero del 2024 luego de su conformación y reconomiento por Resolución Decanal un mes después de su formación. Anteriormente a esto, la última JD es de alrededor del 2018, aunque desconozco más detalles anteriores al 2020 y puede que esté equivocado.
> Actualmente el uso por parte de los estudiantes de la EPF del ambiente 216 es reconocido por la facultad a través de la Resolución Decanal Nº 000582-2024-D-FCF/UNMSM.

Entonces, por lo menos podemos datar la biblioteca hasta 1990 por donaciones selladas a nombre del Centro Federado que entonces existía. Tengo entendido que en algún momento alrededor de la década del 2010 la biblioteca (que antes de entonces se encontraba en el sótano de la facultad, cerca a las escaleras, aunque no puedo garantizar que en los 90s estuvo aquí). He encontrado fotografías de alrededor del 2012 y 2013 donde todavía se hacía uso de la biblioteca en el sótano.

Actualmente tengo entendido que este espacio está clausurado por motivos sanitarios ya que el drenaje parece estar contenido en un espacio adyacente.

Hace dos años, conocí a un exestudiante de la facultad que me comentó que durante su tiempo en la facultad había intenciones de crear una base de datos para los libros para su manejo pero desconocía de lo que sucedió después.

Actualmente, el ambiente 216 se encuentra manejado de forma independiente por estudiantes bajo la dirección de Liuba Ramos, estudiante de la B20. Los estudiantes que apoyan son voluntarios y cualquier estudiante puede unirse bajo discreción a través de una entrevista para colaborar. Estas medidas fueron necesarias para poder mantener cierto orden y asegurar la conservación del catálogo de la biblioteca a lo largo del tiempo.

Si te interesa unirte, puedes contactar por correo (revisa 216.caefisica.com/contacto) o simplemente acercarte al ambiente. Solo es necesario ser estudiante activo de la E.P. de Física.

Volviendo al tema, actualmente la biblioteca ya superó el logro de 300 libros bajo su control y actualmente se usa un archivo de Google Sheets donde los bibliotecarios pueden mantener seguimiento a los préstamos (todavía es un debate si debería de darse aunque en la práctica actualmente se da) y los estudiantes pueden técnicamente encontrar los libros disponibles. Sin embargo, su uso es muy limitado por los bibliotecarios y aún más de los estudiantes siendo más revisado por los responsables principales del ambiente.

Desde el @caefisica (puedes encontrar más sobre nosotros en https://github.com/caefisica/web-main), **decidimos trabajar en una plataforma web** moderna que:

- Centraliza el catálogo de los libros de la biblioteca
- Facilita préstamos y reservas y promueve transparencia
- Permite contribuciones de la comunidad
- Ofrece gestión administrativa simplificada
- Permite obtener estadísticas objetivas de uso que permitan argumentar la existencia a largo plazo de la biblioteca.

## Visión 👀, misión 🎯 y estrategia a futuro 🗺️

### Aspiramos a que la biblioteca amplíe su alcance y uso por parte de los estudiantes de la EPF, creyendo en la colaboración cercana entre docentes y estudiantes para mejorar estrategias de estudio y elevar la calidad académica de nuestra facultad

**Nuestra misión** es permitir que la biblioteca subsista tanto al @caefisica (caefisica.com) (cuyos miembros egresan entre el 2024-2025) y se encuentre con destino principal a ser una biblioteca.

> [!NOTE]  
> Anteriormente han habido intenciones de usar este espacio como un lugar de reuniones de gremio o temas diferentes al ámbito académico. Por lo menos de mi parte, esto debería de evitarse. Como grupo, estamos detrás de la idea de que la biblioteca debe ser independiente y sin embargo colaborar con los gremios que puedan formarse más adelante para alcanzar sus objetivos.

**Nuestros principales resultados** a futuro son:

- Aumentar el uso de la biblioteca y accesibilidad del material de estudio.
- Incrementar el volumen de préstamos sin afectar el funcionamiento de la biblioteca.
- Incentivar la donación de nuevos libros a través de proyectos que promuevan la biblioteca.

**El público objetivo** son los estudiantes y docentes de la E.P. de Física. 

Y sin embargo, este repositorio ha sido diseñado para ser clonado y utilizado por otras organizaciones estudiantiles que también requieran de manejar un inventario. El proyecto es open source y tiene instrucciones para hacer deploy en diversas plataformas e instrucciones de cómo conectar una base de datos con las tablas necesarias para que futuros estudiantes puedan relanzar el sitio en caso de que nosotros no podamos hacerlo. Las tablas tendrán un backup constante y serán brindados en caso de caída para que puedan ser recuperados y transicionados a un nuevo equipo de trabajo.

## Estrategia y plan 🤔

- Ahora:
  - [x] Deploy en producción del MVP básico de la Biblioteca virtual con Cloudflare y Supabase
  - [x] Implementar un sistema de autenticación de de editores a través de Supabase Auth y permisos de uso
  - [x] Envío de correos de autenticación utilizando Resend para la invitación de nuevos bibliotecarios
  - [x] CMS básico que permite añadir y editar la metadata de los libros así como subir galerías de imágenes por libro a través de Supabase Storage
  - [x] Sección enfocada en promover la donación de nuevos libros estableciendo un ranking de donantes a la biblioteca 
- Siguiente:
  - [ ] Mover de Supabase a Next Auth para el manejo de la autenticación
  - [ ] Añadir sección para un calendario que se sincroniza automáticamente con el calendario de Google que utiliza el equipo actualmente
  - [ ] Añadir una API que permita buscar libros y pedir permisos a usuarios autenticados
  - [ ] Implementar un sistema de registro de asistencia interno para los bibliotecarios, también a través de API
- Después:
  - [ ] Implementar un bot de WhatsApp que haga uso de las APIs para permitir aún más la facilidad de uso de libros para los usuarios generales y para los bibliotecarios poder registrar el momento de apertura y cierre de la biblioteca a través del envío de una foto[^1].
  - [ ] Implementar una app mínima que permita registrar la apertura y cierre de forma segura y rápida para los bibliotecarios. Por ahora, estoy pensando en experiemtnar con Ionic debido al tamaño de los builds que tienen.

## Dominio público

Este proyecto se encuentra bajo la [licencia MIT](LICENCE), lo que significa que es de código abierto y cualquier persona puede utilizarlo, modificarlo y distribuirlo libremente.

## Contribuciones de la comunidad

Este repositorio es mantenido por un equipo de voluntarios dedicados.

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

¡Valoramos y alentamos las contribuciones de la comunidad! Si tienes experiencia en física y quieres ayudar a otros estudiantes a mejorar en sus estudios, te invitamos a contribuir a este repositorio. Puedes consultar más detalles en [CONTRIBUTING](.github/CONTRIBUTING.md).

Algunas formas en las que puedes colaborar son:
- Actualizando información histórica sobre la biblioteca
- Arreglando errores ortográficos (a veces se me pasan!)
- Solucionando los issues registrados en https://github.com/caefisica/web-216/issues

## Tech Stack

**Frontend**: [NextJS 15.2.4](https://nextjs.org/docs/app/getting-started/installation) (App Router), [Tailwind v3](https://v3.tailwindcss.com/) (me encuentro trabajando en ver la forma de hacer bump a v4), Shadcn/ui

**Backend**: Supabase ([Auth](https://supabase.com/docs/guides/auth), [PostgreSQL](https://supabase.com/docs/guides/database/overview), [Storage](https://supabase.com/docs/guides/storage))

**Complementos**: Resend (emails), TypeScript, Lucide icons

Puedes encontrar más detalles sobre cómo ejecutar este repositorio localmente, visita [CONTRIBUTING](.github/CONTRIBUTING.md).

---

Redactado por David Duran, _Coordinador General del @caefisica (2022-Actualidad)_

[^1]: Esto permitirá hacer seguimiento a cuánto tiempo exactamente la biblioteca está abierta de forma objetiva.
