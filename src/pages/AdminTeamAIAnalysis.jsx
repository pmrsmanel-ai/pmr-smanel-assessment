import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  useNavigate,
} from "react-router-dom";

import {
  getTeamAnalysis,
} from "../api/api";

import TeamAINavigation from "../components/TeamAINavigation";


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

  return String(profile);

}


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
        p-4
        shadow-sm
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

        <div>

          <div
            className="
              text-[11px]
              font-semibold
              text-slate-500
            "
          >
            {label}
          </div>

          <div
            className="
              mt-1
              text-2xl
              font-black
              text-slate-900
            "
          >
            {formatScore(value)}
          </div>

          <div
            className="
              mt-1
              text-[10px]
              text-slate-400
            "
          >
            {description}
          </div>

        </div>


        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-red-50
            text-red-600
          "
        >

          <Icon
            className="h-4 w-4"
          />

        </div>

      </div>

    </div>
  );

}


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
        safeNumber(average)
      )
    );


  return (
    <div
      className="
        rounded-xl
        border
        border-slate-100
        bg-slate-50
        p-3.5
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
            text-xs
            font-semibold
            text-slate-700
          "
        >
          {label}
        </div>

        <div
          className="
            text-sm
            font-black
            text-slate-900
          "
        >
          {formatScore(average)}
        </div>

      </div>


      <div
        className="
          mt-2.5
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
          mt-1.5
          flex
          justify-between
          text-[9px]
          text-slate-400
        "
      >

        <span>
          Terendah:{" "}
          {formatScore(lowest)}
        </span>

        <span>
          Tertinggi:{" "}
          {formatScore(highest)}
        </span>

      </div>

    </div>
  );

}


function DistributionCard({
  item,
}) {

  return (
    <div
      className="
        rounded-xl
        border
        border-slate-100
        bg-slate-50
        p-3
      "
    >

      <div
        className="
          text-[10px]
          font-semibold
          text-slate-500
        "
      >
        {item?.label}
      </div>

      <div
        className="
          mt-1
          text-xl
          font-black
          text-slate-900
        "
      >
        {safeNumber(item?.count)}
      </div>

      <div
        className="
          mt-0.5
          text-[9px]
          text-slate-400
        "
      >
        peserta
      </div>

    </div>
  );

}


export default function AdminTeamAIAnalysis() {

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
        result.data || {}
      );

    } catch (err) {

      console.error(
        "TEAM ANALYSIS ERROR:",
        err
      );

      setError(
        err?.message ||
        "Gagal mengambil analisis tim."
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


  const summary =
    data?.participant_summary || {};


  const overview =
    data?.score_overview || {};


  const distribution =
    data?.score_distribution || {};


  const profiles =
    data?.profile_distribution || [];


  const potentials =
    data?.potential_distribution || [];


  const teamMap =
    data?.team_map || {};


  const completionPercentage =
    summary.total > 0
      ? (
          summary.completed /
          summary.total
        ) * 100
      : 0;


  const strongestComponents =
    useMemo(
      function() {

        return (
          teamMap?.strengths ||
          []
        ).slice(
          0,
          3
        );

      },
      [
        teamMap,
      ]
    );


  const developmentComponents =
    useMemo(
      function() {

        return (
          teamMap?.development ||
          []
        ).slice(
          0,
          3
        );

      },
      [
        teamMap,
      ]
    );


  const distributionItems =
    Object.values(
      distribution
    );


  const topProfile =
    profiles[0];


  const topPotential =
    potentials[0];


  if (loading) {

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
                  h-7
                  w-7
                  animate-spin
                  text-red-600
                "
              />

              <div
                className="
                  mt-3
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Memuat Executive Summary...
              </div>

              <div
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Mengambil data analisis tim
              </div>

            </div>

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

              <AlertTriangle
                className="h-5 w-5"
              />

              <div
                className="
                  text-sm
                  font-bold
                "
              >
                Gagal mengambil Executive Summary
              </div>

            </div>


            <div
              className="
                mt-2
                text-xs
                leading-5
                text-red-600
              "
            >
              {error}
            </div>


            <button
              type="button"
              onClick={
                function() {
                  loadAnalysis();
                }
              }
              className="
                mt-4
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


  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        px-3
        py-4
        sm:px-5
        sm:py-5
      "
    >

      <div
        className="
          mx-auto
          w-full
          max-w-7xl
        "
      >

        <TeamAINavigation />


        {/* HEADER */}

        <header
          className="
            mt-4
            rounded-3xl
            bg-red-600
            px-5
            py-5
            text-white
            shadow-sm
            sm:px-6
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

            <div>

              <div
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-red-100
                "
              >
                PMR SMANEL • AI LEADERSHIP
              </div>


              <h1
                className="
                  mt-1.5
                  text-2xl
                  font-black
                  tracking-tight
                  sm:text-3xl
                "
              >
                Executive Summary
              </h1>


              <p
                className="
                  mt-1.5
                  max-w-2xl
                  text-xs
                  leading-5
                  text-red-100
                "
              >
                Ringkasan kondisi tim berdasarkan hasil
                Leadership Assessment dan analisis AI.
              </p>

            </div>


            <button
              type="button"
              onClick={
                function() {
                  loadAnalysis(true);
                }
              }
              disabled={refreshing}
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
                font-bold
                text-red-600
                shadow-sm
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


        {/* EXECUTIVE SUMMARY */}

        <section
          className="
            mt-4
            grid
            gap-4
            lg:grid-cols-[1.35fr_1fr]
          "
        >

          <div
            className="
              grid
              gap-3
              sm:grid-cols-2
            "
          >

            <ScoreCard
              label="Total Peserta"
              value={summary.total}
              icon={Users}
              description="Peserta terdaftar"
            />

            <ScoreCard
              label="Assessment Selesai"
              value={summary.completed}
              icon={CheckCircle2}
              description={`
                ${formatPercent(
                  completionPercentage
                )} dari total peserta
              `}
            />

            <ScoreCard
              label="Belum Selesai"
              value={summary.incomplete}
              icon={Activity}
              description="Belum masuk analisis"
            />

            <ScoreCard
              label="Rata-rata Final"
              value={
                overview
                  ?.final_score
                  ?.average
              }
              icon={TrendingUp}
              description="Rata-rata final score"
            />

          </div>


          <div
            className="
              rounded-2xl
              border
              border-red-100
              bg-gradient-to-br
              from-red-50
              to-white
              p-5
              shadow-sm
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
                      font-black
                      text-slate-900
                    "
                  >
                    AI Leadership Analysis
                  </div>

                  <div
                    className="
                      mt-0.5
                      text-[10px]
                      text-slate-400
                    "
                  >
                    Insight lanjutan kondisi tim
                  </div>

                </div>

              </div>


              <button
                type="button"
                onClick={
                  function() {
                    navigate(
                      "/admin/analisis-tim/ai"
                    );
                  }
                }
                className="
                  rounded-lg
                  bg-red-600
                  px-3
                  py-2
                  text-[10px]
                  font-black
                  text-white
                  hover:bg-red-700
                "
              >
                Buka AI
              </button>

            </div>


            <div
              className="
                mt-4
                grid
                gap-2
                sm:grid-cols-3
              "
            >

              <div
                className="
                  rounded-xl
                  bg-white
                  p-3
                "
              >

                <div
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Kekuatan
                </div>

                <div
                  className="
                    mt-1
                    truncate
                    text-xs
                    font-black
                    text-emerald-700
                  "
                >
                  {
                    strongestComponents[0]
                      ?.label ||
                    "-"
                  }
                </div>

              </div>


              <div
                className="
                  rounded-xl
                  bg-white
                  p-3
                "
              >

                <div
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Pengembangan
                </div>

                <div
                  className="
                    mt-1
                    truncate
                    text-xs
                    font-black
                    text-amber-700
                  "
                >
                  {
                    developmentComponents[0]
                      ?.label ||
                    "-"
                  }
                </div>

              </div>


              <div
                className="
                  rounded-xl
                  bg-white
                  p-3
                "
              >

                <div
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Potensi
                </div>

                <div
                  className="
                    mt-1
                    truncate
                    text-xs
                    font-black
                    text-blue-700
                  "
                >
                  {
                    topPotential?.status ||
                    "-"
                  }
                </div>

              </div>

            </div>


            <p
              className="
                mt-4
                text-xs
                leading-5
                text-slate-600
              "
            >
              Hasil AI dapat digunakan untuk membaca
              kekuatan, leadership, talent mapping,
              gap tim, struktur, insight, dan pembinaan.
            </p>

          </div>

        </section>


        {/* SCORE OVERVIEW */}

        <section
          className="
            mt-4
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
                  font-black
                  text-slate-900
                "
              >
                Team Score Overview
              </div>

              <div
                className="
                  mt-0.5
                  text-[10px]
                  text-slate-400
                "
              >
                Ringkasan performa seluruh peserta.
              </div>

            </div>


            <div
              className="
                inline-flex
                w-fit
                items-center
                gap-1.5
                rounded-full
                bg-emerald-50
                px-3
                py-1.5
                text-[10px]
                font-bold
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
              mt-4
              grid
              gap-3
              md:grid-cols-2
              xl:grid-cols-3
            "
          >

            <ComponentScoreRow
              label="Personality"
              {...(
                overview.personality ||
                {}
              )}
            />

            <ComponentScoreRow
              label="Competency"
              {...(
                overview.competency ||
                {}
              )}
            />

            <ComponentScoreRow
              label="Situational Judgment"
              {...(
                overview.sjt ||
                {}
              )}
            />

            <ComponentScoreRow
              label="Leadership Challenge"
              {...(
                overview.challenge ||
                {}
              )}
            />

            <ComponentScoreRow
              label="Objective Score"
              {...(
                overview.objective ||
                {}
              )}
            />

            <ComponentScoreRow
              label="Final Score"
              {...(
                overview.final_score ||
                {}
              )}
            />

          </div>

        </section>


        {/* STRENGTH + DEVELOPMENT */}

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
              rounded-2xl
              border
              border-emerald-100
              bg-emerald-50/50
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
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-emerald-600
                "
              >

                <TrendingUp
                  className="h-4 w-4"
                />

              </div>


              <div>

                <div
                  className="
                    text-sm
                    font-black
                    text-slate-900
                  "
                >
                  Kekuatan Tim
                </div>

                <div
                  className="
                    text-[10px]
                    text-slate-400
                  "
                >
                  Aspek dengan performa tertinggi
                </div>

              </div>

            </div>


            <div
              className="
                mt-4
                space-y-2
              "
            >

              {strongestComponents.length === 0 ? (

                <div
                  className="
                    rounded-xl
                    bg-white/80
                    p-4
                    text-xs
                    text-slate-400
                  "
                >
                  Belum tersedia.
                </div>

              ) : (

                strongestComponents.map(
                  function(item) {

                    return (
                      <div
                        key={item.key}
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                          rounded-xl
                          bg-white
                          px-4
                          py-3
                        "
                      >

                        <span
                          className="
                            text-xs
                            font-bold
                            text-emerald-800
                          "
                        >
                          {item.label}
                        </span>

                        <span
                          className="
                            text-sm
                            font-black
                            text-emerald-700
                          "
                        >
                          {formatScore(
                            item.average
                          )}
                        </span>

                      </div>
                    );

                  }
                )

              )}

            </div>

          </div>


          <div
            className="
              rounded-2xl
              border
              border-amber-100
              bg-amber-50/50
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
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-amber-600
                "
              >

                <Target
                  className="h-4 w-4"
                />

              </div>


              <div>

                <div
                  className="
                    text-sm
                    font-black
                    text-slate-900
                  "
                >
                  Area Pengembangan
                </div>

                <div
                  className="
                    text-[10px]
                    text-slate-400
                  "
                >
                  Aspek yang membutuhkan perhatian
                </div>

              </div>

            </div>


            <div
              className="
                mt-4
                space-y-2
              "
            >

              {developmentComponents.length === 0 ? (

                <div
                  className="
                    rounded-xl
                    bg-white/80
                    p-4
                    text-xs
                    text-slate-400
                  "
                >
                  Belum tersedia.
                </div>

              ) : (

                developmentComponents.map(
                  function(item) {

                    return (
                      <div
                        key={item.key}
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                          rounded-xl
                          bg-white
                          px-4
                          py-3
                        "
                      >

                        <span
                          className="
                            text-xs
                            font-bold
                            text-amber-800
                          "
                        >
                          {item.label}
                        </span>

                        <span
                          className="
                            text-sm
                            font-black
                            text-amber-700
                          "
                        >
                          {formatScore(
                            item.average
                          )}
                        </span>

                      </div>
                    );

                  }
                )

              )}

            </div>

          </div>

        </section>


        {/* DISTRIBUTION + PROFILE + POTENTIAL */}

        <section
          className="
            mt-4
            grid
            gap-4
            lg:grid-cols-3
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
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                "
              >

                <BarChart3
                  className="h-4 w-4"
                />

              </div>


              <div>

                <div
                  className="
                    text-sm
                    font-black
                    text-slate-900
                  "
                >
                  Distribusi Final Score
                </div>

                <div
                  className="
                    text-[10px]
                    text-slate-400
                  "
                >
                  Sebaran peserta
                </div>

              </div>

            </div>


            <div
              className="
                mt-4
                grid
                grid-cols-2
                gap-2
              "
            >

              {distributionItems.length === 0 ? (

                <div
                  className="
                    col-span-2
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

                distributionItems.map(
                  function(item) {

                    return (
                      <DistributionCard
                        key={item.label}
                        item={item}
                      />
                    );

                  }
                )

              )}

            </div>

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
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-purple-50
                  text-purple-600
                "
              >

                <Users
                  className="h-4 w-4"
                />

              </div>


              <div>

                <div
                  className="
                    text-sm
                    font-black
                    text-slate-900
                  "
                >
                  Distribusi Profil
                </div>

                <div
                  className="
                    text-[10px]
                    text-slate-400
                  "
                >
                  Profil kepemimpinan
                </div>

              </div>

            </div>


            <div
              className="
                mt-4
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

                profiles.slice(
                  0,
                  5
                ).map(
                  function(item) {

                    const percent =
                      summary.completed > 0
                        ? (
                            item.count /
                            summary.completed
                          ) * 100
                        : 0;


                    return (
                      <div
                        key={item.profile}
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
                              font-bold
                              text-slate-700
                            "
                          >
                            {getProfileLabel(
                              item.profile
                            )}
                          </span>

                          <span
                            className="
                              font-black
                              text-slate-900
                            "
                          >
                            {item.count}
                          </span>

                        </div>


                        <div
                          className="
                            mt-1.5
                            h-1.5
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


            {topProfile && (
              <div
                className="
                  mt-4
                  rounded-xl
                  bg-purple-50
                  px-3
                  py-2.5
                  text-[10px]
                  text-purple-700
                "
              >
                Profil dominan:{" "}
                <span
                  className="font-black"
                >
                  {getProfileLabel(
                    topProfile.profile
                  )}
                </span>
              </div>
            )}

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
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-50
                  text-emerald-600
                "
              >

                <Brain
                  className="h-4 w-4"
                />

              </div>


              <div>

                <div
                  className="
                    text-sm
                    font-black
                    text-slate-900
                  "
                >
                  Potensi Kepemimpinan
                </div>

                <div
                  className="
                    text-[10px]
                    text-slate-400
                  "
                >
                  Status potensi peserta
                </div>

              </div>

            </div>


            <div
              className="
                mt-4
                space-y-2
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

                potentials.slice(
                  0,
                  5
                ).map(
                  function(item) {

                    return (
                      <div
                        key={item.status}
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                          rounded-xl
                          border
                          border-slate-100
                          bg-slate-50
                          px-3
                          py-2.5
                        "
                      >

                        <span
                          className="
                            text-xs
                            font-bold
                            text-slate-700
                          "
                        >
                          {item.status}
                        </span>

                        <span
                          className="
                            text-sm
                            font-black
                            text-slate-900
                          "
                        >
                          {item.count}
                        </span>

                      </div>
                    );

                  }
                )

              )}

            </div>


            {topPotential && (
              <div
                className="
                  mt-4
                  rounded-xl
                  bg-emerald-50
                  px-3
                  py-2.5
                  text-[10px]
                  text-emerald-700
                "
              >
                Status dominan:{" "}
                <span
                  className="font-black"
                >
                  {topPotential.status}
                </span>
              </div>
            )}

          </div>

        </section>


      </div>

    </div>
  );

}