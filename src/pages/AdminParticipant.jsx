import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import { apiGet, apiPost } from "../api/api";


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


function getParticipant(
  result
) {

  return (
    result?.data?.participant ||
    result?.participant ||
    null
  );

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

    personality:
      safeNumber(
        progress.personality
      ),

    personalityMax:
      safeNumber(
        progress.personality_max,
        40
      ),

    competency:
      safeNumber(
        progress.competency
      ),

    competencyMax:
      safeNumber(
        progress.competency_max,
        40
      ),

    sjt:
      safeNumber(
        progress.sjt
      ),

    sjtMax:
      safeNumber(
        progress.sjt_max,
        15
      ),

    challenge:
      safeNumber(
        progress.challenge
      ),

    challengeMax:
      safeNumber(
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
 * INFO BOX
 * ============================================================
 */

function InfoBox({
  label,
  value,
}) {

  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </div>

      <div className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value}
      </div>

    </div>
  );

}


/* ============================================================
 * PROGRESS ITEM
 * ============================================================
 */

function ProgressItem({
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

      <div className="flex items-center justify-between gap-3">

        <span className="text-xs font-medium text-slate-500">
          {label}
        </span>

        <span className="text-xs font-semibold text-slate-700">
          {value}/{max}
        </span>

      </div>


      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

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

      <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
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
 * CHALLENGE HELPERS
 * ============================================================
 */

function getChallengeItems(result) {
  if (
    Array.isArray(result?.data?.items)
  ) {
    return result.data.items;
  }

  if (
    Array.isArray(result?.data?.evaluations)
  ) {
    return result.data.evaluations;
  }

  if (
    Array.isArray(result?.items)
  ) {
    return result.items;
  }

  if (
    Array.isArray(result?.evaluations)
  ) {
    return result.evaluations;
  }

  return [];
}


function normalizeChallengeStatus(value) {
  return String(
    value || ""
  )
    .trim()
    .toUpperCase();
}


function getChallengeStatusLabel(value) {
  switch (
    normalizeChallengeStatus(value)
  ) {
    case "PENDING_AI":
      return "Menunggu AI";

    case "AI_EVALUATED":
      return "AI Evaluated";

    case "WAITING_VERIFICATION":
      return "Menunggu Verifikasi";

    case "VERIFIED":
      return "Verified";

    default:
      return safeText(value);
  }
}


function getChallengeStatusClass(value) {
  switch (
    normalizeChallengeStatus(value)
  ) {
    case "VERIFIED":
      return "bg-emerald-50 text-emerald-700";

    case "WAITING_VERIFICATION":
      return "bg-amber-50 text-amber-700";

    case "AI_EVALUATED":
      return "bg-blue-50 text-blue-700";

    case "PENDING_AI":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
}


function getChallengeSummary(items) {
  const summary = {
    total: items.length,
    pendingAI: 0,
    aiEvaluated: 0,
    waiting: 0,
    verified: 0,
  };

  items.forEach(
    item => {
      switch (
        normalizeChallengeStatus(
          item?.status
        )
      ) {
        case "PENDING_AI":
          summary.pendingAI += 1;
          break;

        case "AI_EVALUATED":
          summary.aiEvaluated += 1;
          break;

        case "WAITING_VERIFICATION":
          summary.waiting += 1;
          break;

        case "VERIFIED":
          summary.verified += 1;
          break;

        default:
          break;
      }
    }
  );

  return summary;
}


/* ============================================================
 * REPORT HELPERS
 * ============================================================
 */

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


function reportNumber(
  value,
  fallback = 0
) {

  const result =
    Number(value);

  return Number.isFinite(result)
    ? result
    : fallback;

}


function reportPercentage(
  value,
  max,
  fallback = 0
) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const numericValue =
    Number(value);

  const numericMax =
    Number(max);

  if (
    !Number.isFinite(
      numericValue
    ) ||
    !Number.isFinite(
      numericMax
    ) ||
    numericMax <= 0
  ) {
    return fallback;
  }

  return Math.round(
    (
      numericValue /
      numericMax
    ) *
    100
  );

}


/* ============================================================
 * PAGE
 * ============================================================
 */

export default function AdminParticipant() {

  const {
    participantId,
  } = useParams();


  const navigate =
    useNavigate();


  const [
    participant,
    setParticipant
  ] = useState(null);


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
    resetOpen,
    setResetOpen
  ] = useState(false);


  const [
    resetting,
    setResetting
  ] = useState(false);


  const [
    challengeItems,
    setChallengeItems
  ] = useState([]);


  const [
    challengeLoading,
    setChallengeLoading
  ] = useState(false);


  const [
    activeTab,
    setActiveTab
  ] = useState("overview");


  /* ==========================================================
   * LOAD DETAIL
   * ==========================================================
   */

  async function loadParticipant(
    silent = false
  ) {

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }


    setError("");


    try {

      if (!participantId) {

        throw new Error(
          "Participant ID tidak ditemukan."
        );

      }


      setChallengeLoading(true);


      const [
        result,
        challengeResult,
      ] = await Promise.all([

        apiGet({

          action:
            "admin_participant",

          participant_id:
            participantId,

        }),

        apiGet({

          action:
            "challenge_admin_evaluations",

          participant_id:
            participantId,

        }),

      ]);


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
        challengeResult &&
        challengeResult.success === true
      ) {

        setChallengeItems(
          getChallengeItems(
            challengeResult
          )
        );

      } else {

        setChallengeItems([]);

      }


      const data =
        getParticipant(
          result
        );


      if (!data) {

        throw new Error(
          "Data peserta tidak ditemukan."
        );

      }


      setParticipant(
        data
      );


    } catch (err) {

      console.error(
        "ADMIN PARTICIPANT ERROR:",
        err
      );


      setError(
        err?.message ||
        "Gagal mengambil data peserta."
      );


    } finally {

      setLoading(false);
      setRefreshing(false);
      setChallengeLoading(false);

    }

  }


  /* ==========================================================
   * RESET PARTICIPANT
   * ==========================================================
   */

  async function handleResetParticipant() {

    if (
      !participant?.participant_id
    ) {
      return;
    }


    const participantIdValue =
      String(
        participant.participant_id
      ).trim();


    const confirmText =
      window.prompt(
        `Untuk konfirmasi reset, ketik:\n\nRESET:${participantIdValue}`
      );


    if (
      confirmText !==
      `RESET:${participantIdValue}`
    ) {

      setError(
        "Reset dibatalkan. Teks konfirmasi tidak sesuai."
      );

      return;

    }


    setResetting(true);
    setError("");


    try {

      const result =
        await apiPost({

          action:
            "admin_reset_participant",

          participant_id:
            participantIdValue,

          confirm_text:
            confirmText,

        });


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
      setChallengeItems([]);

      await loadParticipant(true);

      setActiveTab("overview");

    } catch (err) {

      console.error(
        "ADMIN PARTICIPANT RESET ERROR:",
        err
      );

      setError(
        err?.message ||
        "Gagal mereset assessment peserta."
      );

    } finally {

      setResetting(false);

    }
  }


  /* ==========================================================
   * DOWNLOAD REPORT
   * ==========================================================
   */

  function handleDownloadReport() {

    if (
      !participant
    ) {
      return;
    }


    const name =
      safeText(
        participant?.nama,
        "Nama Peserta"
      );

    const participantIdValue =
      safeText(
        participant?.participant_id,
        "-"
      );

    const kelas =
      safeText(
        participant?.kelas,
        "-"
      );

    const email =
      safeText(
        participant?.email,
        "-"
      );

    const statusText =
      getStatusLabel(
        status
      );


    const personalityScore =
      reportNumber(
        score.personality_score,
        0
      );

    const personalityMax =
      reportNumber(
        score.personality_max,
        200
      );

    const competencyScore =
      reportNumber(
        score.competency_score,
        0
      );

    const competencyMax =
      reportNumber(
        score.competency_max,
        200
      );

    const sjtScore =
      reportNumber(
        score.sjt_score,
        0
      );

    const sjtMax =
      reportNumber(
        score.sjt_max,
        75
      );

    const challengeScore =
      reportNumber(
        score.challenge_score,
        0
      );

    const challengeMax =
      reportNumber(
        score.challenge_max,
        25
      );

    const objectiveScore =
      reportNumber(
        score.objective_score,
        0
      );

    const objectiveMax =
      reportNumber(
        score.objective_max_score,
        500
      );

    const finalScoreText =
      finalScore !==
        undefined &&
      finalScore !== null &&
      String(
        finalScore
      ).trim() !== ""
        ? String(
            finalScore
          )
        : "Belum tersedia";


const personalityPercentage =
  reportPercentage(
    personalityScore,
    personalityMax
  );

const competencyPercentage =
  reportPercentage(
    competencyScore,
    competencyMax
  );

const sjtPercentage =
  reportPercentage(
    sjtScore,
    sjtMax
  );

const challengePercentage =
  reportPercentage(
    challengeScore,
    challengeMax
  );

const objectivePercentage =
  reportPercentage(
    objectiveScore,
    objectiveMax
  );

    const generatedAt =
      new Date().toLocaleString(
        "id-ID",
        {
          dateStyle:
            "long",
          timeStyle:
            "short",
        }
      );


    const popup =
      window.open(
        "",
        "_blank",
        "width=1000,height=900,scrollbars=yes,resizable=yes"
      );


    if (!popup) {

      setError(
        "Popup report diblokir browser. Izinkan popup untuk situs ini lalu coba lagi."
      );

      return;
    }


    popup.document.open();


    popup.document.write(
      `<!doctype html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />
          <title>
            Laporan Assessment - ${escapeHtml(name)}
          </title>

          <style>
            @page {
              size: A4;
              margin: 14mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              background: #f1f5f9;
              color: #0f172a;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .page {
              width: 100%;
              max-width: 794px;
              margin: 0 auto;
              background: #ffffff;
            }

            .header {
              background: #dc2626;
              color: #ffffff;
              padding: 28px 30px;
            }

            .header-brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-logo {
  width: 70px;
  height: 70px;
  object-fit: contain;
  background: #ffffff;
  border-radius: 12px;
  padding: 6px;
  flex-shrink: 0;
}

.header-text {
  flex: 1;
}

            .brand {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 3px;
              text-transform: uppercase;
              opacity: 0.9;
            }

            .title {
              margin: 8px 0 0;
              font-size: 26px;
              line-height: 1.15;
              font-weight: 800;
            }

            .subtitle {
              margin-top: 8px;
              font-size: 12px;
              line-height: 1.5;
              opacity: 0.92;
            }

            .content {
              padding: 24px 26px 30px;
            }

            .section {
              margin-bottom: 18px;
            }

            .section-title {
              margin: 0 0 9px;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 1.4px;
              text-transform: uppercase;
              color: #64748b;
            }

            .participant-grid {
              display: grid;
              grid-template-columns: 1.6fr 1fr;
              gap: 10px;
            }

            .info {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 12px;
              background: #ffffff;
            }

            .label {
              font-size: 9px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              font-weight: 700;
            }

            .value {
              margin-top: 5px;
              font-size: 12px;
              font-weight: 700;
              color: #0f172a;
              word-break: break-word;
            }

            .summary {
              border-radius: 16px;
              background: #0f172a;
              color: #ffffff;
              padding: 18px 20px;
            }

            .summary-title {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1.2px;
              font-weight: 700;
              color: #cbd5e1;
            }

            .final-score {
              margin-top: 4px;
              font-size: 40px;
              font-weight: 800;
              line-height: 1.05;
            }

            .final-score span {
              font-size: 14px;
              color: #94a3b8;
              font-weight: 600;
            }

            .status {
              display: inline-block;
              margin-top: 12px;
              border-radius: 999px;
              padding: 6px 10px;
              font-size: 10px;
              font-weight: 700;
              background: rgba(255,255,255,0.1);
            }

            .score-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }

            .score-card {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 13px;
            }

            .score-top {
              display: flex;
              justify-content: space-between;
              gap: 8px;
              align-items: baseline;
            }

            .score-name {
              font-size: 11px;
              font-weight: 700;
              color: #334155;
            }

            .score-value {
              margin-top: 6px;
              font-size: 20px;
              font-weight: 800;
            }

            .score-pct {
              color: #dc2626;
              font-size: 12px;
              font-weight: 800;
            }

            .bar {
              margin-top: 8px;
              height: 7px;
              border-radius: 999px;
              background: #fee2e2;
              overflow: hidden;
            }

            .bar > div {
              height: 100%;
              background: #dc2626;
              border-radius: inherit;
            }

            .objective {
              border: 1px solid #fecaca;
              background: #fef2f2;
              border-radius: 14px;
              padding: 15px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
            }

            .objective-value {
              margin-top: 3px;
              font-size: 20px;
              font-weight: 800;
            }

            .objective-pct {
              font-size: 22px;
              font-weight: 800;
              color: #dc2626;
            }

            .note {
              border-radius: 14px;
              background: #f8fafc;
              padding: 15px;
              border: 1px solid #e2e8f0;
            }

            .note p {
              margin: 4px 0 0;
              font-size: 11px;
              line-height: 1.65;
              color: #475569;
            }

            .footer {
              border-top: 1px solid #e2e8f0;
              margin-top: 22px;
              padding-top: 14px;
              text-align: center;
              color: #64748b;
            }

            .footer-main {
              font-size: 10px;
              font-weight: 700;
            }

            .footer-sub {
              margin-top: 4px;
              font-size: 9px;
            }

            .print-button {
              position: fixed;
              right: 18px;
              top: 18px;
              border: 0;
              border-radius: 10px;
              background: #dc2626;
              color: white;
              padding: 10px 14px;
              font-size: 12px;
              font-weight: 700;
              cursor: pointer;
              box-shadow: 0 6px 18px rgba(15,23,42,.15);
            }

            @media print {
              body {
                background: #ffffff;
              }

              .page {
                max-width: none;
              }

              .print-button {
                display: none;
              }
            }

            @media (max-width: 700px) {
              .participant-grid,
              .score-grid {
                grid-template-columns: 1fr;
              }

              .objective {
                align-items: flex-start;
                flex-direction: column;
              }
            }
          </style>
        </head>

        <body>
          <button
            class="print-button"
            onclick="window.print()"
          >
            Download / Cetak PDF
          </button>

          <div class="page">

            <header class="header">
  <div class="header-brand">
    <img
      src="/logo-pmr-smanel.jpg"
      alt="Logo PMR SMANEL"
      class="header-logo"
    />

    <div class="header-text">
      <div class="brand">
        PMR SMANEL
      </div>

      <div class="title">
        Leadership Assessment 2026
      </div>

      <div class="subtitle">
        Laporan hasil assessment kepemimpinan peserta.
      </div>
    </div>
  </div>
</header>

            <main class="content">

              <section class="section">
                <div class="section-title">
                  Data Peserta
                </div>

                <div class="participant-grid">

                  <div class="info">
                    <div class="label">
                      Nama Peserta
                    </div>
                    <div class="value">
                      ${escapeHtml(name)}
                    </div>
                  </div>

                  <div class="info">
                    <div class="label">
                      Participant ID
                    </div>
                    <div class="value">
                      ${escapeHtml(participantIdValue)}
                    </div>
                  </div>

                  <div class="info">
                    <div class="label">
                      Kelas
                    </div>
                    <div class="value">
                      ${escapeHtml(kelas)}
                    </div>
                  </div>

                  <div class="info">
                    <div class="label">
                      Email
                    </div>
                    <div class="value">
                      ${escapeHtml(email)}
                    </div>
                  </div>

                </div>
              </section>


              <section class="section">
                <div class="summary">

                  <div class="summary-title">
                    Final Score
                  </div>

                  <div class="final-score">
                    ${escapeHtml(
                      finalScoreText
                    )}
                    <span>
                      / 100
                    </span>
                  </div>

                  <div class="status">
                    ${escapeHtml(
                      statusText
                    )}
                  </div>

                </div>
              </section>


              <section class="section">
                <div class="section-title">
                  Ringkasan Nilai
                </div>

                <div class="score-grid">

                  <div class="score-card">
                    <div class="score-top">
                      <div class="score-name">
                        Personality
                      </div>
                      <div class="score-pct">
                        ${personalityPercentage}%
                      </div>
                    </div>

                    <div class="score-value">
                      ${personalityScore}
                      /
                      ${personalityMax}
                    </div>

                    <div class="bar">
                      <div
                        style="width:${personalityPercentage}%"
                      ></div>
                    </div>
                  </div>


                  <div class="score-card">
                    <div class="score-top">
                      <div class="score-name">
                        Competency
                      </div>
                      <div class="score-pct">
                        ${competencyPercentage}%
                      </div>
                    </div>

                    <div class="score-value">
                      ${competencyScore}
                      /
                      ${competencyMax}
                    </div>

                    <div class="bar">
                      <div
                        style="width:${competencyPercentage}%"
                      ></div>
                    </div>
                  </div>


                  <div class="score-card">
                    <div class="score-top">
                      <div class="score-name">
                        SJT
                      </div>
                      <div class="score-pct">
                        ${sjtPercentage}%
                      </div>
                    </div>

                    <div class="score-value">
                      ${sjtScore}
                      /
                      ${sjtMax}
                    </div>

                    <div class="bar">
                      <div
                        style="width:${sjtPercentage}%"
                      ></div>
                    </div>
                  </div>


                  <div class="score-card">
                    <div class="score-top">
                      <div class="score-name">
                        Challenge
                      </div>
                      <div class="score-pct">
                        ${challengePercentage}%
                      </div>
                    </div>

                    <div class="score-value">
                      ${challengeScore}
                      /
                      ${challengeMax}
                    </div>

                    <div class="bar">
                      <div
                        style="width:${challengePercentage}%"
                      ></div>
                    </div>
                  </div>

                </div>
              </section>


              <section class="section">

                <div class="objective">

                  <div>
                    <div class="label">
                      Objective Score
                    </div>

                    <div class="objective-value">
                      ${objectiveScore}
                      /
                      ${objectiveMax}
                    </div>
                  </div>

                  <div class="objective-pct">
                    ${objectivePercentage}%
                  </div>

                </div>

              </section>


              <section class="section">

                <div class="note">

                  <div class="section-title">
                    Catatan
                  </div>

                  <p>
                    Laporan ini dibuat berdasarkan data
                    assessment yang tersedia pada sistem
                    PMR SMANEL Leadership Assessment 2026.
                    Gunakan hasil ini sebagai bahan evaluasi
                    dan pengembangan potensi kepemimpinan
                    peserta.
                  </p>

                </div>

              </section>


              <footer class="footer">

                <div class="footer-main">
                  PMR SMANEL • Leadership Assessment 2026
                </div>

                <div class="footer-sub">
                  Muda Beraksi, Kemanusiaan Menginspirasi
                </div>

                <div class="footer-sub">
                  Dibuat:
                  ${escapeHtml(
                    generatedAt
                  )}
                  •
                  Copyright © PMR SMANEL 26
                </div>

              </footer>

            </main>

          </div>
        </body>
      </html>`
    );

    popup.document.close();

    popup.focus();

  }


  /* ==========================================================
   * INITIAL
   * ==========================================================
   */

  useEffect(() => {

    loadParticipant();

  }, [
    participantId,
  ]);


  /* ==========================================================
   * MEMO
   * ==========================================================
   */

  const progress =
    useMemo(
      () =>
        getProgress(
          participant
        ),
      [
        participant,
      ]
    );


  const score =
    participant?.score ||
    {};


  const status =
    String(
      participant?.status ||
      ""
    ).toUpperCase();


  const finalScore =
    score.final_score;


  const challengeSummary =
    useMemo(
      () =>
        getChallengeSummary(
          challengeItems
        ),
      [
        challengeItems,
      ]
    );


  /* ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {

    return (
      <div className="min-h-screen bg-slate-50 px-3 py-5 sm:px-5 sm:py-6">

        <div className="mx-auto flex min-h-[70vh] w-full max-w-[1200px] items-center justify-center">

          <div className="rounded-2xl bg-white px-8 py-10 text-center shadow-sm">

            <Loader2
              className="mx-auto h-9 w-9 animate-spin text-red-600"
            />

            <div className="mt-4 text-base font-semibold text-slate-800">
              Memuat detail peserta...
            </div>

            <div className="mt-1 text-xs text-slate-400">
              {safeText(
                participantId
              )}
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

        <div className="mx-auto w-full max-w-[1200px]">

          <button
            type="button"
            onClick={() =>
              navigate("/admin")
            }
            className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700"
          >

            <ArrowLeft className="h-4 w-4" />

            Kembali

          </button>


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
                loadParticipant()
              }
              className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white"
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

      <div className="mx-auto w-full max-w-[1200px]">

        {/* ====================================================
         * HEADER
         * ====================================================
         */}

        <header className="rounded-3xl bg-red-600 px-5 py-6 text-white shadow-sm sm:px-7 sm:py-7">

          <button
            type="button"
            onClick={() =>
              navigate("/admin")
            }
            className="mb-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold transition hover:bg-white/20"
          >

            <ArrowLeft className="h-4 w-4" />

            Data Peserta

          </button>


          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="min-w-0">

              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-100">
                PMR SMANEL
              </div>


              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {safeText(
                  participant?.nama,
                  "Nama Peserta"
                )}
              </h1>


              <div className="mt-1 text-xs font-medium text-red-100">
                {safeText(
                  participant?.participant_id
                )}
              </div>

            </div>


            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onClick={
                  handleDownloadReport
                }
                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
              >

                <Download className="h-4 w-4" />

                Download Report

              </button>


              <button
                type="button"
                onClick={() =>
                  setResetOpen(true)
                }
                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-white/30 bg-red-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-800"
              >

                <AlertCircle className="h-4 w-4" />

                Reset Assessment

              </button>

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
                  getStatusClass(
                    status
                  )
                }
              `}
            >
              {getStatusLabel(
                status
              )}
            </span>

          </div>

        </header>


        {/* ====================================================
         * TABS
         * ====================================================
         */}

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">

          <div className="grid grid-cols-3 gap-1">

            {[
              {
                id:
                  "overview",
                label:
                  "Overview",
              },
              {
                id:
                  "progress",
                label:
                  "Progress",
              },
              {
                id:
                  "score",
                label:
                  "Score",
              },
            ].map(
              tab => (

                <button
                  key={
                    tab.id
                  }
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.id
                    )
                  }
                  className={`
                    rounded-xl
                    px-3
                    py-2.5
                    text-xs
                    font-semibold
                    transition
                    ${
                      activeTab ===
                      tab.id
                        ? "bg-red-600 text-white"
                        : "text-slate-500 hover:bg-slate-50"
                    }
                  `}
                >
                  {tab.label}
                </button>

              )
            )}

          </div>

        </div>


        {/* ====================================================
         * OVERVIEW
         * ====================================================
         */}

        {activeTab ===
          "overview" && (

          <div className="space-y-4">

            {/* DATA PESERTA */}

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
                    Informasi dasar peserta assessment.
                  </p>

                </div>

              </div>


              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <InfoBox
                  label="Nama"
                  value={
                    safeText(
                      participant?.nama
                    )
                  }
                />

                <InfoBox
                  label="Participant ID"
                  value={
                    safeText(
                      participant?.participant_id
                    )
                  }
                />

                <InfoBox
                  label="Kelas"
                  value={
                    safeText(
                      participant?.kelas
                    )
                  }
                />

                <InfoBox
                  label="Email"
                  value={
                    safeText(
                      participant?.email
                    )
                  }
                />

              </div>

            </section>


            {/* RINGKASAN */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="text-xs font-medium text-slate-500">
                Ringkasan Assessment
              </div>


              <div className="mt-2 flex items-end justify-between gap-4">

                <div>

                  <div className="text-3xl font-semibold text-slate-900">
                    {progress.total}

                    <span className="ml-1 text-base font-medium text-slate-400">
                      / {progress.totalMax}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    Total progress
                  </div>

                </div>


                <div className="text-2xl font-semibold text-red-600">
                  {progress.percentage}%
                </div>

              </div>


              <div className="mt-4">

                <ProgressItem
                  label="Total Assessment"
                  value={
                    progress.total
                  }
                  max={
                    progress.totalMax
                  }
                />

              </div>

            </section>


            {/* STATUS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Status Assessment
                  </div>

                  <div className="mt-1 text-base font-semibold text-slate-800">
                    {getStatusLabel(
                      status
                    )}
                  </div>

                </div>


                {status ===
                "VERIFIED" ? (

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">

                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                  </div>

                ) : (

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">

                    <ShieldCheck className="h-5 w-5 text-slate-400" />

                  </div>

                )}

              </div>

            </section>

          </div>
        )}


        {/* ====================================================
         * PROGRESS
         * ====================================================
         */}

        {activeTab ===
          "progress" && (

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div>

              <div className="text-xs font-medium text-slate-500">
                Progress Assessment
              </div>


              <div className="mt-2 flex items-end justify-between gap-4">

                <div className="text-3xl font-semibold text-slate-900">

                  {progress.total}

                  <span className="ml-1 text-base font-medium text-slate-400">
                    / {progress.totalMax}
                  </span>

                </div>


                <div className="text-2xl font-semibold text-red-600">
                  {progress.percentage}%
                </div>

              </div>

            </div>


            <div className="mt-5 space-y-5">

              <ProgressItem
                label="Personality"
                value={
                  progress.personality
                }
                max={
                  progress.personalityMax
                }
              />

              <ProgressItem
                label="Competency"
                value={
                  progress.competency
                }
                max={
                  progress.competencyMax
                }
              />

              <ProgressItem
                label="SJT"
                value={
                  progress.sjt
                }
                max={
                  progress.sjtMax
                }
              />

              <ProgressItem
                label="Challenge"
                value={
                  progress.challenge
                }
                max={
                  progress.challengeMax
                }
              />

              <ProgressItem
                label="Total"
                value={
                  progress.total
                }
                max={
                  progress.totalMax
                }
              />

            </div>

          </section>
        )}


        {/* ====================================================
         * SCORE
         * ====================================================
         */}

        {activeTab ===
          "score" && (

          <div className="mt-4 space-y-4">

            <section className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm sm:p-6">

              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Final Score
              </div>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                <div>

                  <div className="text-4xl font-black tracking-tight">
                    {finalScore !== undefined &&
                    finalScore !== null &&
                    String(finalScore).trim() !== ""
                      ? Number(finalScore).toFixed(2)
                      : "Belum Final"}

                    {finalScore !== undefined &&
                    finalScore !== null &&
                    String(finalScore).trim() !== "" && (
                      <span className="ml-1 text-sm font-semibold text-slate-400">
                        / 100
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    {finalScore !== undefined &&
                    finalScore !== null &&
                    String(finalScore).trim() !== ""
                      ? "Nilai akhir resmi peserta."
                      : "Menunggu seluruh assessment dan Challenge memenuhi syarat final."}
                  </div>

                </div>


                <div className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold">
                  {finalScore !== undefined &&
                  finalScore !== null &&
                  String(finalScore).trim() !== ""
                    ? "FINAL"
                    : "BELUM FINAL"}
                </div>

              </div>

            </section>


            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">

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


              <div className="mt-5 grid gap-3 sm:grid-cols-2">

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
    reportPercentage(
      safeNumber(
        score.personality_score
      ),
      safeNumber(
        score.personality_max,
        200
      )
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
    reportPercentage(
      safeNumber(
        score.competency_score
      ),
      safeNumber(
        score.competency_max,
        200
      )
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
    reportPercentage(
      safeNumber(
        score.sjt_score
      ),
      safeNumber(
        score.sjt_max,
        75
      )
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
    reportPercentage(
      safeNumber(
        score.challenge_score
      ),
      safeNumber(
        score.challenge_max,
        25
      )
    )
  }
/>

              </div>

            </section>


            <section className="grid gap-3 sm:grid-cols-3">

             <InfoBox
  label="Objective Percentage"
  value={`${reportPercentage(
    score.objective_score,
    safeNumber(
      score.objective_max_score,
      500
    )
  )}%`}
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
                  finalScore !==
                    undefined &&
                  finalScore !==
                    null &&
                  String(
                    finalScore
                  ).trim() !== ""
                    ? String(
                        finalScore
                      )
                    : "Belum tersedia"
                }
              />

            </section>

          </div>
        )}


        {/* ====================================================
         * RESET CONFIRMATION
         * ====================================================
         */}

        {resetOpen && (

          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-3 sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Reset Assessment Peserta"
          >

            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                </div>


                <div className="min-w-0">

                  <h3 className="text-lg font-semibold text-slate-900">
                    Reset Jawaban Peserta?
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Seluruh jawaban assessment, score, dan evaluasi Challenge peserta akan dikembalikan ke kondisi awal.
                  </p>

                </div>

              </div>


              <div className="mt-5 rounded-xl bg-slate-50 p-4">

                <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Peserta
                </div>

                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {safeText(participant?.nama)}
                </div>

                <div className="mt-1 text-xs font-medium text-slate-500">
                  {safeText(participant?.participant_id)}
                </div>

              </div>


              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                <strong>Perhatian:</strong> Progress kembali 0/100, Final Score dikosongkan, dan evaluasi Challenge lama dihapus.
              </div>


              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setResetOpen(false)
                  }
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


        {/* ====================================================
         * REFRESH
         * ====================================================
         */}

        <div className="py-7 text-center">

          <button
            type="button"
            onClick={() =>
              loadParticipant(
                true
              )
            }
            disabled={
              refreshing
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
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

            Refresh Detail

          </button>

        </div>

      </div>

    </div>
  );

}