import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
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


/* ============================================================
 * ROLE CARD
 * ============================================================
 */

function RoleCard({
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
              bg-violet-50
              text-violet-600
            "
          >

            <BriefcaseBusiness
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
                text-violet-500
              "
            >
              Recommended Role {index + 1}
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
                item?.role,
                "Role Belum Ditentukan"
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


      {/* COMPETENCY */}

      <div
        className="
          mt-5
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
            Fokus Kompetensi
          </span>

        </div>


        <p
          className="
            mt-2
            text-sm
            font-bold
            leading-6
            text-slate-700
          "
        >
          {safeText(
            item?.competency_focus,
            "Belum ada fokus kompetensi."
          )}
        </p>

      </div>


      {/* REASON */}

      <div
        className="
          mt-4
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

          <Sparkles
            className="
              h-4
              w-4
              text-violet-500
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
            Dasar Rekomendasi
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
            item?.reason,
            "Belum ada alasan rekomendasi."
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

        Digunakan sebagai acuan
        pembagian tanggung jawab tim.

      </div>

    </article>

  );

}


/* ============================================================
 * EMPTY STATE
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

        <BriefcaseBusiness
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
        Struktur Tim Belum Tersedia
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
        AI belum menghasilkan rekomendasi struktur
        peran untuk kondisi tim saat ini.
      </p>

    </div>

  );

}


/* ============================================================
 * MAIN PAGE
 * ============================================================
 */

export default function AdminTeamAIStructure() {

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
   * LOAD AI
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
        "TEAM AI STRUCTURE:",
        result
      );


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Gagal mengambil Recommended Team Structure."
        );

      }


      setData(
        result.data ||
        {}
      );

    } catch (err) {

      console.error(
        "TEAM AI STRUCTURE ERROR:",
        err
      );


      setError(
        err?.message ||
        "Gagal mengambil Recommended Team Structure."
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

  const structure =
    useMemo(
      function() {

        if (
          !Array.isArray(
            data?.recommended_team_structure
          )
        ) {

          return [];

        }


        return data
          .recommended_team_structure
          .filter(
            item =>
              item &&
              typeof item === "object"
          );

      },
      [data]
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
                text-violet-600
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
              Memuat Struktur Tim...
            </p>


            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              Membaca rekomendasi struktur dari AI
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
                Recommended Team Structure
                Gagal Dimuat
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
                    items-center
                    justify-center
                    rounded-2xl
                    bg-violet-50
                    text-violet-600
                  "
                >

                  <BriefcaseBusiness
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
                      text-violet-600
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
                    Recommended Team Structure
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
                Rekomendasi pembagian peran berdasarkan
                kebutuhan kompetensi dan pola kepemimpinan
                yang terbaca dari hasil assessment tim.
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
                bg-violet-50
                text-violet-600
              "
            >

              <BriefcaseBusiness
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
              Rekomendasi Peran
            </p>


            <p
              className="
                mt-1
                text-3xl
                font-black
                text-slate-900
              "
            >
              {structure.length}
            </p>


            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              struktur peran yang disarankan
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
              Peserta
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


            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              {completed} assessment selesai
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
              Kompetensi
            </p>


            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              pembagian peran dan tanggung jawab
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


        {/* ROLE STRUCTURE */}

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
                bg-violet-50
                text-violet-600
              "
            >

              <BriefcaseBusiness
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
                Struktur Peran yang Direkomendasikan
              </h2>


              <p
                className="
                  text-sm
                  text-slate-400
                "
              >
                Peran disusun berdasarkan kebutuhan
                kompetensi tim.
              </p>

            </div>

          </div>


          {structure.length === 0 ? (

            <EmptyState />

          ) : (

            <div
              className="
                grid
                gap-4
                md:grid-cols-2
              "
            >

              {structure.map(
                (
                  item,
                  index
                ) => (

                  <RoleCard
                    key={
                      `${item?.role || "role"}-${index}`
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

              <Sparkles
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
                Cara Menggunakan Rekomendasi Struktur
              </h3>


              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-600
                "
              >
                Rekomendasi ini menjadi bahan pertimbangan
                pembina dalam menyusun pembagian tanggung
                jawab, mentoring, simulasi kepemimpinan,
                dan persiapan calon pengurus. Rekomendasi
                AI bukan keputusan final penempatan peserta.
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
                    Cocokkan Kompetensi
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
                    Validasi Pembina
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
                    Terapkan Bertahap
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
            Struktur ini bersifat rekomendasi agregat.
            Penempatan peserta tetap memerlukan
            validasi pembina dan observasi langsung.
          </p>

        </div>

      </div>

    </div>

  );

}