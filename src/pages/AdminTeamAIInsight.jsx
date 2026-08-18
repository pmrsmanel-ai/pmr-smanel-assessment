import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import TeamAINavigation from "../components/TeamAINavigation";
import { getTeamAIAnalysis } from "../api/api";


function firstValue(object, keys, fallback = null) {

  if (
    !object ||
    typeof object !== "object"
  ) {
    return fallback;
  }

  for (const key of keys) {

    if (
      Object.prototype.hasOwnProperty.call(object, key) &&
      object[key] !== null &&
      object[key] !== undefined &&
      object[key] !== ""
    ) {
      return object[key];
    }

  }

  return fallback;
}


function toArray(value) {

  if (Array.isArray(value)) {
    return value;
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return Object.entries(value).map(
      ([key, item]) => {

        if (
          item &&
          typeof item === "object" &&
          !Array.isArray(item)
        ) {
          return {
            ...item,
            key:
              item.key ||
              key,
          };
        }

        return {
          key,
          value: item,
          label:
            key.replace(
              /_/g,
              " "
            ),
        };

      }
    );
  }

  return [];
}


function normalizeInsightItem(
  item,
  index
) {

  if (
    typeof item === "string"
  ) {
    return {
      key:
        `insight-${index}`,
      title:
        item,
      description:
        "",
      category:
        "Insight",
      priority:
        null,
      recommendation:
        "",
    };
  }

  const object =
    item || {};

  return {
    key:
      object.key ||
      object.id ||
      object.title ||
      object.name ||
      `insight-${index}`,

    title:
      firstValue(
        object,
        [
          "title",
          "name",
          "insight",
          "headline",
          "label",
        ],
        `Insight ${index + 1}`
      ),

    description:
      firstValue(
        object,
        [
          "description",
          "summary",
          "detail",
          "interpretation",
          "explanation",
          "finding",
        ],
        ""
      ),

    category:
      firstValue(
        object,
        [
          "category",
          "type",
          "area",
          "dimension",
        ],
        "Insight"
      ),

    priority:
      firstValue(
        object,
        [
          "priority",
          "level",
          "severity",
          "risk",
        ]
      ),

    recommendation:
      firstValue(
        object,
        [
          "recommendation",
          "action",
          "recommended_action",
          "recommendedAction",
          "next_step",
          "nextStep",
        ],
        ""
      ),
  };
}


function getInsightSource(
  data
) {

  const sources = [
    data?.ai_insights,
    data?.aiInsights,
    data?.insights,
    data?.team_insights,
    data?.teamInsights,
    data?.key_insights,
    data?.keyInsights,
    data?.findings,
    data?.analysis_insights,
  ];

  return sources.find(
    (item) =>
      Array.isArray(item) ||
      (
        item &&
        typeof item === "object"
      )
  );
}


function getPriorityClass(
  priority
) {

  const value =
    String(
      priority || ""
    ).toLowerCase();

  if (
    value.includes("tinggi") ||
    value.includes("high") ||
    value.includes("critical") ||
    value.includes("urgent")
  ) {
    return {
      wrapper:
        "border-red-100 bg-red-50",
      icon:
        "bg-white text-red-600",
      text:
        "text-red-700",
      label:
        "Prioritas Tinggi",
    };
  }

  if (
    value.includes("sedang") ||
    value.includes("medium") ||
    value.includes("moderate")
  ) {
    return {
      wrapper:
        "border-amber-100 bg-amber-50",
      icon:
        "bg-white text-amber-600",
      text:
        "text-amber-700",
      label:
        "Perlu Perhatian",
    };
  }

  return {
    wrapper:
      "border-emerald-100 bg-emerald-50",
    icon:
      "bg-white text-emerald-600",
    text:
      "text-emerald-700",
    label:
      "Insight",
  };
}


function InsightCard({
  item,
  index,
}) {

  const priority =
    getPriorityClass(
      item.priority
    );

  return (
    <article
      className={`
        rounded-2xl
        border
        p-4
        ${priority.wrapper}
      `}
    >

      <div
        className="
          flex
          items-start
          gap-3
        "
      >

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${priority.icon}
          `}
        >

          {index === 0 ? (
            <Sparkles
              className="h-5 w-5"
            />
          ) : (
            <Lightbulb
              className="h-5 w-5"
            />
          )}

        </div>


        <div
          className="
            min-w-0
            flex-1
          "
        >

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >

            <span
              className={`
                rounded-full
                px-2
                py-1
                text-[9px]
                font-black
                uppercase
                tracking-wider
                ${priority.text}
                bg-white/70
              `}
            >
              {item.category}
            </span>

            {item.priority && (
              <span
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                {priority.label}
              </span>
            )}

          </div>


          <h3
            className="
              mt-2
              text-sm
              font-black
              leading-5
              text-slate-900
            "
          >
            {item.title}
          </h3>

        </div>

      </div>


      {item.description && (
        <p
          className="
            mt-4
            text-xs
            leading-5
            text-slate-600
          "
        >
          {item.description}
        </p>
      )}


      {item.recommendation && (
        <div
          className="
            mt-4
            rounded-xl
            border
            border-white/80
            bg-white/70
            p-3
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
                text-red-600
              "
            />

            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-wider
                text-slate-500
              "
            >
              Rekomendasi
            </p>

          </div>

          <p
            className="
              mt-1
              text-xs
              leading-5
              text-slate-700
            "
          >
            {item.recommendation}
          </p>

        </div>
      )}

    </article>
  );
}


export default function AdminTeamAIInsight() {

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
        await getTeamAIAnalysis();

      console.log(
        "TEAM AI INSIGHT:",
        result
      );

      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Gagal mengambil Insight AI."
        );

      }

      setData(
        result.data || {}
      );

    } catch (err) {

      console.error(
        "TEAM AI INSIGHT ERROR:",
        err
      );

      setError(
        err?.message ||
        "Gagal mengambil Insight AI."
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


  const insights =
    useMemo(
      function() {

        const source =
          getInsightSource(
            data
          );

        return toArray(
          source
        )
          .map(
            normalizeInsightItem
          );

      },
      [data]
    );


  const highPriority =
    insights.filter(
      (item) => {

        const value =
          String(
            item.priority ||
            ""
          ).toLowerCase();

        return (
          value.includes("tinggi") ||
          value.includes("high") ||
          value.includes("critical") ||
          value.includes("urgent")
        );

      }
    ).length;


  const recommendations =
    insights.filter(
      (item) =>
        Boolean(
          item.recommendation
        )
    ).length;


  const summary =
    firstValue(
      data,
      [
        "ai_summary",
        "aiSummary",
        "executive_summary",
        "executiveSummary",
        "summary",
        "overall_insight",
        "overallInsight",
        "interpretation",
      ],
      ""
    );


  const strengths =
    toArray(
      firstValue(
        data,
        [
          "strengths",
          "team_strengths",
          "teamStrengths",
        ],
        []
      )
    );


  const developmentAreas =
    toArray(
      firstValue(
        data,
        [
          "development_areas",
          "developmentAreas",
          "areas_for_development",
          "areasForDevelopment",
        ],
        []
      )
    );


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
                Memuat Insight AI...
              </p>

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

        <TeamAINavigation />


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

                  <Brain
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
                    Insight AI
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
                Temuan utama AI yang membantu membaca kondisi
                tim, peluang pengembangan, dan prioritas
                tindak lanjut.
              </p>

            </div>


            <button
              type="button"
              onClick={function() {
                loadAnalysis(true);
              }}
              disabled={refreshing}
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
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                `}
              />

              Refresh

            </button>

          </div>

        </section>


        <section
          className="
            mt-4
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

            <p
              className="
                text-xs
                font-semibold
                text-slate-500
              "
            >
              Insight Teridentifikasi
            </p>

            <p
              className="
                mt-3
                text-3xl
                font-black
                text-slate-900
              "
            >
              {insights.length}
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
                items-center
                justify-between
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  text-red-600
                "
              >
                Prioritas Tinggi
              </p>

              <AlertCircle
                className="
                  h-5
                  w-5
                  text-red-600
                "
              />

            </div>

            <p
              className="
                mt-3
                text-3xl
                font-black
                text-red-700
              "
            >
              {highPriority}
            </p>

          </div>


          <div
            className="
              rounded-2xl
              border
              border-blue-100
              bg-blue-50
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

              <p
                className="
                  text-xs
                  font-semibold
                  text-blue-700
                "
              >
                Rekomendasi
              </p>

              <Target
                className="
                  h-5
                  w-5
                  text-blue-600
                "
              />

            </div>

            <p
              className="
                mt-3
                text-3xl
                font-black
                text-blue-700
              "
            >
              {recommendations}
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
                items-center
                justify-between
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  text-emerald-700
                "
              >
                Status Analisis
              </p>

              <CheckCircle2
                className="
                  h-5
                  w-5
                  text-emerald-600
                "
              />

            </div>

            <p
              className="
                mt-3
                text-lg
                font-black
                text-emerald-700
              "
            >
              AI Analysis Ready
            </p>

          </div>

        </section>


        {summary && (
          <section
            className="
              mt-4
              rounded-3xl
              border
              border-violet-100
              bg-violet-50/60
              p-5
              shadow-sm
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
                  text-violet-600
                "
              >

                <Sparkles
                  className="h-5 w-5"
                />

              </div>


              <div>

                <p
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-wider
                    text-violet-600
                  "
                >
                  Executive AI Insight
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-slate-700
                  "
                >
                  {summary}
                </p>

              </div>

            </div>

          </section>
        )}


        <section
          className="
            mt-4
            grid
            gap-4
            lg:grid-cols-[1.5fr_1fr]
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
                  bg-red-50
                  text-red-600
                "
              >

                <Lightbulb
                  className="h-5 w-5"
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
                  Temuan Utama AI
                </h2>

                <p
                  className="
                    text-xs
                    text-slate-400
                  "
                >
                  Insight yang dihasilkan dari analisis tim.
                </p>

              </div>

            </div>


            {insights.length === 0 ? (

              <div
                className="
                  mt-5
                  rounded-2xl
                  bg-slate-50
                  p-8
                  text-center
                "
              >

                <Brain
                  className="
                    mx-auto
                    h-7
                    w-7
                    text-slate-300
                  "
                />

                <p
                  className="
                    mt-3
                    text-sm
                    font-bold
                    text-slate-600
                  "
                >
                  Insight AI belum tersedia.
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Halaman akan membaca insight secara otomatis
                  dari response analisis AI.
                </p>

              </div>

            ) : (

              <div
                className="
                  mt-5
                  grid
                  gap-3
                  sm:grid-cols-2
                "
              >

                {insights.map(
                  function(item, index) {

                    return (
                      <InsightCard
                        key={item.key}
                        item={item}
                        index={index}
                      />
                    );

                  }
                )}

              </div>

            )}

          </div>


          <div
            className="
              space-y-4
            "
          >

            <div
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
                  flex
                  items-center
                  gap-3
                "
              >

                <TrendingUp
                  className="
                    h-5
                    w-5
                    text-emerald-600
                  "
                />

                <h2
                  className="
                    text-lg
                    font-black
                    text-slate-900
                  "
                >
                  Kekuatan Tim
                </h2>

              </div>


              {strengths.length === 0 ? (

                <p
                  className="
                    mt-4
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  Belum ada data kekuatan tambahan pada
                  response Insight AI.
                </p>

              ) : (

                <div
                  className="
                    mt-4
                    space-y-2
                  "
                >

                  {strengths.map(
                    function(item, index) {

                      const label =
                        typeof item === "string"
                          ? item
                          : firstValue(
                              item,
                              [
                                "name",
                                "title",
                                "label",
                                "description",
                              ],
                              `Kekuatan ${index + 1}`
                            );

                      return (
                        <div
                          key={
                            `${label}-${index}`
                          }
                          className="
                            flex
                            items-start
                            gap-2
                            rounded-xl
                            bg-white/70
                            px-3
                            py-2.5
                          "
                        >

                          <CheckCircle2
                            className="
                              mt-0.5
                              h-4
                              w-4
                              shrink-0
                              text-emerald-600
                            "
                          />

                          <span
                            className="
                              text-xs
                              leading-5
                              text-slate-700
                            "
                          >
                            {label}
                          </span>

                        </div>
                      );

                    }
                  )}

                </div>

              )}

            </div>


            <div
              className="
                rounded-3xl
                border
                border-amber-100
                bg-amber-50/60
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

                <TrendingUp
                  className="
                    h-5
                    w-5
                    rotate-180
                    text-amber-600
                  "
                />

                <h2
                  className="
                    text-lg
                    font-black
                    text-slate-900
                  "
                >
                  Area Pengembangan
                </h2>

              </div>


              {developmentAreas.length === 0 ? (

                <p
                  className="
                    mt-4
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  Belum ada data area pengembangan tambahan
                  pada response Insight AI.
                </p>

              ) : (

                <div
                  className="
                    mt-4
                    space-y-2
                  "
                >

                  {developmentAreas.map(
                    function(item, index) {

                      const label =
                        typeof item === "string"
                          ? item
                          : firstValue(
                              item,
                              [
                                "name",
                                "title",
                                "label",
                                "description",
                              ],
                              `Area ${index + 1}`
                            );

                      return (
                        <div
                          key={
                            `${label}-${index}`
                          }
                          className="
                            flex
                            items-start
                            gap-2
                            rounded-xl
                            bg-white/70
                            px-3
                            py-2.5
                          "
                        >

                          <AlertCircle
                            className="
                              mt-0.5
                              h-4
                              w-4
                              shrink-0
                              text-amber-600
                            "
                          />

                          <span
                            className="
                              text-xs
                              leading-5
                              text-slate-700
                            "
                          >
                            {label}
                          </span>

                        </div>
                      );

                    }
                  )}

                </div>

              )}

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}