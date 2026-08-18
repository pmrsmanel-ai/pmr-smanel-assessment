import {
  useEffect,
  useState,
} from "react";

import {
  Loader2,
} from "lucide-react";

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { apiPost } from "../api/api";


const ADMIN_TOKEN_KEY =
  "pmr_admin_token";

const ADMIN_USER_KEY =
  "pmr_admin_user";

const API_URL =
  import.meta.env.VITE_API_URL;


export default function ProtectedAdminRoute() {

  const location =
    useLocation();


  const [
    status,
    setStatus,
  ] = useState(
    "checking"
  );


  useEffect(() => {

    let active = true;


    async function verify() {

      const token =
        localStorage.getItem(
          ADMIN_TOKEN_KEY
        );


      if (!token) {

        if (active) {
          setStatus(
            "unauthenticated"
          );
        }

        return;

      }


      try {

        if (!API_URL) {
          throw new Error(
            "VITE_API_URL belum dikonfigurasi."
          );
        }


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

          if (result.data.username) {

            localStorage.setItem(
              ADMIN_USER_KEY,
              result.data.username
            );

          }


          if (active) {
            setStatus(
              "authenticated"
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


        if (active) {
          setStatus(
            "unauthenticated"
          );
        }

      } catch (error) {

        console.error(
          "ADMIN PROTECTED ROUTE ERROR:",
          error
        );


        localStorage.removeItem(
          ADMIN_TOKEN_KEY
        );

        localStorage.removeItem(
          ADMIN_USER_KEY
        );


        if (active) {
          setStatus(
            "unauthenticated"
          );
        }

      }

    }


    verify();


    return () => {
      active = false;
    };

  }, [
    location.pathname,
  ]);


  if (
    status === "checking"
  ) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">

          <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-600" />

          <div className="mt-4 text-sm font-semibold text-slate-800">
            Memverifikasi akses Admin...
          </div>

        </div>

      </div>
    );

  }


  if (
    status !==
    "authenticated"
  ) {

    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from:
            location,
        }}
      />
    );

  }


  return (
    <Outlet />
  );
}