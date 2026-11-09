import { lazy, Suspense, type ComponentType } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AppShell, RequireAuth, ShellSkeleton } from "@/components/app-shell";
import { AuthLayout, FocusLayout, MarketingLayout } from "@/components/layouts";
import { Skeleton } from "@/components/ui/skeleton";
import { Landing } from "@/pages/marketing/landing";

// Each page is its own download, fetched the first time it is opened. The landing
// page ships with the first bundle because most visitors arrive there.
function page<K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(() => load().then((m) => ({ default: m[name] })));
}

const Pricing = page(() => import("@/pages/marketing/pricing"), "Pricing");
const Terms = page(() => import("@/pages/marketing/legal"), "Terms");
const Privacy = page(() => import("@/pages/marketing/legal"), "Privacy");
const NotFound = page(() => import("@/pages/marketing/not-found"), "NotFound");
const SignIn = page(() => import("@/pages/auth/sign-in"), "SignIn");
const SignUp = page(() => import("@/pages/auth/sign-up"), "SignUp");
const ForgotPassword = page(() => import("@/pages/auth/password"), "ForgotPassword");
const ResetPassword = page(() => import("@/pages/auth/password"), "ResetPassword");
const AcceptInvite = page(() => import("@/pages/auth/invite"), "AcceptInvite");
const Onboarding = page(() => import("@/pages/app/onboarding"), "Onboarding");
const NewWorkspace = page(() => import("@/pages/app/new-workspace"), "NewWorkspace");
const Dashboard = page(() => import("@/pages/app/dashboard"), "Dashboard");
const Projects = page(() => import("@/pages/app/projects"), "Projects");
const ProjectDetail = page(() => import("@/pages/app/project-detail"), "ProjectDetail");
const Admin = page(() => import("@/pages/app/admin"), "Admin");
const SettingsLayout = page(() => import("@/pages/app/settings/layout"), "SettingsLayout");
const AccountSettings = page(() => import("@/pages/app/settings/account"), "AccountSettings");
const WorkspaceSettings = page(() => import("@/pages/app/settings/workspace"), "WorkspaceSettings");
const MembersSettings = page(() => import("@/pages/app/settings/members"), "MembersSettings");
const ApiKeysSettings = page(() => import("@/pages/app/settings/api-keys"), "ApiKeysSettings");
const BillingSettings = page(() => import("@/pages/app/settings/billing"), "BillingSettings");

/** Onboarding and new workspace: their own full-screen layout, guarded like the app. */
function Focused({ children }: { children: React.ReactNode }) {
  const loading = <FocusLayout><Skeleton className="h-80" /></FocusLayout>;
  return <RequireAuth fallback={loading}><Suspense fallback={loading}>{children}</Suspense></RequireAuth>;
}

export function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route index element={<Landing />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="invite/:id" element={<AcceptInvite />} />
      </Route>
      <Route path="onboarding" element={<Focused><Onboarding /></Focused>} />
      <Route path="workspaces/new" element={<Focused><NewWorkspace /></Focused>} />
      <Route element={<RequireAuth fallback={<ShellSkeleton />}><AppShell /></RequireAuth>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="admin" element={<Admin />} />
        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="account" replace />} />
          <Route path="account" element={<AccountSettings />} />
          <Route path="workspace" element={<WorkspaceSettings />} />
          <Route path="members" element={<MembersSettings />} />
          <Route path="api-keys" element={<ApiKeysSettings />} />
          <Route path="billing" element={<BillingSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}
