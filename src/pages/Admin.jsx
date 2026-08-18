import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";

import { apiGet, apiPost } from "../api/api";


/* ============================================================
 * STATUS
 * ============================================================
 */

const STATUS = {
  ALL: "",
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  VERIFIED: "VERIFIED",
};


const MOBILE_PAGE_SIZE = 10;


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


function getSummary(
  result
) {
  return (
    result?.data?.summary || {
      total: 0,
      not_started: 0,
      in_progress: 0,
      completed: 0,
      verified: 0,
      progress_100: 0,
    }
  );
}


function getParticipantDetail(
  result
) {
  return (
    result?.data?.participant ||
    result?.participant ||
    null
  );
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

  return Number.isFinite(
    result
  )
    ? result
    : null;
}


function getChallengeCounts(
  result
) {
  return (
    result?.data || {
      total: 0,
      PENDING_AI: 0,
      AI_EVALUATED: 0,
      WAITING_VERIFICATION: 0,
      VERIFIED: 0,
    }
  );
}


function getProgress(
  participant
) {
  const progress =
    participant?.progress || {};

  return {
    total: safeNumber(
      progress.total
    ),

    totalMax: safeNumber(
      progress.total_max,
      100
    ),

    percentage: safeNumber(
      progress.percentage
    ),

    personality: safeNumber(
      progress.personality
    ),

    personalityMax: safeNumber(
      progress.personality_max,
      40
    ),

    competency: safeNumber(
      progress.competency
    ),

    competencyMax: safeNumber(
      progress.competency_max,
      40
    ),

    sjt: safeNumber(
      progress.sjt
    ),

    sjtMax: safeNumber(
      progress.sjt_max,
      15
    ),

    challenge: safeNumber(
      progress.challenge
    ),

    challengeMax: safeNumber(
      progress.challenge_max,
      5
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
 * STAT CARD
 * ============================================================
 */

function StatCard({
  title,
  value,
  description,
  icon,
  iconClass = "",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <div className="text-xs font-medium text-slate-500 sm:text-sm">
            {title}
          </div>

          <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </div>

          <div className="mt-1 text-[11px] text-slate-400 sm:text-xs">
            {description}
          </div>

        </div>


        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-slate-50
            ${iconClass}
          `}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


/* ============================================================
 * CATEGORY PROGRESS
 * ============================================================
 */

function CategoryItem({
  label,
  value,
  max,
}) {

  const percentage =
    max > 0
      ? Math.min(
          100,
          Math.round(
            (
              value /
              max
            ) *
            100
          )
        )
      : 0;


  return (
    <div>

      <div className="flex items-center justify-between gap-2">

        <span className="text-[11px] font-medium text-slate-500">
          {label}
        </span>

        <span className="text-[11px] font-semibold text-slate-700">
          {value}/{max}
        </span>

      </div>


      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-red-500 transition-all"
          style={{
            width:
              `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}


/* ============================================================
 * OVERALL PROGRESS
 * ============================================================
 */

function OverallProgress({
  total,
  max,
  percentage,
}) {

  const calculated =
    max > 0
      ? Math.round(
          (
            total /
            max
          ) *
          100
        )
      : 0;


  const safePercentage =
    Number.isFinite(
      percentage
    )
      ? percentage
      : calculated;


  return (
    <div>

      <div className="flex items-center justify-between gap-3">

        <span className="text-xs font-medium text-slate-500">
          Progress
        </span>

        <span className="text-xs font-semibold text-slate-700">
          {total}/{max}
          <span className="ml-1 text-slate-400">
            ({safePercentage}%)
          </span>
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
                  safePercentage
                )
              )}%`,
          }}
        />

      </div>

    </div>
  );
}


/* ============================================================
 * INFO BOX
 * ============================================================
 */

function InfoBox({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </div>

      <div className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value}
      </div>

    </div>
  );
}


/* ============================================================
 * SCORE CARD
 * ============================================================
 */

function ScoreCard({
  title,
  score,
  max,
  percentage,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">

      <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {title}
      </div>


      <div className="mt-2 flex items-end justify-between gap-2">

        <div className="text-2xl font-semibold text-slate-900">

          {score}

          <span className="ml-1 text-sm font-medium text-slate-400">
            / {max}
          </span>

        </div>


        <div className="text-sm font-semibold text-red-600">
          {percentage}%
        </div>

      </div>

    </div>
  );
}


/* ============================================================
 * COMPONENT
 * ============================================================
 */

export default function Admin() {

  /* ==========================================================
   * DATA
   * ==========================================================
   */

  const [
    participants,
    setParticipants
  ] = useState([]);


  const [
    summary,
    setSummary
  ] = useState({
    total: 0,
    not_started: 0,
    in_progress: 0,
    completed: 0,
    verified: 0,
    progress_100: 0,
  });


  const [
    dashboardParticipants,
    setDashboardParticipants
  ] = useState([]);


  const [
    challengeCounts,
    setChallengeCounts
  ] = useState({
    total: 0,
    PENDING_AI: 0,
    AI_EVALUATED: 0,
    WAITING_VERIFICATION: 0,
    VERIFIED: 0,
  });


  /* ==========================================================
   * FILTER
   * ==========================================================
   */

  const [
    search,
    setSearch
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter
  ] = useState(
    STATUS.ALL
  );


  /* ==========================================================
   * PAGINATION MOBILE
   * ==========================================================
   */

  const [
    currentPage,
    setCurrentPage
  ] = useState(1);


  /* ==========================================================
   * UI STATE
   * ==========================================================
   */

  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    refreshing,
    setRefreshing
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  const [
    lastUpdated,
    setLastUpdated
  ] = useState(null);


  /* ==========================================================
   * DETAIL STATE
   * ==========================================================
   */

  const [
    selectedParticipant,
    setSelectedParticipant
  ] = useState(null);


  const [
    detailLoading,
    setDetailLoading
  ] = useState(false);


  const [
    detailError,
    setDetailError
  ] = useState("");


  const [
    resetOpen,
    setResetOpen
  ] = useState(false);


  const [
    resetting,
    setResetting
  ] = useState(false);


  /* ==========================================================
   * LOAD PARTICIPANTS
   * ==========================================================
   */

  const loadParticipants =
    useCallback(
      async ({
        silent = false,
      } = {}) => {

        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }


        setError("");


        try {

          const [
            result,
            globalResult,
            challengeResult
          ] = await Promise.all([

            apiGet({

              action:
                "admin_participants",

              search:
                search.trim(),

              status:
                statusFilter,

            }),

            apiGet({

              action:
                "admin_participants",

              search:
                "",

              status:
                "",

            }),

            apiGet({

              action:
                "challenge_admin_counts",

            }),

          ]);


          console.log(
            "ADMIN PARTICIPANTS:",
            result
          );


          console.log(
            "ADMIN GLOBAL SUMMARY:",
            globalResult
          );


          console.log(
            "CHALLENGE COUNTS:",
            challengeResult
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


          if (
            !globalResult ||
            globalResult.success !== true
          ) {

            throw new Error(
              globalResult?.error?.message ||
              "Gagal mengambil ringkasan dashboard."
            );

          }


          if (
            !challengeResult ||
            challengeResult.success !== true
          ) {

            throw new Error(
              challengeResult?.error?.message ||
              "Gagal mengambil statistik Challenge."
            );

          }


          setParticipants(
            getParticipants(
              result
            )
          );


          setSummary(
            getSummary(
              globalResult
            )
          );


          setDashboardParticipants(
            getParticipants(
              globalResult
            )
          );


          setChallengeCounts(
            getChallengeCounts(
              challengeResult
            )
          );


          setLastUpdated(
            new Date()
          );


        } catch (err) {

          console.error(
            "ADMIN LOAD ERROR:",
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

      },
      [
        search,
        statusFilter,
      ]
    );


  /* ==========================================================
   * INITIAL LOAD
   * ==========================================================
   */

  useEffect(() => {

    loadParticipants();

  }, [
    loadParticipants,
  ]);


  /* ==========================================================
   * RESET MOBILE PAGE
   * ==========================================================
   */

  useEffect(() => {

    setCurrentPage(1);

  }, [
    search,
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


            if (
              !query
            ) {
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
   * DASHBOARD FINAL RANKING PREVIEW
   * ==========================================================
   */

  const topRankings =
    useMemo(
      () => {

        return dashboardParticipants
          .map(
            participant => ({

              participant,

              finalScore:
                getFinalScore(
                  participant
                ),

            })
          )
          .filter(
            item =>
              item.finalScore !==
              null
          )
          .sort(
            (
              first,
              second
            ) =>
              second.finalScore -
              first.finalScore
          )
          .slice(
            0,
            5
          );

      },
      [
        dashboardParticipants,
      ]
    );


  const dashboardCompletionPercentage =
    summary.total > 0
      ? Math.round(
          (
            summary.progress_100 /
            summary.total
          ) *
          100
        )
      : 0;



  /* ==========================================================
   * MOBILE PAGINATION
   * ==========================================================
   */

  const mobileTotalPages =
    Math.max(
      1,
      Math.ceil(
        visibleParticipants.length /
        MOBILE_PAGE_SIZE
      )
    );


  const mobileStartIndex =
    (
      currentPage -
      1
    ) *
    MOBILE_PAGE_SIZE;


  const mobileParticipants =
    visibleParticipants.slice(
      mobileStartIndex,
      mobileStartIndex +
        MOBILE_PAGE_SIZE
    );


  /* ==========================================================
   * OPEN DETAIL
   * ==========================================================
   */

  async function openParticipant(
    participant
  ) {

    const participantId =
      participant?.participant_id;


    if (
      !participantId
    ) {
      return;
    }


    setSelectedParticipant(
      participant
    );


    setDetailLoading(
      true
    );


    setDetailError("");


    try {

      const result =
        await apiGet({

          action:
            "admin_participant",

          participant_id:
            participantId,

        });


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Gagal mengambil detail peserta."
        );

      }


      const detail =
        getParticipantDetail(
          result
        );


      if (
        detail
      ) {

        setSelectedParticipant(
          detail
        );

      }


    } catch (err) {

      console.error(
        "ADMIN DETAIL ERROR:",
        err
      );


      setDetailError(
        err?.message ||
        "Gagal mengambil detail peserta."
      );


    } finally {

      setDetailLoading(
        false
      );

    }

  }


  async function handleResetParticipant() {

    const participantId =
      selectedParticipant?.participant_id;

    if (!participantId) {
      return;
    }

    setResetting(true);
    setDetailError("");

    try {

      const result =
        await apiPost({

          action:
            "admin_reset_participant",

          participant_id:
            participantId,

          confirm_text:
            `RESET:${participantId}`,

        });

      console.log(
        "ADMIN RESET PARTICIPANT:",
        result
      );

      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Gagal mereset assessment peserta."
        );

      }

      setResetOpen(false);

      await loadParticipants({
        silent: true,
      });

      await openParticipant({
        participant_id:
          participantId,
      });

    } catch (err) {

      console.error(
        "ADMIN RESET ERROR:",
        err
      );

      setDetailError(
        err?.message ||
        "Gagal mereset assessment peserta."
      );

    } finally {

      setResetting(false);

    }

  }


  function closeDetail() {

    setResetOpen(false);

    setSelectedParticipant(
      null
    );

    setDetailError("");

  }


  /* ==========================================================
   * LOADING
   * ==========================================================
   */

  if (
    loading
  ) {

    return (
      <div className="min-h-screen bg-slate-50 px-3 py-5 sm:px-5 sm:py-6">

        <div className="mx-auto flex min-h-[70vh] w-full max-w-[1440px] items-center justify-center">

          <div className="rounded-2xl bg-white px-8 py-10 text-center shadow-sm">

            <Loader2
              className="mx-auto h-9 w-9 animate-spin text-red-600"
            />

            <div className="mt-4 text-base font-semibold text-slate-800">
              Memuat dashboard...
            </div>

            <div className="mt-1 text-xs text-slate-400">
              Mengambil data peserta.
            </div>

          </div>

        </div>

      </div>
    );
  }


  /* ==========================================================
   * DETAIL PAGE
   * ==========================================================
   */

  if (
    selectedParticipant
  ) {

    const progress =
      getProgress(
        selectedParticipant
      );


    const score =
      selectedParticipant?.score ||
      {};


    const status =
      String(
        selectedParticipant?.status ||
        ""
      ).toUpperCase();


    const finalScore =
      score.final_score;


    return (
      <div className="min-h-screen bg-slate-50 px-3 py-5 sm:px-5 sm:py-6">

        <div className="mx-auto w-full max-w-[1440px]">

          {/* ==================================================
           * DETAIL HEADER
           * ==================================================
           */}

          <header className="rounded-3xl bg-red-600 px-5 py-6 text-white shadow-sm sm:px-7 sm:py-7">

            <button
              type="button"
              onClick={
                closeDetail
              }
              className="mb-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold transition hover:bg-white/20"
            >

              <ArrowLeft className="h-4 w-4" />

              Kembali

            </button>


            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="min-w-0">

                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-100">
                  Detail Peserta
                </div>


                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {safeText(
                    selectedParticipant.nama,
                    "Nama Peserta"
                  )}
                </h1>


                <div className="mt-1 text-xs font-medium text-red-100">
                  {safeText(
                    selectedParticipant.participant_id
                  )}
                </div>

              </div>


              <span
                className={`
                  inline-flex
                  w-fit
                  rounded-full
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  ${
                    status ===
                    "VERIFIED"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-white/15 text-white"
                  }
                `}
              >
                {getStatusLabel(
                  status
                )}
              </span>

            </div>

          </header>


          {detailError && (

            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
              {detailError}
            </div>

          )}


          {/* ==================================================
           * DATA PESERTA
           * ==================================================
           */}

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">

                <UserRound className="h-5 w-5 text-red-600" />

              </div>


              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Data Peserta
                </h2>

                <p className="text-xs text-slate-500">
                  Informasi peserta assessment.
                </p>

              </div>

            </div>


            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <InfoBox
                label="Nama"
                value={
                  safeText(
                    selectedParticipant.nama
                  )
                }
              />

              <InfoBox
                label="Participant ID"
                value={
                  safeText(
                    selectedParticipant.participant_id
                  )
                }
              />

              <InfoBox
                label="Kelas"
                value={
                  safeText(
                    selectedParticipant.kelas
                  )
                }
              />

              <InfoBox
                label="Email"
                value={
                  safeText(
                    selectedParticipant.email
                  )
                }
              />

            </div>

          </section>


          {/* ==================================================
           * PROGRESS
           * ==================================================
           */}

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-end justify-between gap-4">

              <div>

                <div className="text-xs font-medium text-slate-500">
                  Progress Assessment
                </div>

                <div className="mt-1 text-3xl font-semibold text-slate-900">
                  {progress.total}

                  <span className="ml-1 text-base font-medium text-slate-400">
                    / {progress.totalMax}
                  </span>
                </div>

              </div>


              <div className="text-2xl font-semibold text-red-600">
                {progress.percentage}%
              </div>

            </div>


            <div className="mt-4">

              <OverallProgress
                total={
                  progress.total
                }
                max={
                  progress.totalMax
                }
                percentage={
                  progress.percentage
                }
              />

            </div>


            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <CategoryItem
                label="Personality"
                value={
                  progress.personality
                }
                max={
                  progress.personalityMax
                }
              />

              <CategoryItem
                label="Competency"
                value={
                  progress.competency
                }
                max={
                  progress.competencyMax
                }
              />

              <CategoryItem
                label="SJT"
                value={
                  progress.sjt
                }
                max={
                  progress.sjtMax
                }
              />

              <CategoryItem
                label="Challenge"
                value={
                  progress.challenge
                }
                max={
                  progress.challengeMax
                }
              />

            </div>

          </section>


          {/* ==================================================
           * SCORES
           * ==================================================
           */}

          <section className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">

                <ShieldCheck className="h-5 w-5 text-red-600" />

              </div>


              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Score Assessment
                </h2>

                <p className="text-xs text-slate-500">
                  Nilai yang tersedia di sistem.
                </p>

              </div>

            </div>


            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <ScoreCard
                title="Personality"
                score={
                  safeNumber(
                    score.personality_score
                  )
                }
                max={
                  safeNumber(
                    score.personality_max,
                    200
                  )
                }
                percentage={
                  safeNumber(
                    score.personality_percentage
                  )
                }
              />

              <ScoreCard
                title="Competency"
                score={
                  safeNumber(
                    score.competency_score
                  )
                }
                max={
                  safeNumber(
                    score.competency_max,
                    200
                  )
                }
                percentage={
                  safeNumber(
                    score.competency_percentage
                  )
                }
              />

              <ScoreCard
                title="SJT"
                score={
                  safeNumber(
                    score.sjt_score
                  )
                }
                max={
                  safeNumber(
                    score.sjt_max,
                    75
                  )
                }
                percentage={
                  safeNumber(
                    score.sjt_percentage
                  )
                }
              />

              <ScoreCard
                title="Challenge"
                score={
                  safeNumber(
                    score.challenge_score
                  )
                }
                max={
                  safeNumber(
                    score.challenge_max,
                    25
                  )
                }
                percentage={
                  safeNumber(
                    score.challenge_percentage
                  )
                }
              />

            </div>


            <div className="mt-4 grid gap-3 sm:grid-cols-3">

              <InfoBox
                label="Objective Score"
                value={`${safeNumber(
                  score.objective_score
                )} / ${safeNumber(
                  score.objective_max_score,
                  500
                )}`}
              />

              <InfoBox
                label="Objective Percentage"
                value={`${safeNumber(
                  score.objective_percentage
                )}%`}
              />

              <InfoBox
                label="Final Score"
                value={
                  finalScore !== undefined &&
                  finalScore !== null &&
                  String(
                    finalScore
                  ).trim() !== ""
                    ? String(
                        finalScore
                      )
                    : "Belum tersedia"
                }
              />

            </div>

          </section>


          {/* ==================================================
           * CHALLENGE
           * ==================================================
           */}

          <section className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-5 sm:p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-600">
                  Challenge Verification
                </div>

                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  Evaluasi Jawaban Challenge
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Detail AI evaluation dan verifikasi admin.
                </p>

              </div>


              <button
                type="button"
                disabled={
                  detailLoading
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >

                Challenge Detail

                <ChevronRight className="h-4 w-4" />

              </button>

            </div>

          </section>


          {/* ==================================================
           * RESET ASSESSMENT
           * ==================================================
           */}

          <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="min-w-0">

                <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-700">
                  Reset Assessment
                </div>

                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  Kembalikan peserta ke kondisi awal
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
                  Menghapus seluruh jawaban, score, dan evaluasi Challenge peserta. Data identitas peserta tetap aman.
                </p>

              </div>


              <button
                type="button"
                onClick={() => setResetOpen(true)}
                disabled={
                  resetting ||
                  detailLoading
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-3 text-xs font-semibold text-amber-800 shadow-sm transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              >

                Reset Jawaban

              </button>

            </div>

          </section>


          {/* ==================================================
           * RESET CONFIRMATION MODAL
           * ==================================================
           */}

          {resetOpen && (

            <div
              className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-3 sm:items-center sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reset-participant-title"
            >

              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">

                    <h3
                      id="reset-participant-title"
                      className="text-lg font-semibold text-slate-900"
                    >
                      Reset Jawaban Peserta?
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Tindakan ini akan menghapus seluruh jawaban dan hasil assessment peserta.
                    </p>

                  </div>

                </div>


                <div className="mt-5 rounded-xl bg-slate-50 p-4">

                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Peserta
                  </div>

                  <div className="mt-1 break-words text-sm font-semibold text-slate-900">
                    {safeText(
                      selectedParticipant?.nama,
                      "Nama Peserta"
                    )}
                  </div>

                  <div className="mt-2 text-xs font-medium text-slate-500">
                    {safeText(
                      selectedParticipant?.participant_id,
                      "-"
                    )}
                  </div>

                </div>


                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                  <strong>Perhatian:</strong> Progress akan kembali 0/100, status menjadi Belum Mulai, Final Score dikosongkan, dan evaluasi Challenge lama dihapus.
                </div>


                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() => setResetOpen(false)}
                    disabled={resetting}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={handleResetParticipant}
                    disabled={resetting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resetting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {resetting
                      ? "Mereset..."
                      : "Reset Sekarang"}
                  </button>

                </div>

              </div>

            </div>

          )}


          {/* ==================================================
           * REFRESH DETAIL
           * ==================================================
           */}

          <div className="py-7 text-center">

            <button
              type="button"
              onClick={() =>
                openParticipant(
                  selectedParticipant
                )
              }
              disabled={
                detailLoading
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >

              {detailLoading ? (
                <Loader2
                  className="h-4 w-4 animate-spin"
                />
              ) : (
                <RefreshCw
                  className="h-4 w-4"
                />
              )}

              Refresh Detail

            </button>

          </div>

        </div>
      </div>
    );
  }


  /* ==========================================================
   * DASHBOARD
   * ==========================================================
   */

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 sm:py-6">

      <div className="mx-auto w-full max-w-[1440px]">

        {/* ====================================================
         * HEADER
         * ====================================================
         */}

        <header className="rounded-3xl bg-red-600 px-5 py-6 text-white shadow-sm sm:px-7 sm:py-7">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0">

              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-100">
                PMR SMANEL
              </div>


              <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
                Leadership Assessment Admin
              </h1>


              <p className="mt-1.5 max-w-2xl text-xs leading-5 text-red-100 sm:text-sm">
                Pantau peserta dan progress assessment secara terpusat.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                loadParticipants({
                  silent: true,
                })
              }
              disabled={
                refreshing
              }
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-white
                px-4
                py-2.5
                text-xs
                font-semibold
                text-red-600
                transition
                hover:bg-red-50
                disabled:opacity-60
              "
            >

              {refreshing ? (
                <Loader2
                  className="h-4 w-4 animate-spin"
                />
              ) : (
                <RefreshCw
                  className="h-4 w-4"
                />
              )}

              Refresh

            </button>

          </div>

        </header>


        {/* ====================================================
         * ERROR
         * ====================================================
         */}

        {error && (

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">

            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <span>
              {error}
            </span>

          </div>

        )}


        {/* ====================================================
         * STATS
         * ====================================================
         */}

        <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

          <StatCard
            title="Total Peserta"
            value={
              summary.total
            }
            description="Peserta terdaftar"
            icon={
              <Users className="h-5 w-5" />
            }
            iconClass="text-slate-600"
          />


          <StatCard
            title="Belum Mulai"
            value={
              summary.not_started
            }
            description="Belum mengerjakan"
            icon={
              <Clock3 className="h-5 w-5" />
            }
            iconClass="text-slate-600"
          />


          <StatCard
            title="Dalam Proses"
            value={
              summary.in_progress
            }
            description="Sedang mengerjakan"
            icon={
              <Loader2 className="h-5 w-5" />
            }
            iconClass="text-blue-600"
          />


          <StatCard
            title="Selesai"
            value={
              summary.completed
            }
            description="Assessment selesai"
            icon={
              <UserRound className="h-5 w-5" />
            }
            iconClass="text-amber-600"
          />


          <StatCard
            title="Terverifikasi"
            value={
              summary.verified
            }
            description="Hasil diverifikasi"
            icon={
              <ShieldCheck className="h-5 w-5" />
            }
            iconClass="text-emerald-600"
          />

        </section>


        {/* ====================================================
         * CHALLENGE MONITORING
         * ====================================================
         */}

        <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

          <StatCard
            title="Challenge Pending AI"
            value={
              challengeCounts.PENDING_AI
            }
            description="Menunggu evaluasi AI"
            icon={
              <Clock3 className="h-5 w-5" />
            }
            iconClass="text-amber-600"
          />


          <StatCard
            title="AI Evaluated"
            value={
              challengeCounts.AI_EVALUATED
            }
            description="Sudah dinilai AI"
            icon={
              <BarChart3 className="h-5 w-5" />
            }
            iconClass="text-blue-600"
          />


          <StatCard
            title="Menunggu Verifikasi"
            value={
              challengeCounts.WAITING_VERIFICATION
            }
            description="Perlu tindakan Admin"
            icon={
              <ClipboardCheck className="h-5 w-5" />
            }
            iconClass="text-red-600"
          />


          <StatCard
            title="Challenge Verified"
            value={
              challengeCounts.VERIFIED
            }
            description="Sudah diverifikasi"
            icon={
              <ShieldCheck className="h-5 w-5" />
            }
            iconClass="text-emerald-600"
          />

        </section>


        {/* ====================================================
         * COMPLETE SUMMARY
         * ====================================================
         */}

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="text-xs font-medium text-slate-500">
                Assessment lengkap
              </div>

              <div className="mt-1 text-xl font-semibold text-slate-900">
                {summary.progress_100}

                <span className="ml-1.5 text-xs font-medium text-slate-400">
                  peserta telah mencapai 100/100
                </span>
              </div>

            </div>


            <div className="w-full sm:w-60">

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width:
                      `${
                        summary.total > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (
                                  summary.progress_100 /
                                  summary.total
                                ) *
                                100
                              )
                            )
                          : 0
                      }%`,
                  }}
                />

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
         * TOP RANKING
         * ====================================================
         */}

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                  <Trophy className="h-4 w-4 text-amber-600" />
                </div>

                <div>

                  <div className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Ranking Final
                  </div>

                  <h2 className="mt-0.5 text-base font-semibold text-slate-900">
                    Top 5 Peserta
                  </h2>

                </div>

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                window.location.assign(
                  "/admin/ranking"
                )
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-[10px] font-semibold text-white transition hover:bg-red-600"
            >
              Lihat Ranking
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

          </div>


          {topRankings.length === 0 ? (

            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">

              <Trophy className="mx-auto h-7 w-7 text-slate-300" />

              <div className="mt-2 text-xs font-semibold text-slate-600">
                Belum ada Final Score
              </div>

              <div className="mt-1 text-[10px] text-slate-400">
                Ranking akan muncul setelah peserta memenuhi syarat Final Score.
              </div>

            </div>

          ) : (

            <div className="mt-4 divide-y divide-slate-100">

              {topRankings.map(
                (
                  item,
                  index
                ) => (

                  <button
                    key={
                      item.participant?.participant_id ||
                      index
                    }
                    type="button"
                    onClick={() =>
                      openParticipant(
                        item.participant
                      )
                    }
                    className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-slate-50"
                  >

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-xs font-bold text-amber-700">
                      {index + 1}
                    </div>


                    <div className="min-w-0 flex-1">

                      <div className="truncate text-xs font-semibold text-slate-800">
                        {safeText(
                          item.participant?.nama,
                          "Nama belum tersedia"
                        )}
                      </div>

                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {safeText(
                          item.participant?.participant_id
                        )}
                        <span className="mx-1.5">
                          •
                        </span>
                        Kelas{" "}
                        {safeText(
                          item.participant?.kelas
                        )}
                      </div>

                    </div>


                    <div className="shrink-0 text-right">

                      <div className="text-lg font-bold text-slate-900">
                        {item.finalScore.toFixed(2)}
                      </div>

                      <div className="text-[9px] font-medium uppercase tracking-wide text-emerald-600">
                        Final
                      </div>

                    </div>

                  </button>

                )
              )}

            </div>

          )}

        </section>


        {/* ====================================================
         * SEARCH
         * ====================================================
         */}

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="relative min-w-0 flex-1">

              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={
                  search
                }
                onChange={
                  event =>
                    setSearch(
                      event.target.value
                    )
                }
                placeholder="Cari nama, ID, kelas, atau email..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  py-2.5
                  pl-10
                  pr-3
                  text-xs
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-red-400
                  focus:bg-white
                  focus:ring-2
                  focus:ring-red-50
                "
              />

            </div>


            <select
              value={
                statusFilter
              }
              onChange={
                event =>
                  setStatusFilter(
                    event.target.value
                  )
              }
              className="
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                py-2.5
                text-xs
                font-medium
                text-slate-700
                outline-none
                focus:border-red-400
              "
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


          <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-400">

            <span>
              {visibleParticipants.length} peserta
            </span>


            {lastUpdated && (
              <span>
                Update{" "}
                {lastUpdated.toLocaleTimeString(
                  "id-ID"
                )}
              </span>
            )}

          </div>

        </section>


        {/* ====================================================
         * DESKTOP
         * ====================================================
         */}

        <section className="mt-4 hidden md:block">

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {visibleParticipants.length === 0 ? (

              <div className="px-6 py-16 text-center">

                <Users className="mx-auto h-10 w-10 text-slate-300" />

                <div className="mt-3 text-sm font-semibold text-slate-700">
                  Tidak ada peserta
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  Coba ubah pencarian atau filter.
                </div>

              </div>

            ) : (

              <div className="divide-y divide-slate-100">

                {visibleParticipants.map(
                  participant => {

                    const progress =
                      getProgress(
                        participant
                      );


                    const status =
                      String(
                        participant?.status ||
                        ""
                      ).toUpperCase();


                    return (
                      <div
                        key={
                          participant.participant_id
                        }
                        className="
                          grid
                          grid-cols-[minmax(250px,1.45fr)_minmax(320px,1.65fr)_150px_190px]
                          items-center
                          gap-6
                          px-6
                          py-5
                          transition
                          hover:bg-slate-50
                          xl:px-8
                        "
                      >

                        {/* ==================================================
                         * PESERTA + STATUS
                         * ==================================================
                         */}

                        <div className="min-w-0">

                          <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xs font-semibold text-red-600">

                              {safeText(
                                participant.nama,
                                "P"
                              )
                                .charAt(0)
                                .toUpperCase()}

                            </div>


                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <div className="truncate text-[15px] font-semibold leading-5 text-slate-800">

                                  {safeText(
                                    participant.nama,
                                    "Nama belum tersedia"
                                  )}

                                </div>


                                <span
                                  className={`
                                    inline-flex
                                    shrink-0
                                    rounded-full
                                    px-2
                                    py-1
                                    text-[9px]
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

                              </div>


                              <div className="mt-1 truncate text-[11px] font-medium text-slate-400">

                                {safeText(
                                  participant.participant_id
                                )}

                                <span className="mx-1.5">
                                  •
                                </span>

                                Kelas{" "}
                                {safeText(
                                  participant.kelas
                                )}

                              </div>

                            </div>

                          </div>

                        </div>


                        {/* ==================================================
                         * CATEGORY PROGRESS
                         * ==================================================
                         */}

                        <div className="grid grid-cols-2 gap-x-5 gap-y-3">

                          <CategoryItem
                            label="Personality"
                            value={
                              progress.personality
                            }
                            max={
                              progress.personalityMax
                            }
                          />

                          <CategoryItem
                            label="Competency"
                            value={
                              progress.competency
                            }
                            max={
                              progress.competencyMax
                            }
                          />

                          <CategoryItem
                            label="SJT"
                            value={
                              progress.sjt
                            }
                            max={
                              progress.sjtMax
                            }
                          />

                          <CategoryItem
                            label="Challenge"
                            value={
                              progress.challenge
                            }
                            max={
                              progress.challengeMax
                            }
                          />

                        </div>


                        {/* ==================================================
                         * TOTAL
                         * ==================================================
                         */}

                        <div>

                          <OverallProgress
                            total={
                              progress.total
                            }
                            max={
                              progress.totalMax
                            }
                            percentage={
                              progress.percentage
                            }
                          />

                        </div>


                        {/* ==================================================
                         * DETAIL
                         * ==================================================
                         */}

                        <div className="flex justify-end">

                          <button
                            type="button"
                            onClick={() =>
                              openParticipant(
                                participant
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              justify-center
                              gap-1.5
                              rounded-xl
                              bg-slate-900
                              px-4
                              py-2.5
                              text-[11px]
                              font-semibold
                              text-white
                              transition
                              hover:bg-red-600
                            "
                          >

                            Detail

                            <ChevronRight className="h-3.5 w-3.5" />

                          </button>

                        </div>

                      </div>
                    );

                  }
                )}

              </div>

            )}

          </div>

        </section>


        {/* ====================================================
         * MOBILE CARDS
         * ====================================================
         */}

        <section className="mt-4 space-y-3 md:hidden">

          {mobileParticipants.length === 0 ? (

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">

              <Users className="mx-auto h-10 w-10 text-slate-300" />

              <div className="mt-3 text-sm font-semibold text-slate-700">
                Tidak ada peserta
              </div>

              <div className="mt-1 text-xs text-slate-400">
                Coba ubah pencarian atau filter.
              </div>

            </div>

          ) : (

            mobileParticipants.map(
              participant => {

                const progress =
                  getProgress(
                    participant
                  );


                const status =
                  String(
                    participant?.status ||
                    ""
                  ).toUpperCase();


                return (
                  <article
                    key={
                      participant.participant_id
                    }
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >

                    {/* ==========================================
                     * CARD HEADER
                     * ==========================================
                     */}

                    <div className="border-b border-slate-100 p-4">

                      <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xs font-semibold text-red-600">

                          {safeText(
                            participant.nama,
                            "P"
                          )
                            .charAt(0)
                            .toUpperCase()}

                        </div>


                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <div className="text-[15px] font-semibold leading-5 text-slate-800">

                              {safeText(
                                participant.nama,
                                "Nama belum tersedia"
                              )}

                            </div>


                            <span
                              className={`
                                inline-flex
                                rounded-full
                                px-2
                                py-1
                                text-[9px]
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

                          </div>


                          <div className="mt-1 text-[11px] font-medium text-slate-400">

                            {safeText(
                              participant.participant_id
                            )}

                          </div>

                        </div>

                      </div>

                    </div>


                    {/* ==========================================
                     * CARD BODY
                     * ==========================================
                     */}

                    <div className="p-4">

                      <div className="flex items-end justify-between gap-4">

                        <div>

                          <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Kelas
                          </div>

                          <div className="mt-1 text-sm font-semibold text-slate-700">
                            {safeText(
                              participant.kelas
                            )}
                          </div>

                        </div>


                        <div className="text-right">

                          <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Progress
                          </div>

                          <div className="mt-1 text-xl font-semibold text-slate-900">

                            {progress.total}/
                            {progress.totalMax}

                          </div>

                        </div>

                      </div>


                      <div className="mt-4">

                        <OverallProgress
                          total={
                            progress.total
                          }
                          max={
                            progress.totalMax
                          }
                          percentage={
                            progress.percentage
                          }
                        />

                      </div>


                      <div className="mt-5 grid grid-cols-2 gap-4">

                        <CategoryItem
                          label="Personality"
                          value={
                            progress.personality
                          }
                          max={
                            progress.personalityMax
                          }
                        />

                        <CategoryItem
                          label="Competency"
                          value={
                            progress.competency
                          }
                          max={
                            progress.competencyMax
                          }
                        />

                        <CategoryItem
                          label="SJT"
                          value={
                            progress.sjt
                          }
                          max={
                            progress.sjtMax
                          }
                        />

                        <CategoryItem
                          label="Challenge"
                          value={
                            progress.challenge
                          }
                          max={
                            progress.challengeMax
                          }
                        />

                      </div>

                    </div>


                    {/* ==========================================
                     * CARD ACTION
                     * ==========================================
                     */}

                    <div className="border-t border-slate-100 bg-slate-50 p-3">

                      <button
                        type="button"
                        onClick={() =>
                          openParticipant(
                            participant
                          )
                        }
                        className="
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-slate-900
                          px-4
                          py-3
                          text-xs
                          font-semibold
                          text-white
                          transition
                          hover:bg-red-600
                        "
                      >

                        Lihat Detail

                        <ChevronRight className="h-4 w-4" />

                      </button>

                    </div>

                  </article>
                );

              }
            )

          )}

        </section>


        {/* ====================================================
         * MOBILE PAGINATION
         * ====================================================
         */}

        {mobileTotalPages > 1 && (

          <div className="mt-4 md:hidden">

            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

              <div className="flex items-center justify-between gap-3">

                <button
                  type="button"
                  disabled={
                    currentPage === 1
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
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3.5
                    py-2.5
                    text-xs
                    font-semibold
                    text-slate-700
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Sebelumnya
                </button>


                <div className="text-center">

                  <div className="text-xs font-semibold text-slate-700">
                    Halaman {currentPage} / {mobileTotalPages}
                  </div>


                  <div className="mt-0.5 text-[10px] text-slate-400">

                    {mobileStartIndex + 1}
                    -
                    {Math.min(
                      mobileStartIndex +
                        MOBILE_PAGE_SIZE,
                      visibleParticipants.length
                    )}

                    {" "}dari{" "}

                    {visibleParticipants.length}
                    {" "}peserta

                  </div>

                </div>


                <button
                  type="button"
                  disabled={
                    currentPage >=
                    mobileTotalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      page =>
                        Math.min(
                          mobileTotalPages,
                          page + 1
                        )
                    )
                  }
                  className="
                    rounded-xl
                    bg-slate-900
                    px-3.5
                    py-2.5
                    text-xs
                    font-semibold
                    text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Berikutnya
                </button>

              </div>

            </div>

          </div>

        )}


        {/* ====================================================
         * FOOTER
         * ====================================================
         */}

        <footer className="py-7 text-center">

          <div className="text-[11px] font-medium text-slate-400">
            PMR SMANEL Leadership Assessment 2026
          </div>

        </footer>

      </div>

    </div>
  );
}