"use client";

import React, { useState, useRef, useEffect } from "react";
import { ApiService, ApiError } from "@/lib/apiService";
import "./page.css";

export default function Home() {
  const [videoLink, setVideoLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [conversionProgress, setConversionProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [timeInterval, setTimeInterval] = useState(60);
  const unsubscribeRef = useRef(null);

  const showMessage = (msg, type = "error") => {
    setMessage(`${type}: ${msg}`);
    setTimeout(() => {
      setMessage("");
    }, 5000);
  };

  const handleProgressUpdate = (progress) => {
    setConversionProgress(progress.percentage || 0);
  };

  const handleConversionComplete = async (result) => {
    try {
      if (result.filename) {
        const pdfBlob = await ApiService.downloadPdf(result.filename);
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `yt_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showMessage("PDF downloaded successfully!", "success");
      }
    } catch (error) {
      console.error("Download error:", error);
      const errorMessage = error instanceof ApiError
        ? error.message
        : "Failed to download PDF. Please try again.";
      showMessage(errorMessage, "error");
    } finally {
      setIsConverting(false);
      setConversionProgress(0);
    }
  };

  const handleConversionError = (error) => {
    console.error("Conversion error:", error);
    const errorMessage = error instanceof ApiError
      ? error.message
      : "An error occurred during conversion. Please try again.";
    showMessage(errorMessage, "error");
    setIsConverting(false);
    setConversionProgress(0);
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

      // Start the conversion process
      const response = await ApiService.convertVideoToPdf(
        videoLink,
        timeInterval
      );

      if (response.data && response.data.task_id) {
        // Subscribe to progress updates
        unsubscribeRef.current = ApiService.subscribeToProgress(
          response.data.task_id,
          handleProgressUpdate,
          handleConversionComplete,
          handleConversionError
        );
      }
    } catch (error) {
      console.error("Conversion error:", error);
      let errorMessage = "Failed to start conversion";

      if (error instanceof ApiError) {
        errorMessage = error.message;
        // Handle validation errors
        if (error.validationErrors && error.validationErrors.length > 0) {
          const validationMessages = error.validationErrors
            .map(err => err.msg)
            .join(", ");
          errorMessage = `Validation error: ${validationMessages}`;
        }
      }

      showMessage(errorMessage, "error");
      setIsConverting(false);
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

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="glass-card">
          <div className="badge">
            <span>YouTube to PDF</span>
          </div>

          <h1 className="hero-title">
            Transform Videos into <span>Smart PDFs</span>
          </h1>

          <p className="hero-subtitle">
            Convert any YouTube video into organized, searchable PDF notes in seconds.
            Simple, fast, and free.
          </p>

          <form className="converter-form" onSubmit={startConversion}>
            <div className="input-wrapper">
              <svg
                className="input-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <input
                type="url"
                className="url-input"
                placeholder="Paste YouTube video URL here..."
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                disabled={isConverting}
                required
              />
            </div>

            <div className="time-interval-selector">
              <label htmlFor="timeInterval">Capture Interval (seconds)</label>
              <input
                type="number"
                id="timeInterval"
                value={timeInterval}
                onChange={(e) => setTimeInterval(Number(e.target.value))}
                disabled={isConverting}
                className="time-input"
                min="1"
                max="3600"
                placeholder="e.g. 60"
              />
            </div>

            {isConverting && (
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${conversionProgress}%` }}
                ></div>
                <span className="progress-text">{Math.round(conversionProgress)}%</span>
              </div>
            )}

            <button
              type="submit"
              className="convert-button"
              disabled={isConverting}
            >
              {isConverting ? (
                <>
                  <div className="spinner"></div>
                  <span>Processing...</span>
                </>
              ) : (
                'Convert to PDF'
              )}
            </button>

            {message && (
              <div className={`message ${message.startsWith('error:') ? 'error' : 'success'}`}>
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [conversionProgress, setConversionProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [timeInterval, setTimeInterval] = useState(60);
  const unsubscribeRef = useRef(null);

  const showMessage = (msg, type = "error") => {
    setMessage(`${type}: ${msg}`);
    setTimeout(() => {
      setMessage("");
    }, 5000);
  };

  const handleProgressUpdate = (progress) => {
    setConversionProgress(progress.percentage || 0);
  };

  const handleConversionComplete = async (result) => {
    try {
      if (result.filename) {
        const pdfBlob = await ApiService.downloadPdf(result.filename);
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `yt_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showMessage("PDF downloaded successfully!", "success");
      }
    } catch (error) {
      console.error("Download error:", error);
      const errorMessage = error instanceof ApiError
        ? error.message
        : "Failed to download PDF. Please try again.";
      showMessage(errorMessage, "error");
    } finally {
      setIsConverting(false);
      setConversionProgress(0);
    }
  };

  const handleConversionError = (error) => {
    console.error("Conversion error:", error);
    const errorMessage = error instanceof ApiError
      ? error.message
      : "An error occurred during conversion. Please try again.";
    showMessage(errorMessage, "error");
    setIsConverting(false);
    setConversionProgress(0);
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

      // Start the conversion process
      const response = await ApiService.convertVideoToPdf(
        videoLink,
        timeInterval
      );

      if (response.data && response.data.task_id) {
        // Subscribe to progress updates
        unsubscribeRef.current = ApiService.subscribeToProgress(
          response.data.task_id,
          handleProgressUpdate,
          handleConversionComplete,
          handleConversionError
        );
      }
    } catch (error) {
      console.error("Conversion error:", error);
      let errorMessage = "Failed to start conversion";

      if (error instanceof ApiError) {
        errorMessage = error.message;
        // Handle validation errors
        if (error.validationErrors && error.validationErrors.length > 0) {
          const validationMessages = error.validationErrors
            .map(err => err.msg)
            .join(", ");
          errorMessage = `Validation error: ${validationMessages}`;
        }
      }

      showMessage(errorMessage, "error");
      setIsConverting(false);
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

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="glass-card">
          <div className="badge">
            <span>YouTube to PDF</span>
          </div>

          <h1 className="hero-title">
            Transform Videos into <span>Smart PDFs</span>
          </h1>

          <p className="hero-subtitle">
            Convert any YouTube video into organized, searchable PDF notes in seconds.
            Simple, fast, and free.
          </p>

          <form className="converter-form" onSubmit={startConversion}>
            <div className="input-wrapper">
              <svg
                className="input-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <input
                type="url"
                className="url-input"
                placeholder="Paste YouTube video URL here..."
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                disabled={isConverting}
                required
              />
            </div>

            <div className="time-interval-selector">
              <label htmlFor="timeInterval">Capture Interval (seconds)</label>
              <input
                type="number"
                id="timeInterval"
                value={timeInterval}
                onChange={(e) => setTimeInterval(Number(e.target.value))}
                disabled={isConverting}
                className="time-input"
                min="1"
                max="3600"
                placeholder="e.g. 60"
              />
            </div>

            {isConverting && (
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${conversionProgress}%` }}
                ></div>
                <span className="progress-text">{Math.round(conversionProgress)}%</span>
              </div>
            )}

            <button
              type="submit"
              className="convert-button"
              disabled={isConverting}
            >
              {isConverting ? (
                <>
                  <div className="spinner"></div>
                  <span>Processing...</span>
                </>
              ) : (
                'Convert to PDF'
              )}
            </button>

            {message && (
              <div className={`message ${message.startsWith('error:') ? 'error' : 'success'}`}>
                {message.replace(/^(error:|success:)\s*/, '')}
              </div>
            )}
          </form>


        </div>
      </div>
    </div>
  );
}
