import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Flag,
  ListChecks,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Target,
  Zap,
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


function toArray(
  value
) {

  if (
    Array.isArray(value)
  ) {

    return value
      .filter(
        item =>
          item !== null &&
          item !== undefined &&
          String(item).trim() !== ""
      )
      .map(
        item =>
          typeof item === "string"
            ? item
            : JSON.stringify(item)
      );

  }


  if (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
  ) {

    return [
      String(value),
    ];

  }


  return [];

}


/* ============================================================
 * ACTION BLOCK
 * ============================================================
 */

function ActionBlock({
  number,
  title,
  description,
  items,
  icon: Icon,
  accent,
  background,
  border,
}) {

  return (

    <section
      className={`
        rounded-3xl
        border
        p-5
        shadow-sm
        ${border}
        ${background}
      `}
    >

      {/* HEADER */}

      <div
        className="
          flex
          items-start
          gap-4
        "
      >

        <div
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-white
            shadow-sm
            ${accent}
          `}
        >

          <Icon
            className="
              h-5
              w-5
            "
          />

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
              className="
                rounded-full
                bg-white/80
                px-2.5
                py-1
                text-[9px]
                font-black
                uppercase
                tracking-wider
                text-slate-500
              "
            >
              {number}
            </span>


            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.18em]
                text-slate-400
              "
            >
              Priority Action
            </span>

          </div>


          <h2
            className="
              mt-2
              text-xl
              font-black
              text-slate-900
            "
          >
            {title}
          </h2>


          <p
            className="
              mt-1
              text-sm
              leading-6
              text-slate-500
            "
          >
            {description}
          </p>

        </div>

      </div>


      {/* ITEMS */}

      {items.length === 0 ? (

        <div
          className="
            mt-5
            rounded-2xl
            bg-white/70
            p-5
            text-center
            text-sm
            text-slate-400
          "
        >

          Belum ada tindakan pada fase ini.

        </div>

      ) : (

        <div
          className="
            mt-5
            space-y-3
          "
        >

          {items.map(
            function(
              item,
              index
            ) {

              return (

                <div
                  key={
                    `${number}-${index}`
                  }
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-2xl
                    bg-white/80
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-slate-50
                      text-[10px]
                      font-black
                      text-slate-500
                    "
                  >

                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}

                  </div>


                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >

                    <p
                      className="
                        text-sm
                        font-semibold
                        leading-6
                        text-slate-700
                      "
                    >
                      {item}
                    </p>

                  </div>


                  <CheckCircle2
                    className="
                      mt-0.5
                      h-4
                      w-4
                      shrink-0
                      text-emerald-500
                    "
                  />

                </div>

              );

            }
          )}

        </div>

      )}

    </section>

  );

}


/* ============================================================
 * ROADMAP CARD
 * ============================================================
 */

function RoadmapCard({
  phase,
  label,
  count,
  color,
  icon: Icon,
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
          items-center
          justify-between
          gap-4
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
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              ${color}
            `}
          >

            <Icon
              className="
                h-5
                w-5
              "
            />

          </div>


          <div>

            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              {phase}
            </p>


            <p
              className="
                mt-1
                text-sm
                font-black
                text-slate-800
              "
            >
              {label}
            </p>

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
              text-slate-900
            "
          >
            {count}
          </p>


          <p
            className="
              text-[9px]
              font-bold
              uppercase
              text-slate-400
            "
          >
            Action
          </p>

        </div>

      </div>

    </div>

  );

}


/* ============================================================
 * EMPTY STATE
 * ============================================================
 */

function EmptyState() {

  return (

    <section
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

        <ListChecks
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
        Priority Action Plan Belum Tersedia
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
        AI belum menghasilkan rencana tindakan
        bertahap untuk kondisi tim saat ini.
      </p>

    </section>

  );

}


/* ============================================================
 * MAIN
 * ============================================================
 */

export default function AdminTeamAIPriorityAction() {

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
   * LOAD
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
        "TEAM AI PRIORITY ACTION:",
        result
      );


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Gagal mengambil Priority Action Plan."
        );

      }


      setData(
        result.data ||
        {}
      );

    } catch (err) {

      console.error(
        "TEAM AI PRIORITY ACTION ERROR:",
        err
      );


      setError(
        err?.message ||
        "Gagal mengambil Priority Action Plan."
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
   * DERIVED DATA
   * ==========================================================
   */

  const plan =
    data?.priority_action_plan ||
    {};


  const immediate =
    useMemo(
      function() {

        return toArray(
          plan?.immediate
        );

      },
      [
        plan?.immediate,
      ]
    );


  const shortTerm =
    useMemo(
      function() {

        return toArray(
          plan?.short_term
        );

      },
      [
        plan?.short_term,
      ]
    );


  const longTerm =
    useMemo(
      function() {

        return toArray(
          plan?.long_term
        );

      },
      [
        plan?.long_term,
      ]
    );


  const totalActions =
    immediate.length +
    shortTerm.length +
    longTerm.length;


  const participants =
    data?.participants ||
    {};


  const totalParticipants =
    Number(
      participants?.total
    ) || 0;


  const completedParticipants =
    Number(
      participants?.completed
    ) || 0;


  const confidenceNote =
    safeText(
      data?.confidence_note,
      ""
    );


  const hasPlan =
    totalActions > 0;


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
                Memuat Priority Action Plan...
              </p>


              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Menyusun prioritas tindakan tim
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

              <Flag
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
                Priority Action Plan Gagal Dimuat
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

                  <Rocket
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
                    Priority Action Plan
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
                Rencana tindakan bertahap yang membantu
                pembina menentukan apa yang perlu dilakukan
                segera, dalam jangka pendek, dan dalam
                pengembangan jangka panjang.
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


        {/* ==================================================
            SUMMARY
           ================================================== */}

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

              <ListChecks
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
              Total Action
            </p>


            <p
              className="
                mt-1
                text-3xl
                font-black
                text-slate-900
              "
            >
              {totalActions}
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

              <Zap
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
              Immediate
            </p>


            <p
              className="
                mt-1
                text-3xl
                font-black
                text-red-700
              "
            >
              {immediate.length}
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

              <Clock3
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
              Short Term
            </p>


            <p
              className="
                mt-1
                text-3xl
                font-black
                text-amber-700
              "
            >
              {shortTerm.length}
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

              <CalendarClock
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
              Long Term
            </p>


            <p
              className="
                mt-1
                text-3xl
                font-black
                text-emerald-700
              "
            >
              {longTerm.length}
            </p>

          </div>

        </section>


        {/* ==================================================
            CONFIDENCE
           ================================================== */}

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

              <ShieldCheck
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


        {/* ==================================================
            ROADMAP OVERVIEW
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
                bg-indigo-50
                text-indigo-600
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
                  text-xl
                  font-black
                  text-slate-900
                "
              >
                Roadmap Prioritas
              </h2>


              <p
                className="
                  text-sm
                  text-slate-400
                "
              >
                Gambaran jumlah tindakan pada setiap
                horizon waktu.
              </p>

            </div>

          </div>


          <div
            className="
              grid
              gap-3
              md:grid-cols-3
            "
          >

            <RoadmapCard
              phase="01"
              label="Tindakan Segera"
              count={
                immediate.length
              }
              color="
                bg-red-50
                text-red-600
              "
              icon={Zap}
            />


            <RoadmapCard
              phase="02"
              label="Jangka Pendek"
              count={
                shortTerm.length
              }
              color="
                bg-amber-50
                text-amber-600
              "
              icon={Clock3}
            />


            <RoadmapCard
              phase="03"
              label="Jangka Panjang"
              count={
                longTerm.length
              }
              color="
                bg-emerald-50
                text-emerald-600
              "
              icon={CalendarClock}
            />

          </div>

        </section>


        {/* ==================================================
            ACTION PLAN
           ================================================== */}

        {!hasPlan ? (

          <EmptyState />

        ) : (

          <>

            <ActionBlock
              number="01"
              title="Immediate Action"
              description="
                Hal yang perlu mendapat perhatian paling
                awal berdasarkan kondisi tim saat ini.
              "
              items={
                immediate
              }
              icon={Zap}
              accent="
                text-red-600
              "
              background="
                bg-red-50/60
              "
              border="
                border-red-100
              "
            />


            <ActionBlock
              number="02"
              title="Short-Term Action"
              description="
                Langkah penguatan yang dapat dijalankan
                setelah tindakan awal mulai berjalan.
              "
              items={
                shortTerm
              }
              icon={Clock3}
              accent="
                text-amber-600
              "
              background="
                bg-amber-50/60
              "
              border="
                border-amber-100
              "
            />


            <ActionBlock
              number="03"
              title="Long-Term Action"
              description="
                Pengembangan berkelanjutan untuk membangun
                kapasitas kepemimpinan tim.
              "
              items={
                longTerm
              }
              icon={CalendarClock}
              accent="
                text-emerald-600
              "
              background="
                bg-emerald-50/60
              "
              border="
                border-emerald-100
              "
            />

          </>

        )}


        {/* ==================================================
            ASSESSMENT CONTEXT
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
              flex
              flex-col
              gap-4
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div>

              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Assessment Context
              </p>


              <h3
                className="
                  mt-1
                  text-lg
                  font-black
                  text-slate-900
                "
              >
                Coverage Data Tim
              </h3>


              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Rencana tindakan harus dibaca bersama
                tingkat kelengkapan assessment.
              </p>

            </div>


            <div
              className="
                flex
                gap-3
              "
            >

              <div
                className="
                  rounded-2xl
                  bg-slate-50
                  px-5
                  py-3
                  text-center
                "
              >

                <p
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    text-slate-400
                  "
                >
                  Total
                </p>


                <p
                  className="
                    mt-1
                    text-xl
                    font-black
                    text-slate-800
                  "
                >
                  {totalParticipants}
                </p>

              </div>


              <div
                className="
                  rounded-2xl
                  bg-emerald-50
                  px-5
                  py-3
                  text-center
                "
              >

                <p
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    text-emerald-600
                  "
                >
                  Selesai
                </p>


                <p
                  className="
                    mt-1
                    text-xl
                    font-black
                    text-emerald-700
                  "
                >
                  {completedParticipants}
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            PRINCIPLE
           ================================================== */}

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

              <Rocket
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
                  tracking-wider
                  text-indigo-600
                "
              >
                Prinsip Pelaksanaan
              </p>


              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-slate-700
                "
              >
                Priority Action Plan digunakan sebagai
                panduan pembina untuk mengubah hasil
                analisis menjadi tindakan nyata. Prioritas
                tetap perlu divalidasi dengan kondisi
                lapangan dan observasi langsung.
              </p>


              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  gap-2
                "
              >

                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-white
                    px-3
                    py-2
                    text-[10px]
                    font-bold
                    text-slate-600
                  "
                >

                  <CheckCircle2
                    className="
                      h-3.5
                      w-3.5
                      text-emerald-600
                    "
                  />

                  Validasi Pembina

                </span>


                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-white
                    px-3
                    py-2
                    text-[10px]
                    font-bold
                    text-slate-600
                  "
                >

                  <ArrowRight
                    className="
                      h-3.5
                      w-3.5
                      text-indigo-600
                    "
                  />

                  Implementasi Bertahap

                </span>


                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-white
                    px-3
                    py-2
                    text-[10px]
                    font-bold
                    text-slate-600
                  "
                >

                  <Target
                    className="
                      h-3.5
                      w-3.5
                      text-red-600
                    "
                  />

                  Evaluasi Berkala

                </span>

              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            FOOTER NOTE
           ================================================== */}

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
            Priority Action Plan adalah rekomendasi
            berbasis analisis agregat. Sistem tidak
            menentukan kelulusan dan tidak menggantikan
            keputusan pembina.
          </p>

        </div>

      </div>

    </div>

  );

}