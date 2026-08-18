import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Medal,
  Search,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  apiGet,
} from "../api/api";


const MOBILE_PAGE_SIZE = 10;


function safeText(
  value,
  fallback = "-"
) {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return fallback;
  }

  return String(value);
}


function safeNumber(
  value,
  fallback = 0
) {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}


function extractParticipants(
  result
) {
  if (
    Array.isArray(
      result?.data?.participants
    )
  ) {
    return result.data.participants;
  }

  if (
    Array.isArray(
      result?.participants
    )
  ) {
    return result.participants;
  }

  return [];
}


function getScore(
  participant
) {
  const score =
    participant?.score ||
    participant?.scores ||
    {};

  const raw =
    score.final_score ??
    score.finalScore ??
    participant?.final_score ??
    participant?.finalScore ??
    "";

  if (
    raw === "" ||
    raw === null ||
    raw === undefined
  ) {
    return null;
  }

  const result =
    Number(raw);

  return Number.isFinite(result)
    ? result
    : null;
}


function getPercentage(
  score,
  max
) {
  if (
    score === null ||
    max <= 0
  ) {
    return null;
  }

  return Math.round(
    (score / max) * 100
  );
}


function statusLabel(
  status
) {
  switch (
    String(
      status || ""
    )
      .trim()
      .toUpperCase()
  ) {
    case "NOT_STARTED":
      return "Belum Mulai";

    case "IN_PROGRESS":
      return "Sedang Mengerjakan";

    case "COMPLETED":
      return "Selesai";

    case "VERIFIED":
      return "Terverifikasi";

    default:
      return safeText(
        status,
        "-"
      );
  }
}


function statusClass(
  status
) {
  switch (
    String(
      status || ""
    )
      .trim()
      .toUpperCase()
  ) {
    case "VERIFIED":
      return "bg-emerald-50 text-emerald-700";

    case "COMPLETED":
      return "bg-amber-50 text-amber-700";

    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}


function componentScore(
  participant,
  key,
  fallbackMax
) {
  const score =
    participant?.score ||
    {};

  const value =
    score[key] ??
    score[
      `${key}_score`
    ] ??
    null;

  const max =
    score[
      `${key}_max`
    ] ??
    fallbackMax;

  return {
    value:
      Number.isFinite(
        Number(value)
      )
        ? Number(value)
        : null,
    max:
      safeNumber(
        max,
        fallbackMax
      ),
  };
}


function componentPercentage(
  participant,
  key,
  fallbackMax
) {
  const component =
    componentScore(
      participant,
      key,
      fallbackMax
    );

  if (
    component.value === null ||
    component.max <= 0
  ) {
    return null;
  }

  return (
    component.value /
    component.max
  ) * 100;
}


function isFinalEligible(
  participant
) {
  const finalScore =
    getScore(
      participant
    );

  /*
   * Backend hanya mengisi final_score
   * setelah assessment final tersedia.
   */
  return finalScore !== null;
}


export default function Ranking() {
  const navigate =
    useNavigate();

  const [
    participants,
    setParticipants,
  ] = useState([]);

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

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    showOnlyScored,
    setShowOnlyScored,
  ] = useState(false);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);


  async function loadRanking(
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
        await apiGet({
          action:
            "admin_participants",
          search: "",
          status: "",
        });

      if (
        !result ||
        result.success !== true
      ) {
        throw new Error(
          result?.error?.message ||
          "Gagal mengambil data ranking."
        );
      }

      setParticipants(
        extractParticipants(
          result
        )
      );

    } catch (err) {
      console.error(
        "RANKING LOAD ERROR:",
        err
      );

      setError(
        err?.message ||
        "Gagal mengambil data ranking."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }


  useEffect(() => {
    loadRanking();
  }, []);


  const rankedParticipants =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      const filtered =
        participants.filter(
          participant => {

            const finalScore =
              getScore(
                participant
              );


            const eligible =
              isFinalEligible(
                participant
              );


            if (
              showOnlyScored &&
              !eligible
            ) {

              return false;

            }


            if (!query) {

              return true;

            }


            const haystack =
              [
                participant?.nama,
                participant?.participant_id,
                participant?.kelas,
                participant?.email,
              ]
                .map(
                  value =>
                    safeText(
                      value,
                      ""
                    ).toLowerCase()
                )
                .join(" ");


            return haystack.includes(
              query
            );

          }
        );


      const items =
        filtered.map(
          participant => ({

            participant,

            finalScore:
              getScore(
                participant
              ),

            eligible:
              isFinalEligible(
                participant
              ),

            personalityPct:
              componentPercentage(
                participant,
                "personality",
                200
              ),

            competencyPct:
              componentPercentage(
                participant,
                "competency",
                200
              ),

            sjtPct:
              componentPercentage(
                participant,
                "sjt",
                75
              ),

            challengePct:
              componentPercentage(
                participant,
                "challenge",
                25
              ),

          })
        );


      items.sort(
        (
          first,
          second
        ) => {

          /*
           * Peserta final selalu di atas
           * peserta yang belum memiliki Final Score.
           */

          if (
            first.eligible !==
            second.eligible
          ) {

            return first.eligible
              ? -1
              : 1;

          }


          /*
           * Peserta pending tidak memakai
           * tie-breaker nilai.
           */

          if (
            !first.eligible &&
            !second.eligible
          ) {

            return safeText(
              first.participant?.nama,
              ""
            ).localeCompare(
              safeText(
                second.participant?.nama,
                ""
              )
            );

          }


          /*
           * TIE BREAKER #1
           * Final Score
           */

          if (
            second.finalScore !==
            first.finalScore
          ) {

            return (
              second.finalScore -
              first.finalScore
            );

          }


          /*
           * TIE BREAKER #2
           * Personality %
           */

          const personalityA =
            first.personalityPct ??
            -1;

          const personalityB =
            second.personalityPct ??
            -1;

          if (
            personalityB !==
            personalityA
          ) {

            return (
              personalityB -
              personalityA
            );

          }


          /*
           * TIE BREAKER #3
           * Competency %
           */

          const competencyA =
            first.competencyPct ??
            -1;

          const competencyB =
            second.competencyPct ??
            -1;

          if (
            competencyB !==
            competencyA
          ) {

            return (
              competencyB -
              competencyA
            );

          }


          /*
           * TIE BREAKER #4
           * SJT %
           */

          const sjtA =
            first.sjtPct ??
            -1;

          const sjtB =
            second.sjtPct ??
            -1;

          if (
            sjtB !==
            sjtA
          ) {

            return (
              sjtB -
              sjtA
            );

          }


          /*
           * TIE BREAKER #5
           * Challenge %
           */

          const challengeA =
            first.challengePct ??
            -1;

          const challengeB =
            second.challengePct ??
            -1;

          if (
            challengeB !==
            challengeA
          ) {

            return (
              challengeB -
              challengeA
            );

          }


          /*
           * TIE BREAKER #6
           * Nama alfabetis
           */

          return safeText(
            first.participant?.nama,
            ""
          ).localeCompare(
            safeText(
              second.participant?.nama,
              ""
            )
          );

        }
      );


      /*
       * Ranking hanya diberikan
       * kepada peserta yang eligible.
       */

      let finalRank =
        0;


      return items.map(
        item => {

          if (
            item.eligible
          ) {

            finalRank +=
              1;

            return {

              ...item,

              rank:
                finalRank,

            };

          }


          return {

            ...item,

            rank:
              null,

          };

        }
      );

    }, [
      participants,
      search,
      showOnlyScored,
    ]);



  const scoredParticipants =
    rankedParticipants.filter(
      item =>
        item.eligible === true &&
        item.finalScore !==
        null
    );


  const topThree =
    scoredParticipants
      .slice(0, 3);


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        rankedParticipants.length /
        MOBILE_PAGE_SIZE
      )
    );


  const startIndex =
    (
      currentPage - 1
    ) *
    MOBILE_PAGE_SIZE;


  const pageItems =
    rankedParticipants.slice(
      startIndex,
      startIndex +
        MOBILE_PAGE_SIZE
    );


  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    showOnlyScored,
  ]);


  function exportRankingCSV() {

    const headers = [
      "Peringkat",
      "Nama Peserta",
      "Participant ID",
      "Kelas",
      "Personality",
      "Personality Maks",
      "Competency",
      "Competency Maks",
      "SJT",
      "SJT Maks",
      "Challenge",
      "Challenge Maks",
      "Final Score",
      "Status",
    ];

    const rows =
      rankedParticipants
        .filter(
          item =>
            item.eligible === true
        )
        .map(
          item => {

          const participant =
            item.participant;

          const personality =
            componentScore(
              participant,
              "personality",
              200
            );

          const competency =
            componentScore(
              participant,
              "competency",
              200
            );

          const sjt =
            componentScore(
              participant,
              "sjt",
              75
            );

          const challenge =
            componentScore(
              participant,
              "challenge",
              25
            );

          return [
            item.rank ?? "",
            safeText(
              participant?.nama,
              ""
            ),
            safeText(
              participant?.participant_id,
              ""
            ),
            safeText(
              participant?.kelas,
              ""
            ),
            personality.value ?? "",
            personality.max,
            competency.value ?? "",
            competency.max,
            sjt.value ?? "",
            sjt.max,
            challenge.value ?? "",
            challenge.max,
            item.finalScore === null
              ? ""
              : item.finalScore.toFixed(2),
            statusLabel(
              participant?.status
            ),
          ];
        }
      );

    const escapeCSV =
      value => {
        const text =
          String(
            value ?? ""
          );

        if (
          text.includes('"') ||
          text.includes(",") ||
          text.includes("\n")
        ) {
          return `"${text.replaceAll(
            '"',
            '""'
          )}"`;
        }

        return text;
      };

    const csv =
      [
        headers,
        ...rows,
      ]
        .map(
          row =>
            row
              .map(
                escapeCSV
              )
              .join(",")
        )
        .join("\r\n");

    const blob =
      new Blob(
        [
          "\uFEFF" +
          csv,
        ],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `ranking-pmr-smanel-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );
  }


  function openParticipant(
    participant
  ) {
    const id =
      participant?.participant_id;

    if (!id) {
      return;
    }

    navigate(
      `/admin/peserta/${encodeURIComponent(id)}`
    );
  }


  function podiumClass(
    index
  ) {
    if (index === 0) {
      return "bg-amber-50 border-amber-200";
    }

    if (index === 1) {
      return "bg-slate-50 border-slate-200";
    }

    return "bg-orange-50 border-orange-200";
  }


  function podiumIcon(
    index
  ) {
    if (index === 0) {
      return (
        <Trophy
          className="h-5 w-5 text-amber-600"
        />
      );
    }

    return (
      <Medal
        className={
          index === 1
            ? "h-5 w-5 text-slate-500"
            : "h-5 w-5 text-orange-500"
        }
      />
    );
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-3 py-5 sm:px-5 sm:py-6">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-[1440px] items-center justify-center">
          <div className="rounded-2xl bg-white px-8 py-10 text-center shadow-sm">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-red-600" />
            <div className="mt-4 text-base font-semibold text-slate-800">
              Memuat ranking...
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Mengambil nilai peserta.
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 sm:py-6">
      <div className="mx-auto w-full max-w-[1440px]">

        <header className="rounded-3xl bg-red-600 px-5 py-6 text-white shadow-sm sm:px-7 sm:py-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <button
                type="button"
                onClick={() =>
                  navigate("/admin")
                }
                className="mb-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </button>

              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-100">
                PMR SMANEL
              </div>

              <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
                Ranking & Rekap Nilai
              </h1>

              <p className="mt-1.5 text-xs leading-5 text-red-100 sm:text-sm">
                Ranking final berdasarkan Final Score yang sudah terverifikasi.
              </p>
            </div>

            <button
              type="button"
              onClick={
                exportRankingCSV
              }
              disabled={
                rankedParticipants.length === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export Rekap
            </button>

            <button
              type="button"
              onClick={() =>
                loadRanking(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <RefreshCw
                className={
                  refreshing
                    ? "h-4 w-4 animate-spin"
                    : "h-4 w-4"
                }
              />
              Refresh
            </button>

          </div>
        </header>


        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}


        <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

          {topThree.map(
            (item, index) => (
              <button
                key={
                  item.participant
                    ?.participant_id ||
                  index
                }
                type="button"
                onClick={() =>
                  openParticipant(
                    item.participant
                  )
                }
                className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${podiumClass(index)}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {podiumIcon(index)}

                    <span className="text-xs font-bold text-slate-500">
                      Peringkat {index + 1}
                    </span>
                  </div>

                  <div className="text-xl font-bold text-slate-900">
                    {item.finalScore.toFixed(2)}
                  </div>
                </div>

                <div className="mt-3 text-sm font-semibold text-slate-900">
                  {safeText(
                    item.participant?.nama,
                    "Nama belum tersedia"
                  )}
                </div>

                <div className="mt-1 text-[11px] text-slate-400">
                  {safeText(
                    item.participant?.participant_id
                  )}
                  <span className="mx-1.5">•</span>
                  Kelas{" "}
                  {safeText(
                    item.participant?.kelas
                  )}
                </div>
              </button>
            )
          )}

          {topThree.length === 0 && (
            <div className="sm:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <Trophy className="mx-auto h-8 w-8 text-slate-300" />
              <div className="mt-3 text-sm font-semibold text-slate-700">
                Belum ada Final Score
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Ranking akan muncul setelah nilai tersedia.
              </div>
            </div>
          )}

        </section>


        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={event =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Cari nama, ID, kelas, atau email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-50"
              />
            </div>

            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={showOnlyScored}
                onChange={event =>
                  setShowOnlyScored(
                    event.target.checked
                  )
                }
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              Hanya yang memiliki nilai
            </label>

          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-400">
            <span>
              {scoredParticipants.length} peserta memiliki Final Score
            </span>

            <span>
              Total{" "}
              {rankedParticipants.length}
            </span>
          </div>


          <div className="mt-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-700">
            Peserta yang belum memiliki Final Score
            belum masuk Ranking Final.
          </div>

        </section>


        <section className="mt-4 hidden md:block">

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="grid grid-cols-[70px_minmax(240px,1.6fr)_100px_minmax(170px,1fr)_150px_120px_110px] items-center gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">

              <div>#</div>
              <div>Peserta</div>
              <div>Kelas</div>
              <div>Komponen</div>
              <div>Final Score</div>
              <div>Status</div>
              <div>Aksi</div>

            </div>


            {rankedParticipants.length === 0 ? (

              <div className="px-6 py-16 text-center">
                <Users className="mx-auto h-10 w-10 text-slate-300" />
                <div className="mt-3 text-sm font-semibold text-slate-700">
                  Tidak ada data ranking
                </div>
              </div>

            ) : (

              <div className="divide-y divide-slate-100">

                {rankedParticipants.map(
                  item => {

                    const participant =
                      item.participant;

                    const personality =
                      componentScore(
                        participant,
                        "personality",
                        200
                      );

                    const competency =
                      componentScore(
                        participant,
                        "competency",
                        200
                      );

                    const sjt =
                      componentScore(
                        participant,
                        "sjt",
                        75
                      );

                    const challenge =
                      componentScore(
                        participant,
                        "challenge",
                        25
                      );

                    const status =
                      participant?.status;

                    return (
                      <div
                        key={
                          participant?.participant_id
                        }
                        className="grid grid-cols-[70px_minmax(240px,1.6fr)_100px_minmax(170px,1fr)_150px_120px_110px] items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
                      >

                        <div className="text-sm font-bold text-slate-500">
                          {item.rank ?? "-"}
                        </div>


                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-800">
                            {safeText(
                              participant?.nama,
                              "Nama belum tersedia"
                            )}
                          </div>

                          <div className="mt-1 truncate text-[11px] text-slate-400">
                            {safeText(
                              participant?.participant_id
                            )}
                          </div>
                        </div>


                        <div>
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600">
                            {safeText(
                              participant?.kelas
                            )}
                          </span>
                        </div>


                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-500">
                          <span>
                            P:{" "}
                            {personality.value === null
                              ? "-"
                              : `${personality.value}/${personality.max}`}
                          </span>

                          <span>
                            C:{" "}
                            {competency.value === null
                              ? "-"
                              : `${competency.value}/${competency.max}`}
                          </span>

                          <span>
                            SJT:{" "}
                            {sjt.value === null
                              ? "-"
                              : `${sjt.value}/${sjt.max}`}
                          </span>

                          <span>
                            CH:{" "}
                            {challenge.value === null
                              ? "-"
                              : `${challenge.value}/${challenge.max}`}
                          </span>
                        </div>


                        <div>
                          {item.finalScore === null ? (
                            <span className="text-xs font-semibold text-slate-400">
                              Belum Final
                            </span>
                          ) : (
                            <div className="text-2xl font-semibold tracking-tight text-slate-900">
                              {item.finalScore.toFixed(2)}
                            </div>
                          )}
                        </div>


                        <div>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1.5 text-[10px] font-semibold ${statusClass(status)}`}
                          >
                            {statusLabel(status)}
                          </span>
                        </div>


                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              openParticipant(
                                participant
                              )
                            }
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-semibold text-white hover:bg-red-600"
                          >
                            Detail
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>
        </section>


        <section className="mt-4 space-y-3 md:hidden">

          {pageItems.map(
            item => {

              const participant =
                item.participant;

              const status =
                participant?.status;

              return (
                <article
                  key={
                    participant?.participant_id
                  }
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >

                  <div className="border-b border-slate-100 p-4">

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[10px] font-bold text-red-600">
                            {item.rank ?? "-"}
                          </span>

                          <div className="truncate text-sm font-semibold text-slate-800">
                            {safeText(
                              participant?.nama
                            )}
                          </div>
                        </div>

                        <div className="mt-1 text-[11px] text-slate-400">
                          {safeText(
                            participant?.participant_id
                          )}
                          <span className="mx-1.5">•</span>
                          Kelas{" "}
                          {safeText(
                            participant?.kelas
                          )}
                        </div>

                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${statusClass(status)}`}
                      >
                        {statusLabel(status)}
                      </span>

                    </div>

                  </div>


                  <div className="grid grid-cols-2 gap-3 p-4">

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-slate-400">
                        Final Score
                      </div>

                      <div className="mt-1 text-2xl font-semibold text-slate-900">
                        {item.finalScore === null
                          ? "-"
                          : item.finalScore.toFixed(2)}
                      </div>
                    </div>


                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-slate-400">
                        Status Nilai
                      </div>

                      <div className="mt-1 text-sm font-semibold text-slate-700">
                        {item.finalScore === null
                          ? "Belum tersedia"
                          : "Tersedia"}
                      </div>
                    </div>

                  </div>


                  <div className="border-t border-slate-100 bg-slate-50 p-3">
                    <button
                      type="button"
                      onClick={() =>
                        openParticipant(
                          participant
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white hover:bg-red-600"
                    >
                      Lihat Detail
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                </article>
              );
            }
          )}


          {pageItems.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
              <Users className="mx-auto h-9 w-9 text-slate-300" />
              <div className="mt-3 text-sm font-semibold text-slate-700">
                Tidak ada data ranking
              </div>
            </div>
          )}

        </section>


        {totalPages > 1 && (
          <section className="mt-4 md:hidden">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

              <div className="flex items-center justify-between gap-3">

                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      page =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>


                <div className="text-center">
                  <div className="text-xs font-semibold text-slate-700">
                    Halaman{" "}
                    {currentPage} /{" "}
                    {totalPages}
                  </div>

                  <div className="mt-0.5 text-[10px] text-slate-400">
                    {startIndex + 1}
                    -
                    {Math.min(
                      startIndex +
                        MOBILE_PAGE_SIZE,
                      rankedParticipants.length
                    )}
                    {" "}dari{" "}
                    {rankedParticipants.length}
                  </div>
                </div>


                <button
                  type="button"
                  disabled={
                    currentPage >=
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      page =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

              </div>

            </div>
          </section>
        )}


        <footer className="py-7 text-center">
          <div className="text-[11px] font-medium text-slate-400">
            PMR SMANEL Leadership Assessment 2026
          </div>
        </footer>

      </div>
    </div>
  );
}