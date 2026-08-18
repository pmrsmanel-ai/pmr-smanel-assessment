import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  apiGet,
} from "../api/api";


/* ============================================================
 * HELPERS
 * ============================================================
 */

function safeText(
  value,
  fallback = "-"
) {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return fallback;
  }

  return String(value);
}


function safeNumber(
  value,
  fallback = 0
) {
  const result =
    Number(value);

  return Number.isFinite(result)
    ? result
    : fallback;
}


function getParticipants(
  result
) {
  if (
    Array.isArray(
      result?.data?.participants
    )
  ) {
    return result.data.participants;
  }

  if (
    Array.isArray(
      result?.participants
    )
  ) {
    return result.participants;
  }

  return [];
}


function getFinalScore(
  participant
) {
  const score =
    participant?.score ||
    participant?.scores ||
    {};

  const raw =
    score.final_score ??
    score.finalScore ??
    participant?.final_score ??
    participant?.finalScore ??
    "";

  if (
    raw === "" ||
    raw === null ||
    raw === undefined
  ) {
    return null;
  }

  const result =
    Number(raw);

  return Number.isFinite(result)
    ? result
    : null;
}


function getProgress(
  participant
) {
  const progress =
    participant?.progress ||
    {};

  return {
    total:
      safeNumber(
        progress.total
      ),

    totalMax:
      safeNumber(
        progress.total_max,
        100
      ),

    percentage:
      safeNumber(
        progress.percentage
      ),
  };
}


function getStatusLabel(
  status
) {
  switch (
    String(
      status || ""
    ).toUpperCase()
  ) {

    case "NOT_STARTED":
      return "Belum Mulai";

    case "IN_PROGRESS":
      return "Sedang Mengerjakan";

    case "COMPLETED":
      return "Selesai";

    case "VERIFIED":
      return "Terverifikasi";

    default:
      return safeText(
        status
      );
  }
}


function getStatusClass(
  status
) {
  switch (
    String(
      status || ""
    ).toUpperCase()
  ) {

    case "NOT_STARTED":
      return "bg-slate-100 text-slate-600";

    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700";

    case "COMPLETED":
      return "bg-amber-50 text-amber-700";

    case "VERIFIED":
      return "bg-emerald-50 text-emerald-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}


/* ============================================================
 * PAGE
 * ============================================================
 */

export default function AdminParticipants() {

  const navigate =
    useNavigate();


  const [
    participants,
    setParticipants,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");


  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);


  const PAGE_SIZE = 10;


  /* ==========================================================
   * LOAD DATA
   * ==========================================================
   */

  async function loadParticipants(
    silent = false
  ) {

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {

      const result =
        await apiGet({
          action:
            "admin_participants",

          search:
            search.trim(),

          status:
            statusFilter,
        });


      console.log(
        "ADMIN PARTICIPANTS:",
        result
      );


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Gagal mengambil data peserta."
        );
      }


      setParticipants(
        getParticipants(
          result
        )
      );

    } catch (err) {

      console.error(
        "ADMIN PARTICIPANTS ERROR:",
        err
      );

      setError(
        err?.message ||
        "Gagal mengambil data peserta."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  }


  /* ==========================================================
   * INITIAL LOAD
   * ==========================================================
   */

  useEffect(() => {

    loadParticipants();

  }, [
    statusFilter,
  ]);


  /* ==========================================================
   * FILTER LOCAL
   * ==========================================================
   */

  const visibleParticipants =
    useMemo(
      () => {

        const query =
          search
            .trim()
            .toLowerCase();


        return participants.filter(
          participant => {

            const participantStatus =
              String(
                participant?.status ||
                ""
              ).toUpperCase();


            if (
              statusFilter &&
              participantStatus !==
                statusFilter
            ) {
              return false;
            }


            if (!query) {
              return true;
            }


            const haystack =
              [
                participant?.nama,
                participant?.participant_id,
                participant?.kelas,
                participant?.email,
              ]
                .map(
                  value =>
                    safeText(
                      value,
                      ""
                    ).toLowerCase()
                )
                .join(" ");


            return haystack.includes(
              query
            );

          }
        );

      },
      [
        participants,
        search,
        statusFilter,
      ]
    );


  /* ==========================================================
   * PAGINATION
   * ==========================================================
   */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        visibleParticipants.length /
        PAGE_SIZE
      )
    );


  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );


  const startIndex =
    (
      safeCurrentPage - 1
    ) *
    PAGE_SIZE;


  const pageParticipants =
    visibleParticipants.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );


  useEffect(() => {

    setCurrentPage(1);

  }, [
    search,
    statusFilter,
  ]);


  /* ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {

    return (
      <div className="min-h-screen bg-slate-50 px-3 py-5 sm:px-5 sm:py-6">

        <div className="mx-auto flex min-h-[70vh] w-full max-w-[1400px] items-center justify-center">

          <div className="rounded-2xl bg-white px-8 py-10 text-center shadow-sm">

            <Loader2
              className="mx-auto h-9 w-9 animate-spin text-red-600"
            />

            <div className="mt-4 text-base font-semibold text-slate-800">
              Memuat data peserta...
            </div>

            <div className="mt-1 text-xs text-slate-400">
              Mengambil data dari database
            </div>

          </div>

        </div>

      </div>
    );
  }


  /* ==========================================================
   * ERROR
   * ==========================================================
   */

  if (error) {

    return (
      <div className="min-h-screen bg-slate-50 px-3 py-5 sm:px-5 sm:py-6">

        <div className="mx-auto w-full max-w-[1400px]">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <div className="text-sm font-semibold text-red-700">
              Gagal mengambil data peserta
            </div>

            <div className="mt-2 text-xs text-red-600">
              {error}
            </div>

            <button
              type="button"
              onClick={() =>
                loadParticipants()
              }
              className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              Coba Lagi
            </button>

          </div>

        </div>

      </div>
    );
  }


  /* ==========================================================
   * MAIN
   * ==========================================================
   */

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-5 sm:px-5 sm:py-6">

      <div className="mx-auto w-full max-w-[1400px]">


        {/* ====================================================
         * HEADER
         * ====================================================
         */}

        <header className="rounded-3xl bg-red-600 px-5 py-6 text-white shadow-sm sm:px-7 sm:py-7">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-100">
                PMR SMANEL
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Data Peserta
              </h1>

              <p className="mt-2 text-sm text-red-100">
                Kelola dan pantau seluruh peserta Leadership Assessment 2026.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                loadParticipants(true)
              }
              disabled={refreshing}
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-60"
            >

              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh

            </button>

          </div>

        </header>


        {/* ====================================================
         * SUMMARY
         * ====================================================
         */}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <div className="text-xs font-medium text-slate-500">
                  Total Peserta
                </div>

                <div className="mt-1 text-3xl font-semibold text-slate-900">
                  {participants.length}
                </div>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50">
                <Users className="h-5 w-5 text-slate-600" />
              </div>

            </div>

            <div className="mt-2 text-xs text-slate-400">
              Peserta terdaftar
            </div>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="text-xs font-medium text-slate-500">
              Belum Mulai
            </div>

            <div className="mt-1 text-3xl font-semibold text-slate-900">

              {
                participants.filter(
                  participant =>
                    String(
                      participant?.status ||
                      ""
                    ).toUpperCase() ===
                    "NOT_STARTED"
                ).length
              }

            </div>

            <div className="mt-2 text-xs text-slate-400">
              Belum mengerjakan
            </div>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="text-xs font-medium text-slate-500">
              Selesai
            </div>

            <div className="mt-1 text-3xl font-semibold text-slate-900">

              {
                participants.filter(
                  participant =>
                    String(
                      participant?.status ||
                      ""
                    ).toUpperCase() ===
                    "COMPLETED"
                ).length
              }

            </div>

            <div className="mt-2 text-xs text-slate-400">
              Assessment selesai
            </div>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="text-xs font-medium text-slate-500">
              Terverifikasi
            </div>

            <div className="mt-1 text-3xl font-semibold text-slate-900">

              {
                participants.filter(
                  participant =>
                    String(
                      participant?.status ||
                      ""
                    ).toUpperCase() ===
                    "VERIFIED"
                ).length
              }

            </div>

            <div className="mt-2 text-xs text-slate-400">
              Hasil terverifikasi
            </div>

          </div>

        </div>


        {/* ====================================================
         * FILTER
         * ====================================================
         */}

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={event =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Cari nama, ID, kelas, atau email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
              />

            </div>


            <select
              value={statusFilter}
              onChange={event =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
            >

              <option value="">
                Semua Status
              </option>

              <option value="NOT_STARTED">
                Belum Mulai
              </option>

              <option value="IN_PROGRESS">
                Sedang Mengerjakan
              </option>

              <option value="COMPLETED">
                Selesai
              </option>

              <option value="VERIFIED">
                Terverifikasi
              </option>

            </select>

          </div>


          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">

            <div className="text-xs text-slate-500">
              Menampilkan{" "}
              <span className="font-semibold text-slate-700">
                {visibleParticipants.length}
              </span>{" "}
              peserta
            </div>

            <div className="text-xs text-slate-400">
              Total database: {participants.length}
            </div>

          </div>

        </section>


        {/* ====================================================
         * TABLE
         * ====================================================
         */}

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="min-w-[950px] w-full">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    #
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Peserta
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Kelas
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Progress
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Final Score
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Aksi
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {pageParticipants.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="px-5 py-16 text-center"
                    >

                      <div className="text-sm font-semibold text-slate-700">
                        Tidak ada peserta ditemukan
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        Coba ubah kata pencarian atau filter.
                      </div>

                    </td>

                  </tr>

                ) : (

                  pageParticipants.map(
                    (
                      participant,
                      index
                    ) => {

                      const progress =
                        getProgress(
                          participant
                        );

                      const finalScore =
                        getFinalScore(
                          participant
                        );

                      const status =
                        String(
                          participant?.status ||
                          ""
                        ).toUpperCase();


                      const number =
                        startIndex +
                        index +
                        1;


                      return (

                        <tr
                          key={
                            participant?.participant_id ||
                            index
                          }
                          className="transition hover:bg-slate-50"
                        >

                          <td className="px-5 py-5 text-sm font-semibold text-slate-500">
                            {number}
                          </td>


                          <td className="px-5 py-5">

                            <div className="font-semibold text-slate-900">
                              {safeText(
                                participant?.nama
                              )}
                            </div>

                            <div className="mt-1 text-xs font-medium text-slate-400">
                              {safeText(
                                participant?.participant_id
                              )}
                            </div>

                            {participant?.email && (

                              <div className="mt-1 text-xs text-slate-400">
                                {participant.email}
                              </div>

                            )}

                          </td>


                          <td className="px-5 py-5">

                            <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {safeText(
                                participant?.kelas
                              )}
                            </span>

                          </td>


                          <td className="px-5 py-5">

                            <div className="min-w-[140px]">

                              <div className="flex items-center justify-between gap-2">

                                <span className="text-xs font-semibold text-slate-700">
                                  {progress.total}/
                                  {progress.totalMax}
                                </span>

                                <span className="text-[11px] text-slate-400">
                                  {progress.percentage}%
                                </span>

                              </div>

                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                                <div
                                  className="h-full rounded-full bg-red-600 transition-all"
                                  style={{
                                    width:
                                      `${Math.min(
                                        100,
                                        Math.max(
                                          0,
                                          progress.percentage
                                        )
                                      )}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </td>


                          <td className="px-5 py-5">

                            {finalScore !== null ? (

                              <div>

                                <div className="text-lg font-bold text-slate-900">
                                  {Number(
                                    finalScore
                                  ).toFixed(2)}
                                </div>

                                <div className="text-[10px] font-medium uppercase tracking-wider text-emerald-600">
                                  Final
                                </div>

                              </div>

                            ) : (

                              <span className="text-xs text-slate-400">
                                Belum tersedia
                              </span>

                            )}

                          </td>


                          <td className="px-5 py-5">

                            <span
                              className={`
                                inline-flex
                                rounded-full
                                px-3
                                py-1.5
                                text-[11px]
                                font-semibold
                                ${getStatusClass(
                                  status
                                )}
                              `}
                            >
                              {getStatusLabel(
                                status
                              )}
                            </span>

                          </td>


                          <td className="px-5 py-5 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/peserta/${encodeURIComponent(
                                    participant?.participant_id
                                  )}`
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                            >

                              Detail

                              <ChevronRight className="h-4 w-4" />

                            </button>

                          </td>

                        </tr>

                      );

                    }
                  )

                )}

              </tbody>

            </table>

          </div>


          {/* ==================================================
           * PAGINATION
           * ==================================================
           */}

          {visibleParticipants.length > PAGE_SIZE && (

            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="text-xs text-slate-400">

                Halaman{" "}
                <span className="font-semibold text-slate-700">
                  {safeCurrentPage}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-700">
                  {totalPages}
                </span>

              </div>


              <div className="flex items-center gap-2">

                <button
                  type="button"
                  disabled={
                    safeCurrentPage <= 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      page =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sebelumnya
                </button>


                <button
                  type="button"
                  disabled={
                    safeCurrentPage >=
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      page =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                </button>

              </div>

            </div>

          )}

        </section>

      </div>

    </div>
  );
}