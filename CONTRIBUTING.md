# Contributing

## Publish your own template

You don't need a pull request. Templates you publish are listed in the gallery under your name.

1. Deploy your app to Light Cloud from a **public** GitHub repository, and make sure the deploy succeeds.
2. In the console, open the app, go to **Settings**, and choose **Publish as Template**.
3. Pick a name, description and category. Choose which environment variables people must fill in. Leave secrets out.
4. Submit it. We review it, and once it's approved it appears in the gallery. We email you either way, and a rejection comes with a reason.

The gallery deploys the commit you published, so later pushes to your repository don't reach people until you send an update for review. Manage your templates under **My templates** in the console.

A good template:

- starts with no keys, or names each required key with a short hint
- has a README that says what it is and how to run it locally
- has a licence

## Improve one of ours

Every template here lives only in this repository, so open issues and pull requests here. The one exception is Open SaaS, a copy of `light-cloud-com/starter-opensaas` (the only entry in `catalogue.json` with a `repo`). Maintainers refresh it with:

```bash
node scripts/sync-starters.mjs
```

The script copies it from its repository, records the commit in `catalogue.json`, and rewrites the table in `README.md`.

## Add one of ours

Add the template's folder and an entry in `catalogue.json` (folder, slug, name, description, language, database), then run the script to refresh the table in `README.md`. Commit each new template on its own, with a subject people would search for (framework, language, what it is, e.g. "Express CRUD REST API starter with PostgreSQL for Node.js") and a short body saying what it does and that it deploys to Light Cloud in one click. The gallery gets its list from the platform, not this file, so add the template there as well.
