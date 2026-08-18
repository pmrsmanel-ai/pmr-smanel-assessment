import {
  useEffect,
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { apiPost } from "../api/api";


const ADMIN_TOKEN_KEY =
  "pmr_admin_token";

const ADMIN_USER_KEY =
  "pmr_admin_user";

const API_URL =
  import.meta.env.VITE_API_URL;


function getErrorMessage(
  result
) {
  return (
    result?.error?.message ||
    result?.message ||
    "Login admin gagal."
  );
}


export default function AdminLogin() {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  const [
    username,
    setUsername,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    checking,
    setChecking,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {

    let active = true;


    async function checkExistingSession() {

      const token =
        localStorage.getItem(
          ADMIN_TOKEN_KEY
        );

      if (!token) {

        if (active) {
          setChecking(false);
        }

        return;
      }


      try {

        const result =
          await apiPost({
            action:
              "admin_check_session",
            token,
          });


        if (
          result?.success === true &&
          result?.data?.authenticated === true
        ) {

          const destination =
            location.state?.from?.pathname ||
            "/admin";

          if (active) {
            navigate(
              destination,
              {
                replace: true,
              }
            );
          }

          return;
        }


        localStorage.removeItem(
          ADMIN_TOKEN_KEY
        );

        localStorage.removeItem(
          ADMIN_USER_KEY
        );

      } catch (sessionError) {

        console.error(
          "ADMIN SESSION CHECK ERROR:",
          sessionError
        );

        localStorage.removeItem(
          ADMIN_TOKEN_KEY
        );

        localStorage.removeItem(
          ADMIN_USER_KEY
        );

      } finally {

        if (active) {
          setChecking(false);
        }

      }
    }


    checkExistingSession();


    return () => {
      active = false;
    };

  }, [
    navigate,
    location.state,
  ]);


  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    setError("");


    const cleanUsername =
      username.trim();


    if (!cleanUsername) {

      setError(
        "Username admin wajib diisi."
      );

      return;

    }


    if (!password) {

      setError(
        "Password admin wajib diisi."
      );

      return;

    }


    setLoading(true);


    try {

      const result =
        await apiPost({
          action:
            "admin_login",

          username:
            cleanUsername,

          password,
        });


      console.log(
        "ADMIN LOGIN:",
        result
      );


      if (
        !result ||
        result.success !== true ||
        !result.data?.token
      ) {

        throw new Error(
          getErrorMessage(
            result
          )
        );

      }


      localStorage.setItem(
        ADMIN_TOKEN_KEY,
        result.data.token
      );


      localStorage.setItem(
        ADMIN_USER_KEY,
        result.data.username ||
          cleanUsername
      );


      const destination =
        location.state?.from?.pathname ||
        "/admin";


      navigate(
        destination,
        {
          replace: true,
        }
      );

    } catch (err) {

      console.error(
        "ADMIN LOGIN ERROR:",
        err
      );

      setError(
        err?.message ||
        "Login admin gagal."
      );

    } finally {

      setLoading(false);

    }

  }


  if (checking) {

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">

          <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-600" />

          <div className="mt-4 text-sm font-semibold text-slate-800">
            Memeriksa sesi Admin...
          </div>

        </div>

      </main>
    );

  }


  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">

        <section className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

          <div className="bg-red-600 px-6 py-7 text-white sm:px-8">

            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-100">
              PMR SMANEL
            </div>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Admin Assessment
            </h1>

            <p className="mt-2 text-xs leading-5 text-red-100">
              Masuk untuk mengelola peserta,
              Challenge, ranking, dan hasil assessment.
            </p>

          </div>


          <div className="p-6 sm:p-8">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                <ShieldCheck className="h-5 w-5 text-red-600" />
              </div>

              <div>

                <div className="text-sm font-semibold text-slate-900">
                  Login Administrator
                </div>

                <div className="text-[11px] text-slate-400">
                  Session aktif selama maksimal 8 jam.
                </div>

              </div>

            </div>


            {error && (

              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                {error}
              </div>

            )}


            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-4"
            >

              <div>

                <label
                  htmlFor="admin-username"
                  className="mb-1.5 block text-xs font-semibold text-slate-600"
                >
                  Username
                </label>

                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={
                    event =>
                      setUsername(
                        event.target.value
                      )
                  }
                  placeholder="Masukkan username"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100"
                />

              </div>


              <div>

                <label
                  htmlFor="admin-password"
                  className="mb-1.5 block text-xs font-semibold text-slate-600"
                >
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="admin-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={password}
                    onChange={
                      event =>
                        setPassword(
                          event.target.value
                        )
                    }
                    placeholder="Masukkan password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    onClick={() =>
                      setShowPassword(
                        value =>
                          !value
                      )
                    }
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>

              </div>


              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}

                {loading
                  ? "Memproses..."
                  : "Masuk ke Admin"}

              </button>

            </form>


            <div className="mt-6 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[10px] leading-4 text-slate-500">

              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

              <span>
                Jangan bagikan password administrator
                kepada peserta.
              </span>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}