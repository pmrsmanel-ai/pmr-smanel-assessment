import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  getTeamAnalysis,
  getTeamAIAnalysis,
} from "../api/api";


/* ============================================================
 * HELPERS
 * ============================================================
 */

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


function formatScore(
  value
) {

  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {

    return "-";

  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2);

}


function formatPercent(
  value
) {

  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {

    return "0%";

  }

  return `${number.toFixed(0)}%`;

}


function getProfileLabel(
  profile
) {

  if (
    !profile ||
    String(profile).trim() === ""
  ) {

    return "Belum Terpetakan";

  }

  return String(
    profile
  );

}


/* ============================================================
 * SCORE CARD
 * ============================================================
 */

function ScoreCard({
  label,
  value,
  icon: Icon,
  description,
}) {

  return (

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
          items-start
          justify-between
          gap-4
        "
      >

        <div>

          <div
            className="
              text-xs
              font-medium
              text-slate-500
            "
          >
            {label}
          </div>

          <div
            className="
              mt-2
              text-2xl
              font-bold
              text-slate-900
            "
          >
            {formatScore(value)}
          </div>

          <div
            className="
              mt-1
              text-[11px]
              text-slate-400
            "
          >
            {description}
          </div>

        </div>


        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-red-50
            text-red-600
          "
        >

          <Icon
            className="h-5 w-5"
          />

        </div>

      </div>

    </div>

  );

}


/* ============================================================
 * COMPONENT SCORE ROW
 * ============================================================
 */

function ComponentScoreRow({
  label,
  average,
  highest,
  lowest,
}) {

  const percentage =
    Math.min(
      100,
      Math.max(
        0,
        safeNumber(
          average
        )
      )
    );


  return (

    <div
      className="
        rounded-xl
        border
        border-slate-100
        bg-slate-50
        p-4
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >

        <div
          className="
            text-sm
            font-semibold
            text-slate-700
          "
        >
          {label}
        </div>

        <div
          className="
            text-sm
            font-bold
            text-slate-900
          "
        >
          {formatScore(average)}
        </div>

      </div>


      <div
        className="
          mt-3
          h-2
          overflow-hidden
          rounded-full
          bg-slate-200
        "
      >

        <div
          className="
            h-full
            rounded-full
            bg-red-600
            transition-all
          "
          style={{
            width:
              `${percentage}%`,
          }}
        />

      </div>


      <div
        className="
          mt-2
          flex
          justify-between
          text-[10px]
          text-slate-400
        "
      >

        <span>
          Terendah:{" "}
          {formatScore(
            lowest
          )}
        </span>

        <span>
          Tertinggi:{" "}
          {formatScore(
            highest
          )}
        </span>

      </div>

    </div>

  );

}


/* ============================================================
 * AI RESULT HELPERS
 * ============================================================
 */

function humanizeAIKey(
  key
) {

  return String(key || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, function(char) {
      return char.toUpperCase();
    });

}


function renderAIValue(
  value
) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return null;

  }


  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {

    return (
      <div
        className="
          text-xs
          leading-5
          text-slate-600
        "
      >
        {String(value)}
      </div>
    );

  }


  if (Array.isArray(value)) {

    return (
      <div
        className="
          mt-3
          space-y-2
        "
      >

        {value.map(
          function(item, index) {

            if (
              item !== null &&
              typeof item === "object"
            ) {

              return (
                <div
                  key={index}
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    bg-slate-50
                    p-4
                  "
                >

                  {renderAIValue(item)}

                </div>
              );

            }


            return (
              <div
                key={index}
                className="
                  rounded-lg
                  bg-slate-50
                  px-3
                  py-2
                  text-xs
                  leading-5
                  text-slate-600
                "
              >
                • {String(item)}
              </div>
            );

          }
        )}

      </div>
    );

  }


  if (
    typeof value === "object"
  ) {

    return (
      <div
        className="
          space-y-3
        "
      >

        {Object.entries(value).map(
          function(entry) {

            const key =
              entry[0];

            const item =
              entry[1];

            return (
              <div
                key={key}
              >

                <div
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                >
                  {humanizeAIKey(key)}
                </div>

                <div
                  className="
                    mt-1
                  "
                >
                  {renderAIValue(item)}
                </div>

              </div>
            );

          }
        )}

      </div>
    );

  }


  return null;

}


/* ============================================================
 * PAGE
 * ============================================================
 */

export default function AdminTeamAnalysis() {

  const navigate =
    useNavigate();

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


  const [
    aiData,
    setAiData,
  ] = useState(null);


  const [
    aiLoading,
    setAiLoading,
  ] = useState(false);


  const [
    aiError,
    setAiError,
  ] = useState("");


  async function runAIAnalysis() {

    setAiLoading(true);
    setAiError("");

    try {

      const result =
        await getTeamAIAnalysis();

      console.log(
        "TEAM AI ANALYSIS:",
        result
      );

      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Gagal menjalankan AI Leadership Analysis."
        );

      }

      setAiData(
        result.data ||
        {}
      );

    } catch (err) {

      console.error(
        "TEAM AI ANALYSIS ERROR:",
        err
      );

      setAiError(
        err?.message ||
        "Gagal menjalankan AI Leadership Analysis."
      );

    } finally {

      setAiLoading(false);

    }

  }



  /* ==========================================================
   * LOAD DATA
   * ==========================================================
   */

  async function loadAnalysis(
    silent = false
  ) {

    if (silent) {

      setRefreshing(
        true
      );

    } else {

      setLoading(
        true
      );

    }


    setError("");


    try {

      const result =
        await getTeamAnalysis();


      console.log(
        "TEAM ANALYSIS:",
        result
      );


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Gagal mengambil analisis tim."
        );

      }


      setData(
        result.data ||
        {}
      );


    } catch (
      err
    ) {

      console.error(
        "TEAM ANALYSIS ERROR:",
        err
      );


      setError(
        err?.message ||
        "Gagal mengambil analisis tim."
      );


    } finally {

      setLoading(
        false
      );

      setRefreshing(
        false
      );

    }

  }


  /* ==========================================================
   * INITIAL LOAD
   * ==========================================================
   */

  useEffect(() => {

    loadAnalysis();

  }, []);


  /* ==========================================================
   * DERIVED DATA
   * ==========================================================
   */

  const summary =
    data?.participant_summary ||
    {};


  const overview =
    data?.score_overview ||
    {};


  const distribution =
    data?.score_distribution ||
    {};


  const profiles =
    data?.profile_distribution ||
    [];


  const potentials =
    data?.potential_distribution ||
    [];


  const teamMap =
    data?.team_map ||
    {};


  const completionPercentage =
    summary.total > 0
      ? (
          summary.completed /
          summary.total
        ) *
        100
      : 0;


  const strongestComponents =
    useMemo(() => {

      return (
        teamMap?.strengths ||
        []
      ).slice(
        0,
        3
      );

    }, [
      teamMap,
    ]);


  const developmentComponents =
    useMemo(() => {

      return (
        teamMap?.development ||
        []
      ).slice(
        0,
        3
      );

    }, [
      teamMap,
    ]);


  /* ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {

    return (

      <div
        className="
          min-h-[70vh]
          flex
          items-center
          justify-center
          bg-slate-50
        "
      >

        <div
          className="
            rounded-2xl
            bg-white
            px-8
            py-10
            text-center
            shadow-sm
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

          <div
            className="
              mt-4
              text-sm
              font-semibold
              text-slate-800
            "
          >
            Memuat Analisis Tim...
          </div>

          <div
            className="
              mt-1
              text-xs
              text-slate-400
            "
          >
            Mengambil data assessment
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
          min-h-[70vh]
          bg-slate-50
          p-5
        "
      >

        <div
          className="
            mx-auto
            max-w-[1400px]
          "
        >

          <div
            className="
              rounded-2xl
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

              <AlertTriangle
                className="h-5 w-5"
              />

              <div
                className="
                  text-sm
                  font-semibold
                "
              >
                Gagal mengambil Analisis Tim
              </div>

            </div>


            <div
              className="
                mt-2
                text-xs
                text-red-600
              "
            >
              {error}
            </div>


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
                font-semibold
                text-white
                hover:bg-red-700
              "
            >

              <RefreshCw
                className="h-4 w-4"
              />

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

    <div
      className="
        min-h-screen
        bg-slate-50
        px-3
        py-5
        sm:px-5
        sm:py-6
      "
    >

      <div
        className="
          mx-auto
          w-full
          max-w-[1400px]
        "
      >

        {/* ====================================================
         * HEADER
         * ====================================================
         */}

        <header
          className="
            rounded-3xl
            bg-red-600
            px-5
            py-6
            text-white
            shadow-sm
            sm:px-7
            sm:py-7
          "
        >

          <div
            className="
              flex
              flex-col
              gap-5
              md:flex-row
              md:items-center
              md:justify-between
            "
          >

            <div>

              <div
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-red-100
                "
              >
                PMR SMANEL
              </div>


              <h1
                className="
                  mt-2
                  text-2xl
                  font-semibold
                  tracking-tight
                  sm:text-3xl
                "
              >
                Analisis Tim
              </h1>


              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  text-red-100
                "
              >
                Analisis statistik kemampuan
                kepemimpinan peserta berdasarkan
                hasil Leadership Assessment.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                loadAnalysis(
                  true
                )
              }
              disabled={
                refreshing
              }
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-xl
                bg-white
                px-4
                py-2.5
                text-xs
                font-semibold
                text-red-600
                shadow-sm
                transition
                hover:bg-red-50
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


        {/* ====================================================
         * SUMMARY
         * ====================================================
         */}

        <div
          className="
            mt-4
            grid
            gap-3
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >

          <ScoreCard
            label="Total Peserta"
            value={
              summary.total
            }
            icon={Users}
            description="Peserta terdaftar"
          />


          <ScoreCard
            label="Assessment Selesai"
            value={
              summary.completed
            }
            icon={
              CheckCircle2
            }
            description={
              `${formatPercent(
                completionPercentage
              )} dari total peserta`
            }
          />


          <ScoreCard
            label="Belum Selesai"
            value={
              summary.incomplete
            }
            icon={
              Activity
            }
            description="Belum masuk analisis"
          />


          <ScoreCard
            label="Rata-rata Final"
            value={
              overview
                ?.final_score
                ?.average
            }
            icon={
              TrendingUp
            }
            description="Rata-rata final score"
          />

        </div>


        {/* ====================================================
         * TEAM SCORE OVERVIEW
         * ====================================================
         */}

        <section
          className="
            mt-4
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
          "
        >

          <div
            className="
              flex
              flex-col
              gap-2
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>

              <div
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                Team Score Overview
              </div>

              <div
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Ringkasan performa seluruh peserta
                yang telah menyelesaikan assessment.
              </div>

            </div>


            <div
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                bg-emerald-50
                px-3
                py-1.5
                text-[11px]
                font-semibold
                text-emerald-700
              "
            >

              <ShieldCheck
                className="h-3.5 w-3.5"
              />

              Data Terverifikasi Sistem

            </div>

          </div>


          <div
            className="
              mt-5
              grid
              gap-3
              md:grid-cols-2
              xl:grid-cols-3
            "
          >

            <ComponentScoreRow
              label="Personality"
              {...(
                overview
                  .personality ||
                {}
              )}
            />


            <ComponentScoreRow
              label="Competency"
              {...(
                overview
                  .competency ||
                {}
              )}
            />


            <ComponentScoreRow
              label="Situational Judgment"
              {...(
                overview
                  .sjt ||
                {}
              )}
            />


            <ComponentScoreRow
              label="Leadership Challenge"
              {...(
                overview
                  .challenge ||
                {}
              )}
            />


            <ComponentScoreRow
              label="Objective Score"
              {...(
                overview
                  .objective ||
                {}
              )}
            />


            <ComponentScoreRow
              label="Final Score"
              {...(
                overview
                  .final_score ||
                {}
              )}
            />

          </div>

        </section>


        {/* ====================================================
         * STRENGTH + DEVELOPMENT
         * ====================================================
         */}

        <div
          className="
            mt-4
            grid
            gap-4
            lg:grid-cols-2
          "
        >

          {/* STRENGTH */}

          <section
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
                  bg-emerald-50
                  text-emerald-600
                "
              >

                <TrendingUp
                  className="h-5 w-5"
                />

              </div>


              <div>

                <div
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Kekuatan Tim
                </div>

                <div
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Aspek dengan performa tertinggi
                </div>

              </div>

            </div>


            <div
              className="mt-5 space-y-3"
            >

              {strongestComponents.length === 0 ? (

                <div
                  className="
                    rounded-xl
                    bg-slate-50
                    p-4
                    text-xs
                    text-slate-400
                  "
                >
                  Belum tersedia.
                </div>

              ) : (

                strongestComponents.map(
                  item => (

                    <div
                      key={
                        item.key
                      }
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-xl
                        bg-emerald-50
                        px-4
                        py-3
                      "
                    >

                      <span
                        className="
                          text-xs
                          font-semibold
                          text-emerald-800
                        "
                      >
                        {item.label}
                      </span>

                      <span
                        className="
                          text-sm
                          font-bold
                          text-emerald-700
                        "
                      >
                        {formatScore(
                          item.average
                        )}
                      </span>

                    </div>

                  )
                )

              )}

            </div>

          </section>


          {/* DEVELOPMENT */}

          <section
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
                  bg-amber-50
                  text-amber-600
                "
              >

                <Target
                  className="h-5 w-5"
                />

              </div>


              <div>

                <div
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Area Pengembangan
                </div>

                <div
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Aspek yang membutuhkan perhatian
                </div>

              </div>

            </div>


            <div
              className="mt-5 space-y-3"
            >

              {developmentComponents.length === 0 ? (

                <div
                  className="
                    rounded-xl
                    bg-slate-50
                    p-4
                    text-xs
                    text-slate-400
                  "
                >
                  Belum tersedia.
                </div>

              ) : (

                developmentComponents.map(
                  item => (

                    <div
                      key={
                        item.key
                      }
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-xl
                        bg-amber-50
                        px-4
                        py-3
                      "
                    >

                      <span
                        className="
                          text-xs
                          font-semibold
                          text-amber-800
                        "
                      >
                        {item.label}
                      </span>

                      <span
                        className="
                          text-sm
                          font-bold
                          text-amber-700
                        "
                      >
                        {formatScore(
                          item.average
                        )}
                      </span>

                    </div>

                  )
                )

              )}

            </div>

          </section>

        </div>


        {/* ====================================================
         * DISTRIBUTION
         * ====================================================
         */}

        <section
          className="
            mt-4
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
          "
        >

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
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-blue-600
              "
            >

              <BarChart3
                className="h-5 w-5"
              />

            </div>


            <div>

              <div
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                Distribusi Final Score
              </div>

              <div
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Sebaran peserta berdasarkan
                hasil akhir assessment.
              </div>

            </div>

          </div>


          <div
            className="
              mt-5
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-5
            "
          >

            {Object.values(
              distribution
            ).map(
              item => (

                <div
                  key={
                    item.label
                  }
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    bg-slate-50
                    p-4
                  "
                >

                  <div
                    className="
                      text-xs
                      font-semibold
                      text-slate-500
                    "
                  >
                    {item.label}
                  </div>


                  <div
                    className="
                      mt-2
                      text-2xl
                      font-bold
                      text-slate-900
                    "
                  >
                    {safeNumber(
                      item.count
                    )}
                  </div>


                  <div
                    className="
                      mt-1
                      text-[10px]
                      text-slate-400
                    "
                  >
                    peserta
                  </div>

                </div>

              )
            )}

          </div>

        </section>


        {/* ====================================================
         * PROFILE DISTRIBUTION
         * ====================================================
         */}

        <div
          className="
            mt-4
            grid
            gap-4
            lg:grid-cols-2
          "
        >

          <section
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
                  bg-purple-50
                  text-purple-600
                "
              >

                <Users
                  className="h-5 w-5"
                />

              </div>


              <div>

                <div
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Distribusi Profil
                </div>

                <div
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Profil kepemimpinan yang
                  telah terpetakan.
                </div>

              </div>

            </div>


            <div
              className="
                mt-5
                space-y-3
              "
            >

              {profiles.length === 0 ? (

                <div
                  className="
                    rounded-xl
                    bg-slate-50
                    p-4
                    text-xs
                    text-slate-400
                  "
                >
                  Belum ada profil yang terpetakan.
                </div>

              ) : (

                profiles.map(
                  item => {

                    const percent =
                      summary.completed > 0
                        ? (
                            item.count /
                            summary.completed
                          ) *
                          100
                        : 0;


                    return (

                      <div
                        key={
                          item.profile
                        }
                      >

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            text-xs
                          "
                        >

                          <span
                            className="
                              font-semibold
                              text-slate-700
                            "
                          >
                            {getProfileLabel(
                              item.profile
                            )}
                          </span>

                          <span
                            className="
                              font-bold
                              text-slate-900
                            "
                          >
                            {item.count}
                          </span>

                        </div>


                        <div
                          className="
                            mt-2
                            h-2
                            overflow-hidden
                            rounded-full
                            bg-slate-100
                          "
                        >

                          <div
                            className="
                              h-full
                              rounded-full
                              bg-purple-500
                            "
                            style={{
                              width:
                                `${percent}%`,
                            }}
                          />

                        </div>

                      </div>

                    );

                  }
                )

              )}

            </div>

          </section>


          {/* POTENTIAL */}

          <section
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
                  bg-emerald-50
                  text-emerald-600
                "
              >

                <Brain
                  className="h-5 w-5"
                />

              </div>


              <div>

                <div
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Potensi Kepemimpinan
                </div>

                <div
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Distribusi status potensi peserta.
                </div>

              </div>

            </div>


            <div
              className="
                mt-5
                space-y-3
              "
            >

              {potentials.length === 0 ? (

                <div
                  className="
                    rounded-xl
                    bg-slate-50
                    p-4
                    text-xs
                    text-slate-400
                  "
                >
                  Belum ada data potensi.
                </div>

              ) : (

                potentials.map(
                  item => (

                    <div
                      key={
                        item.status
                      }
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-xl
                        border
                        border-slate-100
                        bg-slate-50
                        px-4
                        py-3
                      "
                    >

                      <span
                        className="
                          text-xs
                          font-semibold
                          text-slate-700
                        "
                      >
                        {item.status}
                      </span>

                      <span
                        className="
                          text-sm
                          font-bold
                          text-slate-900
                        "
                      >
                        {item.count}
                      </span>

                    </div>

                  )
                )

              )}

            </div>

          </section>

        </div>


        {/* ====================================================
         * AI LEADERSHIP ANALYSIS
         * ====================================================
         */}

        <section
          className="
            mt-4
            rounded-2xl
            border
            border-red-100
            bg-gradient-to-br
            from-red-50
            to-white
            p-5
            shadow-sm
            sm:p-6
          "
        >

          <div
            className="
              flex
              flex-col
              gap-4
              md:flex-row
              md:items-center
              md:justify-between
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
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-600
                  text-white
                "
              >

                <Brain
                  className="h-5 w-5"
                />

              </div>


              <div>

                <div
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  AI Leadership Analysis
                </div>


                <div
                  className="
                    mt-1
                    max-w-2xl
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  Analisis AI menggunakan data agregat
                  Leadership Assessment untuk membaca
                  pola kepemimpinan, kekuatan,
                  area pengembangan, risiko, dan
                  rekomendasi pembinaan tim.
                </div>

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/analisis-tim/ai"
                )
              }
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-xl
                bg-red-600
                px-4
                py-2.5
                text-xs
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-red-700
              "
            >

              <Brain
                className="h-4 w-4"
              />

              Lihat Hasil Analisis AI

            </button>

          </div>


          {aiLoading && (

            <div
              className="
                mt-5
                rounded-xl
                border
                border-red-100
                bg-white
                p-5
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-xs
                  text-slate-600
                "
              >

                <RefreshCw
                  className="
                    h-4
                    w-4
                    animate-spin
                    text-red-600
                  "
                />

                AI sedang membaca statistik tim
                dan menyusun analisis kepemimpinan...

              </div>

            </div>

          )}


          {aiError && (

            <div
              className="
                mt-5
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-4
                text-xs
                text-red-700
              "
            >

              <div
                className="font-semibold"
              >
                AI Analysis Gagal
              </div>

              <div
                className="mt-1 leading-5"
              >
                {aiError}
              </div>

            </div>

          )}


          {aiData && !aiLoading && !aiError && (

            <div
              className="
                mt-6
                space-y-4
              "
            >

              <div
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >

                  <Brain
                    className="h-4 w-4 text-red-600"
                  />

                  Hasil AI Leadership Analysis

                </div>


                <div
                  className="
                    mt-5
                  "
                >

                  {renderAIValue(
                    aiData.analysis ||
                    aiData
                  )}

                </div>

              </div>


              <div
                className="
                  rounded-xl
                  border
                  border-slate-100
                  bg-white
                  px-4
                  py-3
                  text-[10px]
                  leading-5
                  text-slate-400
                "
              >
                Analisis AI merupakan alat bantu
                pengambilan keputusan pembinaan.
                Keputusan akhir tetap berada pada
                Tim Seleksi PMR SMANEL.
              </div>

            </div>

          )}


        </section>

      </div>

    </div>

  );

}