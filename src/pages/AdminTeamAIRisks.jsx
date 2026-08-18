import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingDown,
} from "lucide-react";

import TeamAINavigation from "../components/TeamAINavigation";
import {
  getTeamAIAnalysis,
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
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {

    return fallback;

  }

  return String(value);

}


function getRiskLevel(
  risk,
  impact
) {

  const text =
    `${risk || ""} ${impact || ""}`
      .toLowerCase();


  if (
    text.includes("tinggi") ||
    text.includes("high") ||
    text.includes("critical") ||
    text.includes("kritis") ||
    text.includes("urgent")
  ) {

    return {

      key:
        "high",

      label:
        "Risiko Tinggi",

      wrapper:
        "border-red-200 bg-red-50",

      icon:
        "bg-white text-red-600",

      badge:
        "bg-red-100 text-red-700",

      title:
        "text-red-700",

    };

  }


  if (
    text.includes("sedang") ||
    text.includes("medium") ||
    text.includes("moderate")
  ) {

    return {

      key:
        "medium",

      label:
        "Perlu Perhatian",

      wrapper:
        "border-amber-200 bg-amber-50",

      icon:
        "bg-white text-amber-600",

      badge:
        "bg-amber-100 text-amber-700",

      title:
        "text-amber-700",

    };

  }


  return {

    key:
      "low",

    label:
      "Risiko Terkelola",

    wrapper:
      "border-emerald-200 bg-emerald-50",

    icon:
      "bg-white text-emerald-600",

    badge:
      "bg-emerald-100 text-emerald-700",

    title:
      "text-emerald-700",

  };

}


/* ============================================================
 * RISK CARD
 * ============================================================
 */

function RiskCard({
  item,
  index,
}) {

  const level =
    getRiskLevel(
      item?.risk,
      item?.impact
    );


  return (

    <article
      className={`
        rounded-3xl
        border
        p-5
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md
        ${level.wrapper}
      `}
    >

      {/* HEADER */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >

        <div
          className="
            flex
            min-w-0
            items-start
            gap-3
          "
        >

          <div
            className={`
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              ${level.icon}
            `}
          >

            {level.key === "high" ? (

              <ShieldAlert
                className="
                  h-5
                  w-5
                "
              />

            ) : level.key === "medium" ? (

              <AlertTriangle
                className="
                  h-5
                  w-5
                "
              />

            ) : (

              <ShieldCheck
                className="
                  h-5
                  w-5
                "
              />

            )}

          </div>


          <div
            className="
              min-w-0
            "
          >

            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.18em]
                text-slate-500
              "
            >
              Team Risk {index + 1}
            </p>


            <h2
              className="
                mt-1
                text-lg
                font-black
                leading-tight
                text-slate-900
              "
            >
              {safeText(
                item?.risk,
                "Risiko belum dijelaskan"
              )}
            </h2>

          </div>

        </div>


        <span
          className={`
            shrink-0
            rounded-full
            px-2.5
            py-1
            text-[9px]
            font-black
            uppercase
            tracking-wider
            ${level.badge}
          `}
        >
          {level.label}
        </span>

      </div>


      {/* IMPACT */}

      <div
        className="
          mt-5
          rounded-2xl
          border
          border-white/70
          bg-white/70
          p-4
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <TrendingDown
            className="
              h-4
              w-4
              text-slate-600
            "
          />


          <span
            className="
              text-[10px]
              font-black
              uppercase
              tracking-wider
              text-slate-500
            "
          >
            Dampak terhadap Tim
          </span>

        </div>


        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-700
          "
        >
          {safeText(
            item?.impact,
            "Belum ada dampak yang dijelaskan."
          )}
        </p>

      </div>


      {/* MITIGATION */}

      <div
        className="
          mt-4
          rounded-2xl
          border
          border-white/70
          bg-white/80
          p-4
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <Target
            className="
              h-4
              w-4
              text-blue-600
            "
          />


          <span
            className="
              text-[10px]
              font-black
              uppercase
              tracking-wider
              text-blue-600
            "
          >
            Mitigasi
          </span>

        </div>


        <p
          className="
            mt-2
            text-sm
            font-semibold
            leading-6
            text-slate-700
          "
        >
          {safeText(
            item?.mitigation,
            "Belum ada rekomendasi mitigasi."
          )}
        </p>

      </div>


      {/* FOOTER */}

      <div
        className="
          mt-4
          flex
          items-center
          gap-2
          text-[10px]
          font-bold
          text-slate-500
        "
      >

        <ArrowRight
          className="
            h-3.5
            w-3.5
          "
        />

        Fokus pada pencegahan dan penguatan
        sistem kerja tim.

      </div>

    </article>

  );

}


/* ============================================================
 * EMPTY
 * ============================================================
 */

function EmptyState() {

  return (

    <div
      className="
        rounded-3xl
        border
        border-dashed
        border-slate-300
        bg-slate-50
        p-10
        text-center
      "
    >

      <div
        className="
          mx-auto
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-white
          text-slate-400
          shadow-sm
        "
      >

        <ShieldCheck
          className="
            h-6
            w-6
          "
        />

      </div>


      <h3
        className="
          mt-4
          text-base
          font-black
          text-slate-800
        "
      >
        Tidak Ada Risiko Utama
      </h3>


      <p
        className="
          mx-auto
          mt-2
          max-w-lg
          text-sm
          leading-6
          text-slate-500
        "
      >
        AI belum mengidentifikasi risiko utama
        pada kondisi tim yang tersedia.
      </p>

    </div>

  );

}


/* ============================================================
 * MAIN PAGE
 * ============================================================
 */

export default function AdminTeamAIRisks() {

  const [
    data,
    setData,
  ] = useState(null);


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


  /* ==========================================================
   * LOAD AI ANALYSIS
   * ==========================================================
   */

  async function loadAnalysis(
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
        await getTeamAIAnalysis();


      console.log(
        "TEAM AI RISKS:",
        result
      );


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Gagal mengambil Team Risks."
        );

      }


      setData(
        result.data ||
        {}
      );

    } catch (err) {

      console.error(
        "TEAM AI RISKS ERROR:",
        err
      );


      setError(
        err?.message ||
        "Gagal mengambil Team Risks."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  }


  useEffect(
    function() {

      loadAnalysis();

    },
    []
  );


  /* ==========================================================
   * DATA
   * ==========================================================
   */

  const risks =
    useMemo(
      function() {

        if (
          !Array.isArray(
            data?.team_risks
          )
        ) {

          return [];

        }


        return data
          .team_risks
          .filter(
            item =>
              item &&
              typeof item === "object"
          );

      },
      [data]
    );


  const highRiskCount =
    useMemo(
      function() {

        return risks.filter(
          item =>
            getRiskLevel(
              item?.risk,
              item?.impact
            ).key === "high"
        ).length;

      },
      [risks]
    );


  const mediumRiskCount =
    useMemo(
      function() {

        return risks.filter(
          item =>
            getRiskLevel(
              item?.risk,
              item?.impact
            ).key === "medium"
        ).length;

      },
      [risks]
    );


  const lowRiskCount =
    useMemo(
      function() {

        return risks.filter(
          item =>
            getRiskLevel(
              item?.risk,
              item?.impact
            ).key === "low"
        ).length;

      },
      [risks]
    );


  const participants =
    data?.participants ||
    {};


  const total =
    Number(
      participants?.total
    ) || 0;


  const completed =
    Number(
      participants?.completed
    ) || 0;


  const confidenceNote =
    safeText(
      data?.confidence_note,
      ""
    );


  /* ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {

    return (

      <div
        className="
          min-h-screen
          bg-slate-50
          p-6
        "
      >

        <div
          className="
            mx-auto
            max-w-7xl
          "
        >

          <TeamAINavigation />


          <div
            className="
              mt-4
              flex
              min-h-[60vh]
              items-center
              justify-center
              rounded-3xl
              bg-white
              shadow-sm
            "
          >

            <div
              className="
                text-center
              "
            >

              <RefreshCw
                className="
                  mx-auto
                  h-8
                  w-8
                  animate-spin
                  text-red-600
                "
              />


              <p
                className="
                  mt-4
                  text-sm
                  font-black
                  text-slate-800
                "
              >
                Memuat Team Risks...
              </p>


              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                AI sedang membaca potensi risiko tim
              </p>

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

      <div
        className="
          min-h-screen
          bg-slate-50
          p-4
          sm:p-6
        "
      >

        <div
          className="
            mx-auto
            max-w-7xl
          "
        >

          <TeamAINavigation />


          <div
            className="
              mt-4
              rounded-3xl
              border
              border-red-200
              bg-red-50
              p-6
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
                text-red-700
              "
            >

              <ShieldAlert
                className="
                  h-5
                  w-5
                "
              />


              <p
                className="
                  text-sm
                  font-black
                "
              >
                Team Risks Gagal Dimuat
              </p>

            </div>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-red-600
              "
            >
              {error}
            </p>


            <button
              type="button"
              onClick={() =>
                loadAnalysis()
              }
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-red-600
                px-4
                py-2.5
                text-xs
                font-black
                text-white
                hover:bg-red-700
              "
            >

              <RefreshCw
                className="
                  h-4
                  w-4
                "
              />

              Coba Lagi

            </button>

          </div>

        </div>

      </div>

    );

  }


  /* ==========================================================
   * PAGE
   * ==========================================================
   */

  return (

    <div
      className="
        min-h-screen
        bg-slate-50
        p-4
        sm:p-6
      "
    >

      <div
        className="
          mx-auto
          max-w-7xl
          space-y-5
        "
      >

        {/* NAVIGATION */}

        <TeamAINavigation />


        {/* HEADER */}

        <header
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
          "
        >

          <div
            className="
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-red-50
                    text-red-600
                  "
                >

                  <ShieldAlert
                    className="
                      h-5
                      w-5
                    "
                  />

                </div>


                <div>

                  <p
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.18em]
                      text-red-600
                    "
                  >
                    AI Leadership Analysis
                  </p>


                  <h1
                    className="
                      text-2xl
                      font-black
                      tracking-tight
                      text-slate-900
                    "
                  >
                    Team Risks
                  </h1>

                </div>

              </div>


              <p
                className="
                  mt-2
                  max-w-3xl
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Identifikasi risiko yang dapat menghambat
                perkembangan tim beserta dampak dan
                strategi mitigasinya.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                loadAnalysis(true)
              }
              disabled={
                refreshing
              }
              className="
                inline-flex
                w-fit
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-red-600
                px-4
                py-2.5
                text-xs
                font-black
                text-white
                shadow-sm
                hover:bg-red-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              <RefreshCw
                className={`
                  h-4
                  w-4
                  ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                `}
              />

              Refresh

            </button>

          </div>

        </header>


        {/* SUMMARY */}

        <section
          className="
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
              "
            >

              <ShieldAlert
                className="
                  h-5
                  w-5
                "
              />

            </div>


            <p
              className="
                mt-4
                text-[10px]
                font-black
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Total Risiko
            </p>


            <p
              className="
                mt-1
                text-3xl
                font-black
                text-slate-900
              "
            >
              {risks.length}
            </p>

          </div>


          <div
            className="
              rounded-2xl
              border
              border-red-100
              bg-red-50
              p-5
              shadow-sm
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-white
                text-red-600
              "
            >

              <AlertTriangle
                className="
                  h-5
                  w-5
                "
              />

            </div>


            <p
              className="
                mt-4
                text-[10px]
                font-black
                uppercase
                tracking-wider
                text-red-600
              "
            >
              Risiko Tinggi
            </p>


            <p
              className="
                mt-1
                text-3xl
                font-black
                text-red-700
              "
            >
              {highRiskCount}
            </p>

          </div>


          <div
            className="
              rounded-2xl
              border
              border-amber-100
              bg-amber-50
              p-5
              shadow-sm
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-white
                text-amber-600
              "
            >

              <AlertTriangle
                className="
                  h-5
                  w-5
                "
              />

            </div>


            <p
              className="
                mt-4
                text-[10px]
                font-black
                uppercase
                tracking-wider
                text-amber-600
              "
            >
              Perlu Perhatian
            </p>


            <p
              className="
                mt-1
                text-3xl
                font-black
                text-amber-700
              "
            >
              {mediumRiskCount}
            </p>

          </div>


          <div
            className="
              rounded-2xl
              border
              border-emerald-100
              bg-emerald-50
              p-5
              shadow-sm
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-white
                text-emerald-600
              "
            >

              <CheckCircle2
                className="
                  h-5
                  w-5
                "
              />

            </div>


            <p
              className="
                mt-4
                text-[10px]
                font-black
                uppercase
                tracking-wider
                text-emerald-600
              "
            >
              Terkelola
            </p>


            <p
              className="
                mt-1
                text-3xl
                font-black
                text-emerald-700
              "
            >
              {lowRiskCount}
            </p>

          </div>

        </section>


        {/* CONFIDENCE NOTE */}

        {confidenceNote && (

          <section
            className="
              rounded-3xl
              border
              border-amber-200
              bg-amber-50
              p-5
            "
          >

            <div
              className="
                flex
                items-start
                gap-3
              "
            >

              <Brain
                className="
                  mt-0.5
                  h-5
                  w-5
                  shrink-0
                  text-amber-600
                "
              />


              <div>

                <p
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-wider
                    text-amber-700
                  "
                >
                  Catatan Confidence
                </p>


                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-amber-800
                  "
                >
                  {confidenceNote}
                </p>

              </div>

            </div>

          </section>

        )}


        {/* RISK LIST */}

        <section
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
          "
        >

          <div
            className="
              mb-5
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
              "
            >

              <ShieldAlert
                className="
                  h-5
                  w-5
                "
              />

            </div>


            <div>

              <h2
                className="
                  text-xl
                  font-black
                  text-slate-900
                "
              >
                Risiko Utama Tim
              </h2>


              <p
                className="
                  text-sm
                  text-slate-400
                "
              >
                Risiko, dampak, dan mitigasi yang
                direkomendasikan AI.
              </p>

            </div>

          </div>


          {risks.length === 0 ? (

            <EmptyState />

          ) : (

            <div
              className="
                grid
                gap-4
                lg:grid-cols-2
              "
            >

              {risks.map(
                (
                  item,
                  index
                ) => (

                  <RiskCard
                    key={
                      `${item?.risk || "risk"}-${index}`
                    }
                    item={
                      item
                    }
                    index={
                      index
                    }
                  />

                )
              )}

            </div>

          )}

        </section>


        {/* HOW TO USE */}

        <section
          className="
            rounded-3xl
            border
            border-indigo-100
            bg-indigo-50/60
            p-5
          "
        >

          <div
            className="
              flex
              items-start
              gap-3
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-white
                text-indigo-600
                shadow-sm
              "
            >

              <Brain
                className="
                  h-5
                  w-5
                "
              />

            </div>


            <div>

              <h3
                className="
                  text-sm
                  font-black
                  text-slate-900
                "
              >
                Cara Menggunakan Risk Analysis
              </h3>


              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-600
                "
              >
                Gunakan hasil ini untuk mengantisipasi
                hambatan dalam proses pembinaan,
                pembagian tanggung jawab, komunikasi,
                dan persiapan calon pengurus. Risiko
                merupakan sinyal untuk tindakan preventif,
                bukan label terhadap peserta.
              </p>


              <div
                className="
                  mt-4
                  grid
                  gap-3
                  sm:grid-cols-3
                "
              >

                <div
                  className="
                    rounded-2xl
                    bg-white
                    p-4
                  "
                >

                  <p
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-indigo-500
                    "
                  >
                    01
                  </p>


                  <p
                    className="
                      mt-1
                      text-sm
                      font-bold
                      text-slate-700
                    "
                  >
                    Kenali
                  </p>

                </div>


                <div
                  className="
                    rounded-2xl
                    bg-white
                    p-4
                  "
                >

                  <p
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-indigo-500
                    "
                  >
                    02
                  </p>


                  <p
                    className="
                      mt-1
                      text-sm
                      font-bold
                      text-slate-700
                    "
                  >
                    Mitigasi
                  </p>

                </div>


                <div
                  className="
                    rounded-2xl
                    bg-white
                    p-4
                  "
                >

                  <p
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-indigo-500
                    "
                  >
                    03
                  </p>


                  <p
                    className="
                      mt-1
                      text-sm
                      font-bold
                      text-slate-700
                    "
                  >
                    Evaluasi
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* FOOTER NOTE */}

        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
          "
        >

          <ShieldCheck
            className="
              h-5
              w-5
              shrink-0
              text-emerald-600
            "
          />


          <p
            className="
              text-xs
              leading-5
              text-slate-500
            "
          >
            Risk Analysis bersifat agregat dan
            interpretatif untuk kebutuhan pembinaan.
            Sistem tidak menggunakan hasil ini untuk
            menentukan kelulusan atau memberi label
            negatif kepada individu.
          </p>

        </div>

      </div>

    </div>

  );

}