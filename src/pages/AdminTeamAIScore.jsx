import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  CheckCircle2,
  RefreshCw,
  Users,
} from "lucide-react";

import TeamAINavigation from "../components/TeamAINavigation";
import {
  getTeamAnalysis,
} from "../api/api";


const SCORE_DEFINITIONS = [
  {
    key: "personality",
    label: "Personality",
  },
  {
    key: "competency",
    label: "Competency",
  },
  {
    key: "sjt",
    label: "Situational Judgment",
  },
  {
    key: "challenge",
    label: "Leadership Challenge",
  },
  {
    key: "objective",
    label: "Objective Score",
  },
  {
    key: "final_score",
    label: "Final Score",
  },
];


function formatNumber(
  value
) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  var number =
    Number(value);

  if (
    Number.isNaN(number)
  ) {
    return String(value);
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2);
}


function getStat(
  overview,
  key
) {

  var stat =
    overview?.[key];

  if (
    stat === null ||
    stat === undefined
  ) {
    return {
      average: null,
      highest: null,
      lowest: null,
    };
  }

  if (
    typeof stat === "number"
  ) {
    return {
      average: stat,
      highest: stat,
      lowest: stat,
    };
  }

  return {
    average:
      stat.average ??
      stat.avg ??
      stat.mean ??
      null,

    highest:
      stat.highest ??
      stat.max ??
      null,

    lowest:
      stat.lowest ??
      stat.min ??
      null,
  };
}


function scorePercentage(
  average,
  key
) {

  var value =
    Number(average);

  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  if (
    key === "personality" ||
    key === "competency"
  ) {
    return Math.max(
      0,
      Math.min(
        100,
        (value / 200) * 100
      )
    );
  }

  if (
    key === "sjt"
  ) {
    return Math.max(
      0,
      Math.min(
        100,
        (value / 100) * 100
      )
    );
  }

  return Math.max(
    0,
    Math.min(
      100,
      value
    )
  );
}


function ScoreCard({
  item,
  stat,
}) {

  var percentage =
    scorePercentage(
      stat.average,
      item.key
    );

  return (
    <div
      className="
        rounded-2xl
        bg-slate-50
        p-4
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >

        <div
          className="
            min-w-0
          "
        >

          <div
            className="
              text-sm
              font-black
              leading-5
              text-slate-900
            "
          >
            {item.label}
          </div>

        </div>

        <div
          className="
            shrink-0
            text-right
            text-lg
            font-black
            text-slate-900
          "
        >
          {formatNumber(
            stat.average
          )}
        </div>

      </div>


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
          gap-3
          text-[10px]
          text-slate-400
        "
      >

        <span>
          Terendah:{" "}
          {formatNumber(
            stat.lowest
          )}
        </span>

        <span>
          Tertinggi:{" "}
          {formatNumber(
            stat.highest
          )}
        </span>

      </div>

    </div>
  );
}


export default function AdminTeamAIScore() {

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

      var result =
        await getTeamAnalysis();

      console.log(
        "TEAM SCORE ANALYSIS:",
        result
      );

      if (
        !result ||
        result.success !== true
      ) {
        throw new Error(
          result?.error?.message ||
          "Gagal mengambil analisis score tim."
        );
      }

      setData(
        result.data ||
        {}
      );

    } catch (err) {

      console.error(
        "TEAM SCORE ANALYSIS ERROR:",
        err
      );

      setError(
        err?.message ||
        "Gagal mengambil analisis score tim."
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


  var summary =
    data?.participant_summary ||
    {};

  var overview =
    data?.score_overview ||
    {};


  var completedPercentage =
    summary.total > 0
      ? (
          Number(
            summary.completed || 0
          ) /
          Number(
            summary.total || 0
          )
        ) *
        100
      : 0;


  var scoreRows =
    useMemo(
      function() {

        return SCORE_DEFINITIONS.map(
          function(item) {

            return {
              ...item,
              stat:
                getStat(
                  overview,
                  item.key
                ),
            };

          }
        );

      },
      [overview]
    );


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
            flex
            min-h-[70vh]
            max-w-7xl
            items-center
            justify-center
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
                text-red-600
              "
            />

            <p
              className="
                mt-3
                text-sm
                font-semibold
                text-slate-600
              "
            >
              Memuat Score Analysis...
            </p>

          </div>

        </div>

      </div>
    );
  }


  if (error) {

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
              mt-5
              rounded-2xl
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

        </div>

      </div>
    );
  }


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

        {/* ==================================================
         * GLOBAL AI NAVIGATION
         * ==================================================
         */}

        <TeamAINavigation />


        {/* ==================================================
         * PAGE HEADER
         * ==================================================
         */}

        <section
          className="
            mt-4
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
                    items-center
                    justify-center
                    rounded-2xl
                    bg-red-50
                    text-red-600
                  "
                >

                  <BarChart3
                    className="h-5 w-5"
                  />

                </div>

                <div>

                  <p
                    className="
                      text-[10px]
                      font-bold
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
                    Score Analysis
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
                Analisis mendalam terhadap skor kepemimpinan
                berdasarkan komponen assessment yang telah
                diselesaikan.
              </p>

            </div>


            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-emerald-50
                  px-3
                  py-2
                  text-[11px]
                  font-bold
                  text-emerald-700
                "
              >

                <CheckCircle2
                  className="h-4 w-4"
                />

                Data Terverifikasi Sistem

              </div>


              <button
                type="button"
                onClick={function() {
                  loadAnalysis(true);
                }}
                disabled={refreshing}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-red-600
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  text-white
                  hover:bg-red-700
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

          </div>

        </section>


        {/* ==================================================
         * KPI
         * ==================================================
         */}

        <section
          className="
            mt-4
            grid
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
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
                items-center
                justify-between
              "
            >

              <span
                className="
                  text-xs
                  font-semibold
                  text-slate-500
                "
              >
                Total Peserta
              </span>

              <Users
                className="
                  h-5
                  w-5
                  text-red-600
                "
              />

            </div>

            <div
              className="
                mt-4
                text-3xl
                font-black
                text-slate-900
              "
            >
              {formatNumber(
                summary.total
              )}
            </div>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              Peserta terdaftar
            </p>

          </div>


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

            <span
              className="
                text-xs
                font-semibold
                text-slate-500
              "
            >
              Assessment Selesai
            </span>

            <div
              className="
                mt-4
                text-3xl
                font-black
                text-slate-900
              "
            >
              {formatNumber(
                summary.completed
              )}
            </div>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              {formatNumber(
                completedPercentage
              )}% dari total peserta
            </p>

          </div>


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

            <span
              className="
                text-xs
                font-semibold
                text-slate-500
              "
            >
              Belum Selesai
            </span>

            <div
              className="
                mt-4
                text-3xl
                font-black
                text-slate-900
              "
            >
              {formatNumber(
                summary.incomplete
              )}
            </div>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              Belum masuk analisis
            </p>

          </div>


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

            <span
              className="
                text-xs
                font-semibold
                text-slate-500
              "
            >
              Rata-rata Final
            </span>

            <div
              className="
                mt-4
                text-3xl
                font-black
                text-slate-900
              "
            >
              {formatNumber(
                overview?.final_score?.average
              )}
            </div>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              Rata-rata final score
            </p>

          </div>

        </section>


        {/* ==================================================
         * SCORE OVERVIEW
         * ==================================================
         */}

        <section
          className="
            mt-4
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
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>

              <h2
                className="
                  text-lg
                  font-black
                  text-slate-900
                "
              >
                Komponen Score Overview
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Ringkasan performa seluruh peserta berdasarkan
                komponen penilaian.
              </p>

            </div>

            <div
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                py-2
                text-xs
                font-semibold
                text-slate-600
              "
            >

              <Users
                className="h-4 w-4"
              />

              Semua Peserta

            </div>

          </div>


          <div
            className="
              mt-5
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-6
            "
          >

            {scoreRows.map(
              function(item) {

                return (
                  <ScoreCard
                    key={item.key}
                    item={item}
                    stat={item.stat}
                  />
                );

              }
            )}

          </div>

        </section>


        {/* ==================================================
         * DISTRIBUTION SNAPSHOT
         * ==================================================
         */}

        <section
          className="
            mt-4
            grid
            gap-4
            lg:grid-cols-2
          "
        >

          <div
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <h2
              className="
                text-lg
                font-black
                text-slate-900
              "
            >
              Distribusi Final Score
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              Jumlah peserta berdasarkan rentang final score.
            </p>


            <div
              className="
                mt-5
                grid
                grid-cols-5
                items-end
                gap-2
              "
            >

              {[
                ["0 - 20", "0_20"],
                ["21 - 40", "21_40"],
                ["41 - 60", "41_60"],
                ["61 - 80", "61_80"],
                ["81 - 100", "81_100"],
              ].map(
                function(item) {

                  var band =
                    data?.score_distribution?.[
                      item[1]
                    ];

                  var count =
                    Number(
                      band?.count || 0
                    );

                  var max =
                    Math.max(
                      ...[
                        "0_20",
                        "21_40",
                        "41_60",
                        "61_80",
                        "81_100",
                      ].map(
                        function(key) {
                          return Number(
                            data?.score_distribution?.[
                              key
                            ]?.count || 0
                          );
                        }
                      ),
                      1
                    );

                  var height =
                    Math.max(
                      8,
                      (count / max) * 100
                    );

                  return (
                    <div
                      key={item[1]}
                      className="
                        flex
                        min-w-0
                        flex-col
                        items-center
                        justify-end
                        gap-2
                      "
                    >

                      <span
                        className="
                          text-xs
                          font-bold
                          text-slate-500
                        "
                      >
                        {count}
                      </span>

                      <div
                        className="
                          flex
                          h-36
                          w-full
                          items-end
                        "
                      >

                        <div
                          className="
                            w-full
                            rounded-t-xl
                            bg-red-500
                          "
                          style={{
                            height:
                              `${height}%`,
                          }}
                        />

                      </div>

                      <span
                        className="
                          text-center
                          text-[9px]
                          font-semibold
                          text-slate-400
                        "
                      >
                        {item[0]}
                      </span>

                    </div>
                  );

                }
              )}

            </div>

          </div>


          <div
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <h2
              className="
                text-lg
                font-black
                text-slate-900
              "
            >
              Distribusi Profil Peserta
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              Sebaran peserta berdasarkan profil kepemimpinan.
            </p>


            <div
              className="
                mt-5
                space-y-3
              "
            >

              {(
                data?.profile_distribution ||
                []
              ).length === 0 ? (

                <div
                  className="
                    rounded-xl
                    bg-slate-50
                    p-5
                    text-sm
                    text-slate-400
                  "
                >
                  Distribusi profil belum tersedia.
                </div>

              ) : (

                (
                  data.profile_distribution
                ).slice(
                  0,
                  6
                ).map(
                  function(item) {

                    var total =
                      Number(
                        summary.completed ||
                        0
                      );

                    var count =
                      Number(
                        item?.count ||
                        0
                      );

                    var percentage =
                      total > 0
                        ? (
                            count /
                            total
                          ) *
                          100
                        : 0;

                    return (
                      <div
                        key={
                          item?.profile ||
                          Math.random()
                        }
                        className="
                          rounded-xl
                          bg-slate-50
                          p-3
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

                          <span
                            className="
                              truncate
                              text-xs
                              font-bold
                              text-slate-700
                            "
                          >
                            {item?.profile ||
                              "UNCLASSIFIED"}
                          </span>

                          <span
                            className="
                              shrink-0
                              text-xs
                              font-black
                              text-slate-900
                            "
                          >
                            {formatNumber(
                              count
                            )}
                          </span>

                        </div>

                        <div
                          className="
                            mt-2
                            h-1.5
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
                            "
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>
                    );

                  }
                )

              )}

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}