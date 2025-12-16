"use client";

import React, { useState, useRef, useEffect } from "react";
import ApiService, { ApiError } from "@/lib/apiService";
import { getDownloadConfig } from "@/lib/downloadConfig";
import constants from "@/lib/constants";

export default function Home() {
  const [videoLink, setVideoLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [conversionProgress, setConversionProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [timeInterval, setTimeInterval] = useState(60);
  const [conversionResult, setConversionResult] = useState(null);
  const [progressStatus, setProgressStatus] = useState("");
  const [progressDetails, setProgressDetails] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStep, setDownloadStep] = useState(1); // Track two-step download progress
  const [adVisited, setAdVisited] = useState(false); // Track if ad step completed
  const unsubscribeRef = useRef(null);
  const downloadConfigRef = useRef(getDownloadConfig());

  const showMessage = (msg, type = "error") => {
    setMessage(`${type}: ${msg}`);
    setTimeout(() => {
      setMessage("");
    }, 5000);
  };

  const handleProgressUpdate = (progress) => {
    console.log("[Frontend] Progress update received:", progress);

    // Handle different progress response formats
    const percentage = progress.percentage || progress.progress || 0;
    const status = progress.status || "processing";
    const message = progress.message || `Processing... ${Math.round(percentage)}%`;

    setConversionProgress(Math.min(100, percentage));
    setProgressStatus(status);
    setProgressDetails({
      ...progress,
      percentage: Math.min(100, percentage),
    });
  };

  const handleConversionComplete = async (result) => {
    try {
      console.log("[Frontend] Conversion complete:", result);

      // Extract PDF filename from various response formats
      const pdfFilename = result.pdf_filename || result.filename || (result.data?.pdf_filename);

      if (pdfFilename) {
        // Store result for display
        setConversionResult({
          filename: pdfFilename,
          title: extractVideoTitle(videoLink),
          videoUrl: videoLink,
          completedAt: new Date(),
          status: "completed",
          ...result,
        });
        setProgressStatus("completed");
        showMessage("Conversion completed successfully!", "success");
      } else {
        showMessage("Conversion completed but PDF filename not found", "error");
      }
    } catch (error) {
      console.error("Completion error:", error);
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Failed to process conversion result. Please try again.";
      showMessage(errorMessage, "error");
    } finally {
      setIsConverting(false);
      setConversionProgress(0);
      setCurrentTaskId(null);
    }
  };

  const handleDownloadStep1 = () => {
    if (!conversionResult) return;

    try {
      const config = downloadConfigRef.current;
      console.log("[Frontend] Opening ad URL:", config.adUrl);

      // Open ad in new tab (same window) or current tab
      const target = config.adWindow.openNewTab ? '_blank' : '_self';

      window.open(config.adUrl, target);

      console.log("[Frontend] Ad URL opened successfully", {
        target,
        isNewTab: config.adWindow.openNewTab,
      });

      setAdVisited(true);
      setDownloadStep(2);
      showMessage(config.messages.step2 || "Ad page opened. Click download to proceed.", "success");
    } catch (error) {
      console.error("Step 1 error:", error);
      showMessage("Failed to open ad page. Please try again.", "error");
    }
  };

  const handleDownloadStep2 = async () => {
    if (!conversionResult) return;

    try {
      setIsDownloading(true);
      console.log("[Frontend] Starting PDF download for:", conversionResult.filename);

      // Trigger immediate browser-managed download via direct URL
      const downloadUrl = `${constants.apiUrl}/download/${encodeURIComponent(
        conversionResult.filename
      )}`;
      window.location.href = downloadUrl;

      console.log("[Frontend] PDF download initiated via browser");
      showMessage("Download started in your browser.", "success");
    } catch (error) {
      console.error("Download error:", error);
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Failed to download PDF. Please try again.";
      showMessage(errorMessage, "error");
    } finally {
      setIsDownloading(false);
      // Only reset download flow if two-step is enabled, to allow multiple downloads
      if (downloadConfigRef.current.enableTwoStepDownload) {
        setDownloadStep(1);
        setAdVisited(false);
      }
    }
  };

  const handleDownloadPdf = async () => {
    const config = downloadConfigRef.current;

    // Single-step download if two-step is disabled
    if (!config.enableTwoStepDownload) {
      return handleDownloadStep2();
    }

    // Two-step download flow
    if (downloadStep === 1 && !adVisited) {
      return handleDownloadStep1();
    } else {
      return handleDownloadStep2();
    }
  };

  const extractVideoTitle = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('v') || 'YouTube Video';
    } catch {
      return 'YouTube Video';
    }
  };

  const resetForm = () => {
    setVideoLink("");
    setConversionResult(null);
    setConversionProgress(0);
    setMessage("");
  };

  const handleConversionError = (error) => {
    console.error("Conversion error:", error);
    const errorMessage =
      error instanceof ApiError
        ? error.message
        : "An error occurred during conversion. Please try again.";
    showMessage(errorMessage, "error");
    setIsConverting(false);
    setConversionProgress(0);
    setProgressStatus("error");
    setCurrentTaskId(null);
  };

  const startConversion = async (event) => {
    event.preventDefault();

    if (!videoLink) {
      showMessage("Please enter a YouTube video URL", "error");
      return;
    }

    try {
      setIsConverting(true);
      setConversionProgress(0);
      setConversionResult(null);
      setProgressStatus("initializing");
      setProgressDetails(null);

      console.log("[Frontend] Starting conversion for URL:", videoLink);

      // API expects time interval in seconds; pass value directly
      const response = await ApiService.convertVideoToPdf(
        videoLink,
        timeInterval
      );

      console.log("[Frontend] API response:", response);

      // Extract task_id from response (handle both formats)
      const taskId = response.task_id || response.data?.task_id;

      if (!taskId) {
        throw new Error("No task ID returned from API");
      }

      console.log("[Frontend] Task ID received:", taskId);
      setCurrentTaskId(taskId);
      setProgressStatus("processing");

      // Subscribe to progress updates via /stream endpoint
      unsubscribeRef.current = ApiService.subscribeToProgress(
        taskId,
        handleProgressUpdate,
        handleConversionComplete,
        handleConversionError
      );
    } catch (error) {
      console.error("Conversion error:", error);
      let errorMessage = "Failed to start conversion";

      if (error instanceof ApiError) {
        errorMessage = error.message;
        // Handle validation errors
        if (error.validationErrors && error.validationErrors.length > 0) {
          const validationMessages = error.validationErrors
            .map((err) => err.msg)
            .join(", ");
          errorMessage = `Validation error: ${validationMessages}`;
        }
      }

      showMessage(errorMessage, "error");
      setIsConverting(false);
      setProgressStatus("error");
    }
  };

  const cancelCurrentConversion = async () => {
    if (!currentTaskId) return;

    try {
      console.log("[Frontend] Canceling task:", currentTaskId);
      await ApiService.cancelTask(currentTaskId);
      // Unsubscribe from SSE and reset state
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      setIsConverting(false);
      setCurrentTaskId(null);
      setConversionProgress(0);
      setProgressStatus("canceled");
      showMessage("Conversion canceled", "success");
    } catch (error) {
      console.error("Cancel error:", error);
      const errorMessage = error instanceof ApiError ? error.message : "Failed to cancel conversion";
      showMessage(errorMessage, "error");
    }
  };

  // Cleanup event listeners on unmount
  React.useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const getStepStatus = (stepNumber) => {
    const statusMap = {
      1: ["initializing"].includes(progressStatus),
      2: ["processing"].includes(progressStatus),
      3: ["completed"].includes(progressStatus),
    };
    return statusMap[stepNumber] || false;
  };

  const isStepCompleted = (stepNumber) => {
    if (progressStatus === "completed") return true;
    const completedMap = {
      1: ["processing", "completed"].includes(progressStatus),
      2: ["completed"].includes(progressStatus),
      3: ["completed"].includes(progressStatus),
    };
    return completedMap[stepNumber] || false;
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-10">
      <header className="w-full max-w-2xl" role="banner">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 text-center shadow-sm">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-3 leading-tight">
            YouTube to <span className="text-blue-600">PDF Notes</span>
          </h1>

          <p className="text-sm md:text-base text-slate-600 mb-6 max-w-xl mx-auto">
            Paste a YouTube link, choose how often to capture frames, and get clean, searchable PDF notes.
          </p>

          <form className="max-w-xl mx-auto flex flex-col gap-5" onSubmit={startConversion}>
            {/* YouTube URL Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="videoUrl" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                YouTube Video URL
              </label>
              <input
                id="videoUrl"
                type="url"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:opacity-70 transition-all"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                disabled={isConverting}
                required
              />
            </div>

            {/* Capture Interval Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="captureInterval" className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Capture Interval (seconds)
              </label>
              <input
                id="captureInterval"
                type="number"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm md:text-base bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:opacity-70 transition-all"
                value={timeInterval}
                onChange={(e) => setTimeInterval(Number(e.target.value))}
                disabled={isConverting}
                min="1"
                max="3600"
                placeholder="60"
              />
            </div>

            {isConverting && (
              <div className="flex items-center gap-0 my-8 p-6 bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 rounded-lg border border-slate-200">
                {/* Step 1 */}
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${isStepCompleted(1)
                    ? 'bg-emerald-500 text-white'
                    : getStepStatus(1)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                    }`}>
                    {isStepCompleted(1) ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : '1'}
                  </div>
                  <div className="hidden md:block">
                    <div className={`font-semibold text-sm ${getStepStatus(1) ? 'text-blue-600' : isStepCompleted(1) ? 'text-emerald-600' : 'text-slate-600'}`}>Initializing</div>
                    <div className="text-xs text-slate-500">Preparing conversion</div>
                  </div>
                </div>

                <div className={`h-1 w-12 mx-2 transition-all ${isStepCompleted(1) ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

                {/* Step 2 */}
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${isStepCompleted(2)
                    ? 'bg-emerald-500 text-white'
                    : getStepStatus(2)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                    }`}>
                    {isStepCompleted(2) ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : '2'}
                  </div>
                  <div className="hidden md:block">
                    <div className={`font-semibold text-sm ${getStepStatus(2) ? 'text-blue-600' : isStepCompleted(2) ? 'text-emerald-600' : 'text-slate-600'}`}>Processing</div>
                    <div className="text-xs text-slate-500">Converting video to PDF</div>
                  </div>
                </div>

                <div className={`h-1 w-12 mx-2 transition-all ${isStepCompleted(2) ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

                {/* Step 3 */}
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${isStepCompleted(3)
                    ? 'bg-emerald-500 text-white'
                    : getStepStatus(3)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                    }`}>
                    {isStepCompleted(3) ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : '3'}
                  </div>
                  <div className="hidden md:block">
                    <div className={`font-semibold text-sm ${getStepStatus(3) ? 'text-blue-600' : isStepCompleted(3) ? 'text-emerald-600' : 'text-slate-600'}`}>Complete</div>
                    <div className="text-xs text-slate-500">Ready to download</div>
                  </div>
                </div>
              </div>
            )}

            {isConverting && progressDetails && (
              <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-2">
                  {progressStatus === "processing" && (
                    <>
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                      <span>Processing...</span>
                    </>
                  )}
                  {progressStatus === "initializing" && (
                    <>
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                      <span>Initializing...</span>
                    </>
                  )}
                </div>
                {progressDetails.message && (
                  <p className="text-xs text-slate-600">{progressDetails.message}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              disabled={isConverting}
            >
              {isConverting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                "Convert to PDF"
              )}
            </button>

            {isConverting && (
              <button
                type="button"
                onClick={cancelCurrentConversion}
                className="w-full mt-3 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel Conversion</span>
              </button>
            )}

            {message && (
              <div
                className={`p-3 rounded-lg text-sm font-medium ${message.startsWith("error:")
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
              >
                {message.replace(/^(error:|success:)\s*/, "")}
              </div>
            )}

            {conversionResult && (
              <div className="mt-6 p-6 bg-gradient-to-br from-teal-50 to-slate-50 border-2 border-teal-500 rounded-xl shadow-lg">
                <div className="flex gap-4 mb-6 items-center">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Conversion Complete</h3>
                    {downloadConfigRef.current.enableTwoStepDownload && adVisited && (
                      <p className="text-xs text-teal-600 mt-1">Step 2: Download your PDF</p>
                    )}
                  </div>
                </div>

                <div className="mb-6 p-3 bg-white/80 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                      </svg>
                      <span className="text-sm text-slate-600 truncate">{conversionResult.filename}</span>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading || (downloadConfigRef.current.enableTwoStepDownload && downloadStep === 1 && !adVisited && isDownloading)}
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{downloadConfigRef.current.messages.completed || "Processing..."}</span>
                    </>
                  ) : downloadConfigRef.current.enableTwoStepDownload ? (
                    downloadStep === 1 ? (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.657 14.243a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.757 15.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zM5.757 5.757a1 1 0 000-1.414L5.05 3.636a1 1 0 00-1.414 1.414l.707.707z" />
                        </svg>
                        <span>{downloadConfigRef.current.labels.step1 || "Visit Ad & Download"}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>{downloadConfigRef.current.labels.step2 || "Download PDF"}</span>
                      </>
                    )
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </header>
    </main>
  );
}
