import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowRight,
  Brain,
  RefreshCw,
  ShieldAlert,
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

function safeText(value, fallback = "-") {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return fallback;
  }

  return String(value);
}


function safeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}


function formatScore(value) {
  const number = safeNumber(value);

  if (number === null) {
    return "-";
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(1);
}


/* ============================================================
 * GAP SCORE BAR
 * ============================================================
 */

function GapScore({
  score,
}) {

  const value =
    Math.min(
      100,
      Math.max(
        0,
        safeNumber(score) ?? 0
      )
    );


  return (

    <div>

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
            text-[10px]
            font-black
            uppercase
            tracking-wider
            text-slate-400
          "
        >
          Skor Area
        </span>


        <span
          className="
            text-lg
            font-black
            text-slate-900
          "
        >
          {formatScore(score)}
        </span>

      </div>


      <div
        className="
          mt-2
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
            bg-red-500
            transition-all
          "
          style={{
            width:
              `${value}%`,
          }}
        />

      </div>

    </div>

  );

}


/* ============================================================
 * GAP CARD
 * ============================================================
 */

function DevelopmentGapCard({
  item,
  index,
}) {

  return (

    <article
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md
      "
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

            <TrendingDown
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
                text-[9px]
                font-black
                uppercase
                tracking-[0.18em]
                text-red-500
              "
            >
              Development Gap {index + 1}
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
                item?.area,
                "Area Pengembangan"
              )}
            </h2>

          </div>

        </div>


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
            text-slate-400
          "
        >
          {String(
            index + 1
          ).padStart(2, "0")}
        </div>

      </div>


      {/* SCORE */}

      <div
        className="
          mt-5
          rounded-2xl
          bg-slate-50
          p-4
        "
      >

        <GapScore
          score={
            item?.score
          }
        />

      </div>


      {/* RISK */}

      <div
        className="
          mt-4
          rounded-2xl
          border
          border-amber-200
          bg-amber-50
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

          <AlertTriangle
            className="
              h-4
              w-4
              text-amber-600
            "
          />


          <span
            className="
              text-[10px]
              font-black
              uppercase
              tracking-wider
              text-amber-700
            "
          >
            Risiko
          </span>

        </div>


        <p
          className="
            mt-2
            text-sm
            leading-6
            text-amber-900
          "
        >
          {safeText(
            item?.risk,
            "Belum ada analisis risiko."
          )}
        </p>

      </div>


      {/* RECOMMENDATION */}

      <div
        className="
          mt-4
          rounded-2xl
          border
          border-blue-100
          bg-blue-50/60
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
            Rekomendasi Pembinaan
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
            item?.recommendation,
            "Belum ada rekomendasi."
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
          text-slate-400
        "
      >

        <ArrowRight
          className="
            h-3.5
            w-3.5
          "
        />

        Area ini menjadi prioritas
        pengembangan tim.

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

        <TrendingDown
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
        Belum Ada Development Gap
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
        AI belum menghasilkan area
        pengembangan untuk kondisi tim saat ini.
      </p>

    </div>

  );

}


/* ============================================================
 * PAGE
 * ============================================================
 */

export default function AdminTeamAIGaps() {

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
        "TEAM AI GAPS:",
        result
      );


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Gagal mengambil Development Gaps."
        );

      }


      setData(
        result.data ||
        {}
      );

    } catch (err) {

      console.error(
        "TEAM AI GAPS ERROR:",
        err
      );


      setError(
        err?.message ||
        "Gagal mengambil Development Gaps."
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

  const gaps =
    useMemo(
      function() {

        if (
          !Array.isArray(
            data?.development_gaps
          )
        ) {
          return [];
        }

        return data.development_gaps
          .filter(
            item =>
              item &&
              typeof item === "object"
          );

      },
      [data]
    );


  const participantSummary =
    data?.participants ||
    {};


  const total =
    Number(
      participantSummary?.total
    ) || 0;


  const completed =
    Number(
      participantSummary?.completed
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
            flex
            min-h-[70vh]
            items-center
            justify-center
          "
        >

          <div
            className="
              rounded-3xl
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


            <p
              className="
                mt-4
                text-sm
                font-black
                text-slate-800
              "
            >
              Memuat Team Gap...
            </p>


            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              Membaca area pengembangan tim
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
              mt-5
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
                Development Gaps Gagal Dimuat
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

        <TeamAINavigation />


        {/* HEADER */}

        <header
          className="
            rounded-3xl
            bg-red-600
            p-5
            text-white
            shadow-sm
            sm:p-6
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
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white/15
                  "
                >

                  <TrendingDown
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
                      text-red-100
                    "
                  >
                    PMR SMANEL • AI LEADERSHIP
                  </p>


                  <h1
                    className="
                      mt-1
                      text-2xl
                      font-black
                      tracking-tight
                      sm:text-3xl
                    "
                  >
                    Development Gaps
                  </h1>

                </div>

              </div>


              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-red-100
                "
              >
                Area yang perlu dikembangkan agar
                kapasitas kepemimpinan tim dapat
                tumbuh secara lebih seimbang.
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
                gap-2
                rounded-xl
                bg-white
                px-4
                py-2.5
                text-xs
                font-black
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

              Muat Ulang

            </button>

          </div>

        </header>


        {/* SUMMARY */}

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

              <TrendingDown
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
              Development Gap
            </p>


            <p
              className="
                mt-1
                text-3xl
                font-black
                text-slate-900
              "
            >
              {gaps.length}
            </p>


            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              area prioritas
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

              <Brain
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
              Assessment Selesai
            </p>


            <p
              className="
                mt-1
                text-3xl
                font-black
                text-slate-900
              "
            >
              {completed}
            </p>


            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              dari {total} peserta
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
                text-slate-400
              "
            >
              Fokus
            </p>


            <p
              className="
                mt-1
                text-lg
                font-black
                text-slate-900
              "
            >
              Pembinaan
            </p>


            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              bukan penilaian kelulusan
            </p>

          </div>

        </section>


        {/* CONFIDENCE */}

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

              <ShieldAlert
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


        {/* GAP LIST */}

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
                Area Pengembangan Tim
              </h2>


              <p
                className="
                  text-sm
                  text-slate-400
                "
              >
                Gap yang perlu menjadi perhatian pembina
              </p>

            </div>

          </div>


          {gaps.length === 0 ? (

            <EmptyState />

          ) : (

            <div
              className="
                grid
                gap-4
                lg:grid-cols-2
              "
            >

              {gaps.map(
                (
                  item,
                  index
                ) => (

                  <DevelopmentGapCard
                    key={
                      `${item?.area || "gap"}-${index}`
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


        {/* INTERPRETATION */}

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
                bg-slate-100
                text-slate-600
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
                Cara Menggunakan Team Gap
              </h3>


              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-600
                "
              >
                Development Gap bukan berarti tim
                memiliki kelemahan permanen. Data ini
                digunakan untuk menentukan materi
                latihan, mentoring, simulasi, dan
                pengalaman kepemimpinan yang perlu
                diperbanyak.
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
                    bg-slate-50
                    p-4
                  "
                >

                  <p
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-slate-400
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
                    Identifikasi
                  </p>

                </div>


                <div
                  className="
                    rounded-2xl
                    bg-slate-50
                    p-4
                  "
                >

                  <p
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-slate-400
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
                    Latih
                  </p>

                </div>


                <div
                  className="
                    rounded-2xl
                    bg-slate-50
                    p-4
                  "
                >

                  <p
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-slate-400
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
                    Evaluasi Ulang
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

          <ShieldAlert
            className="
              h-5
              w-5
              shrink-0
              text-slate-400
            "
          />


          <p
            className="
              text-xs
              leading-5
              text-slate-500
            "
          >
            Analisis ini bersifat agregat untuk
            kebutuhan pembinaan tim. Jangan
            menggunakan Development Gap untuk
            memberi label negatif kepada individu.
          </p>

        </div>

      </div>

    </div>

  );

}