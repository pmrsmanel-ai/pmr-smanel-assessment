import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  BarChart3,
  Brain,
  Crosshair,
  FileText,
  Lightbulb,
  Network,
  ShieldCheck,
  Target,
  Users,
  Zap,
} from "lucide-react";


const TEAM_AI_NAV_ITEMS = [

  {
    key: "summary",
    label: "Executive Summary",
    path: "/admin/analisis-tim/ai",
    icon: FileText,
  },

  {
    key: "score",
    label: "Score",
    path: "/admin/analisis-tim/ai/score",
    icon: BarChart3,
  },

  {
    key: "strength",
    label: "Kekuatan",
    path: "/admin/analisis-tim/ai/strength",
    icon: ShieldCheck,
  },

  {
    key: "leadership",
    label: "Leadership",
    path: "/admin/analisis-tim/ai/leadership",
    icon: Brain,
  },

  {
    key: "talent",
    label: "Talent Mapping",
    path: "/admin/analisis-tim/ai/talent",
    icon: Users,
  },

  {
    key: "gap",
    label: "Gap Tim",
    path: "/admin/analisis-tim/ai/gap",
    icon: Crosshair,
  },

  {
    key: "structure",
    label: "Struktur",
    path: "/admin/analisis-tim/ai/structure",
    icon: Network,
  },

  {
    key: "insight",
    label: "Insight AI",
    path: "/admin/analisis-tim/ai/insight",
    icon: Lightbulb,
  },

  {
    key: "risks",
    label: "Team Risks",
    path: "/admin/analisis-tim/ai/risks",
    icon: ShieldCheck,
  },

  {
    key: "development",
    label: "Pembinaan",
    path: "/admin/analisis-tim/ai/development",
    icon: Target,
  },

  {
    key: "priority",
    label: "Priority Action",
    path: "/admin/analisis-tim/ai/action",
    icon: Zap,
  },

];


function normalizePath(
  path
) {

  if (
    !path
  ) {

    return "";

  }


  return path
    .replace(
      /\/+$/,
      ""
    )
    || "/";

}


function getActiveKey(
  pathname
) {

  const currentPath =
    normalizePath(
      pathname
    );


  const exactMatch =
    TEAM_AI_NAV_ITEMS.find(
      function(item) {

        return (
          normalizePath(
            item.path
          ) === currentPath
        );

      }
    );


  if (
    exactMatch
  ) {

    return exactMatch.key;

  }


  return "";

}


export default function TeamAINavigation({
  className = "",
}) {

  const navigate =
    useNavigate();


  const location =
    useLocation();


  const activeKey =
    getActiveKey(
      location.pathname
    );


  return (

    <nav
      aria-label="Navigasi Analisis AI"
      className={`
        sticky
        top-2
        z-30
        w-full
        overflow-x-auto
        rounded-2xl
        border
        border-slate-200
        bg-white/95
        p-2
        shadow-sm
        backdrop-blur
        ${className}
      `}
    >

      <div
        className="
          flex
          min-w-max
          items-center
          gap-1
        "
      >

        {TEAM_AI_NAV_ITEMS.map(
          function(item) {

            const Icon =
              item.icon;


            const active =
              activeKey ===
              item.key;


            return (

              <button
                key={
                  item.key
                }
                type="button"
                onClick={
                  function() {

                    navigate(
                      item.path
                    );

                  }
                }
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                className={`
                  inline-flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  px-3
                  py-2.5
                  text-[11px]
                  font-bold
                  transition-all
                  duration-200
                  ${
                    active
                      ? `
                        bg-red-50
                        text-red-600
                        shadow-sm
                      `
                      : `
                        text-slate-500
                        hover:bg-slate-50
                        hover:text-red-600
                      `
                  }
                `}
              >

                <Icon
                  className="
                    h-3.5
                    w-3.5
                  "
                />

                <span>
                  {
                    item.label
                  }
                </span>

              </button>

            );

          }
        )}

      </div>

    </nav>

  );

}


export {
  TEAM_AI_NAV_ITEMS,
};