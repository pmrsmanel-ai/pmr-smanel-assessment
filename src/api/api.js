const API_URL =
  import.meta.env.VITE_API_URL;


const ADMIN_TOKEN_KEY =
  "pmr_admin_token";


if (!API_URL) {
  console.warn(
    "VITE_API_URL belum dikonfigurasi."
  );
}


/**
 * ============================================================
 * ADMIN ACTIONS
 * ============================================================
 *
 * Action GET yang membutuhkan autentikasi Admin.
 */
const ADMIN_GET_ACTIONS =
  new Set([
    "admin_participants",
    "admin_participant",
    "challenge_admin_evaluations",
    "challenge_admin_evaluation",
    "challenge_admin_counts",
    "verified_challenge_score",

    "admin_settings",
    "admin_team_analysis",
    "admin_team_ai_analysis",
  ]);


/**
 * ============================================================
 * ADMIN POST ACTIONS
 * ============================================================
 *
 * Action POST yang membutuhkan autentikasi Admin.
 *
 * admin_login TIDAK dimasukkan karena login menghasilkan token.
 */
const ADMIN_POST_ACTIONS =
  new Set([
    "admin_check_session",
    "admin_logout",
    "admin_reset_participant",
    "challenge_admin_verify",
    "challenge_admin_reopen",

    "admin_save_settings",
    "admin_reset_settings",
  ]);


/**
 * ============================================================
 * GET ADMIN TOKEN
 * ============================================================
 */

function getAdminToken() {

  if (
    typeof window ===
    "undefined"
  ) {

    return "";

  }


  return (
    localStorage.getItem(
      ADMIN_TOKEN_KEY
    ) || ""
  ).trim();

}


/**
 * ============================================================
 * CHECK ADMIN GET ACTION
 * ============================================================
 */

function isAdminGetAction(
  action
) {

  return ADMIN_GET_ACTIONS.has(
    String(
      action || ""
    )
      .trim()
      .toLowerCase()
  );

}


/**
 * ============================================================
 * CHECK ADMIN POST ACTION
 * ============================================================
 */

function isAdminPostAction(
  action
) {

  return ADMIN_POST_ACTIONS.has(
    String(
      action || ""
    )
      .trim()
      .toLowerCase()
  );

}


/**
 * ============================================================
 * PARSE RESPONSE
 * ============================================================
 */

async function parseResponse(
  response
) {

  const text =
    await response.text();


  let data;


  try {

    data =
      JSON.parse(
        text
      );

  } catch {

    throw new Error(
      "Response backend bukan JSON yang valid."
    );

  }


  return data;

}


/**
 * ============================================================
 * HANDLE ADMIN AUTH ERROR
 * ============================================================
 */

function clearAdminSession() {

  if (
    typeof window !==
    "undefined"
  ) {

    localStorage.removeItem(
      ADMIN_TOKEN_KEY
    );

    localStorage.removeItem(
      "pmr_admin_user"
    );

  }

}


function handleAdminAuthError(
  action,
  result
) {

  if (
    !isAdminGetAction(action) &&
    !isAdminPostAction(action)
  ) {

    return;

  }


  if (
    result?.success !== false
  ) {

    return;

  }


  const errorCode =
    String(
      result?.error?.code || ""
    )
      .trim()
      .toUpperCase();


  if (
    [
      "ADMIN_AUTH_REQUIRED",
      "ADMIN_AUTH_INVALID",
      "ADMIN_TOKEN_REQUIRED",
      "ADMIN_TOKEN_INVALID",
      "ADMIN_TOKEN_EXPIRED",
      "ADMIN_SESSION_INVALID",
    ].includes(
      errorCode
    )
  ) {

    clearAdminSession();

  }

}


/**
 * ============================================================
 * GET API
 * ============================================================
 */

export async function apiGet(
  params = {}
) {

  if (!API_URL) {

    throw new Error(
      "VITE_API_URL belum dikonfigurasi."
    );

  }


  const url =
    new URL(
      API_URL
    );


  const action =
    String(
      params?.action || ""
    )
      .trim()
      .toLowerCase();


  const requestParams = {
    ...params,
  };


  /**
   * ----------------------------------------------------------
   * ADMIN GET
   * ----------------------------------------------------------
   *
   * Tambahkan admin_token otomatis.
   */

  if (
    isAdminGetAction(
      action
    )
  ) {

    const token =
      getAdminToken();


    if (!token) {

      throw new Error(
        "Session Admin tidak ditemukan. Silakan login kembali."
      );

    }


    requestParams.admin_token =
      token;

  }


  /**
   * ----------------------------------------------------------
   * SET QUERY PARAMETER
   * ----------------------------------------------------------
   */

  Object.entries(
    requestParams
  ).forEach(
    ([key, value]) => {

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {

        url.searchParams.set(
          key,
          value
        );

      }

    }
  );


  const response =
    await fetch(
      url.toString(),
      {
        method: "GET",
      }
    );


  const result =
    await parseResponse(
      response
    );


  handleAdminAuthError(
    action,
    result
  );


  return result;

}


/**
 * ============================================================
 * POST API
 * ============================================================
 */

export async function apiPost(
  payload = {}
) {

  if (!API_URL) {

    throw new Error(
      "VITE_API_URL belum dikonfigurasi."
    );

  }


  const action =
    String(
      payload?.action || ""
    )
      .trim()
      .toLowerCase();


  const requestPayload = {
    ...payload,
  };


  /**
   * ----------------------------------------------------------
   * ADMIN POST
   * ----------------------------------------------------------
   *
   * Tambahkan admin_token otomatis.
   *
   * Catatan:
   * admin_login TIDAK membutuhkan token
   * karena action ini justru menghasilkan token.
   */

  if (
    isAdminPostAction(
      action
    )
  ) {

    const token =
      getAdminToken();


    if (!token) {

      throw new Error(
        "Session Admin tidak ditemukan. Silakan login kembali."
      );

    }


    requestPayload.admin_token =
      token;

  }


  /**
   * ----------------------------------------------------------
   * SEND REQUEST
   * ----------------------------------------------------------
   */

  const response =
    await fetch(
      API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8",
        },

        body:
          JSON.stringify(
            requestPayload
          ),
      }
    );


  const result =
    await parseResponse(
      response
    );


  handleAdminAuthError(
    action,
    result
  );


  return result;

}


/**
 * ============================================================
 * HEALTH CHECK
 * ============================================================
 */

export async function healthCheck() {

  return apiGet({

    action:
      "health",

  });

}


/**
 * ============================================================
 * GET PARTICIPANT
 * ============================================================
 */

export async function getParticipant(
  participantId
) {

  if (!participantId) {

    throw new Error(
      "Participant ID wajib diisi."
    );

  }


  return apiGet({

    action:
      "get_participant",

    participant_id:
      participantId,

  });

}


/**
 * ============================================================
 * GET TEAM ANALYSIS
 * ============================================================
 *
 * Mengambil analisis statistik / agregat tim utama.
 *
 * Endpoint:
 * admin_team_analysis
 */

export async function getTeamAnalysis() {

  return apiGet({

    action:
      "admin_team_analysis",

  });

}


/**
 * ============================================================
 * GET TEAM AI ANALYSIS
 * ============================================================
 *
 * Mengambil hasil AI Leadership Analysis.
 *
 * Endpoint AI sengaja dipisahkan dari:
 * admin_team_analysis
 *
 * Endpoint:
 * admin_team_ai_analysis
 */

export async function getTeamAIAnalysis() {

  return apiGet({

    action:
      "admin_team_ai_analysis",

  });

}