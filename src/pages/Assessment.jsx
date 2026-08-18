import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ListChecks,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPost } from "../api/api";

const ASSESSMENT_CONFIG = {
  personality: {
    type: "PERSONALITY",
    title: "Personality",
    required: 40,
  },

  competency: {
    type: "COMPETENCY",
    title: "Competency",
    required: 40,
  },

  sjt: {
    type: "SJT",
    title: "Situational Judgment Test",
    required: 15,
  },

  challenge: {
    type: "CHALLENGE",
    title: "Challenge",
    required: 5,
  },
};

const STORAGE_VERSION = "v3";
const STORAGE_PREFIX = "pmr_smanel_assessment_";

function getProgressStorageKey(
  participantId,
  assessmentType
) {
  return (
    `${STORAGE_PREFIX}` +
    `${STORAGE_VERSION}_` +
    `${participantId}_` +
    `${assessmentType}`
  );
}

function loadAssessmentProgress(
  participantId,
  assessmentType
) {
  if (
    !participantId ||
    !assessmentType ||
    typeof window === "undefined"
  ) {
    return null;
  }

  try {
    const raw =
      localStorage.getItem(
        getProgressStorageKey(
          participantId,
          assessmentType
        )
      );

    if (!raw) {
      return null;
    }

    const parsed =
      JSON.parse(raw);

    if (
      !parsed ||
      parsed.participant_id !== participantId ||
      parsed.assessment_type !== assessmentType
    ) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error(
      "RESUME LOAD ERROR:",
      error
    );

    return null;
  }
}

function saveAssessmentProgress(
  participantId,
  assessmentType,
  progress
) {
  if (
    !participantId ||
    !assessmentType ||
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    localStorage.setItem(
      getProgressStorageKey(
        participantId,
        assessmentType
      ),
      JSON.stringify({
        participant_id:
          participantId,

        assessment_type:
          assessmentType,

        ...progress,

        updated_at:
          new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error(
      "RESUME SAVE ERROR:",
      error
    );
  }
}

function clearAssessmentProgress(
  participantId,
  assessmentType
) {
  if (
    !participantId ||
    !assessmentType ||
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    localStorage.removeItem(
      getProgressStorageKey(
        participantId,
        assessmentType
      )
    );
  } catch (error) {
    console.error(
      "RESUME CLEAR ERROR:",
      error
    );
  }
}

function Assessment() {
  const navigate = useNavigate();
  const { type } = useParams();

  const currentConfig =
    ASSESSMENT_CONFIG[type] ||
    ASSESSMENT_CONFIG.personality;

  const ASSESSMENT_TYPE =
    currentConfig.type;

  const REQUIRED_QUESTIONS =
    currentConfig.required;

  const [participantId, setParticipantId] =
    useState("");

  const [questions, setQuestions] =
    useState([]);

  const [answers, setAnswers] =
    useState({});

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [starting, setStarting] =
    useState(false);

  const [finishing, setFinishing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  /* =========================================================
     PARTICIPANT ID
  ========================================================== */

  useEffect(() => {
    const sessionId =
      sessionStorage.getItem(
        "participant_id"
      );

    const localId =
      localStorage.getItem(
        "participant_id"
      );

    const id =
      sessionId ||
      localId ||
      "";

    if (!id) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const normalizedId =
      String(id).trim();

    sessionStorage.setItem(
      "participant_id",
      normalizedId
    );

    localStorage.setItem(
      "participant_id",
      normalizedId
    );

    setParticipantId(
      normalizedId
    );
  }, [navigate]);


  /* =========================================================
     INITIALIZE ASSESSMENT
  ========================================================== */

  useEffect(() => {
    if (!participantId) {
      return;
    }



    initializeAssessment();
  }, [
    participantId,
    ASSESSMENT_TYPE,
  ]);


  /* =========================================================
     AUTO SAVE LOCAL PROGRESS

     Backend tetap menjadi sumber utama.
     Local storage menjaga posisi dan draft agar
     browser ditutup / direfresh tidak kehilangan posisi.
  ========================================================== */

  useEffect(() => {

    if (
      !participantId ||
      !questions.length
    ) {
      return;
    }

    saveAssessmentProgress(
      participantId,
      ASSESSMENT_TYPE,
      {
        currentIndex,
        answers,
      }
    );

  }, [
    participantId,
    ASSESSMENT_TYPE,
    currentIndex,
    answers,
    questions.length,
  ]);

async function getOverallProgress(
  id
) {

  const result =
    await apiGet({

      action:
        "get_answer_counts",

      participant_id:
        id,

    });


  if (
    !result ||
    result.success !== true
  ) {

    throw new Error(
      result?.error?.message ||
      "Progress assessment tidak dapat diperiksa."
    );

  }


  const counts =
    result?.data?.counts ||
    {};


  return {

    personality:
      Number(
        counts.PERSONALITY ||
        0
      ),

    competency:
      Number(
        counts.COMPETENCY ||
        0
      ),

    sjt:
      Number(
        counts.SJT ||
        0
      ),

    challenge:
      Number(
        counts.CHALLENGE ||
        0
      ),

  };

}

function getNextSectionRoute(
  progress
) {

  if (
    progress.personality <
    40
  ) {

    return "/assessment/personality";

  }


  if (
    progress.competency <
    40
  ) {

    return "/assessment/competency";

  }


  if (
    progress.sjt <
    15
  ) {

    return "/assessment/sjt";

  }


  if (
    progress.challenge <
    5
  ) {

    return "/assessment/challenge";

  }


  return "/result";

}

  async function initializeAssessment() {

  setLoading(true);

  setError("");

  setSuccessMessage("");


  try {

    setStarting(true);


    /* =====================================================
       CEK PROGRESS KESELURUHAN TERLEBIH DAHULU
    ====================================================== */

    const overallProgress =
      await getOverallProgress(
        participantId
      );


    console.log(
      "OVERALL PROGRESS:",
      overallProgress
    );


    /* =====================================================
       SUDAH SELESAI SEMUA
    ====================================================== */

    const completed =
      overallProgress.personality >=
        40 &&
      overallProgress.competency >=
        40 &&
      overallProgress.sjt >=
        15 &&
      overallProgress.challenge >=
        5;


    if (
      completed
    ) {

      console.log(
        "ASSESSMENT SUDAH COMPLETED → RESULT"
      );


      navigate(
        "/result",
        {
          replace:
            true,

          state: {
            participantId:
              participantId,
          },

        }
      );


      return;

    }


    /* =====================================================
       CEK SECTION SEKARANG
    ====================================================== */

    const nextRoute =
      getNextSectionRoute(
        overallProgress
      );


    const currentSectionComplete =

      (
        ASSESSMENT_TYPE ===
          "PERSONALITY" &&
        overallProgress.personality >=
          40
      ) ||

      (
        ASSESSMENT_TYPE ===
          "COMPETENCY" &&
        overallProgress.competency >=
          40
      ) ||

      (
        ASSESSMENT_TYPE ===
          "SJT" &&
        overallProgress.sjt >=
          15
      ) ||

      (
        ASSESSMENT_TYPE ===
          "CHALLENGE" &&
        overallProgress.challenge >=
          5
      );


    /*
     * Kalau section ini sudah selesai,
     * jangan tampilkan soal lagi.
     *
     * Arahkan ke section berikutnya.
     */

    if (
      currentSectionComplete
    ) {

      console.log(
        "CURRENT SECTION COMPLETED →",
        nextRoute
      );


      navigate(
        nextRoute,
        {
          replace:
            true,
        }
      );


      return;

    }


    /* =====================================================
       BARU MULAI / LANJUT SECTION
    ====================================================== */

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
      `START ${ASSESSMENT_TYPE}:`,
      startResult
    );


    if (
      !startResult?.success
    ) {

      throw new Error(
        startResult?.error?.message ||
        `${ASSESSMENT_TYPE} gagal dimulai.`
      );

    }

      /* =====================================================
         GET QUESTIONS
      ====================================================== */

      const questionResult =
        await apiGet({
          action:
            "get_questions",

          participant_id:
            participantId,

          assessment_type:
            ASSESSMENT_TYPE,
        });

      console.log(
        `GET ${ASSESSMENT_TYPE} QUESTIONS:`,
        questionResult
      );

      console.log(
        `${ASSESSMENT_TYPE} RAW QUESTIONS:`,
        JSON.stringify(
          questionResult,
          null,
          2
        )
      );

      if (
        !questionResult?.success
      ) {
        throw new Error(
          questionResult?.error
            ?.message ||
            `Soal ${ASSESSMENT_TYPE} gagal dimuat.`
        );
      }

      const loadedQuestions =
        extractQuestions(
          questionResult
        );

      if (
        !loadedQuestions.length
      ) {
        throw new Error(
          `Soal ${ASSESSMENT_TYPE} tidak ditemukan.`
        );
      }

      setQuestions(
        loadedQuestions
      );


      /* =====================================================
         GET EXISTING ANSWERS
      ====================================================== */

      const answerResult =
        await apiGet({
          action:
            "get_participant_answers",

          participant_id:
            participantId,

          type:
            ASSESSMENT_TYPE,
        });

      console.log(
        `GET ${ASSESSMENT_TYPE} ANSWERS:`,
        answerResult
      );

      if (
        answerResult?.success
      ) {

        const existingAnswers =
          extractAnswers(
            answerResult
          );

        const answerMap = {};

        existingAnswers.forEach(
          (item) => {
            const questionId =
              item?.question_id ||
              item?.questionId;

            if (!questionId) {
              return;
            }

            answerMap[
              String(
                questionId
              ).trim()
            ] =
              normalizeAnswerValue(
                item?.answer
              );
          }
        );

        /*
         * ===================================================
         * RESTORE DRAFT LOCAL
         *
         * Backend adalah sumber utama.
         * Draft lokal hanya mengisi jawaban yang
         * belum tersimpan di backend, terutama Challenge
         * essay yang sedang diketik.
         * ===================================================
         */

        const localProgress =
          loadAssessmentProgress(
            participantId,
            ASSESSMENT_TYPE
          );

        const localAnswers =
          localProgress?.answers &&
          typeof localProgress.answers === "object"
            ? localProgress.answers
            : {};

        Object.keys(
          localAnswers
        ).forEach(
          (questionId) => {

            const backendAnswer =
              String(
                answerMap[
                  questionId
                ] ?? ""
              ).trim();

            const localAnswer =
              normalizeAnswerValue(
                localAnswers[
                  questionId
                ]
              );

            if (
              !backendAnswer &&
              localAnswer
            ) {
              answerMap[
                questionId
              ] =
                localAnswer;
            }

          }
        );

        setAnswers(
          answerMap
        );


        /* ===================================================
           BUKA SOAL PERTAMA YANG BELUM DIJAWAB
        ==================================================== */

        const firstUnansweredIndex =
          loadedQuestions.findIndex(
            (
              question,
              index
            ) => {

              const id =
                getQuestionId(
                  question,
                  index
                );

              const answer =
                answerMap[
                  id
                ];

              return (
                answer ===
                  undefined ||
                answer ===
                  null ||
                String(
                  answer
                ).trim() === ""
              );
            }
          );

        const resumeIndex =
          Number.isInteger(
            Number(
              localProgress?.currentIndex
            )
          )
            ? Math.max(
                0,
                Math.min(
                  Number(
                    localProgress.currentIndex
                  ),
                  loadedQuestions.length - 1
                )
              )
            : -1;

        /*
         * Jika masih ada soal belum dijawab,
         * selalu buka soal pertama yang belum dijawab.
         *
         * Jika semua sudah dijawab, gunakan posisi
         * terakhir yang tersimpan agar peserta dapat
         * meninjau bagian terakhir.
         */

        if (
          firstUnansweredIndex >= 0
        ) {

          setCurrentIndex(
            firstUnansweredIndex
          );

        } else if (
          resumeIndex >= 0
        ) {

          setCurrentIndex(
            resumeIndex
          );

        } else {

          setCurrentIndex(
            Math.max(
              0,
              loadedQuestions.length - 1
            )
          );

        }

      } else {

        setAnswers({});
        setCurrentIndex(0);

      }

    } catch (err) {

      console.error(
        "ASSESSMENT INITIALIZE ERROR:",
        err
      );

      setError(
        err?.message ||
          "Terjadi kesalahan saat memuat assessment."
      );

    } finally {

      setStarting(false);
      setLoading(false);

    }
  }


  /* =========================================================
     RESPONSE HELPERS
  ========================================================== */

  function extractQuestions(result) {
    const data =
      result?.data;

    if (Array.isArray(data)) {
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


  function extractAnswers(result) {
    const data =
      result?.data;

    if (Array.isArray(data)) {
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

    /* =========================================================
     QUESTION HELPERS
  ========================================================== */

function getQuestionId(
  question,
  index = 0
) {

  const id =
    question?.question_id ||
    question?.questionId ||
    question?.question_code ||
    question?.code ||
    question?.sjt_id ||
    question?.challenge_id ||
    question?.challengeId ||
    question?.id;


  /*
   * ==========================================================
   * NORMALISASI ID SJT
   * ==========================================================
   *
   * Beberapa bank soal lama dapat mengirim:
   *
   * SJT-1
   * SJT-2
   *
   * sedangkan JAWABAN / backend menggunakan:
   *
   * S001
   * S002
   *
   * ==========================================================
   */

  if (
    id &&
    /^SJT[-_ ]?\d+$/i.test(
      String(id).trim()
    )
  ) {

    const number =
      String(id)
        .trim()
        .match(
          /\d+/
        )?.[0];


    if (
      number
    ) {

      return (
        "S" +
        String(number).padStart(
          3,
          "0"
        )
      );

    }

  }


  /*
   * Jangan lagi menggunakan
   * QUESTION-1 sebagai ID utama
   * untuk SJT.
   */

  if (
    id
  ) {

    return String(
      id
    ).trim();

  }


  /*
   * Fallback hanya untuk kasus
   * benar-benar tidak memiliki ID.
   */

  return (
    "QUESTION-" +
    String(
      index + 1
    )
  );

}


  function getQuestionText(
    question
  ) {
    return (
      question?.question_text ||
      question?.question ||
      question?.scenario ||
      question?.text ||
      question?.pertanyaan ||
      "Pertanyaan tidak tersedia."
    );
  }


  function normalizeAnswerValue(
    value
  ) {
    if (
      value === undefined ||
      value === null
    ) {
      return "";
    }

    return String(value);
  }


  /* =========================================================
     CURRENT QUESTION
  ========================================================== */

  const currentQuestion =
    questions[currentIndex];

  const currentQuestionId =
    currentQuestion
      ? getQuestionId(
          currentQuestion,
          currentIndex
        )
      : "";

  const currentAnswer =
    answers[
      currentQuestionId
    ] || "";

  const isChallenge =
    ASSESSMENT_TYPE ===
    "CHALLENGE";


  /* =========================================================
     OPTIONS
  ========================================================== */

  const options = useMemo(() => {

    if (!currentQuestion) {
      return [];
    }


    /*
     * =======================================================
     * COMPETENCY / SJT
     *
     * option_a → 1
     * option_b → 2
     * option_c → 3
     * option_d → 4
     * option_e → 5
     * =======================================================
     */

/*
 * =========================================================
 * COMPETENCY
 * =========================================================
 *
 * Backend:
 * option_a
 * option_b
 * option_c
 * option_d
 * option_e
 *
 * Jawaban yang disimpan:
 * A -> 1
 * B -> 2
 * C -> 3
 * D -> 4
 * E -> 5
 *
 * =========================================================
 */

if (
  ASSESSMENT_TYPE === "COMPETENCY"
) {

  return [
    {
      value: "1",
      label:
        currentQuestion.option_a,
    },

    {
      value: "2",
      label:
        currentQuestion.option_b,
    },

    {
      value: "3",
      label:
        currentQuestion.option_c,
    },

    {
      value: "4",
      label:
        currentQuestion.option_d,
    },

    {
      value: "5",
      label:
        currentQuestion.option_e,
    },

  ].filter(
    option =>
      option.label !== undefined &&
      option.label !== null &&
      String(
        option.label
      ).trim() !== ""
  );

}


/*
 * =========================================================
 * SJT
 * =========================================================
 *
 * PENTING:
 *
 * Backend SJT membutuhkan:
 *
 * A / B / C / D / E
 *
 * BUKAN:
 *
 * 1 / 2 / 3 / 4 / 5
 *
 * Jadi value yang dikirim harus huruf.
 *
 * =========================================================
 */

if (
  ASSESSMENT_TYPE === "SJT"
) {

  return [
    {
      value: "A",
      label:
        currentQuestion.option_a,
    },

    {
      value: "B",
      label:
        currentQuestion.option_b,
    },

    {
      value: "C",
      label:
        currentQuestion.option_c,
    },

    {
      value: "D",
      label:
        currentQuestion.option_d,
    },

    {
      value: "E",
      label:
        currentQuestion.option_e,
    },

  ].filter(
    option =>
      option.label !== undefined &&
      option.label !== null &&
      String(
        option.label
      ).trim() !== ""
  );

}


    /*
     * =======================================================
     * ARRAY OPTIONS
     * =======================================================
     */

    if (
      Array.isArray(
        currentQuestion.options
      )
    ) {

      return currentQuestion.options.map(
        (
          option,
          index
        ) => ({

          value:
            String(
              option?.value ??
                option?.score ??
                index + 1
            ),

          label:
            option?.label ??
            option?.text ??
            option?.value ??
            `Pilihan ${
              index + 1
            }`,
        })
      );
    }


    if (
      Array.isArray(
        currentQuestion.choices
      )
    ) {

      return currentQuestion.choices.map(
        (
          option,
          index
        ) => ({

          value:
            String(
              option?.value ??
                option?.score ??
                index + 1
            ),

          label:
            option?.label ??
            option?.text ??
            option?.value ??
            `Pilihan ${
              index + 1
            }`,
        })
      );
    }


    /*
     * =======================================================
     * GENERIC option_1 ... option_5
     * =======================================================
     */

    const generatedOptions =
      [];

    for (
      let i = 1;
      i <= 5;
      i++
    ) {

      const value =
        currentQuestion[
          `option_${i}`
        ] ??
        currentQuestion[
          `option${i}`
        ] ??
        currentQuestion[
          `choice_${i}`
        ];

      if (
        value !==
          undefined &&
        value !== null &&
        value !== ""
      ) {

        generatedOptions.push({
          value:
            String(i),

          label:
            String(value),
        });
      }
    }


    /*
     * =======================================================
     * PERSONALITY FALLBACK
     * =======================================================
     */

    if (
      !generatedOptions.length &&
      ASSESSMENT_TYPE ===
        "PERSONALITY"
    ) {

      return [
        {
          value: "1",
          label:
            "Sangat Tidak Setuju",
        },

        {
          value: "2",
          label:
            "Tidak Setuju",
        },

        {
          value: "3",
          label:
            "Netral",
        },

        {
          value: "4",
          label:
            "Setuju",
        },

        {
          value: "5",
          label:
            "Sangat Setuju",
        },
      ];
    }

    return generatedOptions;

  }, [
    currentQuestion,
    ASSESSMENT_TYPE,
  ]);


  /* =========================================================
     PROGRESS
     IMPORTANT:
     totalQuestions HARUS SEBELUM unansweredCount
  ========================================================== */

  const totalQuestions =
    questions.length ||
    REQUIRED_QUESTIONS;


  const answeredCount =
    useMemo(() => {

      return questions.reduce(
        (
          count,
          question,
          index
        ) => {

          const questionId =
            getQuestionId(
              question,
              index
            );

          const answer =
            answers[
              questionId
            ];

          const hasAnswer =
            answer !==
              undefined &&
            answer !== null &&
            String(
              answer
            ).trim() !== "";

          return hasAnswer
            ? count + 1
            : count;

        },
        0
      );

    }, [
      questions,
      answers,
    ]);


  const unansweredCount =
    Math.max(
      totalQuestions -
        answeredCount,
      0
    );


  const questionNumber =
    currentIndex + 1;


  const progress =
    totalQuestions > 0
      ? Math.min(
          100,
          Math.round(
            (answeredCount /
              totalQuestions) *
              100
          )
        )
      : 0;


  const isLastQuestion =
    currentIndex ===
    questions.length - 1;


  /* =========================================================
     SAVE NUMERIC ANSWER
  ========================================================== */

  async function handleSelectAnswer(
    value
  ) {

    if (
      !currentQuestionId ||
      saving ||
      finishing
    ) {
      return;
    }

    setError("");
    setSuccessMessage("");

    const normalizedValue =
      normalizeAnswerValue(
        value
      );

    const previousAnswer =
      answers[
        currentQuestionId
      ] || "";


    /*
     * UI langsung berubah.
     */

    setAnswers(
      (previous) => ({
        ...previous,

        [currentQuestionId]:
          normalizedValue,
      })
    );


    setSaving(true);

    try {

      console.log(
        "SELECT ANSWER:",
        {
          assessment_type:
            ASSESSMENT_TYPE,

          question_id:
            currentQuestionId,

          answer:
            normalizedValue,
        }
      );


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
            normalizedValue,
        });


      console.log(
        "SAVE ANSWER:",
        result
      );


      if (
        !result?.success
      ) {

        throw new Error(
          result?.error?.message ||
            "Jawaban gagal disimpan."
        );
      }


      setSuccessMessage(
        "Jawaban tersimpan."
      );


      setTimeout(
        () => {
          setSuccessMessage("");
        },
        1000
      );


    } catch (err) {

      console.error(
        "SAVE ANSWER ERROR:",
        err
      );


      /*
       * Kembalikan jawaban
       * jika gagal.
       */

      setAnswers(
        (previous) => ({
          ...previous,

          [currentQuestionId]:
            previousAnswer,
        })
      );


      setError(
        err?.message ||
          "Jawaban gagal disimpan."
      );


    } finally {

      setSaving(false);

    }
  }


  /* =========================================================
     CHALLENGE ESSAY CHANGE
  ========================================================== */

  function handleEssayChange(
    event
  ) {

    if (
      !currentQuestionId ||
      saving ||
      finishing
    ) {
      return;
    }

    const value =
      event.target.value;


    setError("");
    setSuccessMessage("");


    setAnswers(
      (previous) => ({
        ...previous,

        [currentQuestionId]:
          value,
      })
    );
  }


  /* =========================================================
     SAVE CHALLENGE ESSAY
  ========================================================== */

  async function saveChallengeEssay() {

    const answerText =
      String(
        answers[
          currentQuestionId
        ] || ""
      ).trim();


    if (!answerText) {

      throw new Error(
        "Jawaban Challenge wajib diisi."
      );
    }


    const result =
      await apiPost({

        action:
          "save_answer",

        participant_id:
          participantId,

        assessment_type:
          "CHALLENGE",

        question_id:
          currentQuestionId,

        answer:
          answerText,
      });


    console.log(
      "SAVE CHALLENGE ANSWER:",
      result
    );


    if (
      !result?.success
    ) {

      throw new Error(
        result?.error?.message ||
          "Jawaban Challenge gagal disimpan."
      );
    }


    setSuccessMessage(
      "Jawaban Challenge tersimpan."
    );


    setTimeout(
      () => {
        setSuccessMessage("");
      },
      1000
    );
  }

    /* =========================================================
     GO TO QUESTION
  ========================================================== */

  function goToQuestion(
    index
  ) {

    if (
      index < 0 ||
      index >= questions.length
    ) {
      return;
    }


    setError("");

    setCurrentIndex(
      index
    );


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  /* =========================================================
     NEXT
  ========================================================== */

  async function handleNext() {

    const answerText =
      String(
        currentAnswer || ""
      ).trim();


    if (!answerText) {

      setError(
        isChallenge
          ? "Silakan isi jawaban terlebih dahulu."
          : "Silakan pilih jawaban terlebih dahulu."
      );

      return;
    }


    setError("");


    /*
     * CHALLENGE:
     * Simpan essay ketika peserta
     * klik Berikutnya.
     *
     * Personality / Competency / SJT
     * sudah disimpan saat pilihan diklik.
     */

    if (isChallenge) {

      setSaving(true);

      try {

        await saveChallengeEssay();

      } catch (err) {

        console.error(
          "SAVE CHALLENGE ERROR:",
          err
        );

        setError(
          err?.message ||
            "Jawaban Challenge gagal disimpan."
        );

        setSaving(false);

        return;

      } finally {

        setSaving(false);

      }
    }


    /*
     * Belum soal terakhir.
     */

    if (
      !isLastQuestion
    ) {

      goToQuestion(
        currentIndex + 1
      );

      return;
    }


    /*
     * Soal terakhir.
     */

    await handleFinishSection();
  }


  /* =========================================================
     PREVIOUS
  ========================================================== */

  function handlePrevious() {

    if (
      currentIndex <= 0
    ) {
      return;
    }


    goToQuestion(
      currentIndex - 1
    );
  }


  /* =========================================================
     FIND FIRST UNANSWERED
  ========================================================== */

  function findFirstUnansweredIndex() {

    return questions.findIndex(
      (
        question,
        index
      ) => {

        const questionId =
          getQuestionId(
            question,
            index
          );

        const answer =
          answers[
            questionId
          ];


        return (
          answer ===
            undefined ||
          answer === null ||
          String(
            answer
          ).trim() === ""
        );
      }
    );
  }


  /* =========================================================
     FINISH CURRENT SECTION
  ========================================================== */

  async function handleFinishSection() {

    if (finishing) {
      return;
    }


    setFinishing(true);
    setError("");


    try {

      /* =====================================================
         CHECK LOCAL ANSWERS
      ====================================================== */

      const firstUnansweredIndex =
        findFirstUnansweredIndex();


      if (
        firstUnansweredIndex >= 0
      ) {

        setCurrentIndex(
          firstUnansweredIndex
        );


        throw new Error(
          `Masih ada ${unansweredCount} soal ${currentConfig.title} yang belum dijawab.`
        );
      }


      /* =====================================================
         VALIDATE BACKEND
      ====================================================== */

      const result =
        await apiGet({

          action:
            "validate_completion",

          participant_id:
            participantId,
        });


      console.log(
        "VALIDATE COMPLETION:",
        result
      );


      if (
        !result?.success
      ) {

        throw new Error(
          result?.error?.message ||
            "Validasi assessment gagal."
        );
      }


      const data =
        result?.data || {};


      const incomplete =
        Array.isArray(
          data?.incomplete
        )
          ? data.incomplete
          : [];


      const currentIncomplete =
        incomplete.find(
          (item) =>
            String(
              item?.assessment_type ||
                ""
            )
              .trim()
              .toUpperCase() ===
            ASSESSMENT_TYPE
        );


      if (
        currentIncomplete &&
        Number(
          currentIncomplete.answered ||
            0
        ) <
          Number(
            currentIncomplete.required ||
              REQUIRED_QUESTIONS
          )
      ) {

        throw new Error(
          `Assessment ${currentConfig.title} belum lengkap: ${
            currentIncomplete.answered ||
            0
          }/${
            currentIncomplete.required ||
            REQUIRED_QUESTIONS
          }.`
        );
      }


      /* =====================================================
         PERSONALITY → COMPETENCY
      ====================================================== */

      if (
        ASSESSMENT_TYPE ===
        "PERSONALITY"
      ) {

        clearAssessmentProgress(
          participantId,
          ASSESSMENT_TYPE
        );

        navigate(
          "/assessment/competency",
          {
            replace: true,
          }
        );

        return;
      }


      /* =====================================================
         COMPETENCY → SJT
      ====================================================== */

      if (
        ASSESSMENT_TYPE ===
        "COMPETENCY"
      ) {

        clearAssessmentProgress(
          participantId,
          ASSESSMENT_TYPE
        );

        navigate(
          "/assessment/sjt",
          {
            replace: true,
          }
        );

        return;
      }


      /* =====================================================
         SJT → CHALLENGE
      ====================================================== */

      if (
        ASSESSMENT_TYPE ===
        "SJT"
      ) {

        clearAssessmentProgress(
          participantId,
          ASSESSMENT_TYPE
        );

        navigate(
          "/assessment/challenge",
          {
            replace: true,
          }
        );

        return;
      }


      /* =====================================================
         CHALLENGE → RESULT
      ====================================================== */

      if (
        ASSESSMENT_TYPE ===
        "CHALLENGE"
      ) {

        const finalValidation =
          await apiGet({

            action:
              "validate_completion",

            participant_id:
              participantId,
          });


        console.log(
          "FINAL VALIDATION:",
          finalValidation
        );


        if (
          !finalValidation?.success
        ) {

          throw new Error(
            finalValidation
              ?.error
              ?.message ||
              "Validasi final gagal."
          );
        }


        if (
          !finalValidation
            ?.data
            ?.complete
        ) {

          throw new Error(
            "Assessment belum lengkap. Periksa kembali jawaban Anda."
          );
        }


        clearAssessmentProgress(
          participantId,
          ASSESSMENT_TYPE
        );

        navigate(
          "/result",
          {
            replace: true,

            state: {
              participantId,
            },
          }
        );
      }

    } catch (err) {

      console.error(
        "FINISH SECTION ERROR:",
        err
      );


      setError(
        err?.message ||
          "Assessment belum dapat dilanjutkan."
      );

    } finally {

      setFinishing(false);

    }
  }


  /* =========================================================
     LOADING
  ========================================================== */

  if (loading) {

    return (
      <main className="min-h-screen bg-slate-100">

        <div className="flex min-h-screen items-center justify-center px-6">

          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">

            <Loader2
              size={42}
              className="mx-auto animate-spin text-red-600"
            />


            <h2 className="mt-5 text-xl font-extrabold text-slate-900">
              {starting
                ? `Menyiapkan ${currentConfig.title}...`
                : "Memuat Soal..."}
            </h2>


            <p className="mt-2 text-sm text-slate-500">
              Mohon tunggu sebentar.
            </p>

          </div>

        </div>

      </main>
    );
  }


  /* =========================================================
     ERROR WITHOUT QUESTIONS
  ========================================================== */

  if (
    error &&
    !questions.length
  ) {

    return (
      <main className="min-h-screen bg-slate-100">

        <div className="flex min-h-screen items-center justify-center px-6">

          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">

            <div className="flex items-center gap-3 text-red-600">

              <AlertCircle
                size={28}
              />

              <h2 className="text-xl font-extrabold">
                Assessment tidak dapat dimuat
              </h2>

            </div>


            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>


            <button
              type="button"
              onClick={
                initializeAssessment
              }
              className="mt-6 w-full rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Coba Lagi
            </button>

          </div>

        </div>

      </main>
    );
  }

    /* =========================================================
     MAIN UI
  ========================================================== */

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">


          {/* BRAND */}

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white">

              <img
                src="/logo-pmr-smanel.jpg"
                alt="Logo PMR SMANEL"
                className="h-full w-full object-contain"
              />

            </div>


            <div className="leading-tight">

              <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                PMR SMANEL
              </p>

              <p className="text-sm font-bold text-slate-800">
                Leadership Assessment
              </p>

            </div>

          </div>


          {/* PARTICIPANT */}

          <div className="text-right">

            <p className="text-xs text-slate-400">
              Peserta
            </p>

            <p className="text-sm font-bold text-slate-700">
              {participantId}
            </p>

          </div>

        </div>

      </header>


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8 sm:py-10">


        {/* ===================================================
            TITLE
        ==================================================== */}

        <div className="mb-6">

          <div className="flex flex-wrap items-center gap-2">

            <p className="text-sm font-bold uppercase tracking-wider text-red-600">
              Assessment
            </p>


            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
              {currentConfig.title}
            </span>

          </div>


          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Kenali diri dan potensi kepemimpinan Anda
          </h1>


          <p className="mt-2 text-sm leading-6 text-slate-500">
            Jawablah setiap pertanyaan sesuai
            dengan kondisi diri Anda yang sebenarnya.
          </p>

        </div>


        {/* ===================================================
            PROGRESS
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-sm font-bold text-slate-700">
                {answeredCount} /{" "}
                {totalQuestions} terjawab
              </p>


              <p className="mt-1 text-xs text-slate-400">
                Soal {questionNumber} dari{" "}
                {totalQuestions}
              </p>

            </div>


            <span className="text-sm font-bold text-red-600">
              {progress}%
            </span>

          </div>


          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

            <div
              className="h-full rounded-full bg-red-600 transition-all duration-300"
              style={{
                width:
                  `${progress}%`,
              }}
            />

          </div>

        </div>


        {/* ===================================================
            QUESTION NAVIGATION
        ==================================================== */}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">


          {/* HEADER */}

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-2">

              <ListChecks
                size={20}
                className="text-red-600"
              />


              <div>

                <p className="text-sm font-bold text-slate-800">
                  Navigasi Soal
                </p>

                <p className="text-xs text-slate-400">
                  Klik nomor untuk berpindah soal
                </p>

              </div>

            </div>


            <div className="text-right">

              <p className="text-xs font-bold text-slate-500">
                {unansweredCount} belum dijawab
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {answeredCount} dari{" "}
                {totalQuestions} terjawab
              </p>

            </div>

          </div>


          {/* NOMOR SOAL */}

          <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">

            {questions.map(
              (
                question,
                index
              ) => {

                const questionId =
                  getQuestionId(
                    question,
                    index
                  );


                const answer =
                  answers[
                    questionId
                  ];


                const answered =
                  answer !==
                    undefined &&
                  answer !== null &&
                  String(
                    answer
                  ).trim() !== "";


                const active =
                  index ===
                  currentIndex;


                return (
                  <button
                    key={`${questionId}-${index}`}
                    type="button"
                    onClick={() =>
                      goToQuestion(
                        index
                      )
                    }
                    className={`
                      relative flex h-10 items-center
                      justify-center rounded-lg
                      border text-sm font-bold
                      transition-all duration-200

                      ${
                        active
                          ? "border-red-600 bg-red-600 text-white shadow-md shadow-red-600/20"

                          : answered
                            ? "border-green-200 bg-green-50 text-green-700 hover:border-green-400 hover:bg-green-100"

                            : "border-slate-200 bg-slate-50 text-slate-500 hover:border-red-300 hover:bg-red-50"
                      }
                    `}
                  >

                    {index + 1}


                    {answered &&
                      !active && (

                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[9px] font-bold text-white shadow-sm">
                          ✓
                        </span>

                    )}

                  </button>
                );
              }
            )}

          </div>


          {/* LEGEND */}

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">

            <div className="flex items-center gap-2">

              <span className="h-3 w-3 rounded bg-red-600" />

              Sedang dibuka

            </div>


            <div className="flex items-center gap-2">

              <span className="h-3 w-3 rounded bg-green-50 ring-1 ring-green-200" />

              Sudah dijawab

            </div>


            <div className="flex items-center gap-2">

              <span className="h-3 w-3 rounded bg-slate-50 ring-1 ring-slate-200" />

              Belum dijawab

            </div>

          </div>

        </section>


        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <span>
              {error}
            </span>

          </div>

        )}


        {/* ===================================================
            SUCCESS
        ==================================================== */}

        {successMessage && (

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-700">

            <CheckCircle2
              size={20}
            />

            {successMessage}

          </div>

        )}


        {/* ===================================================
            QUESTION CARD
        ==================================================== */}

        {currentQuestion && (

          <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="p-6 sm:p-8">


              {/* QUESTION LABEL */}

              <div className="flex items-center justify-between">

                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                  PERTANYAAN{" "}
                  {questionNumber}
                </span>


                <span className="text-xs font-medium text-slate-400">
                  {currentQuestionId}
                </span>

              </div>


              {/* QUESTION */}

              <h2 className="mt-6 text-xl font-bold leading-8 text-slate-900 sm:text-2xl">

                {getQuestionText(
                  currentQuestion
                )}

              </h2>


              {/* =================================================
                  CHALLENGE = ESSAY
              ================================================== */}

              {isChallenge ? (

                <div className="mt-7">


                  <textarea
                    value={
                      currentAnswer
                    }
                    onChange={
                      handleEssayChange
                    }
                    disabled={
                      saving ||
                      finishing
                    }
                    rows={9}
                    maxLength={
                      1000
                    }
                    placeholder="Tulis jawaban Anda di sini..."
                    className="
                      w-full
                      resize-none
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-5
                      text-sm
                      leading-7
                      text-slate-800
                      outline-none
                      transition

                      placeholder:text-slate-400

                      focus:border-red-500

                      focus:ring-4
                      focus:ring-red-500/10

                      disabled:cursor-not-allowed
                      disabled:bg-slate-50
                    "
                  />


                  <div className="mt-2 flex justify-between gap-4 text-xs text-slate-400">


                    <span>
                      Jelaskan tindakan,
                      alasan, dan langkah
                      yang akan Anda ambil.
                    </span>


                    <span className="shrink-0 font-semibold">

                      {
                        currentAnswer.length
                      }{" "}

                      / 1000

                    </span>

                  </div>

                </div>

              ) : (

                /* =================================================
                   NUMERIC OPTIONS
                ================================================== */

                <div className="mt-7 space-y-3">

                  {options.map(
                    (
                      option,
                      index
                    ) => {

                      const value =
                        String(
                          option?.value ??
                            index + 1
                        );


                      const label =
                        option?.label ??
                        option?.text ??
                        `Pilihan ${
                          index + 1
                        }`;


                      const selected =
                        String(
                          currentAnswer
                        ) ===
                        value;


                      return (

                        <button
                          key={`${currentQuestionId}-${value}-${index}`}
                          type="button"
                          disabled={
                            saving ||
                            finishing
                          }
                          onClick={() =>
                            handleSelectAnswer(
                              value
                            )
                          }
                          className={`
                            group flex w-full
                            items-center gap-4
                            rounded-2xl
                            border
                            p-4
                            text-left
                            transition-all
                            duration-200

                            ${
                              selected
                                ? "border-red-500 bg-red-50 ring-2 ring-red-500/10"

                                : "border-slate-200 bg-white hover:border-red-300 hover:bg-red-50"
                            }
                          `}
                        >


                          <span
                            className={`
                              flex h-10 w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              border
                              text-sm
                              font-bold

                              ${
                                selected
                                  ? "border-red-600 bg-red-600 text-white"

                                  : "border-slate-200 bg-slate-50 text-slate-600"
                              }
                            `}
                          >
                            {index + 1}
                          </span>


                          <span
                            className={`
                              flex-1
                              text-sm
                              font-medium
                              leading-6

                              ${
                                selected
                                  ? "text-red-700"
                                  : "text-slate-700"
                              }
                            `}
                          >
                            {label}
                          </span>


                          {selected && (

                            <CheckCircle2
                              size={21}
                              className="shrink-0 text-red-600"
                            />

                          )}

                        </button>

                      );
                    }
                  )}

                </div>

              )}

            </div>


            {/* =================================================
                FOOTER NAVIGATION
            ================================================== */}

            <div className="border-t border-slate-100 bg-slate-50 p-5 sm:px-8">

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">


                {/* PREVIOUS */}

                <button
                  type="button"
                  onClick={
                    handlePrevious
                  }
                  disabled={
                    currentIndex ===
                      0 ||
                    saving ||
                    finishing
                  }
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-slate-700
                    transition

                    hover:bg-slate-50

                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >

                  <ArrowLeft
                    size={18}
                  />

                  Sebelumnya

                </button>


                {/* NEXT / FINISH */}

                <button
                  type="button"
                  onClick={
                    handleNext
                  }
                  disabled={
                    !String(
                      currentAnswer
                    ).trim() ||
                    saving ||
                    finishing
                  }
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-red-600
                    px-6
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-red-600/20
                    transition

                    hover:bg-red-700

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {saving ? (

                    <>

                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Menyimpan...

                    </>

                  ) : finishing ? (

                    <>

                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Memeriksa...

                    </>

                  ) : isLastQuestion ? (

                    <>

                      Selesaikan Assessment

                      <CheckCircle2
                        size={18}
                      />

                    </>

                  ) : (

                    <>

                      Berikutnya

                      <ArrowRight
                        size={18}
                      />

                    </>

                  )}

                </button>

              </div>

            </div>

          </section>

        )}


        {/* ===================================================
            FOOTER
        ==================================================== */}

        <div className="mt-6 text-center">

          <p className="text-xs leading-5 text-slate-400">

            Jawaban tersimpan otomatis.

            <br />

            Anda dapat berpindah nomor soal kapan saja.

          </p>

        </div>

      </div>

    </main>
  );
}


export default Assessment;