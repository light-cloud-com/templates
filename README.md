# Light Cloud templates

Templates you can deploy to [Light Cloud](https://light-cloud.com) in one click. Each one starts with no keys, and the ones that need a database get one when you deploy.

Browse them with search and filters at [light-cloud.com/templates](https://light-cloud.com/templates).

```text
starters/       a framework or API, ready to build on
websites/       static sites (coming)
apps/           apps with a database (coming)
open-source/    setups for open-source apps (coming)
```

## Starters

<!-- catalogue:start (written by scripts/sync-starters.mjs) -->
| Template | What it is | Language | Database | Deploy |
| --- | --- | --- | --- | --- |
| [Open SaaS](./starters/opensaas) | The Open SaaS starter (Wasp) with a connected PostgreSQL database | JavaScript | PostgreSQL | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://console.light-cloud.com/new?repo=https://github.com/light-cloud-com/starter-opensaas) |
| [React](./starters/starter-react) | Modern React app with Vite | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-react) |
| [Vue](./starters/starter-vue) | Vue 3 app with Vite | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-vue) |
| [Angular](./starters/starter-angular) | Angular 21 with standalone components | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-angular) |
| [Svelte](./starters/starter-svelte) | Svelte app with Vite | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-svelte) |
| [Static HTML](./starters/starter-html) | Simple HTML, CSS, JavaScript | HTML |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-html) |
| [Go](./starters/starter-go) | Go REST API (net/http) | Go |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-go) |
| [PHP](./starters/starter-php) | Slim Framework REST API | PHP |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-php) |
| [.NET](./starters/starter-dotnet) | ASP.NET Core REST API | .NET |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-dotnet) |
| [Dockerfile](./starters/starter-dockerfile) | Custom Dockerfile template | Docker |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-dockerfile) |
| [Next.js](./starters/starter-nextjs) | Next.js with the App Router, rendered on a server | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-nextjs) |
| [Nuxt](./starters/starter-nuxt) | Nuxt 4 with server-side rendering | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-nuxt) |
| [SvelteKit](./starters/starter-sveltekit) | SvelteKit with the Node adapter | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-sveltekit) |
| [Remix](./starters/starter-remix) | Remix v2 on Vite | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-remix) |
| [Astro](./starters/starter-astro) | Astro, prerendered to static files | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-astro) |
| [SolidJS](./starters/starter-solid) | SolidJS app with Vite | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-solid) |
| [Express](./starters/starter-express) | Express API with CORS and a health check | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-express) |
| [Fastify](./starters/starter-fastify) | Fastify API with structured logging | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-fastify) |
| [Hono](./starters/starter-hono) | Hono API on the Node server adapter | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-hono) |
| [NestJS](./starters/starter-nestjs) | NestJS API with TypeScript | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-nestjs) |
| [FastAPI](./starters/starter-fastapi) | FastAPI service served by Uvicorn | Python |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-fastapi) |
| [Flask](./starters/starter-flask) | Flask service served by Waitress | Python |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-flask) |
| [Gin](./starters/starter-gin) | Gin HTTP service in Go | Go |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-gin) |
| [Echo](./starters/starter-echo) | Echo HTTP service in Go | Go |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-echo) |
| [Fiber](./starters/starter-fiber) | Fiber HTTP service in Go | Go |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-fiber) |
| [Spring Boot](./starters/starter-springboot) | Spring Boot web service, built with Maven | Java |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-springboot) |
| [Quarkus](./starters/starter-quarkus) | Quarkus REST service, built with Maven | Java |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-quarkus) |
| [Sinatra](./starters/starter-sinatra) | Sinatra service served through Rack | Ruby |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-sinatra) |
| [Docusaurus](./starters/starter-docusaurus) | Docusaurus documentation site | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-docusaurus) |
| [Eleventy](./starters/starter-eleventy) | Eleventy static site generator | JavaScript |  | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/starter-eleventy) |
| [Express CRUD API](./starters/crud-api-express) | REST API for items on PostgreSQL, built with Express 5 and pg | JavaScript | PostgreSQL | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/crud-api-express) |
| [FastAPI CRUD API](./starters/crud-api-fastapi) | REST API for items on PostgreSQL, built with FastAPI and psycopg 3 | Python | PostgreSQL | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/crud-api-fastapi) |
| [NestJS CRUD API](./starters/crud-api-nestjs) | REST API for items on PostgreSQL, built with NestJS and pg | JavaScript | PostgreSQL | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/crud-api-nestjs) |
| [Hono CRUD API](./starters/crud-api-hono) | REST API for items on PostgreSQL, built with Hono on Node and postgres.js | JavaScript | PostgreSQL | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/crud-api-hono) |
| [Gin CRUD API](./starters/crud-api-gin) | REST API for items on PostgreSQL, built with Gin and pgx | Go | PostgreSQL | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/crud-api-gin) |
| [Spring Boot CRUD API](./starters/crud-api-spring-boot) | REST API for items on PostgreSQL, built with Spring Boot and JDBC | Java | PostgreSQL | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/crud-api-spring-boot) |
| [ASP.NET Core CRUD API](./starters/crud-api-aspnet) | REST API for items on PostgreSQL, built with ASP.NET Core minimal API and Npgsql | .NET | PostgreSQL | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/crud-api-aspnet) |
| [Django CRUD API](./starters/crud-api-django) | REST API for items on PostgreSQL, built with Django REST framework | Python | PostgreSQL | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/crud-api-django) |
| [Flask CRUD API](./starters/crud-api-flask) | REST API for items on PostgreSQL, built with Flask and psycopg 3 | Python | PostgreSQL | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/crud-api-flask) |
<!-- catalogue:end -->

## Using a template

- **Deploy button:** copies the template into your GitHub account and deploys it. Every later push deploys again.
- **Download:** the template page in the gallery has a download link if you would rather not use GitHub.
- **One folder:** GitHub's "Use this template" copies this whole repository. Use the Deploy button or the download instead.

## Publish your own

Anyone can publish a template from an app they already run on Light Cloud. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Licence

MIT, see [LICENSE](./LICENSE). A template built on another project keeps that project's licence in its folder.
