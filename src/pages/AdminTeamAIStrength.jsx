import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Target,
  AlertTriangle,
} from "lucide-react";

import TeamAINavigation from "../components/TeamAINavigation";
import { getTeamAnalysis } from "../api/api";


/* ============================================================
 * FORMAT NUMBER
 * ============================================================
 */

function formatNumber(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return "-";

  }

  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {

    return String(value);

  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2);

}


/* ============================================================
 * FORMAT PERCENTAGE
 * ============================================================
 */

function formatPercent(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return "-";

  }

  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {

    return "-";

  }

  return `${formatNumber(number)}%`;

}


/* ============================================================
 * NORMALIZE SCORE OVERVIEW
 * ============================================================
 */

function buildFallbackRows(
  overview
) {

  const definitions = [

    {
      key:
        "personality",

      label:
        "Personality",
    },

    {
      key:
        "competency",

      label:
        "Competency",
    },

    {
      key:
        "sjt",

      label:
        "Situational Judgment",
    },

    {
      key:
        "challenge",

      label:
        "Leadership Challenge",
    },

    {
      key:
        "objective",

      label:
        "Objective Score",
    },

    {
      key:
        "final_score",

      label:
        "Final Score",
    },

  ];


  return definitions
    .map(
      function(item) {

        const stat =
          overview?.[
            item.key
          ];


        if (
          !stat ||
          stat.average === null ||
          stat.average === undefined
        ) {

          return null;

        }


        return {

          key:
            item.key,

          label:
            item.label,

          average:
            Number(
              stat.average
            ),

          highest:
            stat.highest,

          lowest:
            stat.lowest,

        };

      }
    )
    .filter(
      Boolean
    );

}


/* ============================================================
 * GET TEAM MAP
 * ============================================================
 */

function getTeamMapRows(
  data
) {

  const teamMap =
    data?.team_map ||
    {};


  const strengths =
    Array.isArray(
      teamMap?.strengths
    )
      ? teamMap.strengths
      : [];


  if (
    strengths.length > 0
  ) {

    return strengths;

  }


  /*
   * Fallback:
   * Jika team_map belum tersedia,
   * bangun dari score_overview.
   */

  const overview =
    data?.score_overview ||
    {};


  return buildFallbackRows(
    overview
  )
    .filter(
      function(item) {

        return (
          Number(
            item.average
          ) >= 80
        );

      }
    )
    .sort(
      function(a, b) {

        return (
          Number(
            b.average
          ) -
          Number(
            a.average
          )
        );

      }
    );

}


/* ============================================================
 * GET DEVELOPMENT
 * ============================================================
 */

function getDevelopmentRows(
  data
) {

  const teamMap =
    data?.team_map ||
    {};


  const development =
    Array.isArray(
      teamMap?.development
    )
      ? teamMap.development
      : [];


  if (
    development.length > 0
  ) {

    return development;

  }


  const overview =
    data?.score_overview ||
    {};


  return buildFallbackRows(
    overview
  )
    .filter(
      function(item) {

        const score =
          Number(
            item.average
          );

        return (
          score >= 70 &&
          score < 80
        );

      }
    )
    .sort(
      function(a, b) {

        return (
          Number(
            b.average
          ) -
          Number(
            a.average
          )
        );

      }
    );

}


/* ============================================================
 * GET ATTENTION
 * ============================================================
 */

function getAttentionRows(
  data
) {

  const teamMap =
    data?.team_map ||
    {};


  const attention =
    Array.isArray(
      teamMap?.attention
    )
      ? teamMap.attention
      : [];


  if (
    attention.length > 0
  ) {

    return attention;

  }


  const overview =
    data?.score_overview ||
    {};


  return buildFallbackRows(
    overview
  )
    .filter(
      function(item) {

        return (
          Number(
            item.average
          ) < 70
        );

      }
    )
    .sort(
      function(a, b) {

        return (
          Number(
            a.average
          ) -
          Number(
            b.average
          )
        );

      }
    );

}


/* ============================================================
 * SCORE BAR
 * ============================================================
 */

function ScoreBar({
  value,
}) {

  const score =
    Number(value);


  const progress =
    Number.isFinite(score)
      ? Math.max(
          0,
          Math.min(
            100,
            score
          )
        )
      : 0;


  return (

    <div
      className="
        mt-4
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
          bg-emerald-500
          transition-all
        "
        style={{
          width:
            `${progress}%`,
        }}
      />

    </div>

  );

}


/* ============================================================
 * STRENGTH CARD
 * ============================================================
 */

function StrengthCard({
  item,
  rank,
}) {

  return (

    <article
      className="
        rounded-2xl
        border
        border-slate-200
        bg-slate-50
        p-5
        transition
        hover:-translate-y-0.5
        hover:shadow-sm
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

        <div
          className="
            flex
            min-w-0
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
              bg-emerald-50
              text-emerald-600
            "
          >

            <TrendingUp
              className="
                h-5
                w-5
              "
            />

          </div>


          <div
            className="
              min-w-0
            "
          >

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-emerald-600
              "
            >
              Strength #{rank}
            </p>

            <h3
              className="
                mt-1
                text-base
                font-black
                text-slate-900
              "
            >
              {item.label}
            </h3>

          </div>

        </div>


        <div
          className="
            shrink-0
            text-right
          "
        >

          <p
            className="
              text-2xl
              font-black
              text-emerald-600
            "
          >
            {formatNumber(
              item.average
            )}
          </p>

          <p
            className="
              text-[9px]
              font-bold
              uppercase
              text-slate-400
            "
          >
            Average
          </p>

        </div>

      </div>


      <ScoreBar
        value={
          item.average
        }
      />


      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-3
        "
      >

        <div
          className="
            rounded-xl
            bg-white
            p-3
          "
        >

          <p
            className="
              text-[9px]
              font-bold
              uppercase
              text-slate-400
            "
          >
            Highest
          </p>

          <p
            className="
              mt-1
              text-sm
              font-black
              text-slate-800
            "
          >
            {formatNumber(
              item.highest
            )}
          </p>

        </div>


        <div
          className="
            rounded-xl
            bg-white
            p-3
          "
        >

          <p
            className="
              text-[9px]
              font-bold
              uppercase
              text-slate-400
            "
          >
            Lowest
          </p>

          <p
            className="
              mt-1
              text-sm
              font-black
              text-slate-800
            "
          >
            {formatNumber(
              item.lowest
            )}
          </p>

        </div>

      </div>

    </article>

  );

}


/* ============================================================
 * DEVELOPMENT CARD
 * ============================================================
 */

function DevelopmentCard({
  item,
}) {

  return (

    <div
      className="
        rounded-2xl
        border
        border-amber-100
        bg-amber-50/60
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
            flex
            min-w-0
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-amber-100
              text-amber-600
            "
          >

            <Target
              className="
                h-4
                w-4
              "
            />

          </div>

          <p
            className="
              truncate
              text-sm
              font-black
              text-slate-800
            "
          >
            {item.label}
          </p>

        </div>


        <p
          className="
            shrink-0
            text-lg
            font-black
            text-amber-600
          "
        >
          {formatNumber(
            item.average
          )}
        </p>

      </div>


      <ScoreBar
        value={
          item.average
        }
      />

    </div>

  );

}


/* ============================================================
 * ATTENTION CARD
 * ============================================================
 */

function AttentionCard({
  item,
}) {

  return (

    <div
      className="
        rounded-2xl
        border
        border-red-100
        bg-red-50/60
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
            flex
            min-w-0
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-red-100
              text-red-600
            "
          >

            <AlertTriangle
              className="
                h-4
                w-4
              "
            />

          </div>

          <p
            className="
              truncate
              text-sm
              font-black
              text-slate-800
            "
          >
            {item.label}
          </p>

        </div>


        <p
          className="
            shrink-0
            text-lg
            font-black
            text-red-600
          "
        >
          {formatNumber(
            item.average
          )}
        </p>

      </div>


      <ScoreBar
        value={
          item.average
        }
      />

    </div>

  );

}


/* ============================================================
 * MAIN
 * ============================================================
 */

export default function AdminTeamAIStrength() {

  const [
    data,
    setData,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  async function loadAnalysis() {

    setLoading(true);
    setError("");


    try {

      const result =
        await getTeamAnalysis();


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Gagal mengambil data kekuatan tim."
        );

      }


      setData(
        result.data ||
        {}
      );

    } catch (err) {

      console.error(
        "TEAM STRENGTH ERROR:",
        err
      );


      setError(
        err?.message ||
        "Gagal mengambil data kekuatan tim."
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(
    function() {

      loadAnalysis();

    },
    []
  );


  const strengths =
    useMemo(
      function() {

        return getTeamMapRows(
          data
        );

      },
      [
        data,
      ]
    );


  const development =
    useMemo(
      function() {

        return getDevelopmentRows(
          data
        );

      },
      [
        data,
      ]
    );


  const attention =
    useMemo(
      function() {

        return getAttentionRows(
          data
        );

      },
      [
        data,
      ]
    );


  const topStrength =
    strengths.length > 0
      ? strengths[0]
      : null;


  const totalComponents =
    strengths.length +
    development.length +
    attention.length;


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

        {/* ==================================================
            NAVIGATION
           ================================================== */}

        <TeamAINavigation />


        {/* ==================================================
            HEADER
           ================================================== */}

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
              gap-4
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
                    bg-emerald-50
                    text-emerald-600
                  "
                >

                  <ShieldCheck
                    className="
                      h-5
                      w-5
                    "
                  />

                </div>


                <div>

                  <p
                    className="
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-emerald-600
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
                    Kekuatan Tim
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
                Ringkasan aspek dengan performa paling
                menonjol berdasarkan hasil Leadership
                Assessment.
              </p>

            </div>


            <button
              type="button"
              onClick={
                loadAnalysis
              }
              disabled={
                loading
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-red-600
                px-4
                py-2.5
                text-xs
                font-bold
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
                    loading
                      ? "animate-spin"
                      : ""
                  }
                `}
              />

              Muat Ulang Data

            </button>

          </div>

        </header>


        {/* ==================================================
            LOADING
           ================================================== */}

        {loading ? (

          <div
            className="
              flex
              min-h-[45vh]
              items-center
              justify-center
              rounded-3xl
              border
              border-slate-200
              bg-white
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
                  h-7
                  w-7
                  animate-spin
                  text-emerald-600
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Memuat Kekuatan Tim...
              </p>

            </div>

          </div>

        ) : error ? (

          <div
            className="
              rounded-3xl
              border
              border-red-200
              bg-red-50
              p-6
              text-sm
              text-red-700
            "
          >

            {error}

          </div>

        ) : (

          <>

            {/* ==================================================
                TOP STRENGTH
               ================================================== */}

            <section
              className="
                rounded-3xl
                border
                border-emerald-100
                bg-emerald-50/60
                p-5
                shadow-sm
              "
            >

              <div
                className="
                  grid
                  gap-4
                  lg:grid-cols-[1fr_auto]
                  lg:items-center
                "
              >

                <div>

                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-emerald-600
                    "
                  >
                    Kekuatan Paling Menonjol
                  </p>


                  <h2
                    className="
                      mt-2
                      text-2xl
                      font-black
                      text-slate-900
                    "
                  >

                    {topStrength?.label ||
                      "Belum tersedia"}

                  </h2>


                  <p
                    className="
                      mt-2
                      max-w-3xl
                      text-sm
                      leading-6
                      text-slate-600
                    "
                  >
                    Aspek dengan performa tertinggi
                    berdasarkan data analisis tim yang
                    tersedia pada sistem.
                  </p>

                </div>


                <div
                  className="
                    rounded-2xl
                    bg-white
                    px-7
                    py-4
                    text-center
                    shadow-sm
                  "
                >

                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-400
                    "
                  >
                    Average
                  </p>


                  <p
                    className="
                      mt-1
                      text-4xl
                      font-black
                      text-emerald-600
                    "
                  >
                    {formatNumber(
                      topStrength?.average
                    )}
                  </p>

                </div>

              </div>

            </section>


            {/* ==================================================
                SUMMARY STATUS
               ================================================== */}

            <section
              className="
                grid
                gap-4
                md:grid-cols-3
              "
            >

              <div
                className="
                  rounded-2xl
                  border
                  border-emerald-100
                  bg-emerald-50/60
                  p-5
                "
              >

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-emerald-600
                  "
                >
                  Kekuatan
                </p>

                <p
                  className="
                    mt-2
                    text-3xl
                    font-black
                    text-slate-900
                  "
                >
                  {strengths.length}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  aspek dengan skor ≥ 80
                </p>

              </div>


              <div
                className="
                  rounded-2xl
                  border
                  border-amber-100
                  bg-amber-50/60
                  p-5
                "
              >

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-amber-600
                  "
                >
                  Pengembangan
                </p>

                <p
                  className="
                    mt-2
                    text-3xl
                    font-black
                    text-slate-900
                  "
                >
                  {development.length}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  aspek pada rentang 70–79
                </p>

              </div>


              <div
                className="
                  rounded-2xl
                  border
                  border-red-100
                  bg-red-50/60
                  p-5
                "
              >

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-red-600
                  "
                >
                  Perhatian
                </p>

                <p
                  className="
                    mt-2
                    text-3xl
                    font-black
                    text-slate-900
                  "
                >
                  {attention.length}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  aspek dengan skor &lt; 70
                </p>

              </div>

            </section>


            {/* ==================================================
                STRENGTH DETAIL
               ================================================== */}

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
                    bg-emerald-50
                    text-emerald-600
                  "
                >

                  <TrendingUp
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
                    Detail Kekuatan
                  </h2>

                  <p
                    className="
                      text-sm
                      text-slate-400
                    "
                  >
                    Perbandingan aspek yang menjadi
                    kekuatan utama tim.
                  </p>

                </div>

              </div>


              {strengths.length === 0 ? (

                <div
                  className="
                    rounded-2xl
                    bg-slate-50
                    p-8
                    text-center
                    text-sm
                    text-slate-500
                  "
                >
                  Belum ada aspek yang masuk kategori
                  kekuatan.
                </div>

              ) : (

                <div
                  className="
                    grid
                    gap-4
                    md:grid-cols-2
                    xl:grid-cols-3
                  "
                >

                  {strengths.map(
                    function(item, index) {

                      return (

                        <StrengthCard
                          key={
                            item.key ||
                            item.label ||
                            index
                          }
                          item={
                            item
                          }
                          rank={
                            index + 1
                          }
                        />

                      );

                    }
                  )}

                </div>

              )}

            </section>


            {/* ==================================================
                DEVELOPMENT + ATTENTION
               ================================================== */}

            <div
              className="
                grid
                gap-5
                lg:grid-cols-2
              "
            >

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
                      bg-amber-50
                      text-amber-600
                    "
                  >

                    <Target
                      className="
                        h-5
                        w-5
                      "
                    />

                  </div>


                  <div>

                    <h2
                      className="
                        text-lg
                        font-black
                        text-slate-900
                      "
                    >
                      Area Pengembangan
                    </h2>

                    <p
                      className="
                        text-xs
                        text-slate-400
                      "
                    >
                      Aspek yang masih membutuhkan
                      penguatan.
                    </p>

                  </div>

                </div>


                {development.length === 0 ? (

                  <div
                    className="
                      rounded-2xl
                      bg-slate-50
                      p-6
                      text-center
                      text-sm
                      text-slate-500
                    "
                  >
                    Tidak ada area pengembangan
                    yang teridentifikasi.
                  </div>

                ) : (

                  <div
                    className="
                      space-y-3
                    "
                  >

                    {development.map(
                      function(item, index) {

                        return (

                          <DevelopmentCard
                            key={
                              item.key ||
                              item.label ||
                              index
                            }
                            item={
                              item
                            }
                          />

                        );

                      }
                    )}

                  </div>

                )}

              </section>


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

                    <AlertTriangle
                      className="
                        h-5
                        w-5
                      "
                    />

                  </div>


                  <div>

                    <h2
                      className="
                        text-lg
                        font-black
                        text-slate-900
                      "
                    >
                      Area Perhatian
                    </h2>

                    <p
                      className="
                        text-xs
                        text-slate-400
                      "
                    >
                      Aspek yang membutuhkan perhatian
                      lebih lanjut.
                    </p>

                  </div>

                </div>


                {attention.length === 0 ? (

                  <div
                    className="
                      rounded-2xl
                      bg-emerald-50
                      p-6
                      text-center
                      text-sm
                      text-emerald-700
                    "
                  >
                    Tidak ada aspek yang masuk
                    kategori perhatian.
                  </div>

                ) : (

                  <div
                    className="
                      space-y-3
                    "
                  >

                    {attention.map(
                      function(item, index) {

                        return (

                          <AttentionCard
                            key={
                              item.key ||
                              item.label ||
                              index
                            }
                            item={
                              item
                            }
                          />

                        );

                      }
                    )}

                  </div>

                )}

              </section>

            </div>


            {/* ==================================================
                SYSTEM NOTE
               ================================================== */}

            <section
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
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
                  Data pada halaman ini berasal dari
                  agregasi Leadership Assessment sistem.
                  Klasifikasi kekuatan, pengembangan,
                  dan perhatian mengikuti aturan analisis
                  tim yang tersedia pada backend.
                </p>

              </div>

            </section>

          </>

        )}

      </div>

    </div>

  );

}