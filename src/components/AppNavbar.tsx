import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Menu01Icon,
  Award01Icon,
  ClipboardIcon,
  Settings01Icon,
  ShieldIcon,
  InformationCircleIcon,
  ArrowDown01Icon,
  UserIcon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/pages/auth/hooks";
import { RoleGuard } from "@/components/auth";
import { ROLES } from "@/constants/roles";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { path: "/clubs", labelKey: "manageClub.allClubs", icon: Award01Icon },
  { path: "/tournaments", labelKey: "settings.nav.tournaments", icon: Award01Icon },
  { path: "/record-score", labelKey: "settings.nav.recordScore", icon: ClipboardIcon },
  { path: "/profile", labelKey: "settings.nav.settings", icon: Settings01Icon },
  { path: "/sponsors", labelKey: "settings.nav.sponsors", icon: ShieldIcon },
  { path: "/about", labelKey: "settings.nav.about", icon: InformationCircleIcon },
];

const tb10LogoImage = "https://www.figma.com/api/mcp/asset/5f56c3eb-f8bf-419e-bc2c-0780682ffca6";

const pathToTitleKey: Record<string, string> = {
  "/profile": "settings.title",
  "/settings-preview": "settings.title",
  "/tournaments": "settings.nav.tournaments",
  "/my-score": "settings.nav.myScore",
  "/record-score": "settings.nav.recordScore",
  "/clubs/manage/sponsors/": "sponsors.title",
  "/clubs/manage": "manageClub.title",
  "/clubs/": "clubs.clubDetails",
  "/clubs": "clubs.allClubs",
  "/sponsors": "sponsors.allSponsors",
  "/about": "settings.nav.about",
  "/information": "signup.title",
  "/admin/sponsors": "admin.platformSponsors.navTitle",
  "/admin/clubs-subscriptions": "admin.title",
  "/admin": "admin.title",
};

function getPageTitle(pathname: string, t: (key: string) => string): string {
  for (const [path, key] of Object.entries(pathToTitleKey)) {
    if (pathname.startsWith(path)) return t(key);
  }
  return t("profile.title");
}

function NavLinks({
  location,
  t,
  onNavigate,
}: {
  location: ReturnType<typeof useLocation>;
  t: (key: string) => string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {navItems.map(({ path, labelKey, icon }) => {
        const isActive = path === "/profile"
          ? location.pathname.startsWith("/profile")
          : path === "/clubs"
            ? location.pathname.startsWith("/clubs")
          : location.pathname.startsWith(path);
        return (
          <Link
            key={path}
            to={path}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-1.5 text-[14px] leading-none whitespace-nowrap transition-opacity",
              isActive
                ? "font-medium text-white opacity-100"
                : "font-medium text-white opacity-80 hover:opacity-100"
            )}
          >
            <HugeiconsIcon icon={icon} size={17} />
            {t(labelKey)}
          </Link>
        );
      })}
    </>
  );
}

export function AppNavbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const normalizedLanguage = i18n.resolvedLanguage?.toLowerCase().startsWith("de")
    ? "de"
    : "en";
  const languageLabel = normalizedLanguage === "de" ? "DEU" : "ENG";

  const handleLanguageChange = (language: "en" | "de") => {
    if (language !== normalizedLanguage) {
      void i18n.changeLanguage(language);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const pageTitle = getPageTitle(location.pathname, t);

  const authSection = (
    <>
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-[34px] items-center justify-center gap-[7px] rounded-[8px] bg-white/25 px-[10px] text-[14px] font-medium text-white transition-colors hover:bg-white/30"
            >
              <HugeiconsIcon icon={UserIcon} size={17} className="shrink-0" />
              <span className="max-w-[120px] truncate">{user?.alias?.trim() || user?.name?.trim() || t("profile.title")}</span>
              <HugeiconsIcon icon={ArrowDown01Icon} size={14} className="hidden shrink-0 lg:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* TODO: Setup-only shortcut. Replace with final admin IA/navigation flow. */}
            <RoleGuard requireRoleOrAbove={ROLES.SUPER_ADMIN}>
              <DropdownMenuItem asChild>
                <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                  <HugeiconsIcon icon={Award01Icon} size={18} />
                  {t("admin.nav.admin")}
                </Link>
              </DropdownMenuItem>
            </RoleGuard>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout} className="cursor-pointer">
              <HugeiconsIcon icon={Logout01Icon} size={18} />
              {t("common.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link
          to="/login"
          className="flex h-[34px] shrink-0 items-center justify-center gap-[7px] rounded-[8px] bg-brand-accent px-[20px] text-[14px] font-medium text-[#010a04] transition-colors hover:bg-brand-accent-hover"
        >
          <HugeiconsIcon icon={UserIcon} size={17} />
          {t("common.login")}
        </Link>
      )}
    </>
  );

  return (
    <header
      className="sticky top-0 z-50 h-[56px] w-full lg:h-[60px]"
      style={{ backgroundColor: "var(--brand-primary)" }}
    >
      <div className="mx-auto flex h-full w-full max-w-[1440px] min-w-0 items-center justify-between px-5 lg:px-[96px]">
        <div className="flex h-[33px] w-[169px] items-center lg:h-[39px] lg:w-[200px]">
          <Link to="/" className="inline-flex items-center" aria-label="TB10 Home">
            <img src={tb10LogoImage} alt="TB10 v1.6" className="block h-[33px] w-auto lg:h-[39px]" />
          </Link>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-[25px] lg:flex">
          <NavLinks location={location} t={t} />
        </nav>

        <div className="flex flex-shrink-0 items-center justify-end gap-3 lg:gap-[14px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-[34px] w-[90px] items-center justify-between rounded-[8px] border-[1.2px] border-white/20 pl-[12px] pr-[8px] text-[14px] font-medium text-white transition-colors hover:bg-white/10"
                aria-label={t("common.language")}
              >
                {languageLabel}
                <HugeiconsIcon icon={ArrowDown01Icon} size={14} className="shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[90px] min-w-[90px]">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleLanguageChange("en")}
              >
                ENG
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleLanguageChange("de")}
              >
                DEU
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

    
          {authSection}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-center p-0 text-white lg:hidden"
                aria-label="Open menu"
              >
                <HugeiconsIcon icon={Menu01Icon} size={30} aria-hidden />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(90vw,22rem)] min-w-[18rem] border-0 bg-brand-primary p-0"
              showCloseButton={true}
            >
              <SheetHeader className="border-b border-white/20 px-4 py-4">
                <SheetTitle className="text-lg font-semibold text-white">
                  {pageTitle}
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-3 p-4">
                <NavLinks
                  location={location}
                  t={t}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
