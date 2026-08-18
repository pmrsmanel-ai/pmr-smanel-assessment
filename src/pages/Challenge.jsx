import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Save,
  Send,
  Sparkles,
} from "lucide-react";

import {
  apiGet,
  apiPost,
} from "../api/api";


/* ============================================================
 * CONSTANTS
 * ============================================================
 */

const ASSESSMENT_TYPE =
  "CHALLENGE";

const MAX_ANSWER_LENGTH =
  1000;

const EXPECTED_QUESTIONS =
  5;

const POLLING_INTERVAL =
  5000;


/* ============================================================
 * PARTICIPANT ID
 * ============================================================
 */

function getParticipantId() {

  if (
    typeof window ===
    "undefined"
  ) {
    return "";
  }


  const sessionId =
    sessionStorage.getItem(
      "participant_id"
    );


  const localId =
    localStorage.getItem(
      "participant_id"
    );


  const params =
    new URLSearchParams(
      window.location.search
    );


  const urlId =
    params.get(
      "participant_id"
    ) ||
    params.get(
      "participantId"
    );


  return String(
    sessionId ||
      localId ||
      urlId ||
      ""
  ).trim();
}


/* ============================================================
 * QUESTION ID
 * ============================================================
 */

function getQuestionId(
  question,
  index = 0
) {

  const id =
    question?.question_id ||
    question?.questionId ||
    question?.challenge_id ||
    question?.challengeId ||
    question?.question_code ||
    question?.code ||
    question?.id;


  return String(
    id ||
      `CH${String(
        index + 1
      ).padStart(3, "0")}`
  ).trim();
}


/* ============================================================
 * QUESTION TITLE
 * ============================================================
 */

function getQuestionTitle(
  question,
  index
) {

  return (
    question?.title ||
    question?.question_text ||
    question?.question ||
    question?.judul ||
    `Pertanyaan ${index + 1}`
  );
}


/* ============================================================
 * SCENARIO
 * ============================================================
 */

function getScenario(
  question
) {

  return (
    question?.scenario ||
    question?.skenario ||
    ""
  );
}


/* ============================================================
 * INSTRUCTION
 * ============================================================
 */

function getInstruction(
  question
) {

  return (
    question?.instruction ||
    question?.instructions ||
    question?.petunjuk ||
    ""
  );
}


/* ============================================================
 * EXTRACT QUESTIONS
 * ============================================================
 */

function extractQuestions(
  result
) {

  const data =
    result?.data;


  if (
    Array.isArray(
      data
    )
  ) {
    return data;
  }


  if (
    Array.isArray(
      data?.questions
    )
  ) {
    return data.questions;
  }


  if (
    Array.isArray(
      data?.items
    )
  ) {
    return data.items;
  }


  if (
    Array.isArray(
      result?.questions
    )
  ) {
    return result.questions;
  }


  return [];
}


/* ============================================================
 * EXTRACT ANSWERS
 * ============================================================
 */

function extractAnswers(
  result
) {

  const data =
    result?.data;


  if (
    Array.isArray(
      data
    )
  ) {
    return data;
  }


  if (
    Array.isArray(
      data?.answers
    )
  ) {
    return data.answers;
  }


  if (
    Array.isArray(
      result?.answers
    )
  ) {
    return result.answers;
  }


  return [];
}


/* ============================================================
 * NORMALIZE
 * ============================================================
 */

function normalizeAnswer(
  value
) {

  if (
    value ===
      undefined ||
    value ===
      null
  ) {
    return "";
  }


  return String(
    value
  );
}


/* ============================================================
 * EXTRACT SCORE
 * ============================================================
 */

function extractScore(
  result
) {

  if (
    !result
  ) {
    return null;
  }


  if (
    result.data?.data &&
    typeof result.data.data ===
      "object"
  ) {
    return result.data.data;
  }


  if (
    result.data &&
    typeof result.data ===
      "object"
  ) {
    return result.data;
  }


  return null;
}


/* ============================================================
 * FINAL SCORE CHECK
 * ============================================================
 */

function hasFinalScore(
  score
) {

  if (
    !score
  ) {
    return false;
  }


  return (
    score.final_score !==
      undefined &&
    score.final_score !==
      null &&
    String(
      score.final_score
    ).trim() !== ""
  );
}


/* ============================================================
 * COMPONENT
 * ============================================================
 */

export default function Challenge({
  onBack,
  onFinish,
}) {

  /* ==========================================================
   * PARTICIPANT
   * ==========================================================
   */

  const participantId =
    useMemo(
      () =>
        getParticipantId(),
      []
    );


  /* ==========================================================
   * QUESTIONS
   * ==========================================================
   */

  const [
    questions,
    setQuestions
  ] = useState([]);


  const [
    answers,
    setAnswers
  ] = useState({});


  const [
    currentIndex,
    setCurrentIndex
  ] = useState(0);


  /* ==========================================================
   * GENERAL STATE
   * ==========================================================
   */

  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    saving,
    setSaving
  ] = useState(false);


  const [
    submitting,
    setSubmitting
  ] = useState(false);


  const [
    submitted,
    setSubmitted
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  const [
    saveMessage,
    setSaveMessage
  ] = useState("");


  /* ==========================================================
   * RESULT STATUS
   * ==========================================================
   */

  const [
    checkingResult,
    setCheckingResult
  ] = useState(false);


  const [
    score,
    setScore
  ] = useState(null);


  const [
    resultReady,
    setResultReady
  ] = useState(false);


  const [
    resultError,
    setResultError
  ] = useState("");


  /* ==========================================================
   * CURRENT QUESTION
   * ==========================================================
   */

  const currentQuestion =
    questions[
      currentIndex
    ] || null;


  const currentQuestionId =
    currentQuestion
      ? getQuestionId(
          currentQuestion,
          currentIndex
        )
      : "";


  const currentAnswer =
    currentQuestionId
      ? normalizeAnswer(
          answers[
            currentQuestionId
          ]
        )
      : "";


  /* ==========================================================
   * COUNTS
   * ==========================================================
   */

  const answeredCount =
    questions.filter(
      (
        question,
        index
      ) => {

        const id =
          getQuestionId(
            question,
            index
          );


        return (
          normalizeAnswer(
            answers[id]
          ).trim() !== ""
        );

      }
    ).length;


  const unansweredCount =
    Math.max(
      questions.length -
        answeredCount,
      0
    );


  const allAnswered =
    questions.length > 0 &&
    answeredCount ===
      questions.length;


  const isLastQuestion =
    currentIndex ===
    questions.length - 1;


  /* ==========================================================
   * INITIAL LOAD
   * ==========================================================
   */

  useEffect(() => {

    if (
      !participantId
    ) {

      setLoading(false);

      setError(
        "Participant ID tidak ditemukan."
      );

      return;
    }


    initializeChallenge();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantId]);


  /* ==========================================================
   * INITIALIZE
   * ==========================================================
   */

  async function initializeChallenge() {

    setLoading(true);
    setError("");


    try {

      /* ------------------------------------------------------
       * START
       * ------------------------------------------------------
       */

      const startResult =
        await apiPost({

          action:
            "start_assessment",

          participant_id:
            participantId,

          assessment_type:
            ASSESSMENT_TYPE,

        });


      console.log(
        "START CHALLENGE:",
        startResult
      );


      if (
        !startResult ||
        startResult.success !==
          true
      ) {

        throw new Error(
          startResult?.error?.message ||
          "Challenge gagal dimulai."
        );

      }


      /* ------------------------------------------------------
       * QUESTIONS
       * ------------------------------------------------------
       */

      const questionResult =
        await apiGet({

          action:
            "get_questions",

          participant_id:
            participantId,

          assessment_type:
            ASSESSMENT_TYPE,

          type:
            ASSESSMENT_TYPE,

        });


      console.log(
        "GET CHALLENGE QUESTIONS:",
        questionResult
      );


      if (
        !questionResult ||
        questionResult.success !==
          true
      ) {

        throw new Error(
          questionResult?.error?.message ||
          "Gagal mengambil soal Challenge."
        );

      }


      const loadedQuestions =
        extractQuestions(
          questionResult
        );


      if (
        loadedQuestions.length ===
        0
      ) {

        throw new Error(
          "Soal Challenge tidak ditemukan."
        );

      }


      const normalizedQuestions =
        loadedQuestions.slice(
          0,
          EXPECTED_QUESTIONS
        );


      setQuestions(
        normalizedQuestions
      );


      /* ------------------------------------------------------
       * EXISTING ANSWERS
       * ------------------------------------------------------
       */

      const answerResult =
        await apiGet({

          action:
            "get_participant_answers",

          participant_id:
            participantId,

          type:
            ASSESSMENT_TYPE,

          assessment_type:
            ASSESSMENT_TYPE,

        });


      console.log(
        "GET CHALLENGE ANSWERS:",
        answerResult
      );


      if (
        answerResult &&
        answerResult.success ===
          true
      ) {

        const existingAnswers =
          extractAnswers(
            answerResult
          );


        const answerMap =
          {};


        existingAnswers.forEach(
          (
            item
          ) => {

            const id =
              item?.question_id ||
              item?.questionId ||
              item?.challenge_id ||
              item?.challengeId;


            if (!id) {
              return;
            }


            answerMap[
              String(
                id
              ).trim()
            ] =
              normalizeAnswer(
                item?.answer
              );

          }
        );


        setAnswers(
          answerMap
        );


        const firstUnanswered =
          normalizedQuestions.findIndex(
            (
              question,
              index
            ) => {

              const id =
                getQuestionId(
                  question,
                  index
                );


              return (
                normalizeAnswer(
                  answerMap[id]
                ).trim() ===
                ""
              );

            }
          );


        if (
          firstUnanswered >=
          0
        ) {

          setCurrentIndex(
            firstUnanswered
          );

        } else {

          setCurrentIndex(
            0
          );

        }

      }

    } catch (err) {

      console.error(
        "CHALLENGE INITIALIZE ERROR:",
        err
      );


      setError(
        err?.message ||
        "Terjadi kesalahan saat memuat Challenge."
      );

    } finally {

      setLoading(false);

    }

  }


  /* ==========================================================
   * ESSAY CHANGE
   * ==========================================================
   */

  function handleEssayChange(
    event
  ) {

    if (
      submitted ||
      submitting
    ) {
      return;
    }


    const value =
      event.target.value;


    if (
      value.length >
      MAX_ANSWER_LENGTH
    ) {
      return;
    }


    setAnswers(
      (
        previous
      ) => ({

        ...previous,

        [currentQuestionId]:
          value,

      })
    );


    setError("");
    setSaveMessage("");

  }


  /* ==========================================================
   * SAVE CURRENT
   * ==========================================================
   */

  async function saveCurrentAnswer() {

    if (
      submitted ||
      !participantId ||
      !currentQuestionId
    ) {
      return false;
    }


    const answer =
      normalizeAnswer(
        answers[
          currentQuestionId
        ]
      ).trim();


    if (!answer) {

      setError(
        "Jawaban belum diisi."
      );

      return false;

    }


    setSaving(true);
    setError("");
    setSaveMessage("");


    try {

      const result =
        await apiPost({

          action:
            "save_answer",

          participant_id:
            participantId,

          assessment_type:
            ASSESSMENT_TYPE,

          question_id:
            currentQuestionId,

          answer:
            answer,

        });


      console.log(
        "SAVE CHALLENGE ANSWER:",
        result
      );


      if (
        !result ||
        result.success !==
          true
      ) {

        throw new Error(
          result?.error?.message ||
          "Jawaban gagal disimpan."
        );

      }


      setSaveMessage(
        "Jawaban tersimpan."
      );


      return true;


    } catch (err) {

      console.error(
        "SAVE CHALLENGE ERROR:",
        err
      );


      setError(
        err?.message ||
        "Jawaban gagal disimpan."
      );


      return false;


    } finally {

      setSaving(false);

    }

  }


  /* ==========================================================
   * SAVE ALL
   * ==========================================================
   */

  async function saveAllAnswers() {

    for (
      let index = 0;
      index <
        questions.length;
      index++
    ) {

      const question =
        questions[index];


      const questionId =
        getQuestionId(
          question,
          index
        );


      const answer =
        normalizeAnswer(
          answers[
            questionId
          ]
        ).trim();


      if (!answer) {

        setCurrentIndex(
          index
        );


        setError(
          `Jawaban pertanyaan ${index + 1} belum diisi.`
        );


        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });


        return false;

      }


      const result =
        await apiPost({

          action:
            "save_answer",

          participant_id:
            participantId,

          assessment_type:
            ASSESSMENT_TYPE,

          question_id:
            questionId,

          answer:
            answer,

        });


      console.log(
        "SAVE ALL:",
        questionId,
        result
      );


      if (
        !result ||
        result.success !==
          true
      ) {

        setCurrentIndex(
          index
        );


        setError(
          result?.error?.message ||
          `Jawaban ${questionId} gagal disimpan.`
        );


        return false;

      }

    }


    return true;

  }


  /* ==========================================================
   * NAVIGATION
   * ==========================================================
   */

  async function goToQuestion(
    index
  ) {

    if (
      index < 0 ||
      index >=
        questions.length
    ) {
      return;
    }


    if (
      saving ||
      submitting
    ) {
      return;
    }


    if (
      currentAnswer.trim()
    ) {

      const saved =
        await saveCurrentAnswer();


      if (!saved) {
        return;
      }

    }


    setCurrentIndex(
      index
    );


    window.scrollTo({

      top: 0,

      behavior:
        "smooth",

    });

  }


  /* ==========================================================
   * PREVIOUS
   * ==========================================================
   */

  async function handlePrevious() {

    if (
      currentIndex <=
      0
    ) {
      return;
    }


    await goToQuestion(
      currentIndex - 1
    );

  }


  /* ==========================================================
   * NEXT
   * ==========================================================
   */

  async function handleNext() {

    if (
      !currentAnswer.trim()
    ) {

      setError(
        "Jawaban harus diisi sebelum melanjutkan."
      );

      return;

    }


    if (
      isLastQuestion
    ) {

      await handleSubmit();

      return;

    }


    await goToQuestion(
      currentIndex + 1
    );

  }


  /* ==========================================================
   * SUBMIT
   * ==========================================================
   */

  async function handleSubmit() {

    if (
      submitting ||
      submitted
    ) {
      return;
    }


    setError("");


    if (
      !allAnswered
    ) {

      const firstUnanswered =
        questions.findIndex(
          (
            question,
            index
          ) => {

            const id =
              getQuestionId(
                question,
                index
              );


            return (
              normalizeAnswer(
                answers[id]
              ).trim() ===
              ""
            );

          }
        );


      if (
        firstUnanswered >=
        0
      ) {

        setCurrentIndex(
          firstUnanswered
        );

      }


      setError(
        "Semua 5 pertanyaan Challenge harus dijawab."
      );


      window.scrollTo({
        top: 0,
        behavior:
          "smooth",
      });


      return;

    }


    setSubmitting(
      true
    );


    try {

      /* ------------------------------------------------------
       * SAVE LAST ANSWER
       * ------------------------------------------------------
       */

      const currentSaved =
        await saveCurrentAnswer();


      if (!currentSaved) {
        return;
      }


      /* ------------------------------------------------------
       * SAVE ALL
       * ------------------------------------------------------
       */

      const allSaved =
        await saveAllAnswers();


      if (!allSaved) {
        return;
      }


      /* ------------------------------------------------------
       * VALIDATE COMPLETION
       * ------------------------------------------------------
       */

      const completionResult =
        await apiGet({

          action:
            "validate_completion",

          participant_id:
            participantId,

        });


      console.log(
        "CHALLENGE COMPLETION:",
        completionResult
      );


      if (
        !completionResult ||
        completionResult.success !==
          true
      ) {

        throw new Error(
          completionResult?.error?.message ||
          "Challenge belum lengkap."
        );

      }


      const completion =
        completionResult.data ||
        {};


      const challenge =
        completion.challenge ||
        {};


      const completed =
        Number(
          challenge.answered ||
          0
        );


      const required =
        Number(
          challenge.required ||
            questions.length
        );


      if (
        completed <
        required
      ) {

        throw new Error(
          `Challenge belum lengkap (${completed}/${required}).`
        );

      }


      /*
       * Jangan memberi nilai Challenge di sini.
       *
       * Backend memang menetapkan Challenge = 0
       * sampai proses evaluator dilakukan.
       */

      setSubmitted(
        true
      );


      /*
       * Langsung cek status score.
       */

      await checkResultOnce();

    } catch (err) {

      console.error(
        "SUBMIT CHALLENGE ERROR:",
        err
      );


      setError(
        err?.message ||
        "Challenge gagal dikirim."
      );

    } finally {

      setSubmitting(
        false
      );

    }

  }


  /* ==========================================================
   * CHECK RESULT
   * ==========================================================
   */

  async function checkResultOnce() {

    if (
      !participantId
    ) {
      return;
    }


    setCheckingResult(
      true
    );

    setResultError("");


    try {

      const result =
        await apiGet({

          action:
            "get_score",

          participant_id:
            participantId,

        });


      console.log(
        "CHALLENGE RESULT CHECK:",
        result
      );


      if (
        !result ||
        result.success !==
          true
      ) {

        throw new Error(
          result?.error?.message ||
          "Hasil assessment belum dapat diperiksa."
        );

      }


      const data =
        extractScore(
          result
        );


      setScore(
        data
      );


      setResultReady(
        hasFinalScore(
          data
        )
      );


    } catch (err) {

      console.error(
        "CHECK RESULT ERROR:",
        err
      );


      setResultError(
        err?.message ||
        "Belum dapat mengambil status hasil."
      );

    } finally {

      setCheckingResult(
        false
      );

    }

  }


  /* ==========================================================
   * POLLING
   * ==========================================================
   *
   * Hanya berjalan setelah peserta mengirim Challenge.
   *
   * Tidak menggunakan endpoint AI yang belum terverifikasi.
   * Menggunakan get_score yang memang sudah tersedia.
   *
   * ==========================================================
   */

  useEffect(() => {

    if (
      !submitted ||
      resultReady ||
      !participantId
    ) {
      return undefined;
    }


    const timer =
      window.setInterval(
        () => {

          checkResultOnce();

        },
        POLLING_INTERVAL
      );


    return () => {

      window.clearInterval(
        timer
      );

    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    submitted,
    resultReady,
    participantId,
  ]);


  /* ==========================================================
   * LOADING
   * ==========================================================
   */

  if (
    loading
  ) {

    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10">

        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">

          <div className="rounded-3xl bg-white px-10 py-12 text-center shadow-xl">

            <Loader2
              className="mx-auto h-10 w-10 animate-spin text-red-600"
            />

            <h2 className="mt-5 text-xl font-extrabold text-slate-950">
              Memuat Leadership Challenge
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Sedang mengambil soal Challenge.
            </p>

          </div>

        </div>

      </div>
    );

  }


  /* ==========================================================
   * INITIAL ERROR
   * ==========================================================
   */

  if (
    error &&
    !questions.length
  ) {

    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10">

        <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">

          <div className="w-full rounded-3xl bg-white p-8 shadow-xl">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-50">

                <AlertCircle className="h-7 w-7 text-red-600" />

              </div>


              <div>

                <h2 className="text-2xl font-black text-slate-950">
                  Challenge Tidak Dapat Dimuat
                </h2>

                <p className="mt-2 text-sm leading-7 text-slate-500">
                  {error}
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={
                initializeChallenge
              }
              className="mt-6 rounded-2xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
            >
              Coba Lagi
            </button>

          </div>

        </div>

      </div>
    );

  }


  /* ==========================================================
   * SUBMITTED / WAITING / READY
   * ==========================================================
   */

  if (
    submitted
  ) {

    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10">

        <div className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center">

          <div className="w-full rounded-[30px] bg-white p-8 shadow-2xl sm:p-12">

            {/* ICON */}

            <div className="flex justify-center">

              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full ${
                  resultReady
                    ? "bg-green-50"
                    : "bg-amber-50"
                }`}
              >

                {resultReady ? (
                  <CheckCircle2
                    className="h-11 w-11 text-green-600"
                  />
                ) : (
                  <Clock3
                    className="h-11 w-11 text-amber-600"
                  />
                )}

              </div>

            </div>


            {/* TITLE */}

            <h1 className="mt-6 text-center text-3xl font-black text-slate-950">

              {resultReady
                ? "Hasil Sudah Tersedia"
                : "Challenge Berhasil Dikirim"}

            </h1>


            {/* DESCRIPTION */}

            <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-7 text-slate-500 sm:text-base">

              {resultReady
                ? "Nilai final Anda sudah tersedia. Silakan lanjut ke halaman hasil assessment."
                : "Jawaban Challenge Anda sudah tersimpan dan sedang menunggu proses evaluasi AI serta verifikasi admin."}

            </p>


            {/* STATUS */}

            <div
              className={`mt-7 rounded-2xl border px-5 py-5 ${
                resultReady
                  ? "border-green-100 bg-green-50"
                  : "border-amber-100 bg-amber-50"
              }`}
            >

              <div
                className={`text-xs font-bold uppercase tracking-wider ${
                  resultReady
                    ? "text-green-700"
                    : "text-amber-700"
                }`}
              >
                Status Challenge
              </div>


              <div
                className={`mt-1 text-xl font-black ${
                  resultReady
                    ? "text-green-900"
                    : "text-amber-900"
                }`}
              >

                {resultReady
                  ? "TERVERIFIKASI"
                  : "MENUNGGU EVALUASI"}

              </div>


              <p
                className={`mt-2 text-sm leading-6 ${
                  resultReady
                    ? "text-green-800"
                    : "text-amber-800"
                }`}
              >

                {resultReady
                  ? "Final Score sudah tersedia pada sistem."
                  : "Sistem akan memeriksa hasil secara otomatis. Anda tidak perlu mengirim ulang jawaban."}

              </p>

            </div>


            {/* SCORE PREVIEW */}

            {score && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl bg-slate-50 p-5">

                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Challenge
                  </div>

                  <div className="mt-2 text-3xl font-black text-slate-950">
                    {score.challenge_score ??
                      0}
                    <span className="ml-1 text-sm font-bold text-slate-400">
                      /{" "}
                      {score.challenge_max ??
                        25}
                    </span>
                  </div>

                </div>


                <div className="rounded-2xl bg-slate-50 p-5">

                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Final Score
                  </div>

                  <div className="mt-2 text-3xl font-black text-slate-950">

                    {hasFinalScore(
                      score
                    )
                      ? score.final_score
                      : "—"}

                  </div>

                </div>

              </div>
            )}


            {/* CHECK ERROR */}

            {resultError && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                {resultError}
              </div>
            )}


            {/* CHECKING */}

            {!resultReady && (
              <div className="mt-6 flex items-center justify-center gap-3 text-sm font-semibold text-slate-500">

                {checkingResult ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                    Memeriksa status hasil...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 text-red-600" />
                    Menunggu proses evaluasi...
                  </>
                )}

              </div>
            )}


            {/* ACTIONS */}

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              {onBack && (
                <button
                  type="button"
                  onClick={
                    onBack
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                >

                  <ArrowLeft className="h-5 w-5" />

                  Kembali

                </button>
              )}


              <button
                type="button"
                onClick={
                  checkResultOnce
                }
                disabled={
                  checkingResult
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-6 py-3 font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >

                {checkingResult ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Clock3 className="h-5 w-5" />
                )}

                Cek Status

              </button>


              {resultReady &&
                onFinish && (

                  <button
                    type="button"
                    onClick={
                      onFinish
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
                  >

                    Lihat Hasil

                    <ArrowRight className="h-5 w-5" />

                  </button>

                )}

            </div>

          </div>

        </div>

      </div>
    );

  }


  {/* ==========================================================
   * MAIN CHALLENGE PAGE
   * ==========================================================
   */}

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* ====================================================
         * HEADER
         * ====================================================
         */}

        <section className="rounded-[28px] bg-white p-6 shadow-xl sm:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-red-600">
                  Leadership Challenge
                </span>

                <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500">
                  ESSAY
                </span>

              </div>


              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Challenge Kepemimpinan
              </h1>


              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
                Jelaskan tindakan, alasan, dan langkah yang akan
                Anda ambil dalam setiap situasi.
              </p>

            </div>


            <div className="shrink-0 rounded-2xl bg-red-50 px-5 py-4">

              <div className="text-xs font-bold uppercase tracking-wider text-red-600">
                Peserta
              </div>

              <div className="mt-1 text-lg font-black text-slate-950">
                {participantId}
              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
         * PROGRESS
         * ====================================================
         */}

        <section className="mt-6 rounded-[28px] bg-white p-5 shadow-xl sm:p-6">

          <div className="flex flex-col gap-5">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="text-lg font-black text-slate-950">
                  {answeredCount} / {questions.length} terjawab
                </div>

                <div className="text-sm text-slate-500">
                  Soal {currentIndex + 1} dari {questions.length}
                </div>

              </div>


              <div className="text-sm font-bold text-slate-500">

                {allAnswered
                  ? "Semua soal sudah dijawab"
                  : `${unansweredCount} belum dijawab`}

              </div>

            </div>


            <div className="h-3 overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-red-600 transition-all duration-500"
                style={{
                  width: `${
                    questions.length
                      ? (
                          answeredCount /
                          questions.length
                        ) *
                        100
                      : 0
                  }%`,
                }}
              />

            </div>

          </div>

        </section>


        {/* ====================================================
         * NAVIGATION
         * ====================================================
         */}

        <section className="mt-6 rounded-[28px] bg-white p-5 shadow-xl sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">

              <CheckCircle2 className="h-5 w-5 text-red-600" />

            </div>


            <div>

              <h2 className="font-extrabold text-slate-950">
                Navigasi Challenge
              </h2>

              <p className="text-sm text-slate-500">
                Klik nomor untuk berpindah pertanyaan.
              </p>

            </div>

          </div>


          <div className="mt-5 flex flex-wrap gap-3">

            {questions.map(
              (
                question,
                index
              ) => {

                const id =
                  getQuestionId(
                    question,
                    index
                  );


                const answered =
                  normalizeAnswer(
                    answers[id]
                  ).trim() !==
                  "";


                const active =
                  index ===
                  currentIndex;


                return (
                  <button
                    key={`${id}-${index}`}
                    type="button"
                    onClick={() =>
                      goToQuestion(
                        index
                      )
                    }
                    disabled={
                      saving ||
                      submitting
                    }
                    className={`
                      relative
                      flex
                      h-12
                      min-w-12
                      items-center
                      justify-center
                      rounded-xl
                      border
                      px-4
                      text-sm
                      font-extrabold
                      transition
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      ${
                        active
                          ? "border-red-600 bg-red-600 text-white shadow-lg"
                          : answered
                            ? "border-green-200 bg-green-50 text-green-700 hover:border-green-300"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-red-200 hover:bg-red-50"
                      }
                    `}
                  >

                    {index + 1}


                    {answered &&
                      !active && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[9px] font-black text-white">
                          ✓
                        </span>
                      )}

                  </button>
                );

              }
            )}

          </div>

        </section>


        {/* ====================================================
         * FEEDBACK
         * ====================================================
         */}

        {error && (

          <section className="mt-5">

            <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold leading-6 text-red-700">

              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              {error}

            </div>

          </section>

        )}


        {saveMessage && (

          <section className="mt-5">

            <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">

              <Save className="h-5 w-5" />

              {saveMessage}

            </div>

          </section>

        )}


        {/* ====================================================
         * QUESTION
         * ====================================================
         */}

        <section className="mt-6 overflow-hidden rounded-[30px] bg-white shadow-xl">

          <div className="border-b border-slate-100 px-6 py-6 sm:px-10 sm:py-8">

            <div className="flex items-start justify-between gap-5">

              <div>

                <div className="inline-flex rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
                  PERTANYAAN {currentIndex + 1}
                </div>

                <div className="mt-3 text-sm font-medium text-slate-400">
                  {currentQuestionId}
                </div>

              </div>


              <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Essay
              </div>

            </div>

          </div>


          <div className="px-6 py-8 sm:px-10 sm:py-10">

            <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
              {getQuestionTitle(
                currentQuestion,
                currentIndex
              )}
            </h2>


            {getScenario(
              currentQuestion
            ) && (

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">

                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Situasi
                </div>

                <p className="mt-3 whitespace-pre-line text-base leading-7 text-slate-700">
                  {getScenario(
                    currentQuestion
                  )}
                </p>

              </div>

            )}


            {getInstruction(
              currentQuestion
            ) && (

              <div className="mt-5">

                <div className="text-sm font-bold text-red-600">
                  Petunjuk
                </div>

                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-500">
                  {getInstruction(
                    currentQuestion
                  )}
                </p>

              </div>

            )}


            <div className="mt-8">

              <label
                htmlFor="challenge-answer"
                className="block text-sm font-bold text-slate-900"
              >
                Tulis jawaban Anda
              </label>


              <textarea
                id="challenge-answer"
                value={
                  currentAnswer
                }
                onChange={
                  handleEssayChange
                }
                disabled={
                  submitting
                }
                maxLength={
                  MAX_ANSWER_LENGTH
                }
                rows={12}
                placeholder="Jelaskan tindakan, alasan, dan langkah yang akan Anda ambil..."
                className="
                  mt-3
                  w-full
                  resize-y
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-5
                  text-base
                  leading-7
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-red-500
                  focus:ring-4
                  focus:ring-red-50
                  disabled:bg-slate-50
                "
              />


              <div className="mt-3 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

                <span>
                  Maksimal {MAX_ANSWER_LENGTH} karakter.
                </span>

                <span>
                  {currentAnswer.length} / {MAX_ANSWER_LENGTH}
                </span>

              </div>

            </div>

          </div>


          {/* ==================================================
           * FOOTER
           * ==================================================
           */}

          <div className="border-t border-slate-100 bg-slate-50 px-6 py-5 sm:px-10">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <button
                type="button"
                onClick={
                  handlePrevious
                }
                disabled={
                  currentIndex ===
                    0 ||
                  saving ||
                  submitting
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >

                <ArrowLeft className="h-5 w-5" />

                Sebelumnya

              </button>


              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={
                    saveCurrentAnswer
                  }
                  disabled={
                    saving ||
                    submitting ||
                    !currentAnswer.trim()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-6 py-4 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Simpan
                    </>
                  )}

                </button>


                <button
                  type="button"
                  onClick={
                    handleNext
                  }
                  disabled={
                    saving ||
                    submitting ||
                    !currentAnswer.trim()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Mengirim...
                    </>
                  ) : isLastQuestion ? (
                    <>
                      <Send className="h-5 w-5" />
                      Kirim Challenge
                    </>
                  ) : (
                    <>
                      Berikutnya
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
         * FOOTER
         * ====================================================
         */}

        <div className="py-8 text-center">

          <p className="text-sm font-bold text-slate-700">
            Jawaban Challenge disimpan sebagai teks.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Setelah dikirim, jawaban diproses melalui evaluasi AI
            dan verifikasi admin.
          </p>

        </div>


        {onBack && (

          <div className="pb-8 text-center">

            <button
              type="button"
              onClick={
                onBack
              }
              disabled={
                submitting
              }
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-slate-500 transition hover:bg-white hover:text-slate-800"
            >

              <ArrowLeft className="h-4 w-4" />

              Kembali

            </button>

          </div>

        )}

      </div>

    </div>
  );
}