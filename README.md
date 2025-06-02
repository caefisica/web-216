# Biblioteca virtual del 216

<!-- prettier-ignore-start -->
| Publicación y CI | Calidad del código | Monitoreo |
| - | - | - |
| [![Cloudflare](https://img.shields.io/endpoint?url=https://cloudflare-pages-badges.cae.workers.dev/?projectName=216)](https://dash.cloudflare.com/?to=/:account/pages/view/caefisica/) | [![👷 CI/CD (Node.JS)](https://github.com/caefisica/web-216/actions/workflows/ci_nodejs.yml/badge.svg)](https://github.com/caefisica/web-216/actions/workflows/ci_nodejs.yml) | [![🚓 Análisis de código](https://github.com/caefisica/web-216/actions/workflows/analyze_codeql.yml/badge.svg)](https://github.com/caefisica/web-216/actions/workflows/analyze_codeql.yml) |
<!-- prettier-ignore-end -->

**Este repositorio es mantenido por estudiantes voluntarios.** Aquí encontrarás el código fuente del sitio web [216.caefisica.com](https://216.caefisica.com/), una plataforma para gestionar la biblioteca de estudiantes de la E.P. de Física de la Facultad de Ciencias Físicas de la UNMSM.

La biblioteca física se encuentra en el ambiente 216 (segundo piso) del pabellón de pregrado de la facultad y cuenta con más de 300 libros especializados. Este sistema web facilita el acceso y búsqueda de recursos académicos para estudiantes, mientras simplifica la administración para los bibliotecarios voluntarios.

## Tabla de contenido

- [Contexto y por qué existe este proyecto 🤔](#contexto-y-por-qué-existe-este-proyecto-)
  - [Un poco de historia](#un-poco-de-historia)
- [Visión 👀, misión 🎯 y estrategia a futuro 🗺️](#visión--misión--y-estrategia-a-futuro-%EF%B8%8F)
- [Estrategia y plan 🤔](#estrategia-y-plan-)
  - [Estrategia de priorización](#estrategia-de-priorización)
- [Tech Stack](#tech-stack)
- [¿Cómo participar?](#cómo-participar)
- [Dominio público](#dominio-público)
- [Créditos](#créditos)

O en caso de que busques algo específico:

<!-- prettier-ignore-start -->
| ¿Qué necesitas?        | ¿A dónde ir?                                                     |
| ---------------------- | ---------------------------------------------------------------- |
| Empezar a programar    | [/docs/01-getting-started.md](/docs/01-getting-started.md)       |
| Contribuir al proyecto | [./docs/09-contributing.md](./docs/09-contributing.md)           |
| Reportar un problema   | [https://github.com/caefisica/web-216/issues](https://github.com/caefisica/web-216/issues) |
| Contactar al equipo    | [216.caefisica.com/contacto](https://216.caefisica.com/contacto) |
<!-- prettier-ignore-end -->

## Contexto y por qué existe este proyecto 🤔

**El problema fundamental que observamos** es que los estudiantes de nuestra escuela tienen acceso a una biblioteca con más de 300 libros y un espacio donde estudiar, pero muchas veces no saben que la biblioteca existe o, si la conocen, no saben si el libro que necesitan está disponible. En muchas ocasiones, un estudiante ni siquiera sabe qué libro está buscando para un curso específico.

Hasta ahora, el sistema de gestión se basaba en un archivo de Google Sheets donde los bibliotecarios podían hacer seguimiento a los préstamos y los estudiantes teóricamente podían encontrar los libros disponibles. Sin embargo, su uso era y es muy limitado tanto por bibliotecarios (prefieren reportar préstamos a través de un grupo interno de WhatsApp – ciertamente más conveniente) como por estudiantes, siendo revisado principalmente por los responsables del ambiente.

Desde el [@caefisica](https://github.com/caefisica/web-main), decidimos desarrollar una plataforma web que centralice el catálogo, facilite los préstamos y reservas con transparencia, permita contribuciones de la comunidad, ofrezca una forma fácil de gestionar y genere estadísticas de uso que permitan argumentar la existencia a largo plazo de la biblioteca.

### Un poco de historia

Desconozco el origen exacto de la biblioteca, pero al revisar el stock he encontrado libros sellados con fecha de hasta 1990 bajo el nombre del Centro Federado de la Facultad de Ciencias Físicas, así que podemos datar su existencia al menos hasta esa década.

Me voy por las ramas por un momento pero es necesario aclarar un par de cosas:

> [!NOTE]  
> Un Centro Federado es un gremio formado por estudiantes a nivel de facultad. Nuestra facultad tiene dos escuelas: Física (EPF) e Ingeniería de Mecánica de Fluidos (EPIMF). El gremio de una escuela específica se conoce como Centro de Estudiantes. A la fecha (06/2025) no existe un Centro de Estudiantes de Física activo, siendo la última Junta Directiva de alrededor de febrero 2024.

Volviendo al tema... durante décadas, la biblioteca estuvo ubicada en el sótano de la facultad cerca a las escaleras, como he podido constatar en fotografías compartidas conmigo por un compañero de los años 2012 y 2013. Ese espacio fue posteriormente clausurado por motivos sanitarios relacionados con el drenaje.

Actualmente, el ambiente 216 es manejado de forma independiente por estudiantes bajo la dirección de Liuba Ramos (estudiante de la B20). El funcionamiento está reconocido oficialmente por la facultad a través de la Resolución Decanal Nº 000582-2024-D-FCF/UNMSM. Los bibliotecarios son estudiantes voluntarios que colaboran para mantener el orden y asegurar la conservación del catálogo a lo largo del tiempo.

## Visión 👀, misión 🎯 y estrategia a futuro 🗺️

### Aspiramos a que la biblioteca amplíe su alcance y uso por parte de los estudiantes de la EPF, creyendo en la colaboración cercana entre docentes y estudiantes para mejorar estrategias de estudio y elevar la calidad académica de nuestra facultad

**Nuestra misión** es permitir que la biblioteca subsista más allá del [@caefisica](https://caefisica.com) (cuyos miembros egresan entre 2024-2025) y se mantenga con destino principal de ser una biblioteca académica.

> [!NOTE]  
> Anteriormente han existido intenciones de usar este espacio como lugar de reuniones de gremio o temas diferentes al ámbito académico. Consideramos que esto debería evitarse. Como grupo, defendemos la idea de que la biblioteca debe ser independiente, aunque puede colaborar con gremios que se formen más adelante para alcanzar objetivos académicos comunes.

**Los resultados que buscamos a futuro** incluyen aumentar el uso de la biblioteca y accesibilidad del material de estudio, incrementar el volumen de préstamos sin afectar el funcionamiento, e incentivar la donación de nuevos libros a través de proyectos (¡como este!) que promuevan la biblioteca.

**El público objetivo** son los estudiantes y docentes de la E.P. de Física, aunque este repositorio ha sido diseñado para ser clonado y utilizado por otras organizaciones estudiantiles que requieran manejar un inventario similar.

## Estrategia y plan 🤔

### Estrategia de priorización

- ✅ Completado (hasta ahora):
  - [x] Deploy en producción del MVP básico con Cloudflare Pages y Supabase
  - [x] Sistema de autenticación de editores a través de Supabase Auth y permisos de uso
  - [x] Envío de correos de autenticación utilizando Resend para invitación de nuevos bibliotecarios
  - [x] CMS básico que permite añadir y editar metadata de libros, así como subir galerías de imágenes por libro a través de Supabase Storage
  - [x] Sección enfocada en promover la donación de nuevos libros estableciendo un ranking de donantes a la biblioteca
- 🔄 En progreso:
  - [ ] Migrar de Supabase a Next Auth para el manejo de autenticación
- 📋 En planes:
  - [ ] Añadir sección para calendario que se sincroniza automáticamente con el Google Calendar interno utilizado por el equipo
  - [ ] Añadir API que permita buscar libros y pedir permisos a usuarios autenticados
  - [ ] Implementar sistema de registro de asistencia interno para bibliotecarios, también a través de API
  - [ ] Implementar un bot de WhatsApp que haga uso de las APIs para facilitar aún más el uso de libros tanto para usuarios generales como para bibliotecarios, permitiendo registrar apertura y cierre de la biblioteca a través del envío de fotos[^1].
  - [ ] Desarrollar una app mínima que permita registrar apertura y cierre de forma segura y rápida para bibliotecarios. Actualmente me encuentro experimentando con Ionic debido al tamaño optimizado de los builds

## Tech Stack

**Frontend**: Utilizamos [NextJS 15.2.4](https://nextjs.org/docs/app/getting-started/installation) con App Router, [Tailwind v3](https://v3.tailwindcss.com/) (trabajando en migración a v4), [shadcn/ui](https://ui.shadcn.com/docs/installation/next)

**Backend**: Supabase ([Auth](https://supabase.com/docs/guides/auth), [PostgreSQL](https://supabase.com/docs/guides/database/overview), [Storage](https://supabase.com/docs/guides/storage))

**Complementos**: [Resend](https://resend.com/docs/send-with-nextjs) (emails), TypeScript, Lucide icons

Puedes encontrar más detalles sobre cómo ejecutar este repositorio localmente en [CONTRIBUTING](.github/CONTRIBUTING.md).

## ¿Cómo participar?

**Para desarrolladores**: Si tienes experiencia en desarrollo web y quieres contribuir al código, consulta nuestra [documentación para desarrolladores](/docs/01-getting-started.md) y la [guía de contribución](./docs/09-contributing.md).

**Para bibliotecarios**: Si eres estudiante activo de la E.P. de Física y te interesa unirte como bibliotecario voluntario, puedes contactarnos por correo (revisa [216.caefisica.com/contacto](https://216.caefisica.com/contacto)) o simplemente acercarte al ambiente 216.

**Para la comunidad**: Valoramos y fomentamos las contribuciones de la comunidad universitaria. Algunas formas en las que puedes colaborar son:

- Actualizando información histórica sobre la biblioteca (en caso seas un estudiante de bases mayores)
- Corrigiendo errores ortográficos (a veces se me pasan algunas cosas por aquí o por allá)
- Solucionando issues registrados en [GitHub Issues](https://github.com/caefisica/web-216/issues), o implementando funcionalidades descritas en nuestro plan de trabajo.

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Dominio público

Este proyecto se encuentra bajo la [licencia MIT](LICENCE), lo que significa que es de código abierto y cualquier persona puede utilizarlo, modificarlo y distribuirlo libremente.

## Créditos

Redactado por David Duran, Coordinador General del [@caefisica](https://github.com/caefisica/web-main) (2022-actualidad)

[^1]: Esto permitirá hacer seguimiento objetivo del tiempo exacto que la biblioteca permanece abierta.

[^2]: Olvidé preguntarle y no tengo forma de contactarle actualmente 😅
