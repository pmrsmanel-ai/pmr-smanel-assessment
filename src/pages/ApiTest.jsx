import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { healthCheck } from "../api/api";

function ApiTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await healthCheck();

      console.log("HEALTH RESPONSE:", response);

      if (response?.success) {
        setResult({
          success: true,
          message: "Backend berhasil terhubung.",
          data: response.data,
        });
      } else {
        setResult({
          success: false,
          message:
            response?.error?.message ||
            "Backend mengembalikan error.",
          data: response,
        });
      }
    } catch (error) {
      console.error("HEALTH ERROR:", error);

      setResult({
        success: false,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-xl">

        <div className="rounded-3xl bg-white p-7 shadow-xl">

          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-wider text-red-600">
              Developer Test
            </p>

            <h1 className="mt-2 text-2xl font-extrabold">
              Backend Connection
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Menguji koneksi React dengan Google Apps Script API.
            </p>
          </div>

          <button
            onClick={handleTest}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Menghubungkan...
              </>
            ) : (
              "Test Backend"
            )}
          </button>

          {result && (
            <div
              className={`mt-6 rounded-2xl border p-5 ${
                result.success
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >

              <div className="flex items-center gap-3">

                {result.success ? (
                  <CheckCircle2
                    className="text-green-600"
                    size={24}
                  />
                ) : (
                  <XCircle
                    className="text-red-600"
                    size={24}
                  />
                )}

                <p
                  className={`font-bold ${
                    result.success
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {result.message}
                </p>

              </div>

              {result.data && (
                <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-xs text-slate-700">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}

export default ApiTest;