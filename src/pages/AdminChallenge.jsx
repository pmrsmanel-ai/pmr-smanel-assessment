import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileCheck2,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  apiGet,
  apiPost,
} from "../api/api";


/* ============================================================
 * CONFIG
 * ============================================================
 */

const PAGE_SIZE = 10;

const CHALLENGE_TOTAL = 5;

const STATUS = {
  ALL: "",
  PENDING_AI: "PENDING_AI",
  AI_EVALUATED: "AI_EVALUATED",
  WAITING_VERIFICATION:
    "WAITING_VERIFICATION",
  VERIFIED: "VERIFIED",
};


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

  return Number.isFinite(
    result
  )
    ? result
    : fallback;

}


function normalizeStatus(
  value
) {

  return String(
    value || ""
  )
    .trim()
    .toUpperCase();

}


function statusLabel(
  status
) {

  switch (
    normalizeStatus(
      status
    )
  ) {

    case STATUS.PENDING_AI:
      return "Menunggu AI";

    case STATUS.AI_EVALUATED:
      return "AI Selesai";

    case STATUS.WAITING_VERIFICATION:
      return "Menunggu Verifikasi";

    case STATUS.VERIFIED:
      return "Terverifikasi";

    default:
      return safeText(
        status
      );

  }

}


function statusClass(
  status
) {

  switch (
    normalizeStatus(
      status
    )
  ) {

    case STATUS.PENDING_AI:
      return "bg-slate-100 text-slate-600";

    case STATUS.AI_EVALUATED:
      return "bg-blue-50 text-blue-700";

    case STATUS.WAITING_VERIFICATION:
      return "bg-amber-50 text-amber-700";

    case STATUS.VERIFIED:
      return "bg-emerald-50 text-emerald-700";

    default:
      return "bg-slate-100 text-slate-600";

  }

}


function getItems(
  result
) {

  if (
    Array.isArray(
      result?.data?.items
    )
  ) {
    return result.data.items;
  }

  return [];

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

  return [];

}


function canVerify(
  status
) {

  const normalized =
    normalizeStatus(
      status
    );

  return (
    normalized ===
      STATUS.AI_EVALUATED ||
    normalized ===
      STATUS.WAITING_VERIFICATION
  );

}


/* ============================================================
 * GROUP EVALUATIONS BY PARTICIPANT
 * ============================================================
 */

function groupByParticipant(
  items,
  participants
) {

  const participantMap =
    {};


  participants.forEach(
    participant => {

      const id =
        safeText(
          participant?.participant_id,
          ""
        ).trim();

      if (
        id
      ) {

        participantMap[id] =
          participant;

      }

    }
  );


  const grouped =
    {};


  items.forEach(
    item => {

      const participantId =
        safeText(
          item?.participant_id,
          ""
        ).trim();


      if (
        !participantId
      ) {
        return;
      }


      if (
        !grouped[
          participantId
        ]
      ) {

        const participant =
          participantMap[
            participantId
          ] || {};


        grouped[
          participantId
        ] = {

          participant_id:
            participantId,

          nama:
            participant.nama ||
            "",

          kelas:
            participant.kelas ||
            "",

          email:
            participant.email ||
            "",

          evaluations:
            [],

        };

      }


      grouped[
        participantId
      ]
        .evaluations
        .push(
          item
        );

    }
  );


  /*
   * Urutkan Challenge berdasarkan question_id
   */

  Object.values(
    grouped
  ).forEach(
    participant => {

      participant.evaluations.sort(
        (
          a,
          b
        ) => {

          return safeText(
            a?.question_id,
            ""
          ).localeCompare(
            safeText(
              b?.question_id,
              ""
            ),
            undefined,
            {
              numeric: true,
            }
          );

        }
      );

    }
  );


  return Object.values(
    grouped
  );

}


/* ============================================================
 * PARTICIPANT SUMMARY
 * ============================================================
 */

function getParticipantChallengeSummary(
  participant
) {

  const evaluations =
    participant?.evaluations ||
    [];


  const summary = {

    total:
      evaluations.length,

    pending:
      0,

    aiEvaluated:
      0,

    waiting:
      0,

    verified:
      0,

  };


  evaluations.forEach(
    evaluation => {

      switch (
        normalizeStatus(
          evaluation?.status
        )
      ) {

        case STATUS.PENDING_AI:
          summary.pending++;
          break;

        case STATUS.AI_EVALUATED:
          summary.aiEvaluated++;
          break;

        case STATUS.WAITING_VERIFICATION:
          summary.waiting++;
          break;

        case STATUS.VERIFIED:
          summary.verified++;
          break;

      }

    }
  );


  return summary;

}


/* ============================================================
 * SCORE DISPLAY
 * ============================================================
 */

function ScoreValue({
  value,
}) {

  if (
    value ===
      undefined ||
    value ===
      null ||
    String(value).trim() === ""
  ) {

    return (
      <span className="text-slate-400">
        —
      </span>
    );

  }


  return (
    <span>
      {safeText(value)}
    </span>
  );

}

/* ============================================================
 * AI BREAKDOWN HELPERS
 * ============================================================
 */

function parseAIBreakdown(
  value
) {

  if (
    !value
  ) {

    return {};

  }


  if (
    typeof value ===
    "object"
  ) {

    return value;

  }


  if (
    typeof value !==
    "string"
  ) {

    return {};

  }


  const text =
    value.trim();


  if (
    !text
  ) {

    return {};

  }


  try {

    const parsed =
      JSON.parse(
        text
      );


    if (
      parsed &&
      typeof parsed ===
        "object"
    ) {

      return parsed;

    }

  } catch (
    error
  ) {

    console.warn(
      "AI BREAKDOWN PARSE ERROR:",
      error
    );

  }


  return {};

}


/* ============================================================
 * AI BREAKDOWN CONFIG
 * ============================================================
 */

const AI_BREAKDOWN_CONFIG = [

  {
    key:
      "problem_understanding",

    label:
      "Problem Understanding",

    short:
      "Pemahaman Masalah",

    weight:
      20,
  },

  {
    key:
      "decision_making",

    label:
      "Decision Making",

    short:
      "Pengambilan Keputusan",

    weight:
      25,
  },

  {
    key:
      "leadership",

    label:
      "Leadership",

    short:
      "Kepemimpinan",

    weight:
      25,
  },

  {
    key:
      "teamwork_communication",

    label:
      "Teamwork & Communication",

    short:
      "Kerja Tim & Komunikasi",

    weight:
      15,
  },

  {
    key:
      "solution_action",

    label:
      "Solution & Action",

    short:
      "Solusi & Tindakan",

    weight:
      15,
  },

];


/* ============================================================
 * AI BREAKDOWN COMPONENT
 * ============================================================
 */

function AIBreakdown({
  value,
}) {

  const breakdown =
    parseAIBreakdown(
      value
    );


  const hasData =
    AI_BREAKDOWN_CONFIG.some(
      item => {

        const score =
          Number(
            breakdown?.[
              item.key
            ]
          );


        return Number.isFinite(
          score
        );

      }
    );


  if (
    !hasData
  ) {

    return (

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          AI Breakdown
        </div>


        <div className="mt-3 text-xs text-slate-500">
          Breakdown AI belum tersedia.
        </div>

      </section>

    );

  }


  return (

    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">

      <div className="flex items-start justify-between gap-3">

        <div>

          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            AI Breakdown
          </div>

          <div className="mt-1 text-sm font-semibold text-slate-800">
            Penilaian berdasarkan rubric kepemimpinan
          </div>

        </div>


        <div className="rounded-full bg-blue-50 px-2.5 py-1.5 text-[9px] font-semibold text-blue-700">
          AI Assessment
        </div>

      </div>


      <div className="mt-4 space-y-3">

        {AI_BREAKDOWN_CONFIG.map(
          item => {

            const score =
              Number(
                breakdown?.[
                  item.key
                ]
              );


            const validScore =
              Number.isFinite(
                score
              )
                ? Math.max(
                    0,
                    Math.min(
                      5,
                      score
                    )
                  )
                : 0;


            const percentage =
              (
                validScore /
                5
              ) *
              100;


            return (

              <div
                key={
                  item.key
                }
                className="rounded-xl border border-slate-100 bg-slate-50 p-3.5"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <div className="text-xs font-semibold text-slate-800">
                      {item.label}
                    </div>

                    <div className="mt-0.5 text-[10px] text-slate-400">
                      {item.short} · Bobot{" "}
                      {item.weight}%
                    </div>

                  </div>


                  <div className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-sm font-bold text-slate-800 shadow-sm">

                    {Number.isFinite(
                      score
                    )
                      ? score
                      : "—"}

                    <span className="ml-0.5 text-[10px] font-medium text-slate-400">
                      /5
                    </span>

                  </div>

                </div>


                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

                  <div
                    className="h-full rounded-full bg-red-600 transition-all"
                    style={{
                      width:
                        `${percentage}%`,
                    }}
                  />

                </div>

              </div>

            );

          }
        )}

      </div>

    </section>

  );

}

/* ============================================================
 * STAT CARD
 * ============================================================
 */

function StatCard({
  title,
  value,
  icon,
  iconClass = "",
}) {

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="flex items-center justify-between gap-3">

        <div>

          <div className="text-xs font-medium text-slate-500">
            {title}
          </div>

          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {value}
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
 * CHALLENGE DETAIL MODAL
 * ============================================================
 */

function ChallengeDetailModal({
  participant,
  onClose,
  onVerified,
  onReopened,
}) {

  const [
    selectedEvaluation,
    setSelectedEvaluation
  ] = useState(null);


  const [
    score,
    setScore
  ] = useState("");


  const [
    feedback,
    setFeedback
  ] = useState("");


  const [
    saving,
    setSaving
  ] = useState(false);

  const [
  reopening,
  setReopening
] = useState(false);

  const [
    error,
    setError
  ] = useState("");


  const evaluations =
    participant?.evaluations ||
    [];


  function openEvaluation(
    item
  ) {

    setSelectedEvaluation(
      item
    );


    setScore(
      item?.admin_score !==
        undefined &&
      item?.admin_score !==
        null &&
      String(
        item.admin_score
      ).trim() !== ""
        ? String(
            item.admin_score
          )
        : ""
    );


    setFeedback(
      item?.admin_feedback ||
      ""
    );


    setError("");

  }


  function closeEvaluation() {

    setSelectedEvaluation(
      null
    );

    setError("");

  }


  async function handleVerify() {

    if (
      !selectedEvaluation
    ) {
      return;
    }


    const adminScore =
      Number(score);


    if (
      !Number.isFinite(
        adminScore
      ) ||
      adminScore < 1 ||
      adminScore > 5
    ) {

      setError(
        "Admin Score harus 1 sampai 5."
      );

      return;

    }


    setSaving(
      true
    );


    setError("");


    try {

      const result =
        await apiPost({

          action:
            "challenge_admin_verify",

          evaluation_id:
            selectedEvaluation
              .evaluation_id,

          admin_score:
            adminScore,

          admin_feedback:
            feedback.trim(),

          verified_by:
            "ADMIN",

        });


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Gagal memverifikasi Challenge."
        );

      }


      onVerified();

    } catch (
      err
    ) {

      console.error(
        "CHALLENGE VERIFY ERROR:",
        err
      );


      setError(
        err?.message ||
        "Gagal memverifikasi Challenge."
      );

    } finally {

      setSaving(
        false
      );

    }

  }

async function handleReopen() {

  if (
    !selectedEvaluation
  ) {

    return;

  }


  const confirmed =
    window.confirm(
      "Evaluasi ini akan dikembalikan ke status Menunggu Verifikasi.\n\n" +
      "Nilai final akan dihapus dan Admin dapat melakukan koreksi nilai.\n\n" +
      "Lanjutkan?"
    );


  if (
    !confirmed
  ) {

    return;

  }


  setReopening(
    true
  );


  setError("");


  try {

    const result =
      await apiPost({

        action:
          "challenge_admin_reopen",

        evaluation_id:
          selectedEvaluation
            .evaluation_id,

        admin_feedback:
          "Dibuka kembali untuk koreksi nilai.",

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.error?.message ||
        "Gagal membuka kembali evaluasi Challenge."
      );

    }


    console.log(
      "CHALLENGE REOPEN RESULT:",
      result
    );


    /*
     * ======================================================
     * UPDATE MODAL LANGSUNG
     * ======================================================
     *
     * VERIFIED
     * ↓
     * WAITING_VERIFICATION
     */

    setSelectedEvaluation(
      current => {

        if (
          !current
        ) {

          return null;

        }


        return {

          ...current,

          status:
            "WAITING_VERIFICATION",

          final_score:
            "",

          admin_score:
            "",

          admin_feedback:
            "",

          verified_by:
            "",

          verified_at:
            "",

        };

      }
    );


    /*
     * Reset form Admin
     */

    setScore(
      ""
    );


    setFeedback(
      ""
    );


    /*
     * Refresh data halaman utama.
     *
     * PENTING:
     * Jangan memakai onVerified()
     * karena onVerified() menutup modal.
     */

    if (
      typeof onReopened ===
      "function"
    ) {

      await onReopened();

    }


  } catch (
    err
  ) {

    console.error(
      "CHALLENGE REOPEN ERROR:",
      err
    );


    setError(
      err?.message ||
      "Gagal membuka kembali evaluasi Challenge."
    );


  } finally {

    setReopening(
      false
    );

  }

}


  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">

      <div className="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-w-4xl sm:rounded-3xl">

        {/* ==================================================
         * MODAL HEADER
         * ==================================================
         */}

        <div className="shrink-0 border-b border-slate-100 px-4 py-3.5 sm:px-6 sm:py-5">

          <div className="flex items-start justify-between gap-4">

            <div className="min-w-0">

              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-600">
                Challenge Peserta
              </div>

              <h2 className="mt-1 truncate text-xl font-semibold text-slate-900">
                {safeText(
                  participant?.nama,
                  "Peserta"
                )}
              </h2>

              <div className="mt-0.5 text-[11px] text-slate-400">
                {safeText(
                  participant?.participant_id
                )}
              </div>

            </div>


            <button
              type="button"
              onClick={
                onClose
              }
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            >

              <X className="h-5 w-5" />

            </button>

          </div>

        </div>


        {/* ==================================================
         * MODAL CONTENT
         * ==================================================
         */}

        <div className="flex-1 overflow-y-auto px-4 py-3.5 sm:p-6">

          {!selectedEvaluation ? (

            <div className="space-y-2.5">

              {evaluations.length ===
              0 ? (

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-12 text-center">

                  <FileCheck2 className="mx-auto h-9 w-9 text-slate-300" />

                  <div className="mt-3 text-sm font-semibold text-slate-700">
                    Belum ada evaluasi Challenge
                  </div>

                </div>

              ) : (

                evaluations.map(
                  item => {

                    const itemStatus =
                      normalizeStatus(
                        item?.status
                      );


                    return (
                      <button
                        key={
                          item.evaluation_id
                        }
                        type="button"
                        onClick={() =>
                          openEvaluation(
                            item
                          )
                        }
                        className="
  flex
  w-full
  items-center
  rounded-2xl
  border
  border-slate-200
  bg-white
  px-3
  py-3
  text-left
  shadow-sm
  transition
  hover:border-red-200
  hover:bg-red-50/30
  sm:p-4
"
                      >

                        <div className="flex items-center justify-between gap-3">

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[10px] font-semibold text-red-600 sm:h-10 sm:w-10 sm:text-xs">

                              {safeText(
                                item?.question_id,
                                "CH"
                              )}

                            </div>


                            <div>

                              <div className="text-sm font-semibold text-slate-800">
                                {safeText(
                                  item?.question_id
                                )}
                              </div>

                              <div className="mt-1 text-[11px] text-slate-400">

                                AI Score{" "}

                                <ScoreValue
                                  value={
                                    item?.ai_score
                                  }
                                />

                                /5

                              </div>

                            </div>

                          </div>


                          <div className="flex items-center gap-2">

                            <span
                              className={`
                                rounded-full
                                px-2.5
                                py-1.5
                                text-[9px]
                                font-semibold
                                ${statusClass(
                                  itemStatus
                                )}
                              `}
                            >
                              {statusLabel(
                                itemStatus
                              )}
                            </span>


                            <ChevronRight className="h-4 w-4 text-slate-400" />

                          </div>

                        </div>

                      </button>
                    );

                  }
                )

              )}

            </div>

          ) : (

            <div className="space-y-3 sm:space-y-4">

              <button
                type="button"
                onClick={
                  closeEvaluation
                }
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >

                <ChevronLeft className="h-4 w-4" />

                Kembali ke daftar Challenge

              </button>


              {/* EVALUATION HEADER */}

              <section className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <div>

                    <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Question
                    </div>

                    <div className="mt-1 text-xl font-semibold text-slate-900">
                      {safeText(
                        selectedEvaluation
                          ?.question_id
                      )}
                    </div>

                  </div>


                  <span
                    className={`
                      rounded-full
                      px-3
                      py-2
                      text-[10px]
                      font-semibold
                      ${statusClass(
                        selectedEvaluation
                          ?.status
                      )}
                    `}
                  >
                    {statusLabel(
                      selectedEvaluation
                        ?.status
                    )}
                  </span>

                </div>

              </section>


              {/* ANSWER */}

              <section className="rounded-2xl bg-slate-50 p-3.5 sm:p-4">

                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Jawaban Peserta
                </div>

                <div className="mt-2 max-h-[180px] overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-slate-800">
                  {safeText(
                    selectedEvaluation?.answer,
                    "Belum ada jawaban"
                  )}
                </div>

              </section>


              {/* AI */}

              <section className="grid grid-cols-3 gap-2 sm:gap-3">

                <div className="rounded-xl border border-slate-200 p-3 sm:rounded-2xl sm:p-4">

                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    AI Score
                  </div>

                  <div className="mt-1 text-2xl font-semibold text-slate-900">
                    {safeText(
                      selectedEvaluation?.ai_score,
                      "—"
                    )}

                    <span className="text-sm text-slate-400">
                      /5
                    </span>
                  </div>

                </div>


                <div className="rounded-2xl border border-slate-200 p-4">

                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Confidence
                  </div>

                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {safeText(
                      selectedEvaluation?.ai_confidence
                    )}
                  </div>

                </div>


                <div className="rounded-2xl border border-slate-200 p-4">

                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Final Score
                  </div>

                  <div className="mt-1 text-2xl font-semibold text-slate-900">
                    {selectedEvaluation?.final_score !==
                    undefined &&
                    selectedEvaluation?.final_score !==
                    null &&
                    String(
                      selectedEvaluation.final_score
                    ).trim() !== ""
                      ? selectedEvaluation.final_score
                      : "—"}
                  </div>

                </div>

              </section>


              {/* AI FEEDBACK */}

              <section className="rounded-xl border border-blue-100 bg-blue-50 p-3.5 sm:rounded-2xl sm:p-4">

                <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                  AI Feedback
                </div>

                <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {safeText(
                    selectedEvaluation?.ai_feedback,
                    "Belum tersedia"
                  )}
                </div>

              </section>


              {/* AI BREAKDOWN */}

              <AIBreakdown
                value={
                selectedEvaluation?.ai_breakdown
                 }
                  />


              {/* ADMIN */}

              <section className="rounded-xl border border-red-100 bg-red-50 p-3.5 sm:rounded-2xl sm:p-5">

                <div className="text-[10px] font-semibold uppercase tracking-wider text-red-600">
                  Verifikasi Admin
                </div>


              {normalizeStatus(
  selectedEvaluation?.status
) ===
STATUS.VERIFIED ? (

  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">

      <CheckCircle2 className="h-5 w-5" />

      Sudah Diverifikasi

    </div>


    <div className="mt-2 text-xs text-emerald-700">

      Admin Score:{" "}

      {safeText(
        selectedEvaluation
          ?.admin_score
      )}

      /5

    </div>


    {selectedEvaluation?.admin_feedback && (

      <div className="mt-2 text-xs leading-5 text-emerald-700">

        {
          selectedEvaluation
            .admin_feedback
        }

      </div>

    )}


    {error && (

      <div className="mt-3 rounded-xl border border-red-200 bg-white px-4 py-3 text-xs font-medium text-red-700">

        {error}

      </div>

    )}


    <div className="mt-4 flex justify-end">

      <button
        type="button"
        disabled={
          reopening
        }
        onClick={
          handleReopen
        }
        className="
          inline-flex
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-amber-300
          bg-white
          px-4
          py-2.5
          text-xs
          font-semibold
          text-amber-700
          transition
          hover:bg-amber-50
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >

        {reopening ? (

          <Loader2
            className="h-4 w-4 animate-spin"
          />

        ) : (

          <RefreshCw
            className="h-4 w-4"
          />

        )}


        {reopening
          ? "Membuka..."
          : "Buka Kembali untuk Koreksi"}

      </button>

    </div>

  </div>

) : (

                  <>

                    {error && (

                      <div className="mt-3 rounded-xl border border-red-200 bg-white px-4 py-3 text-xs font-medium text-red-700">
                        {error}
                      </div>

                    )}


                    {!canVerify(
                      selectedEvaluation?.status
                    ) && (

                      <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                        Evaluasi belum dapat diverifikasi.
                      </div>

                    )}


                    <div className="mt-4 grid gap-4 sm:grid-cols-[130px_1fr]">

                      <div>

                        <label className="text-xs font-medium text-slate-600">
                          Admin Score
                        </label>

                        <select
                          value={
                            score
                          }
                          onChange={
                            event =>
                              setScore(
                                event.target.value
                              )
                          }
                          disabled={
                            !canVerify(
                              selectedEvaluation?.status
                            ) ||
                            saving
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-red-500"
                        >

                          <option value="">
                            Pilih
                          </option>

                          <option value="1">
                            1
                          </option>

                          <option value="2">
                            2
                          </option>

                          <option value="3">
                            3
                          </option>

                          <option value="4">
                            4
                          </option>

                          <option value="5">
                            5
                          </option>

                        </select>

                      </div>


                      <div>

                        <label className="text-xs font-medium text-slate-600">
                          Feedback Admin
                        </label>

                        <textarea
                          value={
                            feedback
                          }
                          onChange={
                            event =>
                              setFeedback(
                                event.target.value
                              )
                          }
                          disabled={
                            !canVerify(
                              selectedEvaluation?.status
                            ) ||
                            saving
                          }
                          rows={4}
                          placeholder="Berikan catatan verifikasi..."
                          className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-red-500"
                        />

                      </div>

                    </div>


                    <div className="mt-4 flex justify-end">

                      <button
                        type="button"
                        disabled={
                          !canVerify(
                            selectedEvaluation?.status
                          ) ||
                          saving
                        }
                        onClick={
                          handleVerify
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          bg-red-600
                          px-5
                          py-3
                          text-xs
                          font-semibold
                          text-white
                          transition
                          hover:bg-red-700
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >

                        {saving ? (
                          <Loader2
                            className="h-4 w-4 animate-spin"
                          />
                        ) : (
                          <ShieldCheck
                            className="h-4 w-4"
                          />
                        )}

                        Verifikasi

                      </button>

                    </div>

                  </>

                )}

              </section>

            </div>

          )}

        </div>

      </div>

    </div>
  );

}


/* ============================================================
 * MAIN PAGE
 * ============================================================
 */

export default function AdminChallenge() {

  const [
    items,
    setItems
  ] = useState([]);


  const [
    participants,
    setParticipants
  ] = useState([]);


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
    search,
    setSearch
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter
  ] = useState(
    STATUS.ALL
  );


  const [
    currentPage,
    setCurrentPage
  ] = useState(1);


  const [
    selectedParticipant,
    setSelectedParticipant
  ] = useState(null);


  /* ==========================================================
   * LOAD DATA
   * ==========================================================
   */

  async function loadData(
    silent = false
  ) {

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }


    setError("");


    try {

      const [
        challengeResult,
        participantResult,
      ] = await Promise.all([

        apiGet({

          action:
            "challenge_admin_evaluations",

          status:
            statusFilter,

        }),

        apiGet({

          action:
            "admin_participants",

        }),

      ]);


      if (
        !challengeResult ||
        challengeResult.success !==
          true
      ) {

        throw new Error(
          challengeResult?.error?.message ||
          "Gagal mengambil data Challenge."
        );

      }


      if (
        !participantResult ||
        participantResult.success !==
          true
      ) {

        throw new Error(
          participantResult?.error?.message ||
          "Gagal mengambil data peserta."
        );

      }


      setItems(
        getItems(
          challengeResult
        )
      );


      setParticipants(
        getParticipants(
          participantResult
        )
      );


      setCurrentPage(
        1
      );


    } catch (
      err
    ) {

      console.error(
        "CHALLENGE ADMIN LOAD ERROR:",
        err
      );


      setError(
        err?.message ||
        "Gagal mengambil data Challenge."
      );


    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  }


  /* ==========================================================
   * INITIAL + STATUS
   * ==========================================================
   */

  useEffect(() => {

    loadData();

  }, [
    statusFilter,
  ]);


  /* ==========================================================
   * GROUP
   * ==========================================================
   */

  const groupedParticipants =
    useMemo(
      () => {

        return groupByParticipant(
          items,
          participants
        );

      },
      [
        items,
        participants,
      ]
    );


  /* ==========================================================
   * SEARCH
   * ==========================================================
   */

  const filteredParticipants =
    useMemo(
      () => {

        const query =
          search
            .trim()
            .toLowerCase();


        if (
          !query
        ) {
          return groupedParticipants;
        }


        return groupedParticipants.filter(
          participant => {

            const content =
              [
                participant.nama,
                participant.participant_id,
                participant.kelas,
                participant.email,
              ]
                .map(
                  value =>
                    safeText(
                      value,
                      ""
                    ).toLowerCase()
                )
                .join(" ");


            return content.includes(
              query
            );

          }
        );

      },
      [
        groupedParticipants,
        search,
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
        filteredParticipants.length /
        PAGE_SIZE
      )
    );


  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );


  const pageStart =
    (
      safeCurrentPage -
      1
    ) *
    PAGE_SIZE;


  const pageParticipants =
    filteredParticipants.slice(
      pageStart,
      pageStart +
        PAGE_SIZE
    );


  /* ==========================================================
   * GLOBAL COUNTS
   * ==========================================================
   */

  const counts =
    useMemo(
      () => {

        const result = {

          participants:
            groupedParticipants.length,

          pending:
            0,

          aiEvaluated:
            0,

          waiting:
            0,

          verified:
            0,

          complete:
            0,

        };


        groupedParticipants.forEach(
          participant => {

            const summary =
              getParticipantChallengeSummary(
                participant
              );


            result.pending +=
              summary.pending;

            result.aiEvaluated +=
              summary.aiEvaluated;

            result.waiting +=
              summary.waiting;

            result.verified +=
              summary.verified;


            if (
              summary.verified >=
              CHALLENGE_TOTAL
            ) {

              result.complete++;

            }

          }
        );


        return result;

      },
      [
        groupedParticipants,
      ]
    );


  /* ==========================================================
   * VERIFICATION COMPLETED
   * ==========================================================
   */

  function handleVerified() {

    setSelectedParticipant(
      null
    );


    loadData(
      true
    );

  }

  async function handleReopened() {

  await loadData(
    true
  );

}

  /* ==========================================================
   * RESET PAGE AFTER SEARCH
   * ==========================================================
   */

  useEffect(() => {

    setCurrentPage(
      1
    );

  }, [
    search,
  ]);


  /* ==========================================================
   * LOADING
   * ==========================================================
   */

  if (
    loading
  ) {

    return (
      <div className="min-h-[70vh] px-3 py-6 sm:px-5">

        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="rounded-2xl bg-white px-8 py-10 text-center shadow-sm">

            <Loader2
              className="mx-auto h-9 w-9 animate-spin text-red-600"
            />

            <div className="mt-4 text-sm font-semibold text-slate-800">
              Memuat Challenge...
            </div>

            <div className="mt-1 text-xs text-slate-400">
              Mengelompokkan Challenge berdasarkan peserta.
            </div>

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
    <div className="px-3 py-5 sm:px-5 sm:py-6">

      <div className="mx-auto w-full max-w-[1200px]">

        {/* ====================================================
         * HEADER
         * ====================================================
         */}

        <header className="rounded-3xl bg-red-600 px-5 py-6 text-white shadow-sm sm:px-7 sm:py-7">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-100">
                PMR SMANEL
              </div>


              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Challenge Verification
              </h1>


              <p className="mt-1.5 text-xs leading-5 text-red-100 sm:text-sm">
                Daftar Challenge dikelompokkan berdasarkan peserta.
              </p>

            </div>


            <button
              type="button"
              disabled={
                refreshing
              }
              onClick={() =>
                loadData(
                  true
                )
              }
              className="
                inline-flex
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

          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
            {error}
          </div>

        )}


        {/* ====================================================
         * STATS
         * ====================================================
         */}

        <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

          <StatCard
            title="Peserta"
            value={
              counts.participants
            }
            icon={
              <FileCheck2 className="h-5 w-5 text-slate-600" />
            }
          />


          <StatCard
            title="Pending AI"
            value={
              counts.pending
            }
            icon={
              <Clock3 className="h-5 w-5 text-slate-600" />
            }
          />


          <StatCard
            title="AI Selesai"
            value={
              counts.aiEvaluated
            }
            icon={
              <Loader2 className="h-5 w-5 text-blue-600" />
            }
          />


          <StatCard
            title="Menunggu"
            value={
              counts.waiting
            }
            icon={
              <ShieldCheck className="h-5 w-5 text-amber-600" />
            }
          />


          <StatCard
            title="Verified"
            value={
              counts.verified
            }
            icon={
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            }
          />

        </section>


        {/* ====================================================
         * SEARCH + FILTER
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
                placeholder="Cari nama peserta, Participant ID, atau kelas..."
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
                  placeholder:text-slate-400
                  focus:border-red-400
                  focus:bg-white
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

              <option value="PENDING_AI">
                Pending AI
              </option>

              <option value="AI_EVALUATED">
                AI Selesai
              </option>

              <option value="WAITING_VERIFICATION">
                Menunggu Verifikasi
              </option>

              <option value="VERIFIED">
                Verified
              </option>

            </select>

          </div>


          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">

            <span>

              {filteredParticipants.length}
              {" "}
              peserta

            </span>


            <span>

              Menampilkan{" "}
              {filteredParticipants.length ===
                0
                ? 0
                : pageStart + 1}
              -
              {Math.min(
                pageStart +
                  PAGE_SIZE,
                filteredParticipants.length
              )}

            </span>

          </div>

        </section>


        {/* ====================================================
         * PARTICIPANT CARDS
         * ====================================================
         */}

        <section className="mt-4 space-y-3">

          {pageParticipants.length ===
          0 ? (

            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">

              <FileCheck2 className="mx-auto h-10 w-10 text-slate-300" />

              <div className="mt-3 text-sm font-semibold text-slate-700">
                Tidak ada peserta Challenge
              </div>

              <div className="mt-1 text-xs text-slate-400">
                Data Challenge belum tersedia atau tidak sesuai filter.
              </div>

            </div>

          ) : (

            pageParticipants.map(
              participant => {

                const summary =
                  getParticipantChallengeSummary(
                    participant
                  );


                const progressPercent =
                  Math.min(
                    100,
                    Math.round(
                      (
                        summary.total /
                        CHALLENGE_TOTAL
                      ) *
                      100
                    )
                  );


                const participantComplete =
                  summary.verified >=
                  CHALLENGE_TOTAL;


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

                    <div className="border-b border-slate-100 px-4 py-4 sm:px-5">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm font-semibold text-red-600">

                            {safeText(
                              participant.nama,
                              "P"
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>


                          <div className="min-w-0">

                            <div className="truncate text-[15px] font-semibold text-slate-800">
                              {safeText(
                                participant.nama,
                                "Nama Peserta"
                              )}
                            </div>


                            <div className="mt-0.5 text-[11px] font-medium text-slate-400">

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


                        <div className="flex items-center gap-2">

                          {participantComplete ? (

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-700">

                              <CheckCircle2 className="h-3.5 w-3.5" />

                              Semua Verified

                            </span>

                          ) : (

                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-2 text-[10px] font-semibold text-slate-600">

                              {summary.verified}/
                              {CHALLENGE_TOTAL}
                              {" "}Verified

                            </span>

                          )}

                        </div>

                      </div>

                    </div>


                    {/* ==========================================
                     * CARD BODY
                     * ==========================================
                     */}

                    <div className="p-4 sm:p-5">

                      {/* PROGRESS */}

                      <div>

                        <div className="flex items-center justify-between gap-3">

                          <div className="text-xs font-medium text-slate-500">
                            Progress Challenge
                          </div>

                          <div className="text-xs font-semibold text-slate-700">
                            {summary.total}/
                            {CHALLENGE_TOTAL}
                          </div>

                        </div>


                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full bg-red-600"
                            style={{
                              width:
                                `${progressPercent}%`,
                            }}
                          />

                        </div>

                      </div>


                    {/* ==========================================================
 * STATUS SUMMARY
 * DESKTOP ONLY
 * ==========================================================
 */}

<div className="mt-4 hidden grid-cols-4 gap-3 sm:grid">

  <div className="rounded-xl bg-slate-50 p-3">

    <div className="text-[10px] text-slate-400">
      Pending AI
    </div>

    <div className="mt-1 text-lg font-semibold text-slate-800">
      {summary.pending}
    </div>

  </div>


  <div className="rounded-xl bg-blue-50 p-3">

    <div className="text-[10px] text-blue-600">
      AI Selesai
    </div>

    <div className="mt-1 text-lg font-semibold text-blue-700">
      {summary.aiEvaluated}
    </div>

  </div>


  <div className="rounded-xl bg-amber-50 p-3">

    <div className="text-[10px] text-amber-600">
      Menunggu
    </div>

    <div className="mt-1 text-lg font-semibold text-amber-700">
      {summary.waiting}
    </div>

  </div>


  <div className="rounded-xl bg-emerald-50 p-3">

    <div className="text-[10px] text-emerald-600">
      Verified
    </div>

    <div className="mt-1 text-lg font-semibold text-emerald-700">
      {summary.verified}
    </div>

  </div>

</div>

{summary.verified > 0 &&
 summary.verified < CHALLENGE_TOTAL && (

  <div className="
    mt-3
    hidden
    rounded-xl
    border
    border-amber-100
    bg-amber-50
    px-3.5
    py-2.5
    text-[10px]
    font-medium
    text-amber-700
    sm:block
  ">

    <div className="flex items-center gap-2">

      <RefreshCw className="h-3.5 w-3.5" />

      <span>
        Beberapa Challenge sudah diverifikasi dan
        masih dapat dibuka kembali untuk koreksi.
      </span>

    </div>

  </div>

)}


{/* ==========================================================
 * MOBILE STATUS
 * ==========================================================
 */}

<div className="mt-3 flex items-center justify-between gap-3 sm:hidden">

  <span className="text-[11px] text-slate-400">
    Challenge
  </span>


  <div className="flex items-center gap-2">

    {summary.waiting > 0 && (

      <span className="
        inline-flex
        items-center
        gap-1
        rounded-full
        bg-amber-50
        px-2.5
        py-1.5
        text-[9px]
        font-semibold
        text-amber-700
      ">

        <Clock3 className="h-3 w-3" />

        {summary.waiting} Menunggu

      </span>

    )}


    {summary.verified > 0 && (

      <span className="
        inline-flex
        items-center
        gap-1
        rounded-full
        bg-emerald-50
        px-2.5
        py-1.5
        text-[9px]
        font-semibold
        text-emerald-700
      ">

        <CheckCircle2 className="h-3 w-3" />

        {summary.verified}/{CHALLENGE_TOTAL}

      </span>

    )}

  </div>

</div>


{/* ==========================================================
 * CHALLENGE PREVIEW - DESKTOP
 * ==========================================================
 */}

<div className="mt-4 hidden gap-2 sm:grid sm:grid-cols-5">

  {Array.from({
    length: CHALLENGE_TOTAL,
  }).map(
    (
      _,
      index
    ) => {

      const questionId =
        `CH${String(
          index + 1
        ).padStart(
          3,
          "0"
        )}`;


      const evaluation =
        participant
          .evaluations
          .find(
            item =>
              normalizeQuestionId(
                item?.question_id
              ) ===
              questionId
          );


      const evaluationStatus =
        evaluation
          ? normalizeStatus(
              evaluation.status
            )
          : "NOT_AVAILABLE";


      return (
        <div
          key={
            questionId
          }
          className="rounded-xl border border-slate-200 bg-white p-3"
        >

          <div className="flex items-center justify-between gap-2">

            <span className="text-xs font-semibold text-slate-700">
              {questionId}
            </span>


            <span
              className={`
                rounded-full
                px-2
                py-1
                text-[8px]
                font-semibold
                ${statusClass(
                  evaluationStatus
                )}
              `}
            >
              {shortStatus(
                evaluationStatus
              )}
            </span>

          </div>


          <div className="mt-2 text-[10px] text-slate-400">
            AI
          </div>


          <div className="text-sm font-semibold text-slate-800">

            {evaluation?.ai_score !==
              undefined &&
            evaluation?.ai_score !==
              null &&
            String(
              evaluation.ai_score
            ).trim() !== ""
              ? `${evaluation.ai_score}/5`
              : "—"}

          </div>


          <div className="mt-1 text-[10px] text-slate-400">
            Admin
          </div>


          <div className="text-sm font-semibold text-slate-800">

            {evaluation?.admin_score !==
              undefined &&
            evaluation?.admin_score !==
              null &&
            String(
              evaluation.admin_score
            ).trim() !== ""
              ? `${evaluation.admin_score}/5`
              : "—"}

          </div>

        </div>
      );

    }
  )}

</div>


{/* ==========================================================
 * CHALLENGE PREVIEW - MOBILE
 * ==========================================================
 */}

<div className="mt-4 flex gap-2 overflow-hidden sm:hidden">

  {Array.from({
    length: CHALLENGE_TOTAL,
  }).map(
    (
      _,
      index
    ) => {

      const questionId =
        `CH${String(
          index + 1
        ).padStart(
          3,
          "0"
        )}`;


      const evaluation =
        participant
          .evaluations
          .find(
            item =>
              normalizeQuestionId(
                item?.question_id
              ) ===
              questionId
          );


      const evaluationStatus =
        evaluation
          ? normalizeStatus(
              evaluation.status
            )
          : "NOT_AVAILABLE";


      const isVerified =
        evaluationStatus ===
        STATUS.VERIFIED;


      const isWaiting =
        evaluationStatus ===
        STATUS.WAITING_VERIFICATION;


      return (
        <div
          key={
            questionId
          }
          className="
            flex
            min-w-0
            flex-1
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            px-1.5
            py-2.5
          "
        >

          <div className="text-center">

            <div className="text-[9px] font-semibold text-slate-700">
              CH{String(
                index + 1
              ).padStart(
                2,
                "0"
              )}
            </div>


            <div
              className={`
                mx-auto
                mt-1
                flex
                h-5
                min-w-5
                items-center
                justify-center
                rounded-full
                px-1
                text-[8px]
                font-bold
                ${
                  isVerified
                    ? "bg-emerald-50 text-emerald-600"
                    : isWaiting
                      ? "bg-amber-50 text-amber-600"
                      : "bg-slate-100 text-slate-400"
                }
              `}
            >

              {isVerified
                ? "✓"
                : isWaiting
                  ? "!"
                  : "–"}

            </div>

          </div>

        </div>
      );

    }
  )}

</div>

                    </div>


                    {/* ==========================================
                     * CARD FOOTER
                     * ==========================================
                     */}

                    <div className="border-t border-slate-100 bg-slate-50 p-3">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedParticipant(
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

                        Detail Challenge

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
         * PAGINATION
         * ====================================================
         */}

        {totalPages > 1 && (

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

            <div className="flex items-center justify-between gap-3">

              <button
                type="button"
                disabled={
                  safeCurrentPage === 1
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
                  inline-flex
                  items-center
                  gap-1.5
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

                <ChevronLeft className="h-4 w-4" />

                Sebelumnya

              </button>


              <div className="text-center">

                <div className="text-xs font-semibold text-slate-700">
                  Halaman{" "}
                  {safeCurrentPage}
                  {" / "}
                  {totalPages}
                </div>


                <div className="mt-0.5 text-[10px] text-slate-400">

                  {pageStart + 1}
                  -
                  {Math.min(
                    pageStart +
                      PAGE_SIZE,
                    filteredParticipants.length
                  )}
                  {" "}dari{" "}
                  {filteredParticipants.length}
                  {" "}peserta

                </div>

              </div>


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
                className="
                  inline-flex
                  items-center
                  gap-1.5
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

                <ChevronRight className="h-4 w-4" />

              </button>

            </div>

          </section>

        )}

      </div>


      {/* ======================================================
       * DETAIL MODAL
       * ======================================================
       */}

      {selectedParticipant && (

        <ChallengeDetailModal
          participant={
            selectedParticipant
          }
          onClose={() =>
            setSelectedParticipant(
              null
            )
          }
          onVerified={
            handleVerified
          }

          onReopened={
  handleReopened
}
          
        />

      )}

    </div>
  );

}


/* ============================================================
 * QUESTION ID NORMALIZER
 * ============================================================
 */

function normalizeQuestionId(
  value
) {

  const raw =
    String(
      value || ""
    )
      .trim()
      .toUpperCase();


  if (
    /^CH\d{1,3}$/.test(
      raw
    )
  ) {

    const numberPart =
      raw.replace(
        "CH",
        ""
      );


    return (
      "CH" +
      numberPart.padStart(
        3,
        "0"
      )
    );

  }


  return raw;

}


/* ============================================================
 * SHORT STATUS
 * ============================================================
 */

function shortStatus(
  status
) {

  switch (
    normalizeStatus(
      status
    )
  ) {

    case STATUS.PENDING_AI:
      return "Pending";

    case STATUS.AI_EVALUATED:
      return "AI";

    case STATUS.WAITING_VERIFICATION:
      return "Wait";

    case STATUS.VERIFIED:
      return "OK";

    default:
      return "-";

  }

}