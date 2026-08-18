import {
  Activity,
  Brain,
  CheckCircle2,
  Database,
  FileText,
  Info,
  RefreshCw,
  Save,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  RotateCcw,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  apiGet,
  apiPost,
} from "../api/api";


/* ============================================================
 * DEFAULT SETTINGS
 * ============================================================
 */

const DEFAULT_SETTINGS = {

  app_name:
    "PMR SMANEL Leadership Assessment",

  organization:
    "PMR SMANEL",

  assessment_year:
    "2026",

  report_title:
    "Leadership Assessment 2026",

  report_format:
    "A4",

  report_orientation:
    "Portrait",

  report_logo_enabled:
    true,

  report_show_final_score:
    true,

  report_show_details:
    true,

  report_show_status:
    true,

  assessment_enabled:
    true,

  challenge_enabled:
    true,

  ai_enabled:
    true,

};


/* ============================================================
 * PAGE
 * ============================================================
 */

export default function AdminSettings() {

  const [
    settings,
    setSettings,
  ] = useState(
    DEFAULT_SETTINGS
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    resetting,
    setResetting,
  ] = useState(false);


  const [
    checking,
    setChecking,
  ] = useState(false);


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const [
    systemStatus,
    setSystemStatus,
  ] = useState({

    api:
      "CHECKING",

    database:
      "CHECKING",

    ai:
      "READY",

    challenge:
      "ACTIVE",

  });


  const [
    lastChecked,
    setLastChecked,
  ] = useState(null);


  /* ==========================================================
   * LOAD SETTINGS
   * ==========================================================
   */

  async function loadSettings() {

    setLoading(true);

    setError("");

    try {

      const result =
        await apiGet({

          action:
            "admin_settings",

        });


      console.log(
        "ADMIN SETTINGS:",
        result
      );


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Pengaturan gagal dimuat."
        );

      }


      const loadedSettings =
        result?.data?.settings ||
        {};


      setSettings({

        ...DEFAULT_SETTINGS,

        ...loadedSettings,

      });


    } catch (
      err
    ) {

      console.error(
        "LOAD SETTINGS ERROR:",
        err
      );


      setError(
        err?.message ||
        "Pengaturan gagal dimuat."
      );

    } finally {

      setLoading(false);

    }

  }


  /* ==========================================================
   * INITIAL LOAD
   * ==========================================================
   */

  useEffect(() => {

    loadSettings();

    checkSystemStatus();

  }, []);


  /* ==========================================================
   * CHECK SYSTEM
   * ==========================================================
   */

  async function checkSystemStatus() {

    setChecking(true);

    try {

      const result =
        await apiGet({

          action:
            "health",

        });


      if (
        result?.success === true
      ) {

        setSystemStatus(
          previous => ({

            ...previous,

            api:
              "ONLINE",

            database:
              "ONLINE",

          })
        );

      } else {

        setSystemStatus(
          previous => ({

            ...previous,

            api:
              "OFFLINE",

          })
        );

      }

    } catch (
      err
    ) {

      console.error(
        "SYSTEM STATUS ERROR:",
        err
      );


      setSystemStatus(
        previous => ({

          ...previous,

          api:
            "OFFLINE",

          database:
            "OFFLINE",

        })
      );

    } finally {

      setChecking(false);

      setLastChecked(
        new Date()
      );

    }

  }


  /* ==========================================================
   * UPDATE FIELD
   * ==========================================================
   */

  function updateSetting(
    key,
    value
  ) {

    setSettings(
      previous => ({

        ...previous,

        [key]:
          value,

      })
    );


    setMessage("");

    setError("");

  }


  /* ==========================================================
   * SAVE
   * ==========================================================
   */

  async function handleSave() {

    if (
      saving
    ) {

      return;

    }


    setSaving(true);

    setMessage("");

    setError("");


    try {

      const result =
        await apiPost({

          action:
            "admin_save_settings",

          settings:
            settings,

        });


      console.log(
        "SAVE SETTINGS:",
        result
      );


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Pengaturan gagal disimpan."
        );

      }


      const savedSettings =
        result?.data?.settings ||
        settings;


      setSettings({

        ...DEFAULT_SETTINGS,

        ...savedSettings,

      });


      setMessage(
        result?.data?.message ||
        "Pengaturan berhasil disimpan."
      );


    } catch (
      err
    ) {

      console.error(
        "SAVE SETTINGS ERROR:",
        err
      );


      setError(
        err?.message ||
        "Pengaturan gagal disimpan."
      );

    } finally {

      setSaving(false);

    }

  }


  /* ==========================================================
   * RESET
   * ==========================================================
   */

  async function handleReset() {

    if (
      resetting
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        "Kembalikan seluruh pengaturan ke nilai default?"
      );


    if (!confirmed) {

      return;

    }


    setResetting(true);

    setMessage("");

    setError("");


    try {

      const result =
        await apiPost({

          action:
            "admin_reset_settings",

        });


      console.log(
        "RESET SETTINGS:",
        result
      );


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.error?.message ||
          "Pengaturan gagal direset."
        );

      }


      const resetSettings =
        result?.data?.settings ||
        DEFAULT_SETTINGS;


      setSettings({

        ...DEFAULT_SETTINGS,

        ...resetSettings,

      });


      setMessage(
        result?.data?.message ||
        "Pengaturan berhasil dikembalikan ke default."
      );


    } catch (
      err
    ) {

      console.error(
        "RESET SETTINGS ERROR:",
        err
      );


      setError(
        err?.message ||
        "Pengaturan gagal direset."
      );

    } finally {

      setResetting(false);

    }

  }


  /* ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-5 sm:px-5 sm:py-6">

      <div className="mx-auto w-full max-w-[1400px]">


        {/* ====================================================
         * HEADER
         * ====================================================
         */}

        <header className="rounded-3xl bg-red-600 px-5 py-6 text-white shadow-sm sm:px-7 sm:py-7">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Settings
                  className="h-5 w-5 text-red-100"
                />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-100">
                  ADMIN SYSTEM
                </span>

              </div>


              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Pengaturan Sistem
              </h1>


              <p className="mt-2 max-w-2xl text-sm text-red-100">
                Konfigurasi dan informasi sistem PMR SMANEL Leadership Assessment {settings.assessment_year}.
              </p>

            </div>


            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={
                  checkSystemStatus
                }
                disabled={
                  checking
                }
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-60"
              >

                <RefreshCw
                  className={
                    checking
                      ? "h-4 w-4 animate-spin"
                      : "h-4 w-4"
                  }
                />

                Periksa Sistem

              </button>


              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={
                  saving ||
                  loading
                }
                className="inline-flex items-center gap-2 rounded-xl bg-red-800 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-900 disabled:opacity-60"
              >

                <Save
                  className="h-4 w-4"
                />

                {saving
                  ? "Menyimpan..."
                  : "Simpan Pengaturan"}

              </button>

            </div>

          </div>

        </header>


        {/* ====================================================
         * MESSAGE
         * ====================================================
         */}

        {message && (

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">

            <CheckCircle2
              className="h-4 w-4 shrink-0"
            />

            {message}

          </div>

        )}


        {error && (

          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">

            {error}

          </div>

        )}


        {/* ====================================================
         * LOADING
         * ====================================================
         */}

        {loading ? (

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <RefreshCw
              className="mx-auto h-6 w-6 animate-spin text-red-500"
            />

            <p className="mt-3 text-sm text-slate-500">
              Memuat pengaturan sistem...
            </p>

          </div>

        ) : (

          <>


            {/* =================================================
             * INFORMASI SISTEM
             * =================================================
             */}

            <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <SectionHeader
                icon={
                  <Info className="h-5 w-5 text-red-600" />
                }
                title="Informasi Sistem"
                description="Informasi dasar aplikasi yang digunakan."
              />


              <div className="mt-5 grid gap-4 md:grid-cols-2">

                <InputField
                  label="Nama Aplikasi"
                  value={
                    settings.app_name
                  }
                  onChange={
                    value =>
                      updateSetting(
                        "app_name",
                        value
                      )
                  }
                />


                <InputField
                  label="Organisasi"
                  value={
                    settings.organization
                  }
                  onChange={
                    value =>
                      updateSetting(
                        "organization",
                        value
                      )
                  }
                />


                <InputField
                  label="Tahun Assessment"
                  value={
                    settings.assessment_year
                  }
                  onChange={
                    value =>
                      updateSetting(
                        "assessment_year",
                        value
                      )
                  }
                />


                <InputField
                  label="Judul Report"
                  value={
                    settings.report_title
                  }
                  onChange={
                    value =>
                      updateSetting(
                        "report_title",
                        value
                      )
                  }
                />

              </div>

            </section>


            {/* =================================================
             * REPORT
             * =================================================
             */}

            <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <SectionHeader
                icon={
                  <FileText className="h-5 w-5 text-blue-600" />
                }
                title="Pengaturan Laporan"
                description="Konfigurasi laporan peserta."
              />


              <div className="mt-5 grid gap-4 md:grid-cols-2">

                <SelectField
                  label="Format Laporan"
                  value={
                    settings.report_format
                  }
                  options={[
                    "A4",
                  ]}
                  onChange={
                    value =>
                      updateSetting(
                        "report_format",
                        value
                      )
                  }
                />


                <SelectField
                  label="Orientasi"
                  value={
                    settings.report_orientation
                  }
                  options={[
                    "Portrait",
                    "Landscape",
                  ]}
                  onChange={
                    value =>
                      updateSetting(
                        "report_orientation",
                        value
                      )
                  }
                />


                <ToggleField
                  label="Logo PMR SMANEL"
                  description="Tampilkan logo pada laporan."
                  checked={
                    settings.report_logo_enabled
                  }
                  onChange={
                    value =>
                      updateSetting(
                        "report_logo_enabled",
                        value
                      )
                  }
                />


                <ToggleField
                  label="Final Score"
                  description="Tampilkan nilai akhir peserta."
                  checked={
                    settings.report_show_final_score
                  }
                  onChange={
                    value =>
                      updateSetting(
                        "report_show_final_score",
                        value
                      )
                  }
                />


                <ToggleField
                  label="Detail Nilai"
                  description="Tampilkan seluruh komponen assessment."
                  checked={
                    settings.report_show_details
                  }
                  onChange={
                    value =>
                      updateSetting(
                        "report_show_details",
                        value
                      )
                  }
                />


                <ToggleField
                  label="Status Peserta"
                  description="Tampilkan status assessment."
                  checked={
                    settings.report_show_status
                  }
                  onChange={
                    value =>
                      updateSetting(
                        "report_show_status",
                        value
                      )
                  }
                />

              </div>

            </section>


            {/* =================================================
             * ASSESSMENT
             * =================================================
             */}

            <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <SectionHeader
                icon={
                  <Sparkles className="h-5 w-5 text-violet-600" />
                }
                title="Kontrol Assessment"
                description="Kontrol utama proses assessment."
              />


              <div className="mt-5 grid gap-4 md:grid-cols-2">

                <ToggleField
                  label="Assessment Peserta"
                  description="Izinkan peserta mengerjakan assessment."
                  checked={
                    settings.assessment_enabled
                  }
                  onChange={
                    value =>
                      updateSetting(
                        "assessment_enabled",
                        value
                      )
                  }
                />


                <ToggleField
                  label="Challenge"
                  description="Aktifkan tahap Challenge peserta."
                  checked={
                    settings.challenge_enabled
                  }
                  onChange={
                    value =>
                      updateSetting(
                        "challenge_enabled",
                        value
                      )
                  }
                />


                <ToggleField
                  label="AI Evaluator"
                  description="Aktifkan evaluasi AI untuk Challenge."
                  checked={
                    settings.ai_enabled
                  }
                  onChange={
                    value =>
                      updateSetting(
                        "ai_enabled",
                        value
                      )
                  }
                />

              </div>


              <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4">

                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                />

                <p className="text-xs leading-5 text-amber-700">

                  Perubahan kontrol assessment akan memengaruhi
                  perilaku portal peserta. Gunakan dengan hati-hati.

                </p>

              </div>

            </section>


            {/* =================================================
             * SYSTEM STATUS
             * =================================================
             */}

            <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <SectionHeader
                icon={
                  <Activity className="h-5 w-5 text-emerald-600" />
                }
                title="Status Sistem"
                description="Status komponen utama aplikasi."
              />


              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <SystemStatusCard
                  icon={
                    <Server className="h-5 w-5" />
                  }
                  title="Backend API"
                  status={
                    systemStatus.api
                  }
                />


                <SystemStatusCard
                  icon={
                    <Database className="h-5 w-5" />
                  }
                  title="Database"
                  status={
                    systemStatus.database
                  }
                />


                <SystemStatusCard
                  icon={
                    <Brain className="h-5 w-5" />
                  }
                  title="AI Evaluator"
                  status={
                    settings.ai_enabled
                      ? "ONLINE"
                      : "OFFLINE"
                  }
                />


                <SystemStatusCard
                  icon={
                    <ShieldCheck className="h-5 w-5" />
                  }
                  title="Challenge"
                  status={
                    settings.challenge_enabled
                      ? "ONLINE"
                      : "OFFLINE"
                  }
                />

              </div>


              {lastChecked && (

                <div className="mt-4 text-[11px] text-slate-400">

                  Terakhir diperiksa:{" "}

                  {lastChecked.toLocaleTimeString(
                    "id-ID"
                  )}

                </div>

              )}

            </section>


            {/* =================================================
             * STRUCTURE
             * =================================================
             */}

            <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <SectionHeader
                icon={
                  <Sparkles className="h-5 w-5 text-violet-600" />
                }
                title="Struktur Assessment"
                description="Maksimum nilai assessment yang digunakan sistem."
              />


              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

                <ScoreStructure
                  title="Personality"
                  value="200"
                />

                <ScoreStructure
                  title="Competency"
                  value="200"
                />

                <ScoreStructure
                  title="SJT"
                  value="75"
                />

                <ScoreStructure
                  title="Challenge"
                  value="25"
                />

                <ScoreStructure
                  title="Objective"
                  value="500"
                />

              </div>


              <div className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 p-4">

                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
                />

                <p className="text-xs leading-5 text-slate-500">

                  Struktur bobot assessment bersifat
                  <span className="font-semibold">
                    {" "}read-only
                  </span>
                  {" "}dan tidak dapat diubah dari halaman Settings.

                </p>

              </div>

            </section>


            {/* =================================================
             * ADMINISTRATION
             * =================================================
             */}

            <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <SectionHeader
                icon={
                  <Settings className="h-5 w-5 text-slate-600" />
                }
                title="Administrasi"
                description="Kontrol administrasi sistem."
              />


              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <div className="text-sm font-semibold text-slate-800">
                    Kembalikan Pengaturan
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    Mengembalikan seluruh pengaturan ke nilai default.
                  </div>

                </div>


                <button
                  type="button"
                  onClick={
                    handleReset
                  }
                  disabled={
                    resetting ||
                    saving
                  }
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >

                  <RotateCcw
                    className={
                      resetting
                        ? "h-4 w-4 animate-spin"
                        : "h-4 w-4"
                    }
                  />

                  {resetting
                    ? "Mereset..."
                    : "Reset Default"}

                </button>

              </div>

            </section>


            {/* =================================================
             * BOTTOM SAVE
             * =================================================
             */}

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="text-xs text-slate-400">
                Perubahan hanya tersimpan setelah tombol Simpan Pengaturan ditekan.
              </div>


              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={
                  saving
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
              >

                <Save
                  className="h-4 w-4"
                />

                {saving
                  ? "Menyimpan..."
                  : "Simpan Pengaturan"}

              </button>

            </div>


            {/* =================================================
             * FOOTER
             * =================================================
             */}

            <div className="mt-6 pb-4 text-center">

              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">

                <CheckCircle2
                  className="h-4 w-4 text-emerald-500"
                />

                PMR SMANEL Leadership Assessment {settings.assessment_year}

              </div>

              <div className="mt-1 text-[10px] text-slate-400">
                Admin System
              </div>

            </div>

          </>

        )}

      </div>

    </div>
  );
}


/* ============================================================
 * SECTION HEADER
 * ============================================================
 */

function SectionHeader({
  icon,
  title,
  description,
}) {

  return (

    <div className="flex items-start gap-4">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50">

        {icon}

      </div>


      <div>

        <h2 className="text-sm font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>

      </div>

    </div>

  );
}


/* ============================================================
 * INPUT
 * ============================================================
 */

function InputField({
  label,
  value,
  onChange,
}) {

  return (

    <label className="block">

      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>


      <input
        type="text"
        value={
          value ?? ""
        }
        onChange={
          event =>
            onChange(
              event.target.value
            )
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
      />

    </label>

  );
}


/* ============================================================
 * SELECT
 * ============================================================
 */

function SelectField({
  label,
  value,
  options,
  onChange,
}) {

  return (

    <label className="block">

      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>


      <select
        value={
          value ?? ""
        }
        onChange={
          event =>
            onChange(
              event.target.value
            )
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
      >

        {options.map(
          option => (

            <option
              key={
                option
              }
              value={
                option
              }
            >
              {option}
            </option>

          )
        )}

      </select>

    </label>

  );
}


/* ============================================================
 * TOGGLE
 * ============================================================
 */

function ToggleField({
  label,
  description,
  checked,
  onChange,
}) {

  return (

    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">

      <div>

        <div className="text-sm font-semibold text-slate-800">
          {label}
        </div>

        <div className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </div>

      </div>


      <button
        type="button"
        onClick={() =>
          onChange(
            !checked
          )
        }
        className={`
          relative
          h-7
          w-12
          shrink-0
          rounded-full
          transition
          ${
            checked
              ? "bg-emerald-500"
              : "bg-slate-300"
          }
        `}
        aria-label={
          label
        }
      >

        <span
          className={`
            absolute
            top-1
            h-5
            w-5
            rounded-full
            bg-white
            shadow-sm
            transition
            ${
              checked
                ? "left-6"
                : "left-1"
            }
          `}
        />

      </button>

    </div>

  );
}


/* ============================================================
 * SYSTEM STATUS
 * ============================================================
 */

function SystemStatusCard({
  icon,
  title,
  status,
}) {

  const online =
    String(
      status || ""
    ).toUpperCase() ===
    "ONLINE";


  return (

    <div className="rounded-xl border border-slate-200 p-4">

      <div className="flex items-center justify-between">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-600">

          {icon}

        </div>


        <span
          className={`
            rounded-full
            px-2.5
            py-1.5
            text-[10px]
            font-semibold
            ${
              online
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }
          `}
        >

          {online
            ? "Online"
            : "Offline"}

        </span>

      </div>


      <div className="mt-4 text-sm font-semibold text-slate-800">
        {title}
      </div>

    </div>

  );
}


/* ============================================================
 * SCORE STRUCTURE
 * ============================================================
 */

function ScoreStructure({
  title,
  value,
}) {

  return (

    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">

      <div className="text-xs font-semibold text-slate-600">
        {title}
      </div>

      <div className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-[10px] text-slate-400">
        maksimum
      </div>

    </div>

  );
}