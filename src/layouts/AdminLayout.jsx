import {
  BarChart3,
  Brain,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Trophy,
  Users,
  X,
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  useState,
} from "react";

import {
  apiPost,
} from "../api/api";


/* ============================================================
 * ADMIN SESSION
 * ============================================================
 */

const ADMIN_TOKEN_KEY =
  "pmr_admin_token";

const ADMIN_USER_KEY =
  "pmr_admin_user";


/* ============================================================
 * MENU
 * ============================================================
 */

const MENU_ITEMS = [

  {
    label:
      "Dashboard",

    path:
      "/admin",

    icon:
      LayoutDashboard,

    end:
      true,
  },


  {
    label:
      "Data Peserta",

    path:
      "/admin/peserta",

    icon:
      Users,
  },


  {
    label:
      "Challenge",

    path:
      "/admin/challenge",

    icon:
      ClipboardCheck,
  },


  {
    label:
      "Analisis Tim",

    path:
      "/admin/analisis-tim",

    icon:
      Brain,
  },


  {
    label:
      "Ranking",

    path:
      "/admin/ranking",

    icon:
      Trophy,
  },

];


/* ============================================================
 * ADMIN LAYOUT
 * ============================================================
 */

export default function AdminLayout() {

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);


  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);


  const navigate =
    useNavigate();


  /* ==========================================================
   * CLOSE MOBILE
   * ==========================================================
   */

  function closeMobile() {

    setMobileOpen(
      false
    );

  }


  /* ==========================================================
   * LOGOUT ADMIN
   * ==========================================================
   *
   * Alur:
   *
   * 1. Ambil token Admin
   * 2. Panggil admin_logout
   * 3. Hapus token lokal
   * 4. Hapus username lokal
   * 5. Kembali ke Login Peserta
   * ==========================================================
   */

  async function handleLogout() {

    if (
      loggingOut
    ) {

      return;

    }


    setLoggingOut(
      true
    );


    const token =
      localStorage.getItem(
        ADMIN_TOKEN_KEY
      );


    try {

      /*
       * Panggil backend logout
       * selama token tersedia.
       */

      if (
        token
      ) {

        const result =
          await apiPost({

            action:
              "admin_logout",

            token:
              token,

          });


        console.log(
          "ADMIN LOGOUT:",
          result
        );

      }

    } catch (
      error
    ) {

      /*
       * Walaupun backend logout gagal,
       * session lokal tetap harus dihapus.
       */

      console.error(
        "ADMIN LOGOUT ERROR:",
        error
      );

    } finally {

      /*
       * HAPUS TOKEN SESSION
       */

      localStorage.removeItem(
        ADMIN_TOKEN_KEY
      );


      /*
       * HAPUS USERNAME ADMIN
       */

      localStorage.removeItem(
        ADMIN_USER_KEY
      );


      /*
       * KEMBALI KE LOGIN PESERTA
       */

      navigate(
        "/login",
        {
          replace:
            true,
        }
      );


      setLoggingOut(
        false
      );

    }

  }


  return (

    <div
      className="
        min-h-screen
        bg-slate-50
      "
    >

      {/* ======================================================
       * MOBILE OVERLAY
       * ======================================================
       */}

      {mobileOpen && (

        <button
          type="button"
          aria-label="Tutup menu"
          onClick={
            closeMobile
          }
          className="
            fixed
            inset-0
            z-40
            bg-slate-950/30
            backdrop-blur-[2px]
            lg:hidden
          "
        />

      )}


      {/* ======================================================
       * SIDEBAR
       * ======================================================
       */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[260px]
          flex-col
          border-r
          border-slate-200
          bg-white
          shadow-xl
          transition-transform
          duration-200
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >


        {/* ====================================================
         * BRAND
         * ====================================================
         */}

        <div
          className="
            flex
            h-[76px]
            items-center
            justify-between
            border-b
            border-slate-100
            px-5
          "
        >

          <div
            className="
              min-w-0
            "
          >

            <div
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-red-600
              "
            >
              PMR SMANEL
            </div>


            <div
              className="
                mt-1
                truncate
                text-sm
                font-semibold
                text-slate-900
              "
            >
              Leadership Assessment
            </div>

          </div>


          <button
            type="button"
            onClick={
              closeMobile
            }
            className="
              rounded-xl
              p-2
              text-slate-400
              hover:bg-slate-50
              hover:text-slate-700
              lg:hidden
            "
          >

            <X
              className="
                h-5
                w-5
              "
            />

          </button>

        </div>


        {/* ====================================================
         * MENU
         * ====================================================
         */}

        <nav
          className="
            flex-1
            overflow-y-auto
            px-3
            py-5
          "
        >

          <div
            className="
              mb-3
              px-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-slate-400
            "
          >
            Menu Utama
          </div>


          <div
            className="
              space-y-1
            "
          >

            {MENU_ITEMS.map(
              item => {

                const Icon =
                  item.icon;


                return (

                  <NavLink
                    key={
                      item.path
                    }
                    to={
                      item.path
                    }
                    end={
                      item.end
                    }
                    onClick={
                      closeMobile
                    }
                    className={({
                      isActive,
                    }) => `
                      group
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-sm
                      font-medium
                      transition
                      ${
                        isActive
                          ? "bg-red-50 text-red-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
                  >

                    {({
                      isActive,
                    }) => (

                      <>

                        <Icon
                          className={`
                            h-5
                            w-5
                            shrink-0
                            ${
                              isActive
                                ? "text-red-600"
                                : "text-slate-400 group-hover:text-slate-600"
                            }
                          `}
                        />


                        <span
                          className="
                            flex-1
                          "
                        >
                          {
                            item.label
                          }
                        </span>


                        {isActive && (

                          <ChevronRight
                            className="
                              h-4
                              w-4
                            "
                          />

                        )}

                      </>

                    )}

                  </NavLink>

                );

              }
            )}

          </div>


          {/* ==================================================
           * SISTEM
           * ==================================================
           */}

          <div
            className="
              mt-7
              mb-3
              px-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-slate-400
            "
          >
            Sistem
          </div>


          <NavLink
            to="/admin/settings"
            onClick={
              closeMobile
            }
            className={({
              isActive,
            }) => `
              group
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              text-left
              text-sm
              font-medium
              transition
              ${
                isActive
                  ? "bg-red-50 text-red-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }
            `}
          >

            {({
              isActive,
            }) => (

              <>

                <Settings
                  className={`
                    h-5
                    w-5
                    shrink-0
                    ${
                      isActive
                        ? "text-red-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    }
                  `}
                />


                <span
                  className="
                    flex-1
                  "
                >
                  Pengaturan
                </span>


                {isActive && (

                  <ChevronRight
                    className="
                      h-4
                      w-4
                    "
                  />

                )}

              </>

            )}

          </NavLink>

        </nav>


        {/* ====================================================
         * SIDEBAR FOOTER
         * ====================================================
         */}

        <div
          className="
            border-t
            border-slate-100
            p-3
          "
        >

          <button
            type="button"
            onClick={
              handleLogout
            }
            disabled={
              loggingOut
            }
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              text-left
              text-sm
              font-medium
              text-slate-500
              transition
              hover:bg-red-50
              hover:text-red-600
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            <LogOut
              className="
                h-5
                w-5
              "
            />


            {
              loggingOut
                ? "Keluar..."
                : "Keluar"
            }

          </button>

        </div>

      </aside>


      {/* ======================================================
       * MAIN AREA
       * ======================================================
       */}

      <div
        className="
          min-h-screen
          lg:pl-[260px]
        "
      >


        {/* ====================================================
         * TOP BAR
         * ====================================================
         */}

        <header
          className="
            sticky
            top-0
            z-30
            border-b
            border-slate-200
            bg-white/95
            backdrop-blur
          "
        >

          <div
            className="
              flex
              h-[64px]
              items-center
              justify-between
              px-4
              sm:px-6
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <button
                type="button"
                onClick={() =>
                  setMobileOpen(
                    true
                  )
                }
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-slate-600
                  lg:hidden
                "
              >

                <Menu
                  className="
                    h-5
                    w-5
                  "
                />

              </button>


              <div
                className="
                  lg:hidden
                "
              >

                <div
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-red-600
                  "
                >
                  PMR SMANEL
                </div>


                <div
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Admin Assessment
                </div>

              </div>

            </div>


            <div
              className="
                hidden
                items-center
                gap-2
                lg:flex
              "
            >

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-red-50
                "
              >

                <BarChart3
                  className="
                    h-4
                    w-4
                    text-red-600
                  "
                />

              </div>


              <div>

                <div
                  className="
                    text-[10px]
                    font-medium
                    text-slate-400
                  "
                >
                  SYSTEM
                </div>


                <div
                  className="
                    text-xs
                    font-semibold
                    text-emerald-600
                  "
                >
                  Online
                </div>

              </div>

            </div>

          </div>

        </header>


        {/* ====================================================
         * PAGE CONTENT
         * ====================================================
         */}

        <main
          className="
            min-h-[calc(100vh-64px)]
          "
        >

          <Outlet />

        </main>

      </div>

    </div>

  );

}