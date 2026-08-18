import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Brain,
  RefreshCw,
  Users,
  Crown,
  Target,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import TeamAINavigation from "../components/TeamAINavigation";
import { getTeamAnalysis } from "../api/api";


/* ============================================================
 * HELPERS
 * ============================================================
 */

function formatNumber(value) {

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

  return `${number.toFixed(1)}%`;

}


function humanize(
  value
) {

  return String(
    value || "UNCLASSIFIED"
  )
    .replace(/_/g, " ")
    .replace(/\b\w/g, char =>
      char.toUpperCase()
    );

}


/* ============================================================
 * DISTRIBUTION NORMALIZER
 * ============================================================
 */

function normalizeProfiles(
  data
) {

  const profiles =
    Array.isArray(
      data?.profile_distribution
    )
      ? data.profile_distribution
      : [];


  return profiles
    .map(
      item => ({

        profile:
          item?.profile ||
          item?.status ||
          "UNCLASSIFIED",

        count:
          Number(
            item?.count
          ) || 0,

      })
    )
    .sort(
      (a, b) =>
        b.count - a.count
    );

}


function normalizePotentials(
  data
) {

  const potentials =
    Array.isArray(
      data?.potential_distribution
    )
      ? data.potential_distribution
      : [];


  return potentials
    .map(
      item => ({

        status:
          item?.status ||
          item?.potential ||
          "UNCLASSIFIED",

        count:
          Number(
            item?.count
          ) || 0,

      })
    )
    .sort(
      (a, b) =>
        b.count - a.count
    );

}


/* ============================================================
 * BAR
 * ============================================================
 */

function DistributionBar({
  value,
  total,
}) {

  const percentage =
    total > 0
      ? (
          value /
          total
        ) * 100
      : 0;


  return (

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
          bg-indigo-500
          transition-all
        "
        style={{
          width:
            `${percentage}%`,
        }}
      />

    </div>

  );

}


/* ============================================================
 * PROFILE CARD
 * ============================================================
 */

function ProfileCard({
  item,
  total,
  index,
}) {

  const percentage =
    total > 0
      ? (
          item.count /
          total
        ) * 100
      : 0;


  return (

    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-slate-50
        p-5
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
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-indigo-50
              text-indigo-600
            "
          >

            {index === 0 ? (

              <Crown
                className="
                  h-5
                  w-5
                "
              />

            ) : (

              <Brain
                className="
                  h-5
                  w-5
                "
              />

            )}

          </div>


          <div
            className="
              min-w-0
            "
          >

            <p
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-wider
                text-indigo-500
              "
            >
              Profil #{index + 1}
            </p>

            <h3
              className="
                mt-1
                truncate
                text-base
                font-black
                text-slate-900
              "
            >
              {humanize(
                item.profile
              )}
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
              text-indigo-600
            "
          >
            {item.count}
          </p>

          <p
            className="
              text-[9px]
              font-bold
              uppercase
              text-slate-400
            "
          >
            Peserta
          </p>

        </div>

      </div>


      <DistributionBar
        value={
          item.count
        }
        total={
          total
        }
      />


      <div
        className="
          mt-3
          flex
          justify-between
          text-xs
        "
      >

        <span
          className="
            text-slate-400
          "
        >
          Proporsi
        </span>

        <span
          className="
            font-black
            text-slate-700
          "
        >
          {formatPercent(
            percentage
          )}
        </span>

      </div>

    </div>

  );

}


/* ============================================================
 * POTENTIAL CARD
 * ============================================================
 */

function PotentialCard({
  item,
  total,
}) {

  const percentage =
    total > 0
      ? (
          item.count /
          total
        ) * 100
      : 0;


  return (

    <div
      className="
        rounded-2xl
        border
        border-emerald-100
        bg-emerald-50/50
        p-4
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
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-emerald-100
              text-emerald-600
            "
          >

            <Sparkles
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
            {humanize(
              item.status
            )}
          </p>

        </div>


        <div
          className="
            text-right
          "
        >

          <p
            className="
              text-lg
              font-black
              text-emerald-600
            "
          >
            {item.count}
          </p>

          <p
            className="
              text-[9px]
              font-bold
              text-slate-400
            "
          >
            {formatPercent(
              percentage
            )}
          </p>

        </div>

      </div>


      <DistributionBar
        value={
          item.count
        }
        total={
          total
        }
      />

    </div>

  );

}


/* ============================================================
 * MAIN PAGE
 * ============================================================
 */

export default function AdminTeamAILeadership() {

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


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Gagal mengambil data Leadership."
        );

      }


      setData(
        result.data ||
        {}
      );

    } catch (err) {

      console.error(
        "TEAM LEADERSHIP ERROR:",
        err
      );


      setError(
        err?.message ||
        "Gagal mengambil data Leadership."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  }


  useEffect(
    () => {

      loadAnalysis();

    },
    []
  );


  const summary =
    data?.participant_summary ||
    {};


  const profiles =
    useMemo(
      () =>
        normalizeProfiles(
          data
        ),
      [data]
    );


  const potentials =
    useMemo(
      () =>
        normalizePotentials(
          data
        ),
      [data]
    );


  const completed =
    Number(
      summary.completed
    ) || 0;


  const total =
    Number(
      summary.total
    ) || 0;


  const incomplete =
    Number(
      summary.incomplete
    ) || 0;


  const completionPercentage =
    total > 0
      ? (
          completed /
          total
        ) * 100
      : 0;


  const topProfile =
    profiles.length > 0
      ? profiles[0]
      : null;


  const topPotential =
    potentials.length > 0
      ? potentials[0]
      : null;


  /* ============================================================
   * LOADING
   * ============================================================
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
                text-indigo-600
              "
            />

            <p
              className="
                mt-4
                text-sm
                font-bold
                text-slate-700
              "
            >
              Memuat Leadership Analysis...
            </p>

          </div>

        </div>

      </div>

    );

  }


  /* ============================================================
   * ERROR
   * ============================================================
   */

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
              rounded-3xl
              border
              border-red-200
              bg-red-50
              p-6
            "
          >

            <p
              className="
                text-sm
                font-bold
                text-red-700
              "
            >
              Leadership Analysis Gagal
            </p>


            <p
              className="
                mt-2
                text-sm
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
                font-bold
                text-white
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
                    items-center
                    justify-center
                    rounded-2xl
                    bg-indigo-50
                    text-indigo-600
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

                  <p
                    className="
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-indigo-600
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
                    Leadership
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
                Pemetaan profil kepemimpinan dan
                potensi tim berdasarkan hasil
                Leadership Assessment.
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

              Muat Ulang Data

            </button>

          </div>

        </header>


        {/* ==================================================
            HERO INSIGHT
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
              grid
              gap-5
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
                  text-indigo-600
                "
              >
                Profil Leadership Dominan
              </p>


              <h2
                className="
                  mt-2
                  text-2xl
                  font-black
                  text-slate-900
                "
              >

                {topProfile
                  ? humanize(
                      topProfile.profile
                    )
                  : "Belum tersedia"}

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

                {topProfile
                  ? `${topProfile.count} peserta atau ${formatPercent(
                      completed > 0
                        ? (
                            topProfile.count /
                            completed
                          ) * 100
                        : 0
                    )} dari peserta yang telah menyelesaikan assessment berada pada profil ini.`
                  : "Belum terdapat data profil kepemimpinan yang dapat dianalisis."}

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
                Peserta
              </p>

              <p
                className="
                  mt-1
                  text-4xl
                  font-black
                  text-indigo-600
                "
              >
                {topProfile?.count || 0}
              </p>

            </div>

          </div>

        </section>


        {/* ==================================================
            SUMMARY CARDS
           ================================================== */}

        <section
          className="
            grid
            gap-4
            md:grid-cols-4
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

            <Users
              className="
                h-5
                w-5
                text-indigo-600
              "
            />

            <p
              className="
                mt-4
                text-[10px]
                font-bold
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

            <ShieldCheck
              className="
                h-5
                w-5
                text-emerald-600
              "
            />

            <p
              className="
                mt-4
                text-[10px]
                font-bold
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

            <Target
              className="
                h-5
                w-5
                text-amber-600
              "
            />

            <p
              className="
                mt-4
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Profil Teridentifikasi
            </p>

            <p
              className="
                mt-1
                text-3xl
                font-black
                text-slate-900
              "
            >
              {profiles.length}
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

            <Sparkles
              className="
                h-5
                w-5
                text-blue-600
              "
            />

            <p
              className="
                mt-4
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Potensi Teratas
            </p>

            <p
              className="
                mt-1
                truncate
                text-lg
                font-black
                text-slate-900
              "
            >
              {topPotential
                ? humanize(
                    topPotential.status
                  )
                : "-"}
            </p>

          </div>

        </section>


        {/* ==================================================
            PROFILE DISTRIBUTION
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

              <Brain
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
                Distribusi Profil Kepemimpinan
              </h2>

              <p
                className="
                  text-sm
                  text-slate-400
                "
              >
                Sebaran peserta berdasarkan profil
                kepemimpinan hasil assessment.
              </p>

            </div>

          </div>


          {profiles.length === 0 ? (

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
              Data profil kepemimpinan belum tersedia.
            </div>

          ) : (

            <div
              className="
                grid
                gap-4
                md:grid-cols-2
              "
            >

              {profiles.map(
                (
                  item,
                  index
                ) => (

                  <ProfileCard
                    key={
                      `${item.profile}-${index}`
                    }
                    item={
                      item
                    }
                    total={
                      completed
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
            POTENTIAL DISTRIBUTION
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
                Distribusi Potensi
              </h2>

              <p
                className="
                  text-sm
                  text-slate-400
                "
              >
                Sebaran status potensi kepemimpinan
                dalam tim.
              </p>

            </div>

          </div>


          {potentials.length === 0 ? (

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
              Data potensi belum tersedia.
            </div>

          ) : (

            <div
              className="
                grid
                gap-3
                md:grid-cols-2
                xl:grid-cols-3
              "
            >

              {potentials.map(
                (
                  item,
                  index
                ) => (

                  <PotentialCard
                    key={
                      `${item.status}-${index}`
                    }
                    item={
                      item
                    }
                    total={
                      completed
                    }
                  />

                )
              )}

            </div>

          )}

        </section>


        {/* ==================================================
            ASSESSMENT CONFIDENCE
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
              gap-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div>

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-indigo-600
                "
              >
                Assessment Coverage
              </p>


              <h2
                className="
                  mt-1
                  text-xl
                  font-black
                  text-slate-900
                "
              >
                Tingkat Kelengkapan Data
              </h2>


              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Profil leadership sebaiknya dibaca
                bersama tingkat kelengkapan assessment.
                Semakin banyak peserta yang menyelesaikan
                assessment, semakin representatif gambaran
                komposisi tim.
              </p>

            </div>


            <div
              className="
                min-w-[220px]
              "
            >

              <div
                className="
                  flex
                  justify-between
                  text-xs
                "
              >

                <span
                  className="
                    font-semibold
                    text-slate-500
                  "
                >
                  Coverage
                </span>

                <span
                  className="
                    font-black
                    text-slate-800
                  "
                >
                  {formatPercent(
                    completionPercentage
                  )}
                </span>

              </div>


              <div
                className="
                  mt-2
                  h-3
                  overflow-hidden
                  rounded-full
                  bg-slate-200
                "
              >

                <div
                  className="
                    h-full
                    rounded-full
                    bg-indigo-500
                  "
                  style={{
                    width:
                      `${Math.min(
                        100,
                        completionPercentage
                      )}%`,
                  }}
                />

              </div>


              <p
                className="
                  mt-2
                  text-right
                  text-[10px]
                  text-slate-400
                "
              >
                {completed} selesai ·{" "}
                {incomplete} belum selesai
              </p>

            </div>

          </div>

        </section>


        {/* ==================================================
            FOOT NOTE
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
            Halaman ini menampilkan data agregat tim.
            Tidak digunakan untuk menentukan kelulusan
            atau membuat kesimpulan terhadap individu.
          </p>

        </div>

      </div>

    </div>

  );

}