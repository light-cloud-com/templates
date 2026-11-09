import { Router } from "express";
import { requireSession, requireWorkspace } from "../middleware/auth.ts";
import { createProject, deleteProject, listProjects, updateProject } from "../lib/projects.ts";

export const projectRoutes = Router();
projectRoutes.use(requireSession);

projectRoutes.get("/", requireWorkspace({ project: ["read"] }), async (_req, res) => {
  res.json(await listProjects(res.locals.workspace.id));
});

projectRoutes.post("/", requireWorkspace({ project: ["create"] }), async (req, res) => {
  res.status(201).json(await createProject(res.locals.workspace.id, res.locals.session.user.id, req.body));
});

projectRoutes.patch("/:id", requireWorkspace({ project: ["update"] }), async (req, res) => {
  res.json(await updateProject(res.locals.workspace.id, req.params.id as string, req.body));
});

projectRoutes.delete("/:id", requireWorkspace({ project: ["delete"] }), async (req, res) => {
  await deleteProject(res.locals.workspace.id, req.params.id as string);
  res.status(204).end();
});
