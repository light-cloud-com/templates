import { Navigate, Outlet, Route, Routes } from "react-router";
import { AppShell, RequireAuth } from "@/components/app-shell";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Landing } from "@/pages/marketing/landing";
import { Pricing } from "@/pages/marketing/pricing";
import { Privacy, Terms } from "@/pages/marketing/legal";
import { NotFound } from "@/pages/marketing/not-found";
import { SignIn } from "@/pages/auth/sign-in";
import { SignUp } from "@/pages/auth/sign-up";
import { ForgotPassword, ResetPassword } from "@/pages/auth/password";
import { AcceptInvite } from "@/pages/auth/invite";
import { Onboarding } from "@/pages/app/onboarding";
import { Dashboard } from "@/pages/app/dashboard";
import { Projects } from "@/pages/app/projects";
import { ProjectDetail } from "@/pages/app/project-detail";
import { NewWorkspace } from "@/pages/app/new-workspace";
import { Admin } from "@/pages/app/admin";
import { SettingsLayout } from "@/pages/app/settings/layout";
import { AccountSettings } from "@/pages/app/settings/account";
import { WorkspaceSettings } from "@/pages/app/settings/workspace";
import { MembersSettings } from "@/pages/app/settings/members";
import { ApiKeysSettings } from "@/pages/app/settings/api-keys";
import { BillingSettings } from "@/pages/app/settings/billing";

function MarketingLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-2">Skip to content</a>
      <SiteHeader />
      <main id="main" className="flex-1"><Outlet /></main>
      <SiteFooter />
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route index element={<Landing />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="invite/:id" element={<AcceptInvite />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
      <Route path="workspaces/new" element={<RequireAuth><NewWorkspace /></RequireAuth>} />
      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
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
