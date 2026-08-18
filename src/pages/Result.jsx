import { useEffect, useState } from "react";
import { apiGet } from "../api/api";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Download,
  Mail,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";


/* ============================================================
 * PARTICIPANT ID
 * ============================================================
 */

function getParticipantId(user) {

  if (
    typeof window === "undefined"
  ) {
    return "";
  }


  const sessionId =
    sessionStorage.getItem(
      "participant_id"
    ) || "";


  const localId =
    localStorage.getItem(
      "participant_id"
    ) || "";

  return (

    user?.participant_id ||

    user?.participantId ||

    user?.id ||

    user?.user?.participant_id ||

    user?.user?.participantId ||

    user?.data?.participant_id ||

    user?.data?.user?.participant_id ||

    sessionId ||

    localId ||

    ""

  );

}


/* ============================================================
 * EXTRACT PARTICIPANT
 * ============================================================
 */

function extractParticipant(result) {
  if (!result) {
    return null;
  }

  if (result.data?.participant) {
    return result.data.participant;
  }

  if (result.data?.data?.participant) {
    return result.data.data.participant;
  }

  if (result.participant) {
    return result.participant;
  }

  if (
    result.data &&
    !Array.isArray(result.data)
  ) {
    return result.data;
  }

  return null;
}


/* ============================================================
 * EXTRACT SCORE
 * ============================================================
 */

function extractScore(result) {
  if (!result) {
    return null;
  }

  if (
    result.data?.data &&
    typeof result.data.data === "object"
  ) {
    return result.data.data;
  }

  if (
    result.data &&
    typeof result.data === "object"
  ) {
    return result.data;
  }

  return null;
}


/* ============================================================
 * NUMBER
 * ============================================================
 */

function toNumber(
  value,
  fallback = 0
) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}


/* ============================================================
 * PERCENTAGE
 * ============================================================
 */

function getPercentage(
  score,
  max
) {
  const numericScore =
    toNumber(score);

  const numericMax =
    toNumber(max);

  if (numericMax <= 0) {
    return 0;
  }

  return Math.round(
    (numericScore / numericMax) * 100
  );
}


/* ============================================================
 * SCORE CARD
 * ============================================================
 */

function ScoreCard({
  title,
  description,
  score,
  max,
  percentage,
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg">

      <div className="flex items-start justify-between gap-4">

        <div>

          <h3 className="text-lg font-extrabold text-slate-950">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>

        </div>

        <div className="shrink-0 text-right">

          <div className="text-2xl font-black text-red-600">
            {percentage}%
          </div>

        </div>

      </div>


      <div className="mt-6 flex items-baseline gap-2">

        <span className="text-4xl font-black text-slate-950">
          {score}
        </span>

        <span className="text-base font-semibold text-slate-400">
          / {max}
        </span>

      </div>


      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-red-600 transition-all duration-700"
          style={{
            width: `${Math.min(
              Math.max(
                percentage,
                0
              ),
              100
            )}%`,
          }}
        />

      </div>

    </div>
  );
}


/* ============================================================
 * DEVELOPMENT CARD
 * ============================================================
 */

function DevelopmentCard({
  title,
  percentage,
  overview,
  recommendation,
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">

      <div className="flex items-start justify-between gap-4">

        <h3 className="text-lg font-extrabold text-slate-950">
          {title}
        </h3>

        <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-red-600 shadow-sm">
          {percentage}%
        </span>

      </div>


      <div className="mt-5">

        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Gambaran
        </div>

        <p className="mt-2 text-sm leading-7 text-slate-600">
          {overview}
        </p>

      </div>


      <div className="mt-5 rounded-2xl bg-white p-4">

        <div className="text-xs font-bold uppercase tracking-wider text-red-600">
          Saran
        </div>

        <p className="mt-2 text-sm leading-7 text-slate-700">
          {recommendation}
        </p>

      </div>

    </div>
  );
}


/* ============================================================
 * INSIGHT CARD
 * ============================================================
 */

function InsightCard({
  title,
  percentage,
  text,
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg">

      <div className="text-sm font-bold uppercase tracking-wider text-red-600">
        {title}
      </div>

      <div className="mt-3 text-4xl font-black text-slate-950">
        {percentage}%
      </div>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        {text}
      </p>

    </div>
  );
}


/* ============================================================
 * STRONGEST AREA
 * ============================================================
 */

function getStrongestArea({
  personality,
  competency,
  sjt,
}) {
  const areas = [
    {
      name: "Personality",
      value: personality,
    },
    {
      name: "Competency",
      value: competency,
    },
    {
      name: "Situational Judgment",
      value: sjt,
    },
  ];

  areas.sort(
    (a, b) =>
      b.value - a.value
  );

  const strongest =
    areas[0];

  return `Aspek yang saat ini paling menonjol adalah ${strongest.name} dengan capaian ${strongest.value}%. Jadikan aspek ini sebagai modal untuk memperkuat aspek kepemimpinan lainnya.`;
}


/* ============================================================
 * PRIORITY AREA
 * ============================================================
 */

function getPriorityArea({
  personality,
  competency,
  sjt,
}) {
  const areas = [
    {
      name: "Personality",
      value: personality,
    },
    {
      name: "Competency",
      value: competency,
    },
    {
      name: "Situational Judgment",
      value: sjt,
    },
  ];

  areas.sort(
    (a, b) =>
      a.value - b.value
  );

  const priority =
    areas[0];

  return `Aspek yang paling perlu mendapatkan perhatian adalah ${priority.name} dengan capaian ${priority.value}%. Fokuskan latihan dan pengalaman organisasi pada aspek ini.`;
}


/* ============================================================
 * RESULT COMPONENT
 * ============================================================
 */

export default function Result() {

  const navigate =
    useNavigate();

  const participantId =
    getParticipantId(null);


  /* ==========================================================
   * STATE
   * ==========================================================
   */

  const [
    participant,
    setParticipant
  ] = useState(null);

  const [
    score,
    setScore
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const [
    retrying,
    setRetrying
  ] = useState(false);

  const [
    downloading,
    setDownloading
  ] = useState(false);

  /* ==========================================================
   * LOAD RESULT
   * ==========================================================
   */

  useEffect(() => {

    if (!participantId) {

      setLoading(false);

      setError(
        "Participant ID tidak ditemukan."
      );

      return;

    }



    loadResult();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantId]);

  async function getCompletionStatus(
  id
) {

  const result =
    await apiGet({

      action:
        "validate_completion",

      participant_id:
        id,

    });


  console.log(
    "RESULT COMPLETION:",
    result
  );


  if (
    !result ||
    result.success !== true
  ) {

    throw new Error(
      result?.error?.message ||
      "Status assessment tidak dapat diperiksa."
    );

  }


  return (
    result.data ||
    {}
  );

}

async function loadResult() {

  setLoading(true);
  setError("");

  try {

    /* ======================================================
     * GUARD COMPLETION
     * ======================================================
     */

    const completion =
      await getCompletionStatus(
        participantId
      );


    console.log(
      "COMPLETION DATA:",
      completion
    );


    /*
     * Belum selesai
     */

    if (
      !completion?.complete
    ) {

      const incomplete =
        Array.isArray(
          completion?.incomplete
        )
          ? completion.incomplete
          : [];


      const firstIncomplete =
        incomplete.find(
          (item) =>
            Number(
              item?.answered ||
              0
            ) <
            Number(
              item?.required ||
              0
            )
        );


      if (
        firstIncomplete
      ) {

        const type =
          String(
            firstIncomplete?.assessment_type ||
            ""
          )
            .trim()
            .toUpperCase();


        const routeMap = {

          PERSONALITY:
            "/assessment/personality",

          COMPETENCY:
            "/assessment/competency",

          SJT:
            "/assessment/sjt",

          CHALLENGE:
            "/assessment/challenge",

        };


        const nextRoute =
          routeMap[type];


        if (
          nextRoute
        ) {

          navigate(
            nextRoute,
            {
              replace:
                true,
            }
          );


          return;

        }

      }


      throw new Error(
        "Assessment belum selesai."
      );

    }


    /* ======================================================
     * BARU AMBIL HASIL
     * ======================================================
     */

    /* GET PARTICIPANT */

      /* ======================================================
       * GET PARTICIPANT
       * ======================================================
       */

      const participantResult =
        await apiGet({

          action:
            "get_participant",

          participant_id:
            participantId,

        });


      console.log(
        "GET PARTICIPANT:",
        participantResult
      );


      if (
        participantResult &&
        participantResult.success === false
      ) {

        throw new Error(
          participantResult?.error?.message ||
          "Data peserta tidak ditemukan."
        );

      }


      const participantData =
        extractParticipant(
          participantResult
        );


      setParticipant(
        participantData
      );


      /* ======================================================
       * GET SCORE
       * ======================================================
       */

const scoreResult =
  await apiGet({

    action:
      "get_result_score",

    participant_id:
      participantId,

  });


      console.log(
        "GET SCORE:",
        scoreResult
      );


      if (
        !scoreResult ||
        scoreResult.success !== true
      ) {

        throw new Error(
          scoreResult?.error?.message ||
          "Gagal mengambil hasil assessment."
        );

      }


      const scoreData =
        extractScore(
          scoreResult
        );


      if (!scoreData) {

        throw new Error(
          "Data hasil assessment belum tersedia."
        );

      }


      setScore(
        scoreData
      );


    } catch (err) {

      console.error(
        "RESULT ERROR:",
        err
      );

      setError(
        err?.message ||
        "Gagal memuat hasil assessment."
      );

    } finally {

      setLoading(false);
      setRetrying(false);

    }

  }


  /* ==========================================================
   * RETRY
   * ==========================================================
   */

  async function handleRetry() {

    setRetrying(true);

    await loadResult();

  }




  /* ==========================================================
   * DOWNLOAD RESULT
   * ==========================================================
   */

  async function handleDownloadJPEG() {

    if (
      downloading ||
      finalScore === null
    ) {
      return;
    }

    try {

      setDownloading(true);

      const canvas =
        document.createElement("canvas");

      const width = 1200;
      const height = 1780;

      canvas.width = width;
      canvas.height = height;

      const ctx =
        canvas.getContext("2d");

      if (!ctx) {
        throw new Error(
          "Canvas browser tidak tersedia."
        );
      }


      /* ======================================================
       * DRAW HELPERS
       * ======================================================
       */

      function roundRect(
        x,
        y,
        w,
        h,
        r,
        fill,
        stroke
      ) {

        const radius =
          Math.min(
            r,
            w / 2,
            h / 2
          );

        ctx.beginPath();

        ctx.moveTo(
          x + radius,
          y
        );

        ctx.arcTo(
          x + w,
          y,
          x + w,
          y + h,
          radius
        );

        ctx.arcTo(
          x + w,
          y + h,
          x,
          y + h,
          radius
        );

        ctx.arcTo(
          x,
          y + h,
          x,
          y,
          radius
        );

        ctx.arcTo(
          x,
          y,
          x + w,
          y,
          radius
        );

        ctx.closePath();

        if (fill) {

          ctx.fillStyle =
            fill;

          ctx.fill();

        }

        if (stroke) {

          ctx.strokeStyle =
            stroke;

          ctx.lineWidth =
            2;

          ctx.stroke();

        }

      }


      function drawText(
        value,
        x,
        y,
        size,
        weight = "400",
        color = "#0f172a",
        align = "left"
      ) {

        ctx.font =
          `${weight} ${size}px Arial, sans-serif`;

        ctx.fillStyle =
          color;

        ctx.textAlign =
          align;

        ctx.textBaseline =
          "alphabetic";

        ctx.fillText(
          String(
            value ?? ""
          ),
          x,
          y
        );

      }


      function wrapText(
        value,
        maxWidth,
        size,
        weight = "400"
      ) {

        ctx.font =
          `${weight} ${size}px Arial, sans-serif`;

        const words =
          String(
            value ?? ""
          )
            .split(/\s+/)
            .filter(Boolean);

        const lines = [];

        let current =
          "";

        words.forEach(
          (word) => {

            const test =
              current
                ? `${current} ${word}`
                : word;

            if (
              ctx.measureText(
                test
              ).width <=
              maxWidth
            ) {

              current =
                test;

            } else {

              if (current) {
                lines.push(
                  current
                );
              }

              current =
                word;

            }

          }
        );

        if (current) {
          lines.push(
            current
          );
        }

        return lines;

      }


      function drawProgress(
        x,
        y,
        widthValue,
        percentage
      ) {

        roundRect(
          x,
          y,
          widthValue,
          12,
          6,
          "#fee2e2"
        );

        const safePercentage =
          Math.min(
            Math.max(
              Number(
                percentage
              ) || 0,
              0
            ),
            100
          );

        roundRect(
          x,
          y,
          widthValue *
            safePercentage /
            100,
          12,
          6,
          "#dc2626"
        );

      }


      /* ======================================================
       * BACKGROUND
       * ======================================================
       */

      ctx.fillStyle =
        "#f1f5f9";

      ctx.fillRect(
        0,
        0,
        width,
        height
      );


      /* ======================================================
       * HEADER
       * ======================================================
       */

      ctx.fillStyle =
        "#ef1117";

      ctx.fillRect(
        0,
        0,
        width,
        245
      );


      /*
       * Logo dari public/logo-pmr-smanel.jpg.
       * Download tetap berjalan meskipun logo gagal dimuat.
       */

      const logo =
        new Image();

      logo.crossOrigin =
        "anonymous";

      const logoLoaded =
        await new Promise(
          (resolve) => {

            logo.onload =
              () => resolve(
                true
              );

            logo.onerror =
              () => resolve(
                false
              );

            logo.src =
              "/logo-pmr-smanel.jpg";

          }
        );


      roundRect(
        46,
        34,
        128,
        128,
        20,
        "#ffffff"
      );


      if (logoLoaded) {

        ctx.drawImage(
          logo,
          60,
          48,
          100,
          100
        );

      } else {

        drawText(
          "PMR",
          110,
          107,
          30,
          "800",
          "#ef1117",
          "center"
        );

        drawText(
          "SMANEL",
          110,
          138,
          16,
          "700",
          "#0f172a",
          "center"
        );

      }


      drawText(
        "PMR SMANEL",
        205,
        72,
        22,
        "700",
        "#ffffff"
      );

      drawText(
        "Leadership Assessment 2026",
        205,
        118,
        36,
        "800",
        "#ffffff"
      );

      drawText(
        "Hasil penilaian potensi dan kepemimpinan peserta.",
        205,
        160,
        18,
        "400",
        "#fee2e2"
      );


      /* ======================================================
       * DATA PESERTA
       * ======================================================
       */

      roundRect(
        48,
        275,
        1104,
        205,
        22,
        "#ffffff",
        "#e2e8f0"
      );

      drawText(
        "DATA PESERTA",
        78,
        315,
        14,
        "800",
        "#dc2626"
      );


      const nameLines =
        wrapText(
          participantName,
          590,
          28,
          "700"
        ).slice(
          0,
          2
        );


      nameLines.forEach(
        (
          line,
          index
        ) => {

          drawText(
            line,
            78,
            357 +
              index * 34,
            28,
            "700",
            "#0f172a"
          );

        }
      );


      drawText(
        displayParticipantId,
        78,
        425,
        17,
        "400",
        "#64748b"
      );


      const infoX =
        770;


      drawText(
        "KELAS",
        infoX,
        335,
        13,
        "700",
        "#64748b"
      );

      drawText(
        participantClass,
        infoX,
        372,
        24,
        "800",
        "#0f172a"
      );


      drawText(
        "STATUS",
        infoX + 180,
        335,
        13,
        "700",
        "#64748b"
      );

      drawText(
        status,
        infoX + 180,
        372,
        18,
        "700",
        "#047857"
      );


      /* ======================================================
       * FINAL SCORE
       * ======================================================
       */

      roundRect(
        48,
        510,
        1104,
        220,
        24,
        "#0f172a"
      );


      drawText(
        "FINAL SCORE",
        78,
        550,
        15,
        "700",
        "#cbd5e1"
      );


      drawText(
        Number(
          finalScore
        ).toFixed(2),
        78,
        635,
        72,
        "800",
        "#ffffff"
      );


      drawText(
        "/ 100",
        315,
        635,
        24,
        "700",
        "#94a3b8"
      );


      drawText(
        "Nilai akhir berdasarkan 4 komponen assessment.",
        78,
        682,
        16,
        "400",
        "#cbd5e1"
      );


      drawText(
        "Bobot masing-masing komponen: 25%.",
        78,
        708,
        16,
        "400",
        "#94a3b8"
      );


      /* ======================================================
       * SCORE CARDS
       * ======================================================
       */

      const cardY1 =
        760;

      const cardY2 =
        925;

      const cardW =
        530;

      const gap =
        44;

      const leftX =
        48;

      const rightX =
        leftX +
        cardW +
        gap;


      function drawScoreCard(
        x,
        y,
        title,
        scoreValue,
        maxValue,
        percentage
      ) {

        roundRect(
          x,
          y,
          cardW,
          140,
          20,
          "#ffffff",
          "#e2e8f0"
        );


        drawText(
          title,
          x + 26,
          y + 32,
          17,
          "700",
          "#475569"
        );


        drawText(
          `${scoreValue} / ${maxValue}`,
          x + 26,
          y + 75,
          25,
          "800",
          "#0f172a"
        );


        drawText(
          `${percentage}%`,
          x + cardW - 26,
          y + 75,
          25,
          "800",
          "#dc2626",
          "right"
        );


        drawProgress(
          x + 26,
          y + 103,
          cardW - 52,
          percentage
        );

      }


      drawScoreCard(
        leftX,
        cardY1,
        "Personality",
        personalityScore,
        personalityMax,
        personalityPercentage
      );


      drawScoreCard(
        rightX,
        cardY1,
        "Competency",
        competencyScore,
        competencyMax,
        competencyPercentage
      );


      drawScoreCard(
        leftX,
        cardY2,
        "SJT",
        sjtScore,
        sjtMax,
        sjtPercentage
      );


      drawScoreCard(
        rightX,
        cardY2,
        "Challenge",
        challengeScore,
        challengeMax,
        challengePercentage
      );


      /* ======================================================
       * OBJECTIVE SCORE
       * ======================================================
       */

      roundRect(
        48,
        1095,
        1104,
        145,
        20,
        "#fff1f2",
        "#fecaca"
      );


      drawText(
        "OBJECTIVE SCORE",
        78,
        1135,
        14,
        "800",
        "#dc2626"
      );


      drawText(
        `${objectiveScore} / ${objectiveMax}`,
        78,
        1185,
        29,
        "800",
        "#0f172a"
      );


      drawText(
        `${objectivePercentage}%`,
        1095,
        1185,
        28,
        "800",
        "#dc2626",
        "right"
      );


      /* ======================================================
       * MOTIVATIONAL MESSAGE
       * ======================================================
       */

      roundRect(
        48,
        1270,
        1104,
        190,
        20,
        "#ffffff",
        "#e2e8f0"
      );


      drawText(
        "PESAN UNTUK ANDA",
        78,
        1310,
        15,
        "800",
        "#dc2626"
      );


      const motivation =
        "Teruslah belajar, berani mengambil tanggung jawab, dan jadikan setiap pengalaman sebagai kesempatan untuk bertumbuh. Pemimpin yang baik bukan hanya mampu memimpin orang lain, tetapi juga mampu memimpin dirinya sendiri.";


      const motivationLines =
        wrapText(
          motivation,
          1040,
          18,
          "400"
        );


      motivationLines
        .slice(
          0,
          5
        )
        .forEach(
          (
            line,
            index
          ) => {

            drawText(
              line,
              78,
              1350 +
                index * 28,
              18,
              "400",
              "#475569"
            );

          }
        );


      /* ======================================================
       * FOOTER
       * ======================================================
       */

      // Garis pemisah footer
      ctx.beginPath();
      ctx.moveTo(80, 1510);
      ctx.lineTo(1120, 1510);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Footer dibuat rata tengah agar lebih profesional
      drawText(
        "PMR SMANEL • Leadership Assessment 2026",
        600,
        1545,
        17,
        "700",
        "#334155",
        "center"
      );

      drawText(
        "Muda Beraksi, Kemanusiaan Menginspirasi",
        600,
        1577,
        14,
        "400",
        "#64748b",
        "center"
      );

      drawText(
        `Dibuat untuk ${participantName} • ${displayParticipantId}`,
        600,
        1607,
        12,
        "400",
        "#94a3b8",
        "center"
      );

      drawText(
        "Copyright © PMR SMANEL 26",
        600,
        1642,
        12,
        "700",
        "#64748b",
        "center"
      );


      /* ======================================================
       * DOWNLOAD JPEG
       * ======================================================
       */

      const safeName =
        String(
          participantName ||
          participantId ||
          "peserta"
        )
          .trim()
          .replace(
            /[^a-zA-Z0-9_-]+/g,
            "_"
          );


      const link =
        document.createElement(
          "a"
        );


      link.download =
        `Hasil_Assessment_PMR_SMANEL_${safeName}.jpg`;


      link.href =
        canvas.toDataURL(
          "image/jpeg",
          0.95
        );


      document.body.appendChild(
        link
      );

      link.click();

      link.remove();


    } catch (
      error
    ) {

      console.error(
        "DOWNLOAD RESULT ERROR:",
        error
      );


      window.alert(
        "Gagal membuat file hasil assessment. Silakan coba lagi."
      );

    } finally {

      setDownloading(
        false
      );

    }

  }

  /* ==========================================================
   * SCORE VALUES
   * ==========================================================
   */

  const personalityScore =
    toNumber(
      score?.personality_score
    );

  const personalityMax =
    toNumber(
      score?.personality_max,
      200
    );

  const personalityPercentage =
    getPercentage(
      personalityScore,
      personalityMax
    );


  const competencyScore =
    toNumber(
      score?.competency_score
    );

  const competencyMax =
    toNumber(
      score?.competency_max,
      200
    );

  const competencyPercentage =
    getPercentage(
      competencyScore,
      competencyMax
    );


  const sjtScore =
    toNumber(
      score?.sjt_score
    );

  const sjtMax =
    toNumber(
      score?.sjt_max,
      75
    );

  const sjtPercentage =
    getPercentage(
      sjtScore,
      sjtMax
    );


  const challengeScore =
    toNumber(
      score?.challenge_score
    );

  const challengeMax =
    toNumber(
      score?.challenge_max,
      25
    );

  const challengePercentage =
    getPercentage(
      challengeScore,
      challengeMax
    );


  const objectiveScore =
    toNumber(
      score?.objective_score
    );

  const objectiveMax =
    toNumber(
      score?.objective_max_score,
      500
    );

  const objectivePercentage =
    getPercentage(
      objectiveScore,
      objectiveMax
    );


  /* ==========================================================
   * PARTICIPANT
   * ==========================================================
   */

  const participantName =
    participant?.nama ||
    participant?.name ||
    participant?.nama_peserta ||
    participant?.nama_lengkap ||
    participant?.full_name ||
    "-";


  const participantClass =
    participant?.kelas ||
    participant?.class ||
    participant?.kelas_peserta ||
    "-";


  const participantEmail =
    participant?.email ||
    participant?.email_address ||
    "-";


  const displayParticipantId =
    participant?.participant_id ||
    participantId;


  /* ==========================================================
   * STATUS
   * ==========================================================
   */

  const status =
    score?.score_status ||
    score?.status ||
    "COMPLETED";


  /* ==========================================================
   * FINAL SCORE
   * ==========================================================
   */

  const finalScore =
    score?.final_score !== undefined &&
    score?.final_score !== null &&
    String(
      score.final_score
    ).trim() !== ""
      ? score.final_score
      : null;


  /* ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {

    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10">

        <div className="mx-auto flex min-h-[65vh] max-w-5xl items-center justify-center">

          <div className="rounded-3xl bg-white px-10 py-12 text-center shadow-xl">

            <Loader2
              className="mx-auto mb-5 h-10 w-10 animate-spin text-red-600"
            />

            <h2 className="text-xl font-extrabold text-slate-950">
              Memuat Hasil Assessment
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Mengambil data peserta dan hasil penilaian.
            </p>

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
      <div className="min-h-screen bg-slate-100 px-4 py-10">

        <div className="mx-auto flex min-h-[65vh] max-w-5xl items-center justify-center">

          <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-50">

                <AlertCircle className="h-7 w-7 text-red-600" />

              </div>


              <div>

                <h2 className="text-2xl font-black text-slate-950">
                  Hasil Belum Tersedia
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Terjadi kendala saat mengambil hasil assessment.
                </p>

              </div>

            </div>


            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
              {error}
            </div>


            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {retrying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memuat Ulang...
                </>
              ) : (
                "Coba Lagi"
              )}

            </button>

          </div>

        </div>

      </div>
    );

  }


  /* ==========================================================
   * RESULT PAGE
   * ==========================================================
   */

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* ====================================================
         * HEADER
         * ====================================================
         */}

        <section className="overflow-hidden rounded-[28px] bg-red-600 shadow-2xl">

          <div className="px-6 py-8 sm:px-10 sm:py-10">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-5">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">

                  <img
                    src="/logo-pmr-smanel.jpg"
                    alt="Logo PMR SMANEL"
                    className="h-full w-full object-contain"
                  />

                </div>


                <div className="text-white">

                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-red-100">
                    PMR SMANEL
                  </div>

                  <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                    Leadership Assessment 2026
                  </h1>

                  <p className="mt-2 text-sm text-red-100 sm:text-base">
                    Hasil penilaian potensi dan kepemimpinan peserta.
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">

                <CheckCircle2 className="h-7 w-7 text-white" />

                <div>

                  <div className="text-xs font-semibold uppercase tracking-wider text-red-100">
                    Status Assessment
                  </div>

                  <div className="mt-1 text-lg font-extrabold text-white">
                    {status}
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
         * DATA PESERTA
         * ====================================================
         */}

        <section className="mt-6 rounded-[28px] bg-white p-6 shadow-xl sm:p-8">

          <div className="mb-6 flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">

              <UserRound className="h-6 w-6 text-red-600" />

            </div>

            <div>

              <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl">
                Data Peserta
              </h2>

              <p className="text-sm text-slate-500">
                Informasi peserta yang mengikuti assessment.
              </p>

            </div>

          </div>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl bg-slate-50 p-5">

              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
                <UserRound className="h-4 w-4" />
                Nama
              </div>

              <div className="text-lg font-extrabold text-slate-950">
                {participantName}
              </div>

            </div>


            <div className="rounded-2xl bg-slate-50 p-5">

              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
                <Award className="h-4 w-4" />
                Participant ID
              </div>

              <div className="text-lg font-extrabold text-slate-950">
                {displayParticipantId}
              </div>

            </div>


            <div className="rounded-2xl bg-slate-50 p-5">

              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
                <GraduationCap className="h-4 w-4" />
                Kelas
              </div>

              <div className="text-lg font-extrabold text-slate-950">
                {participantClass}
              </div>

            </div>


            <div className="rounded-2xl bg-slate-50 p-5">

              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
                <Mail className="h-4 w-4" />
                Email
              </div>

              <div className="break-all text-base font-extrabold text-slate-950">
                {participantEmail}
              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
         * SCORE
         * ====================================================
         */}

        <section className="mt-6">

          <div className="mb-5">

            <h2 className="text-2xl font-black text-slate-950">
              Hasil Assessment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ringkasan hasil penilaian objektif kepemimpinan Anda.
            </p>

          </div>


          <div className="grid gap-5 md:grid-cols-2">

            <ScoreCard
              title="Personality"
              description="Karakter, integritas, sikap, dan kecenderungan perilaku."
              score={personalityScore}
              max={personalityMax}
              percentage={personalityPercentage}
            />


            <ScoreCard
              title="Competency"
              description="Kompetensi dan kemampuan bekerja bersama tim."
              score={competencyScore}
              max={competencyMax}
              percentage={competencyPercentage}
            />


            <ScoreCard
              title="Situational Judgment"
              description="Kemampuan mengambil keputusan dalam berbagai situasi."
              score={sjtScore}
              max={sjtMax}
              percentage={sjtPercentage}
            />


            <ScoreCard
              title="Leadership Challenge"
              description="Kemampuan menghadapi tantangan kepemimpinan."
              score={challengeScore}
              max={challengeMax}
              percentage={challengePercentage}
            />

          </div>


          {/* ==================================================
           * OBJECTIVE
           * ==================================================
           */}

          <div className="mt-6 overflow-hidden rounded-[28px] bg-red-50 shadow-sm">

            <div className="p-7 sm:p-9">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

                <div>

                  <div className="text-sm font-bold uppercase tracking-[0.18em] text-red-600">
                    Objective Score
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">

                    <span className="text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
                      {objectiveScore}
                    </span>

                    <span className="text-lg font-semibold text-slate-400">
                      / {objectiveMax}
                    </span>

                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {objectivePercentage}% dari nilai maksimal objektif.
                  </p>

                </div>


                <div className="text-right">

                  <div className="text-4xl font-black text-red-600">
                    {objectivePercentage}%
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    Capaian objektif
                  </div>

                </div>

              </div>


              <div className="mt-7 h-4 overflow-hidden rounded-full bg-red-100">

                <div
                  className="h-full rounded-full bg-red-600 transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        objectivePercentage,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

          </div>


          {/* ==================================================
           * ANSWER STATUS
           * ==================================================
           */}

          <div className="mt-5 rounded-[24px] bg-white p-6 shadow-lg">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="text-sm font-semibold text-slate-500">
                  Jawaban
                </div>

                <div className="mt-1 text-lg font-extrabold text-slate-950">
                  {toNumber(
                    score?.total_answered
                  )}{" "}
                  /{" "}
                  {toNumber(
                    score?.total_questions,
                    100
                  )}
                </div>

              </div>


              <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                {status}
              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
         * DEVELOPMENT
         * ====================================================
         */}

        <section className="mt-6 rounded-[28px] bg-white p-6 shadow-xl sm:p-8">

          <div className="mb-7">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">

                <Award className="h-6 w-6 text-red-600" />

              </div>


              <div>

                <h2 className="text-2xl font-black text-slate-950">
                  Saran Pengembangan
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Rekomendasi berdasarkan hasil assessment objektif.
                </p>

              </div>

            </div>

          </div>


          <div className="grid gap-5 lg:grid-cols-2">

            <DevelopmentCard
              title="Personality"
              percentage={personalityPercentage}
              overview={
                personalityPercentage >= 75
                  ? "Potensi karakter dan kecenderungan perilaku sudah terlihat kuat."
                  : personalityPercentage >= 60
                    ? "Dasar karakter dan sikap sudah cukup baik untuk dikembangkan."
                    : "Karakter, integritas, dan konsistensi sikap masih perlu diperkuat."
              }
              recommendation={
                personalityPercentage >= 75
                  ? "Pertahankan konsistensi sikap dan jadikan nilai tersebut sebagai teladan."
                  : personalityPercentage >= 60
                    ? "Perbanyak refleksi diri, evaluasi sikap, dan latihan mengambil keputusan yang konsisten."
                    : "Fokus pada kedisiplinan, integritas, tanggung jawab, dan evaluasi diri."
              }
            />


            <DevelopmentCard
              title="Competency"
              percentage={competencyPercentage}
              overview={
                competencyPercentage >= 75
                  ? "Kemampuan kerja sama dan pelaksanaan tugas tergolong kuat."
                  : competencyPercentage >= 60
                    ? "Kompetensi dasar sudah berkembang dan masih memiliki ruang penguatan."
                    : "Kemampuan kerja tim dan pelaksanaan tugas perlu mendapat perhatian lebih."
              }
              recommendation={
                competencyPercentage >= 75
                  ? "Pertahankan kemampuan bekerja dalam tim dan mulai berlatih mengambil peran koordinatif."
                  : competencyPercentage >= 60
                    ? "Perkuat komunikasi, pembagian tugas, koordinasi, dan penyelesaian masalah bersama."
                    : "Mulai dari komunikasi, kerja sama, manajemen tugas, dan penyelesaian masalah."
              }
            />


            <DevelopmentCard
              title="Situational Judgment"
              percentage={sjtPercentage}
              overview={
                sjtPercentage >= 75
                  ? "Kemampuan mempertimbangkan situasi dan menentukan tindakan sudah baik."
                  : sjtPercentage >= 60
                    ? "Kemampuan menghadapi situasi mulai terbentuk, tetapi masih perlu konsistensi."
                    : "Kemampuan mempertimbangkan konsekuensi dan memilih tindakan masih perlu dilatih."
              }
              recommendation={
                sjtPercentage >= 75
                  ? "Biasakan mengevaluasi beberapa alternatif sebelum mengambil keputusan penting."
                  : sjtPercentage >= 60
                    ? "Latih analisis situasi, pertimbangan dampak, dan komunikasi keputusan."
                    : "Perbanyak latihan studi kasus dan diskusi situasional sebelum mengambil keputusan."
              }
            />


            <DevelopmentCard
              title="Leadership Challenge"
              percentage={challengePercentage}
              overview={
                challengePercentage > 0
                  ? "Komponen tantangan kepemimpinan sudah memiliki hasil evaluasi."
                  : "Komponen Challenge belum memiliki nilai objektif."
              }
              recommendation={
                challengePercentage > 0
                  ? "Gunakan umpan balik evaluator untuk memperbaiki kualitas argumentasi dan solusi kepemimpinan."
                  : "Jawaban Challenge akan melalui evaluasi sebelum nilai final ditetapkan."
              }
            />

          </div>

        </section>


        {/* ====================================================
         * INSIGHT
         * ====================================================
         */}

        <section className="mt-6 grid gap-5 md:grid-cols-2">

          <InsightCard
            title="Kekuatan Utama"
            percentage={
              Math.max(
                personalityPercentage,
                competencyPercentage,
                sjtPercentage
              )
            }
            text={getStrongestArea({
              personality:
                personalityPercentage,

              competency:
                competencyPercentage,

              sjt:
                sjtPercentage,
            })}
          />


          <InsightCard
            title="Prioritas Pengembangan"
            percentage={
              Math.min(
                personalityPercentage,
                competencyPercentage,
                sjtPercentage
              )
            }
            text={getPriorityArea({
              personality:
                personalityPercentage,

              competency:
                competencyPercentage,

              sjt:
                sjtPercentage,
            })}
          />

        </section>


        {/* ====================================================
         * FINAL SCORE
         * ====================================================
         */}

        <section className="mt-6 overflow-hidden rounded-[28px] bg-white shadow-xl">

          <div className="p-6 sm:p-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="text-sm font-bold uppercase tracking-[0.18em] text-red-600">
                  Final Score
                </div>


                {finalScore !== null ? (

                  <>

                    <div className="mt-3 flex items-baseline gap-2">
                      <div className="text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
                        {Number(finalScore).toFixed(2)}
                      </div>

                      <div className="text-lg font-semibold text-slate-400">
                        / 100
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-green-600">
                      Nilai final telah tersedia setelah proses verifikasi.
                    </p>

                  </>

                ) : (

                  <>

                    <div className="mt-3 text-3xl font-black text-slate-950">
                      Menunggu Verifikasi
                    </div>

                    <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">
                      Nilai Leadership Challenge belum masuk ke Final Score.
                      Jawaban Challenge akan melalui evaluasi dan verifikasi
                      sebelum nilai akhir ditetapkan.
                    </p>

                  </>

                )}

              </div>


              <div
                className={`rounded-2xl px-5 py-4 ${
                  finalScore !== null
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >

                <div className="text-xs font-bold uppercase tracking-wider">
                  Status Nilai
                </div>

                <div className="mt-1 font-extrabold">
                  {finalScore !== null
                    ? "TERVERIFIKASI"
                    : "MENUNGGU VERIFIKASI"}
                </div>

              </div>

            </div>

            {/* ==================================================
             * FINAL SCORE BREAKDOWN
             * Bobot sama rata: 25% per komponen
             * ==================================================
             */}

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Personality
                </div>
                <div className="mt-1 text-xl font-black text-slate-900">
                  {personalityPercentage}%
                </div>
                <div className="mt-1 text-[11px] font-medium text-slate-400">
                  Bobot 25%
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Competency
                </div>
                <div className="mt-1 text-xl font-black text-slate-900">
                  {competencyPercentage}%
                </div>
                <div className="mt-1 text-[11px] font-medium text-slate-400">
                  Bobot 25%
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  SJT
                </div>
                <div className="mt-1 text-xl font-black text-slate-900">
                  {sjtPercentage}%
                </div>
                <div className="mt-1 text-[11px] font-medium text-slate-400">
                  Bobot 25%
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Challenge
                </div>
                <div className="mt-1 text-xl font-black text-slate-900">
                  {challengePercentage}%
                </div>
                <div className="mt-1 text-[11px] font-medium text-slate-400">
                  Bobot 25%
                </div>
              </div>

            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
              Final Score dihitung dari rata-rata persentase Personality, Competency, SJT, dan Challenge dengan bobot masing-masing 25%.
            </div>

          </div>

        </section>


        {/* ====================================================
         * DOWNLOAD RESULT
         * ====================================================
         */}

        <section className="mt-5 rounded-[24px] bg-white p-5 shadow-lg sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="text-sm font-bold text-slate-900">
                Simpan Hasil Assessment
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Download hasil assessment sebagai gambar setelah Final Score tersedia.
              </p>

            </div>

            <button
              type="button"
              onClick={
                handleDownloadJPEG
              }
              disabled={
                downloading ||
                finalScore === null
              }
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition ${
                finalScore !== null
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "cursor-not-allowed bg-slate-100 text-slate-400"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >

              {downloading ? (

                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                  Membuat File...
                </>

              ) : finalScore === null ? (

                <>
                  <Download className="h-4 w-4" />
                  Menunggu Nilai Final
                </>

              ) : (

                <>
                  <Download className="h-4 w-4" />
                  Download Nilai
                </>

              )}

            </button>

          </div>

        </section>


        {/* ====================================================
         * PART 3 END
         * ====================================================
         */}

      </div>

    </div>
  );
}