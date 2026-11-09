import { Router } from "express";
import { requireApiKey } from "../middleware/auth.ts";
import { createProject, deleteProject, getProject, listProjects, updateProject } from "../lib/projects.ts";

// The public, versioned API. Each key belongs to one workspace.
export const v1Routes = Router();
v1Routes.use(requireApiKey);

v1Routes.get("/projects", async (_req, res) => {
  res.json({ data: await listProjects(res.locals.workspace.id) });
});

v1Routes.post("/projects", async (req, res) => {
  res.status(201).json({ data: await createProject(res.locals.workspace.id, null, req.body) });
});

v1Routes.get("/projects/:id", async (req, res) => {
  res.json({ data: await getProject(res.locals.workspace.id, req.params.id as string) });
});

v1Routes.patch("/projects/:id", async (req, res) => {
  res.json({ data: await updateProject(res.locals.workspace.id, req.params.id as string, req.body) });
});

v1Routes.delete("/projects/:id", async (req, res) => {
  await deleteProject(res.locals.workspace.id, req.params.id as string);
  res.status(204).end();
});
