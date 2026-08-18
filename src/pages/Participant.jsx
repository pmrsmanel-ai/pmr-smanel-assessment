import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  GraduationCap,
  LogOut,
  Mail,
  UserRound,
  ShieldCheck,
  AlertCircle,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { apiGet } from "../api/api";

function Participant() {
  const navigate = useNavigate();

  const [participantId, setParticipantId] =
    useState("");

  const [participant, setParticipant] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [assessmentLoading, setAssessmentLoading] =
    useState(false);

  /* =========================================================
     LOAD PARTICIPANT ID
  ========================================================== */

  useEffect(() => {
    const sessionId =
      sessionStorage.getItem(
        "participant_id"
      );

    const localId =
      localStorage.getItem(
        "participant_id"
      );

    const id =
      sessionId ||
      localId ||
      "";

    if (!id) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const normalizedId =
      String(id).trim();

    /*
     * Sinkronkan kembali storage.
     */
    sessionStorage.setItem(
      "participant_id",
      normalizedId
    );

    localStorage.setItem(
      "participant_id",
      normalizedId
    );

    setParticipantId(
      normalizedId
    );

    loadParticipant(
      normalizedId
    );
  }, [navigate]);

  /* =========================================================
     GET PARTICIPANT
  ========================================================== */

  async function loadParticipant(id) {
  setLoading(true);
  setError("");

  try {
    const result = await apiGet({
      action: "get_participant",
      participant_id: id,
    });

    console.log(
      "================================="
    );

    console.log(
      "GET PARTICIPANT RESULT:",
      result
    );

    console.log(
      "RESULT DATA:",
      result?.data
    );

    console.log(
      "================================="
    );

    if (!result?.success) {
      throw new Error(
        result?.error?.message ||
          "Data peserta tidak ditemukan."
      );
    }

    /*
     * Backend bisa mengembalikan data
     * langsung di data atau di data.participant.
     */

    let rawData = result?.data;

    if (
      rawData?.participant &&
      typeof rawData.participant === "object"
    ) {
      rawData =
        rawData.participant;
    }

    /*
     * Jika backend mengembalikan array,
     * ambil data pertama.
     */

    if (Array.isArray(rawData)) {
      rawData =
        rawData[0] || {};
    }

    /*
     * Normalisasi nama field.
     */

    const participantData = {
      participant_id:
        rawData?.participant_id ||
        rawData?.participantId ||
        rawData?.id ||
        id,

      nama:
        rawData?.nama ||
        rawData?.name ||
        rawData?.nama_peserta ||
        rawData?.namaPeserta ||
        "",

      kelas:
        rawData?.kelas ||
        rawData?.class ||
        rawData?.kelas_peserta ||
        "",

      email:
        rawData?.email ||
        rawData?.email_peserta ||
        "",

      status:
        rawData?.status ||
        "ACTIVE",

      assessment_status:
        rawData?.assessment_status ||
        rawData?.assessmentStatus ||
        "NOT_STARTED",

      created_at:
        rawData?.created_at ||
        "",

      updated_at:
        rawData?.updated_at ||
        "",
    };

    console.log(
      "NORMALIZED PARTICIPANT:",
      participantData
    );

    /*
     * Pastikan ID benar-benar tersedia.
     */

    if (
      !participantData.participant_id
    ) {
      throw new Error(
        "Participant ID tidak ditemukan dari response backend."
      );
    }

    /*
     * Simpan ID yang sudah diverifikasi.
     */

    const normalizedId =
      String(
        participantData.participant_id
      ).trim();

    sessionStorage.setItem(
      "participant_id",
      normalizedId
    );

    localStorage.setItem(
      "participant_id",
      normalizedId
    );

    setParticipantId(
      normalizedId
    );

    /*
     * Simpan seluruh data peserta.
     */

    setParticipant(
      participantData
    );

    console.log(
      "PARTICIPANT SET:",
      participantData
    );

  } catch (err) {
    console.error(
      "GET PARTICIPANT ERROR:",
      err
    );

    setError(
      err?.message ||
        "Terjadi kesalahan saat mengambil data peserta."
    );
  } finally {
    setLoading(false);
  }
}

  /* =========================================================
     CONTINUE ASSESSMENT
  ========================================================== */

function handleContinueAssessment() {
  const id =
    participant?.participant_id ||
    participant?.participantId ||
    participantId;

  if (!id) {
    setError(
      "Participant ID tidak ditemukan. Silakan login kembali."
    );
    return;
  }

  const normalizedId = String(id).trim();

  // Pastikan session tetap tersedia
  sessionStorage.setItem(
    "participant_id",
    normalizedId
  );

  localStorage.setItem(
    "participant_id",
    normalizedId
  );

  console.log(
    "CONTINUE ASSESSMENT:",
    normalizedId
  );

  setAssessmentLoading(true);

  // MASUK KE PERSONALITY
  navigate("/assessment/personality");
}

  /* =========================================================
     LOGOUT
  ========================================================== */

  function handleLogout() {
    sessionStorage.removeItem(
      "participant_id"
    );

    localStorage.removeItem(
      "participant_id"
    );

    navigate("/login", {
      replace: true,
    });
  }

  /* =========================================================
     FORMAT VALUE
  ========================================================== */

  function displayValue(
    value
  ) {
    if (
      value === undefined ||
      value === null ||
      String(value).trim() === ""
    ) {
      return "-";
    }

    return String(value);
  }

  /* =========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100">
        <div className="flex min-h-screen items-center justify-center px-5">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <Loader2
                size={28}
                className="animate-spin text-red-600"
              />
            </div>

            <h1 className="mt-5 text-xl font-extrabold text-slate-900">
              Memuat Data Peserta
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sedang memverifikasi
              Participant ID Anda.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================== */

  if (error && !participant) {
    return (
      <main className="min-h-screen bg-slate-100">
        <div className="flex min-h-screen items-center justify-center px-5">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle
                size={28}
                className="text-red-600"
              />
            </div>

            <h1 className="mt-5 text-xl font-extrabold text-slate-900">
              Data Peserta Tidak Ditemukan
            </h1>

            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700">
              {error}
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/login",
                  {
                    replace: true,
                  }
                )
              }
              className="mt-5 w-full rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Kembali ke Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     PARTICIPANT DATA
  ========================================================== */

  const name =
  participant?.nama || "-";

const kelas =
  participant?.kelas || "-";

const email =
  participant?.email || "-";

  const status =
    String(
      participant?.status ||
        "ACTIVE"
    ).toUpperCase();

  const assessmentStatus =
    String(
      participant?.assessment_status ||
        participant?.assessmentStatus ||
        "NOT_STARTED"
    ).toUpperCase();

  const assessmentStarted =
    assessmentStatus ===
      "IN_PROGRESS" ||
    assessmentStatus ===
      "STARTED";

  /* =========================================================
     MAIN
  ========================================================== */

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          {/* LOGO */}

          <div className="flex items-center">
            <img
              src="/logo-pmr-smanel.jpg"
              alt="PMR SMANEL"
              className="h-12 w-auto max-w-[150px] object-contain sm:h-14"
            />
          </div>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut
              size={18}
            />

            <span className="hidden sm:inline">
              Keluar
            </span>
          </button>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
        {/* INTRO */}

        <section className="mb-7">
          <p className="text-sm font-extrabold uppercase tracking-wider text-red-600">
            PMR SMANEL Leadership Assessment
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
  Halo,{" "}
  <span className="break-words">
    {name}
  </span>{" "}
  👋
</h1>

          <p className="mt-3 text-base leading-7 text-slate-500">
            Selamat datang di halaman
            assessment kepemimpinan
            PMR SMANEL.
          </p>
        </section>

        {/* ===================================================
            DATA PESERTA
        ==================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50">
              <UserRound
                size={25}
                className="text-red-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Data Peserta
              </h2>

              <p className="text-sm text-slate-500">
                Informasi akun assessment
              </p>
            </div>
          </div>

          {/* DATA GRID */}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {/* PARTICIPANT ID */}

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-medium text-slate-400">
                Participant ID
              </p>

              <p className="mt-2 break-all text-base font-bold text-slate-800">
                {displayValue(
                  participantId
                )}
              </p>
            </div>

            {/* NAMA */}

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-medium text-slate-400">
                Nama
              </p>

              <p className="mt-2 text-base font-bold text-slate-800">
                {displayValue(
                  name
                )}
              </p>
            </div>

            {/* KELAS */}

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-medium text-slate-400">
                Kelas
              </p>

              <p className="mt-2 flex items-center gap-2 text-base font-bold text-slate-800">
                <GraduationCap
                  size={18}
                  className="text-red-500"
                />

                {displayValue(
                  kelas
                )}
              </p>
            </div>

            {/* EMAIL */}

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-medium text-slate-400">
                Email
              </p>

              <p className="mt-2 flex items-center gap-2 break-all text-base font-bold text-slate-800">
                <Mail
                  size={17}
                  className="shrink-0 text-red-500"
                />

                {displayValue(
                  email
                )}
              </p>
            </div>
          </div>

          {/* STATUS */}

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-green-100 bg-green-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={22}
                className="text-green-600"
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                  Status Peserta
                </p>

                <p className="mt-1 text-sm font-bold text-green-800">
                  Peserta terdaftar dalam sistem
                </p>
              </div>
            </div>

            <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-extrabold text-green-700">
              {status}
            </span>
          </div>
        </section>

        {/* ===================================================
            ASSESSMENT
        ==================================================== */}

        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          {/* TITLE */}

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50">
              <BookOpen
                size={25}
                className="text-red-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Assessment Kepemimpinan
              </h2>

              <p className="text-sm text-slate-500">
                Penilaian potensi dan karakter kepemimpinan
              </p>
            </div>
          </div>

          {/* STATUS ASSESSMENT */}

          <div
            className={`mt-6 rounded-2xl border p-5 ${
              assessmentStarted
                ? "border-yellow-200 bg-yellow-50"
                : "border-yellow-200 bg-yellow-50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
                <Clock3
                  size={24}
                  className="text-orange-600"
                />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Status Assessment
                </p>

                <p className="mt-1 text-xl font-extrabold text-orange-700">
                  {assessmentStarted
                    ? "Sedang Berlangsung"
                    : "Belum Dimulai"}
                </p>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}

          <p className="mt-6 text-sm leading-7 text-slate-500 sm:text-base">
            Assessment terdiri dari beberapa
            bagian untuk mengukur karakter,
            kompetensi, situational judgment,
            dan kemampuan menghadapi tantangan.
          </p>

          {/* ERROR */}

          {error && participant && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />

              <span>
                {error}
              </span>
            </div>
          )}

          {/* BUTTON */}

          <button
            type="button"
            disabled={
              assessmentLoading
            }
            onClick={
              handleContinueAssessment
            }
            className="group mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {assessmentLoading ? (
              <>
                <Loader2
                  size={21}
                  className="animate-spin"
                />

                Membuka Assessment...
              </>
            ) : (
              <>
                {assessmentStarted
                  ? "Lanjutkan Assessment"
                  : "Mulai Assessment"}

                <ArrowRight
                  size={21}
                  className="transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </button>
        </section>

        {/* ===================================================
            FOOTER INFO
        ==================================================== */}

        <div className="mt-7 text-center">
          <p className="text-xs leading-5 text-slate-400">
            Pastikan data peserta sudah
            benar sebelum memulai assessment.
            <br />
            Jangan membagikan Participant ID
            kepada peserta lain.
          </p>
        </div>
      </div>
    </main>
  );
}

export default Participant;