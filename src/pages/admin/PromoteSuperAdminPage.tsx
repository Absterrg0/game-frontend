import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePromoteToSuperAdmin } from "@/pages/admin/hooks";
import { Input } from "@/components/ui/input";
import { UserSearchSelect } from "@/components/shared/UserSearchSelect";
import {
  USER_SEARCH_MIN_LENGTH,
  type SearchUserResult,
} from "@/pages/clubs/hooks";

function usernameForPromotion(user: SearchUserResult): string {
  return user.alias?.trim() || user.email;
}

export default function PromoteSuperAdminPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedUser, setSelectedUser] = useState<SearchUserResult | null>(
    null
  );

  const trimmedUsername = username.trim();
  const promote = usePromoteToSuperAdmin();

  const handleUsernameChange = (next: string) => {
    setUsername(next);
    setSelectedUser((prev) => {
      if (!prev) return null;
      return usernameForPromotion(prev) === next.trim() ? prev : null;
    });
  };

  const handleSelectUser = (user: SearchUserResult) => {
    setSelectedUser(user);
    setUsername(usernameForPromotion(user));
  };

  const showSelectHint =
    trimmedUsername.length >= USER_SEARCH_MIN_LENGTH && !selectedUser;

  const canSubmit =
    selectedUser !== null && password.length > 0 && !promote.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password.length === 0) {
      toast.error(t("admin.promoteSuperAdmin.toastPasswordRequired"));
      return;
    }

    if (!selectedUser) {
      toast.error(t("admin.promoteSuperAdmin.toastSelectUserRequired"));
      return;
    }

    try {
      const result = await promote.mutateAsync({
        username: usernameForPromotion(selectedUser),
        password: password,
      });

      toast.success(
        t("admin.promoteSuperAdmin.toastSuccess", {
          name: result.user.alias ?? result.user.email,
        })
      );
      setPassword("");
      setSelectedUser(null);
      setUsername("");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null;

      toast.error(message ?? t("admin.promoteSuperAdmin.toastError"));
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <Link
        to="/admin"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        {t("admin.promoteSuperAdmin.backToAdmin")}
      </Link>

      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">
          {t("admin.promoteSuperAdmin.pageTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("admin.promoteSuperAdmin.pageDescription")}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="promote-username"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              {t("admin.promoteSuperAdmin.usernameLabel")}
            </label>
            <UserSearchSelect
              inputId="promote-username"
              value={username}
              onValueChange={handleUsernameChange}
              onSelectUser={handleSelectUser}
              placeholder={t("admin.promoteSuperAdmin.usernamePlaceholder")}
              keepTypingText={t("admin.promoteSuperAdmin.keepTypingUsernames")}
              noResultsText={t("admin.promoteSuperAdmin.noMatchingUsernames")}
              userFilter={(user) => {
                const alias = user.alias?.trim();
                return (
                  Boolean(alias) &&
                  alias!.toLowerCase().includes(trimmedUsername.toLowerCase())
                );
              }}
              primaryText={(user) => user.alias?.trim() ?? user.email}
            />
         
          </div>

          <div>
            <label
              htmlFor="promote-password"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              {t("admin.promoteSuperAdmin.passwordLabel")}
            </label>
            <Input
              id="promote-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("admin.promoteSuperAdmin.passwordPlaceholder")}
              autoComplete="off"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-brand-primary hover:bg-brand-primary-hover"
            disabled={!canSubmit}
          >
            {promote.isPending
              ? t("admin.promoteSuperAdmin.submitting")
              : t("admin.promoteSuperAdmin.submit")}
          </Button>
      </form>
      </div>
    </div>
  );
}
