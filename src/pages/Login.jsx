import {
  useState,
} from "react";

import {
  ArrowRight,
  LockKeyhole,
  CheckCircle2,
  UserRound,
  GraduationCap,
  ShieldCheck,
  RotateCcw,
  Loader2,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";


/*
 * ============================================================
 * LOGIN PESERTA
 * ============================================================
 *
 * ALUR:
 *
 * 1. Masukkan Participant ID
 * 2. Ambil data peserta
 * 3. Simpan session
 * 4. Saat "Lanjut Assessment":
 *
 *    - cek jumlah jawaban
 *    - jika 100/100 -> Result
 *    - jika belum -> bagian pertama yang belum selesai
 *
 * ============================================================
 */


function Login() {

  const navigate =
    useNavigate();


  const [
    participantId,
    setParticipantId,
  ] =
    useState("");


  const [
    participant,
    setParticipant,
  ] =
    useState(null);


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    progressLoading,
    setProgressLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  /*
   * ==========================================================
   * API URL
   * ==========================================================
   */

  const API_URL =
    import.meta.env.VITE_API_URL;


  /*
   * ==========================================================
   * GET PARTICIPANT
   * ==========================================================
   */

  const getParticipant =
    async (
      id
    ) => {

      if (!API_URL) {

        throw new Error(
          "VITE_API_URL belum dikonfigurasi."
        );

      }


      const url =
        new URL(
          API_URL
        );


      url.searchParams.set(
        "action",
        "get_participant"
      );


      url.searchParams.set(
        "participant_id",
        id
      );


      console.log(
        "GET PARTICIPANT:",
        url.toString()
      );


      const response =
        await fetch(
          url.toString(),
          {
            method:
              "GET",
          }
        );


      if (!response.ok) {

        throw new Error(
          `Server error: ${response.status}`
        );

      }


      const text =
        await response.text();


      console.log(
        "RAW PARTICIPANT RESPONSE:",
        text
      );


      let result;


      try {

        result =
          JSON.parse(
            text
          );

      } catch {

        throw new Error(
          "Response backend bukan JSON yang valid."
        );

      }


      return result;

    };


  /*
   * ==========================================================
   * GET ANSWER COUNTS
   * ==========================================================
   *
   * Backend:
   *
   * ?action=get_answer_counts
   *
   * Output yang digunakan:
   *
   * {
   *   PERSONALITY: 40,
   *   COMPETENCY: 40,
   *   SJT: 15,
   *   CHALLENGE: 5
   * }
   *
   * ==========================================================
   */

  const getAnswerCounts =
    async (
      id
    ) => {

      if (!API_URL) {

        throw new Error(
          "VITE_API_URL belum dikonfigurasi."
        );

      }


      const url =
        new URL(
          API_URL
        );


      url.searchParams.set(
        "action",
        "get_answer_counts"
      );


      url.searchParams.set(
        "participant_id",
        id
      );


      console.log(
        "GET ANSWER COUNTS:",
        url.toString()
      );


      const response =
        await fetch(
          url.toString(),
          {
            method:
              "GET",
          }
        );


      if (!response.ok) {

        throw new Error(
          `Server error: ${response.status}`
        );

      }


      const text =
        await response.text();


      console.log(
        "RAW ANSWER COUNTS:",
        text
      );


      let result;


      try {

        result =
          JSON.parse(
            text
          );

      } catch {

        throw new Error(
          "Response progress bukan JSON yang valid."
        );

      }


      return result;

    };


  /*
   * ==========================================================
   * SIMPAN SESSION PESERTA
   * ==========================================================
   */

  const saveParticipantSession =
    (
      data
    ) => {

      const id =
        String(
          data?.participant_id ||
          data?.participantId ||
          data?.id ||
          ""
        ).trim();


      if (!id) {

        return;

      }


      /*
       * ID utama
       */

      localStorage.setItem(
        "participant_id",
        id
      );


      sessionStorage.setItem(
        "participant_id",
        id
      );


      /*
       * Data lengkap peserta
       */

      localStorage.setItem(
        "pmr_participant",
        JSON.stringify(
          data
        )
      );


      sessionStorage.setItem(
        "pmr_participant",
        JSON.stringify(
          data
        )
      );

    };


  /*
   * ==========================================================
   * CARI HALAMAN PERTAMA YANG BELUM SELESAI
   * ==========================================================
   */

  const getNextAssessmentRoute =
    (
      counts
    ) => {

      const personality =
        Number(
          counts?.PERSONALITY ||
          0
        );


      const competency =
        Number(
          counts?.COMPETENCY ||
          0
        );


      const sjt =
        Number(
          counts?.SJT ||
          0
        );


      const challenge =
        Number(
          counts?.CHALLENGE ||
          0
        );


      /*
       * PERSONALITY
       */

      if (
        personality < 40
      ) {

        return {
          route:
            "/assessment/personality",

          label:
            "Personality",

          answered:
            personality,

          required:
            40,

        };

      }


      /*
       * COMPETENCY
       */

      if (
        competency < 40
      ) {

        return {
          route:
            "/assessment/competency",

          label:
            "Competency",

          answered:
            competency,

          required:
            40,

        };

      }


      /*
       * SJT
       */

      if (
        sjt < 15
      ) {

        return {
          route:
            "/assessment/sjt",

          label:
            "Situational Judgment",

          answered:
            sjt,

          required:
            15,

        };

      }


      /*
       * CHALLENGE
       */

      if (
        challenge < 5
      ) {

        return {
          route:
            "/assessment/challenge",

          label:
            "Leadership Challenge",

          answered:
            challenge,

          required:
            5,

        };

      }


      /*
       * Semua selesai
       */

      return null;

    };


  /*
   * ==========================================================
   * SUBMIT PARTICIPANT ID
   * ==========================================================
   */

  const handleSubmit =
    async (
      event
    ) => {

      event.preventDefault();


      const id =
        participantId
          .trim()
          .toUpperCase();


      if (!id) {

        setError(
          "Participant ID wajib diisi."
        );

        return;

      }


      setError("");
      setParticipant(null);
      setLoading(true);


      try {

        const result =
          await getParticipant(
            id
          );


        console.log(
          "PARTICIPANT RESULT:",
          result
        );


        /*
         * ======================================================
         * VALIDASI
         * ======================================================
         */

        if (
          !result?.success
        ) {

          throw new Error(
            result?.error?.message ||
            "Participant ID tidak ditemukan."
          );

        }


        /*
         * ======================================================
         * AMBIL DATA PESERTA
         * ======================================================
         */

        const data =
          result?.data?.participant ||
          result?.data?.data ||
          result?.data;


        if (!data) {

          throw new Error(
            "Data peserta tidak ditemukan pada response backend."
          );

        }


        console.log(
          "DATA PESERTA FINAL:",
          data
        );


        const normalizedParticipant = {

          participant_id:
            data.participant_id ||
            data.id ||
            data.participantId ||
            id,


          nama:
            data.nama ||
            data.name ||
            data.nama_lengkap ||
            "",


          kelas:
            data.kelas ||
            data.class ||
            "",


          email:
            data.email ||
            "",


          status:
            data.status ||
            "ACTIVE",


          assessment_status:
            data.assessment_status ||
            "",

        };


        /*
         * ======================================================
         * SET DATA
         * ======================================================
         */

        setParticipant(
          normalizedParticipant
        );


        /*
         * ======================================================
         * SIMPAN SESSION
         * ======================================================
         */

        saveParticipantSession(
          normalizedParticipant
        );


      } catch (
        err
      ) {

        console.error(
          "GET PARTICIPANT ERROR:",
          err
        );


        setParticipant(
          null
        );


        setError(
          err?.message ||
          "Terjadi kesalahan saat menghubungkan ke server."
        );


      } finally {

        setLoading(
          false
        );

      }

    };


  /*
   * ==========================================================
   * LANJUT ASSESSMENT
   * ==========================================================
   */

  const handleContinue =
    async () => {

      if (!participant) {

        setError(
          "Data peserta belum tersedia."
        );

        return;

      }


      const id =
        String(
          participant.participant_id ||
          ""
        ).trim();


      if (!id) {

        setError(
          "Participant ID tidak ditemukan."
        );

        return;

      }


      setError(
        ""
      );


      setProgressLoading(
        true
      );


      try {

        /*
         * ======================================================
         * PASTIKAN SESSION
         * ======================================================
         */

        saveParticipantSession(
          participant
        );


        /*
         * ======================================================
         * CEK PROGRESS BACKEND
         * ======================================================
         */

        const result =
          await getAnswerCounts(
            id
          );


        console.log(
          "PARTICIPANT PROGRESS RESULT:",
          result
        );


        if (
          !result ||
          result.success !== true
        ) {

          throw new Error(
            result?.error?.message ||
            "Progress assessment tidak dapat diperiksa."
          );

        }


        const data =
          result?.data ||
          {};


        const counts =
          data?.counts ||
          {};


        /*
         * ======================================================
         * NORMALISASI COUNT
         * ======================================================
         */

        const personality =
          Number(
            counts.PERSONALITY ||
            0
          );


        const competency =
          Number(
            counts.COMPETENCY ||
            0
          );


        const sjt =
          Number(
            counts.SJT ||
            0
          );


        const challenge =
          Number(
            counts.CHALLENGE ||
            0
          );


        const totalAnswered =
          personality +
          competency +
          sjt +
          challenge;


        const totalQuestions =
          40 +
          40 +
          15 +
          5;


        console.log(
          "ASSESSMENT PROGRESS:",
          {
            personality,
            competency,
            sjt,
            challenge,
            totalAnswered,
            totalQuestions,
          }
        );


        /*
         * ======================================================
         * CEK SELESAI
         * ======================================================
         */

        const completed =
          personality >= 40 &&
          competency >= 40 &&
          sjt >= 15 &&
          challenge >= 5;


        if (
          completed
        ) {

          /*
           * ====================================================
           * SUDAH SELESAI
           *
           * Langsung ke Result.
           * ====================================================
           */

          console.log(
            "ASSESSMENT COMPLETED -> RESULT"
          );


          navigate(
            "/result",
            {
              replace:
                true,

              state: {
                participantId:
                  id,
              },

            }
          );


          return;

        }


        /*
         * ======================================================
         * BELUM SELESAI
         *
         * Cari section pertama yang belum selesai.
         * ======================================================
         */

        const next =
          getNextAssessmentRoute(
            counts
          );


        if (!next) {

          /*
           * Safety fallback.
           */

          navigate(
            "/result",
            {
              replace:
                true,

              state: {
                participantId:
                  id,
              },

            }
          );


          return;

        }


        console.log(
          "NEXT ASSESSMENT:",
          next
        );


        /*
         * ======================================================
         * NAVIGASI
         * ======================================================
         *
         * Assessment.jsx akan membaca jawaban yang sudah ada
         * dan melanjutkan dari soal pertama yang belum dijawab.
         *
         * Jadi:
         *
         * Competency 18/40
         * -> masuk Competency
         * -> lanjut sekitar soal 19
         *
         * ======================================================
         */

        navigate(
          next.route,
          {
            replace:
              true,

            state: {
              participantId:
                id,

              resume:
                true,

              answered:
                next.answered,

              required:
                next.required,

              assessmentType:
                next.label,

            },

          }
        );


      } catch (
        err
      ) {

        console.error(
          "CONTINUE ASSESSMENT ERROR:",
          err
        );


        setError(
          err?.message ||
          "Assessment tidak dapat dilanjutkan."
        );


      } finally {

        setProgressLoading(
          false
        );

      }

    };


  /*
   * ==========================================================
   * KEMBALI / GANTI ID
   * ==========================================================
   */

  const handleBack =
    () => {

      setParticipant(
        null
      );


      setError(
        ""
      );

    };


  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (

    <main className="min-h-screen bg-slate-100 text-slate-900">

      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 py-8 sm:px-8">

        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">


          {/* =================================================
              BRANDING
          ================================================== */}

          <section className="relative flex flex-col justify-between overflow-hidden bg-red-600 p-8 sm:p-10 lg:p-12">

            <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-white/10" />

            <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-black/10" />


            <div className="relative z-10">

              {/* LOGO */}

              <div className="mx-auto mb-8 flex max-w-sm justify-center rounded-2xl bg-white p-4 shadow-xl sm:p-5">

                <img
                  src="/logo-pmr-smanel.jpg"
                  alt="Logo PMR SMANEL"
                  className="h-auto w-full max-w-[280px] object-contain sm:max-w-[320px]"
                />

              </div>


              <p className="text-center text-sm font-bold uppercase tracking-[0.25em] text-red-100">
                PMR SMAN 1 AIKMEL
              </p>


              <h1 className="mt-4 text-center text-3xl font-extrabold leading-tight text-white sm:text-4xl">

                Leadership

                <br />

                Assessment 2026

              </h1>


              <p className="mx-auto mt-5 max-w-md text-center text-sm leading-6 text-red-50 sm:text-base">

                Platform assessment kepemimpinan anggota PMR
                SMAN 1 Aikmel untuk mengenali potensi,
                kompetensi, dan kesiapan calon pemimpin PMR.

              </p>

            </div>


            {/* FOOTER BRANDING */}

            <div className="relative z-10 mt-10 text-center text-xs text-red-100">

              <p className="font-semibold">
                Together We Can, We Are Not Alone
              </p>

              <p className="mt-2 opacity-80">
                PMR SMANEL
              </p>

            </div>

          </section>


          {/* =================================================
              RIGHT CONTENT
          ================================================== */}

          <section className="flex items-center bg-white px-7 py-10 sm:px-10 lg:px-12">

            <div className="mx-auto w-full max-w-md">


              {/* =================================================
                  STEP 1
              ================================================== */}

              {!participant && (

                <>

                  <div className="mb-8">

                    <p className="text-sm font-bold uppercase tracking-wider text-red-600">
                      Peserta
                    </p>


                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                      Selamat Datang
                    </h2>


                    <p className="mt-3 leading-6 text-slate-500">

                      Masukkan Participant ID Anda untuk
                      memulai Leadership Assessment.

                    </p>

                  </div>


                  <form
                    onSubmit={
                      handleSubmit
                    }
                    className="space-y-5"
                  >

                    {/* PARTICIPANT ID */}

                    <div>

                      <label
                        htmlFor="participantId"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Participant ID
                      </label>


                      <div className="relative">

                        <LockKeyhole
                          size={19}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />


                        <input
                          id="participantId"
                          type="text"
                          value={
                            participantId
                          }
                          onChange={
                            (event) => {

                              setParticipantId(
                                event.target.value
                              );

                              setError(
                                ""
                              );

                            }
                          }
                          placeholder="Contoh: PMR26-001"
                          autoComplete="off"
                          autoCapitalize="characters"
                          disabled={
                            loading
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium uppercase outline-none transition placeholder:text-slate-400 placeholder:normal-case focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                      </div>

                    </div>


                    {/* ERROR */}

                    {error && (

                      <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

                        <div className="mt-0.5">
                          ⚠️
                        </div>

                        <div>
                          {error}
                        </div>

                      </div>

                    )}


                    {/* BUTTON */}

                    <button
                      type="submit"
                      disabled={
                        loading
                      }
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {loading ? (

                        <>

                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                          Memeriksa...

                        </>

                      ) : (

                        <>

                          Mulai Assessment

                          <ArrowRight
                            size={18}
                            className="transition-transform group-hover:translate-x-1"
                          />

                        </>

                      )}

                    </button>

                  </form>


                  {/* INFO */}

                  <div className="mt-8 border-t border-slate-100 pt-6">

                    <p className="text-center text-xs leading-5 text-slate-400">

                      Gunakan Participant ID yang diberikan
                      oleh panitia.

                      <br />

                      Jangan bagikan ID Anda kepada peserta lain.

                    </p>

                  </div>

                </>

              )}


              {/* =================================================
                  STEP 2 - PESERTA DITEMUKAN
              ================================================== */}

              {participant && (

                <div>

                  {/* HEADER */}

                  <div className="mb-7">

                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-green-600">

                      <CheckCircle2
                        size={18}
                      />

                      Peserta Ditemukan

                    </div>


                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                      Data Peserta
                    </h2>


                    <p className="mt-3 leading-6 text-slate-500">

                      Periksa data berikut sebelum melanjutkan
                      ke Leadership Assessment.

                    </p>

                  </div>


                  {/* DATA CARD */}

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">

                    {/* VERIFIED HEADER */}

                    <div className="border-b border-green-100 bg-green-50 px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">

                          <CheckCircle2
                            size={22}
                            className="text-green-600"
                          />

                        </div>


                        <div>

                          <p className="font-bold text-green-700">
                            Data berhasil ditemukan
                          </p>

                          <p className="text-xs text-green-600">
                            Participant ID valid
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* DATA */}

                    <div className="divide-y divide-slate-200">

                      {/* ID */}

                      <div className="flex items-center gap-4 px-5 py-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">

                          <ShieldCheck
                            size={19}
                            className="text-red-600"
                          />

                        </div>


                        <div className="min-w-0">

                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Participant ID
                          </p>

                          <p className="mt-1 truncate text-sm font-bold text-slate-900">

                            {
                              participant?.participant_id ||
                              "-"
                            }

                          </p>

                        </div>

                      </div>


                      {/* NAMA */}

                      <div className="flex items-center gap-4 px-5 py-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">

                          <UserRound
                            size={19}
                            className="text-red-600"
                          />

                        </div>


                        <div className="min-w-0">

                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Nama Peserta
                          </p>

                          <p className="mt-1 break-words text-sm font-bold text-slate-900">

                            {
                              participant?.nama ||
                              "-"
                            }

                          </p>

                        </div>

                      </div>


                      {/* KELAS */}

                      <div className="flex items-center gap-4 px-5 py-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">

                          <GraduationCap
                            size={19}
                            className="text-red-600"
                          />

                        </div>


                        <div className="min-w-0">

                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Kelas
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-900">

                            {
                              participant?.kelas ||
                              "-"
                            }

                          </p>

                        </div>

                      </div>


                      {/* EMAIL */}

                      {participant?.email && (

                        <div className="px-5 py-4">

                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Email
                          </p>

                          <p className="mt-1 break-all text-sm font-medium text-slate-700">

                            {
                              participant.email
                            }

                          </p>

                        </div>

                      )}


                      {/* STATUS */}

                      <div className="flex items-center justify-between gap-4 px-5 py-4">

                        <div>

                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Status Peserta
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Peserta terdaftar dalam sistem
                          </p>

                        </div>


                        <span className="shrink-0 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">

                          {
                            participant?.status ||
                            "ACTIVE"
                          }

                        </span>

                      </div>

                    </div>

                  </div>


                  {/* WARNING */}

                  <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">

                    <p className="text-xs leading-5 text-amber-700">

                      <strong>
                        Periksa kembali.
                      </strong>{" "}

                      Pastikan nama dan kelas di atas
                      adalah data Anda. Jika data tidak sesuai,
                      silakan kembali dan gunakan Participant ID
                      yang benar.

                    </p>

                  </div>


                  {/* ERROR */}

                  {error && (

                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

                      <div className="mt-0.5">
                        ⚠️
                      </div>

                      <div>
                        {error}
                      </div>

                    </div>

                  )}


                  {/* ACTIONS */}

                  <div className="mt-6 space-y-3">

                    {/* CONTINUE */}

                    <button
                      type="button"
                      onClick={
                        handleContinue
                      }
                      disabled={
                        progressLoading
                      }
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {progressLoading ? (

                        <>

                          <Loader2
                            size={18}
                            className="animate-spin"
                          />

                          Memeriksa Progress...

                        </>

                      ) : (

                        <>

                          Lanjut Assessment

                          <ArrowRight
                            size={18}
                            className="transition-transform group-hover:translate-x-1"
                          />

                        </>

                      )}

                    </button>


                    {/* BACK */}

                    <button
                      type="button"
                      onClick={
                        handleBack
                      }
                      disabled={
                        progressLoading
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      <RotateCcw
                        size={16}
                      />

                      Ganti Participant ID

                    </button>

                  </div>


                  {/* SECURITY INFO */}

                  <div className="mt-7 border-t border-slate-100 pt-5">

                    <p className="text-center text-xs leading-5 text-slate-400">

                      Dengan melanjutkan, sistem akan memeriksa
                      progress assessment Anda.

                      <br />

                      Jika belum selesai, Anda akan diarahkan
                      ke soal terakhir yang belum dijawab.

                    </p>

                  </div>

                </div>

              )}

            </div>

          </section>

        </div>

      </div>

    </main>

  );

}


export default Login;