import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  RefreshCw,
  Target,
  UserRound,
  Zap,
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
      Object.prototype.hasOwnProperty.call(
        object,
        key
      ) &&
      object[key] !== null &&
      object[key] !== undefined &&
      object[key] !== ""
    ) {
      return object[key];
    }

  }

  return fallback;
}


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
    Number.isNaN(number)
  ) {
    return String(value);
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2);
}


function normalizeActionItem(
  item,
  index
) {

  if (
    typeof item === "string"
  ) {

    return {
      key:
        `action-${index}`,
      title:
        item,
      description:
        "",
      priority:
        null,
      target:
        "",
      timeline:
        "",
      owner:
        "",
      indicator:
        "",
      status:
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
      `action-${index}`,

    title:
      firstValue(
        object,
        [
          "title",
          "name",
          "action",
          "recommendation",
          "label",
        ],
        `Tindakan ${index + 1}`
      ),

    description:
      firstValue(
        object,
        [
          "description",
          "summary",
          "detail",
          "explanation",
          "reason",
        ],
        ""
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

    target:
      firstValue(
        object,
        [
          "target",
          "goal",
          "objective",
          "sasaran",
        ],
        ""
      ),

    timeline:
      firstValue(
        object,
        [
          "timeline",
          "duration",
          "deadline",
          "period",
          "timeframe",
          "time_frame",
        ],
        ""
      ),

    owner:
      firstValue(
        object,
        [
          "owner",
          "pic",
          "person_in_charge",
          "personInCharge",
          "responsible",
          "responsibility",
        ],
        ""
      ),

    indicator:
      firstValue(
        object,
        [
          "indicator",
          "success_indicator",
          "successIndicator",
          "metric",
          "measurement",
          "kpi",
        ],
        ""
      ),

    status:
      firstValue(
        object,
        [
          "status",
          "progress",
          "state",
        ],
        ""
      ),

  };

}


function normalizeActions(
  data
) {

  const sources = [
    data?.development_actions,
    data?.developmentActions,
    data?.action_plan,
    data?.actionPlan,
    data?.action_plans,
    data?.actionPlans,
    data?.coaching_plan,
    data?.coachingPlan,
    data?.recommendations,
    data?.recommendation,
    data?.follow_up,
    data?.followUp,
    data?.development_recommendations,
    data?.developmentRecommendations,
  ];

  const source =
    sources.find(
      (item) =>
        Array.isArray(item) ||
        (
          item &&
          typeof item === "object"
        )
    );

  if (!source) {
    return [];
  }


  if (
    Array.isArray(source)
  ) {
    return source.map(
      normalizeActionItem
    );
  }


  const nested =
    [
      source.items,
      source.actions,
      source.recommendations,
      source.plans,
      source.priorities,
      source.programs,
    ].find(
      (item) =>
        Array.isArray(item)
    );

  if (nested) {
    return nested.map(
      normalizeActionItem
    );
  }


  return Object.entries(
    source
  ).map(
    ([key, value], index) => {

      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {

        return normalizeActionItem(
          {
            ...value,
            key:
              value.key ||
              key,
          },
          index
        );

      }

      return normalizeActionItem(
        {
          key,
          title:
            key.replace(
              /_/g,
              " "
            ),
          description:
            value,
        },
        index
      );

    }
  );

}


function getPriority(
  item
) {

  const value =
    String(
      item.priority ||
      ""
    ).toLowerCase();

  if (
    value.includes("tinggi") ||
    value.includes("high") ||
    value.includes("critical") ||
    value.includes("urgent")
  ) {
    return "high";
  }

  if (
    value.includes("sedang") ||
    value.includes("medium") ||
    value.includes("moderate")
  ) {
    return "medium";
  }

  return "low";
}


function PriorityBadge({
  priority,
}) {

  if (
    priority === "high"
  ) {

    return (
      <span
        className="
          inline-flex
          items-center
          rounded-full
          bg-red-100
          px-2.5
          py-1
          text-[9px]
          font-black
          uppercase
          tracking-wider
          text-red-700
        "
      >
        Prioritas Tinggi
      </span>
    );

  }

  if (
    priority === "medium"
  ) {

    return (
      <span
        className="
          inline-flex
          items-center
          rounded-full
          bg-amber-100
          px-2.5
          py-1
          text-[9px]
          font-black
          uppercase
          tracking-wider
          text-amber-700
        "
      >
        Prioritas Sedang
      </span>
    );

  }

  return (
    <span
      className="
        inline-flex
        items-center
        rounded-full
        bg-emerald-100
        px-2.5
        py-1
        text-[9px]
        font-black
        uppercase
        tracking-wider
        text-emerald-700
      "
    >
      Prioritas Rendah
    </span>
  );
}


function ActionCard({
  item,
}) {

  const priority =
    getPriority(item);

  const styles =
    priority === "high"
      ? {
          border:
            "border-red-100",
          background:
            "bg-red-50/60",
          icon:
            "bg-white text-red-600",
          accent:
            "text-red-600",
        }
      : priority === "medium"
        ? {
            border:
              "border-amber-100",
            background:
              "bg-amber-50/60",
            icon:
              "bg-white text-amber-600",
            accent:
              "text-amber-600",
          }
        : {
            border:
              "border-emerald-100",
            background:
              "bg-emerald-50/60",
            icon:
              "bg-white text-emerald-600",
            accent:
              "text-emerald-600",
          };

  return (
    <article
      className={`
        rounded-2xl
        border
        p-4
        ${styles.border}
        ${styles.background}
      `}
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
            flex
            min-w-0
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
              ${styles.icon}
            `}
          >

            <ClipboardCheck
              className="h-5 w-5"
            />

          </div>


          <div
            className="
              min-w-0
            "
          >

            <h3
              className="
                text-sm
                font-black
                leading-5
                text-slate-900
              "
            >
              {item.title}
            </h3>

            <div
              className="
                mt-2
              "
            >
              <PriorityBadge
                priority={priority}
              />
            </div>

          </div>

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


      <div
        className="
          mt-4
          grid
          gap-2
          sm:grid-cols-2
        "
      >

        {item.target && (
          <div
            className="
              rounded-xl
              bg-white/80
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
                className={`
                  h-4
                  w-4
                  ${styles.accent}
                `}
              />

              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Target
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
              {item.target}
            </p>

          </div>
        )}


        {item.timeline && (
          <div
            className="
              rounded-xl
              bg-white/80
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

              <Clock3
                className={`
                  h-4
                  w-4
                  ${styles.accent}
                `}
              />

              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Timeline
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
              {item.timeline}
            </p>

          </div>
        )}


        {item.owner && (
          <div
            className="
              rounded-xl
              bg-white/80
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

              <UserRound
                className={`
                  h-4
                  w-4
                  ${styles.accent}
                `}
              />

              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                PIC
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
              {item.owner}
            </p>

          </div>
        )}


        {item.status && (
          <div
            className="
              rounded-xl
              bg-white/80
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

              <Zap
                className={`
                  h-4
                  w-4
                  ${styles.accent}
                `}
              />

              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Status
              </p>

            </div>

            <p
              className="
                mt-1
                text-xs
                font-bold
                leading-5
                text-slate-700
              "
            >
              {item.status}
            </p>

          </div>
        )}

      </div>


      {item.indicator && (
        <div
          className="
            mt-3
            rounded-xl
            border
            border-white/80
            bg-white/70
            px-3
            py-2.5
          "
        >

          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-wider
              text-slate-400
            "
          >
            Indikator Keberhasilan
          </p>

          <p
            className="
              mt-1
              text-xs
              leading-5
              text-slate-700
            "
          >
            {item.indicator}
          </p>

        </div>
      )}

    </article>
  );
}


export default function AdminTeamAIAction() {

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
        "TEAM AI ACTION:",
        result
      );

      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Gagal mengambil rencana pembinaan."
        );

      }

      setData(
        result.data || {}
      );

    } catch (err) {

      console.error(
        "TEAM AI ACTION ERROR:",
        err
      );

      setError(
        err?.message ||
        "Gagal mengambil rencana pembinaan."
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


  const actions =
    useMemo(
      function() {

        return normalizeActions(
          data
        )
          .slice()
          .sort(
            function(a, b) {

              const weight = {
                high: 3,
                medium: 2,
                low: 1,
              };

              return (
                (
                  weight[
                    getPriority(b)
                  ] ||
                  0
                ) -
                (
                  weight[
                    getPriority(a)
                  ] ||
                  0
                )
              );

            }
          );

      },
      [data]
    );


  const high =
    actions.filter(
      (item) =>
        getPriority(item) ===
        "high"
    ).length;


  const medium =
    actions.filter(
      (item) =>
        getPriority(item) ===
        "medium"
    ).length;


  const low =
    actions.filter(
      (item) =>
        getPriority(item) ===
        "low"
    ).length;


  const summary =
    firstValue(
      data,
      [
        "action_summary",
        "actionSummary",
        "coaching_summary",
        "coachingSummary",
        "development_summary",
        "developmentSummary",
        "summary",
      ],
      ""
    );


  const nextStep =
    firstValue(
      data,
      [
        "next_step",
        "nextStep",
        "immediate_action",
        "immediateAction",
        "priority_action",
        "priorityAction",
      ],
      ""
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
                Memuat Pembinaan...
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

                  <ClipboardCheck
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
                    Pembinaan
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
                Rencana tindak lanjut pembinaan berdasarkan
                hasil analisis AI, prioritas kebutuhan tim,
                dan area pengembangan yang telah teridentifikasi.
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
              Program Pembinaan
            </p>

            <p
              className="
                mt-3
                text-3xl
                font-black
                text-slate-900
              "
            >
              {actions.length}
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

              <AlertTriangle
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
              {high}
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

            <p
              className="
                text-xs
                font-semibold
                text-amber-700
              "
            >
              Prioritas Sedang
            </p>

            <p
              className="
                mt-3
                text-3xl
                font-black
                text-amber-700
              "
            >
              {medium}
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

            <p
              className="
                text-xs
                font-semibold
                text-emerald-700
              "
            >
              Prioritas Rendah
            </p>

            <p
              className="
                mt-3
                text-3xl
                font-black
                text-emerald-700
              "
            >
              {low}
            </p>

          </div>

        </section>


        {(summary || nextStep) && (
          <section
            className="
              mt-4
              grid
              gap-4
              lg:grid-cols-2
            "
          >

            {summary && (
              <div
                className="
                  rounded-3xl
                  border
                  border-blue-100
                  bg-blue-50/60
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

                  <Target
                    className="
                      mt-0.5
                      h-5
                      w-5
                      shrink-0
                      text-blue-600
                    "
                  />

                  <div>

                    <p
                      className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-wider
                        text-blue-600
                      "
                    >
                      Ringkasan Pembinaan
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

              </div>
            )}


            {nextStep && (
              <div
                className="
                  rounded-3xl
                  border
                  border-red-100
                  bg-red-50/60
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

                  <Zap
                    className="
                      mt-0.5
                      h-5
                      w-5
                      shrink-0
                      text-red-600
                    "
                  />

                  <div>

                    <p
                      className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-wider
                        text-red-600
                      "
                    >
                      Langkah Berikutnya
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
                        text-slate-700
                      "
                    >
                      {nextStep}
                    </p>

                  </div>

                </div>

              </div>
            )}

          </section>
        )}


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

              <ClipboardCheck
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
                Rencana Tindakan Pembinaan
              </h2>

              <p
                className="
                  text-xs
                  text-slate-400
                "
              >
                Prioritas tindakan disusun dari hasil analisis AI.
              </p>

            </div>

          </div>


          {actions.length === 0 ? (

            <div
              className="
                mt-5
                rounded-2xl
                bg-slate-50
                p-8
                text-center
              "
            >

              <ClipboardCheck
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
                Data rencana pembinaan belum tersedia.
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-400
                "
              >
                Halaman akan membaca rekomendasi pembinaan
                secara otomatis dari hasil analisis AI.
              </p>

            </div>

          ) : (

            <div
              className="
                mt-5
                grid
                gap-3
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >

              {actions.map(
                function(item) {

                  return (
                    <ActionCard
                      key={item.key}
                      item={item}
                    />
                  );

                }
              )}

            </div>

          )}

        </section>


        {actions.length > 0 && (
          <section
            className="
              mt-4
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
                items-start
                gap-3
              "
            >

              <CheckCircle2
                className="
                  mt-0.5
                  h-5
                  w-5
                  shrink-0
                  text-emerald-600
                "
              />

              <div>

                <p
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-wider
                    text-emerald-600
                  "
                >
                  Prinsip Pembinaan
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-slate-700
                  "
                >
                  Gunakan prioritas tindakan sebagai panduan
                  pembinaan. Keputusan akhir tetap disesuaikan
                  dengan kondisi nyata peserta dan kebutuhan tim.
                </p>

              </div>

            </div>

          </section>
        )}

      </div>

    </div>
  );
}