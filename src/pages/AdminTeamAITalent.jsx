import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  UsersRound,
  Target,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Brain,
  ArrowRight,
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


function humanize(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/* ============================================================
 * TALENT CARD
 * ============================================================
 */

function TalentSegmentCard({
  item,
  index,
}) {

  return (
    <article
      className="
        group
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
              bg-blue-50
              text-blue-600
            "
          >

            <UsersRound
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
                text-blue-500
              "
            >
              Segment {index + 1}
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
                item?.segment,
                "Segment Tanpa Nama"
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
            text-slate-400
          "
        >

          <span
            className="
              text-[10px]
              font-black
            "
          >
            {String(
              index + 1
            ).padStart(2, "0")}
          </span>

        </div>

      </div>


      <div
        className="
          mt-5
          rounded-2xl
          bg-slate-50
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

          <Brain
            className="
              h-4
              w-4
              text-indigo-500
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
            Karakteristik Segment
          </span>

        </div>


        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-600
          "
        >
          {safeText(
            item?.description,
            "Belum ada deskripsi segment."
          )}
        </p>

      </div>


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
            Fokus Pembinaan
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
            item?.recommended_focus,
            "Belum ada rekomendasi fokus."
          )}
        </p>

      </div>


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

        Segmentasi digunakan untuk
        pembinaan, mentoring, dan pembagian
        tanggung jawab.

      </div>

    </article>
  );

}


/* ============================================================
 * EMPTY STATE
 * ============================================================
 */

function EmptyTalentState() {

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

        <UsersRound
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
        Talent Mapping Belum Tersedia
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
        Belum terdapat segmentasi talent yang
        dihasilkan oleh AI berdasarkan data
        Leadership Assessment.
      </p>

    </div>

  );

}


/* ============================================================
 * MAIN PAGE
 * ============================================================
 */

export default function AdminTeamAITalent() {

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


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Gagal mengambil Talent Mapping."
        );

      }


      setData(
        result.data ||
        {}
      );

    } catch (err) {

      console.error(
        "TEAM AI TALENT ERROR:",
        err
      );


      setError(
        err?.message ||
        "Gagal mengambil Talent Mapping."
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

  const talentMapping =
    useMemo(
      function() {

        const value =
          data?.talent_mapping;

        if (
          !Array.isArray(value)
        ) {
          return [];
        }

        return value.filter(
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


  const completed =
    Number(
      participantSummary?.completed
    ) || 0;


  const total =
    Number(
      participantSummary?.total
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
                text-blue-600
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
              Memuat Talent Mapping...
            </p>


            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              AI sedang membaca segmentasi tim
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

              <ShieldCheck
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
                Talent Mapping Gagal Dimuat
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
                    items-center
                    justify-center
                    rounded-2xl
                    bg-blue-50
                    text-blue-600
                  "
                >

                  <UsersRound
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
                      text-blue-600
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
                    Talent Mapping
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
                Segmentasi potensi tim untuk membantu
                pembina menentukan fokus mentoring,
                pengembangan kompetensi, dan pembagian
                tanggung jawab.
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

              Muat Ulang

            </button>

          </div>

        </header>


        {/* ==================================================
            OVERVIEW
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

              <UsersRound
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
              Total Peserta
            </p>


            <p
              className="
                mt-1
                text-3xl
                font-black
                text-slate-900
              "
            >
              {total}
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
              Segmen Talent
            </p>


            <p
              className="
                mt-1
                text-3xl
                font-black
                text-slate-900
              "
            >
              {talentMapping.length}
            </p>

          </div>

        </section>


        {/* ==================================================
            AI EXPLANATION
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
            TALENT MAPPING
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
                bg-blue-50
                text-blue-600
              "
            >

              <Sparkles
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
                Segmentasi Talent
              </h2>


              <p
                className="
                  text-sm
                  text-slate-400
                "
              >
                Pemetaan berbasis kelompok, bukan
                penilaian individu.
              </p>

            </div>

          </div>


          {talentMapping.length === 0 ? (

            <EmptyTalentState />

          ) : (

            <div
              className="
                grid
                gap-4
                md:grid-cols-2
              "
            >

              {talentMapping.map(
                (
                  item,
                  index
                ) => (

                  <TalentSegmentCard
                    key={
                      `${item?.segment || "segment"}-${index}`
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
                Cara Membaca Talent Mapping
              </h3>


              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-slate-600
                "
              >
                Segmentasi ini digunakan sebagai dasar
                pembina untuk merancang mentoring,
                latihan kepemimpinan, pembagian peran,
                dan pengembangan calon pengurus.
                Segmentasi tidak digunakan untuk memberi
                label tetap kepada peserta.
              </p>

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
            Talent Mapping bersifat agregat dan
            interpretatif. Sistem tidak menampilkan
            nama peserta, participant ID, atau
            menentukan kelulusan.
          </p>

        </div>

      </div>

    </div>

  );

}