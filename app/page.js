"use client";

import React, { useState, useRef, useEffect } from "react";
import ApiService, { ApiError } from "@/lib/apiService";
import "./page.css";

export default function Home() {
  const [videoLink, setVideoLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [conversionProgress, setConversionProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [timeInterval, setTimeInterval] = useState(60);
  const [conversionResult, setConversionResult] = useState(null);
  const [progressStatus, setProgressStatus] = useState("");
  const [progressDetails, setProgressDetails] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const unsubscribeRef = useRef(null);

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
    }
  };

  const handleDownloadPdf = async () => {
    if (!conversionResult) return;

    try {
      setIsDownloading(true);
      console.log("[Frontend] Starting PDF download for:", conversionResult.filename);
      
      const pdfBlob = await ApiService.downloadPdf(conversionResult.filename);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = conversionResult.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("[Frontend] PDF download successful");
      showMessage("PDF downloaded successfully!", "success");
    } catch (error) {
      console.error("Download error:", error);
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Failed to download PDF. Please try again.";
      showMessage(errorMessage, "error");
    } finally {
      setIsDownloading(false);
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

      // Convert seconds to minutes (API expects minutes)
      const timeIntervalMinutes = Math.max(1, Math.round(timeInterval / 60));

      // Start the conversion process
      const response = await ApiService.convertVideoToPdf(
        videoLink,
        timeIntervalMinutes
      );

      console.log("[Frontend] API response:", response);

      // Extract task_id from response (handle both formats)
      const taskId = response.task_id || response.data?.task_id;
      
      if (!taskId) {
        throw new Error("No task ID returned from API");
      }

      console.log("[Frontend] Task ID received:", taskId);
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

  // Cleanup event listeners on unmount
  React.useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return (
    <main className="home-container">
      <header className="hero-section" role="banner">
        <div className="glass-card">
          <div className="badge" aria-label="Product Category">
            <span>YouTube to PDF Converter</span>
          </div>

          <h1 className="hero-title">
            Transform YouTube Videos into{" "}
            <span>Smart, Searchable PDF Notes</span>
          </h1>

          <p className="hero-subtitle">
            Instantly convert any YouTube video into organized, searchable PDF
            notes with timestamps. Perfect for students, researchers, and
            professionals who want to learn more effectively.
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
                <span className="progress-text">
                  {Math.round(conversionProgress)}%
                </span>
              </div>
            )}

            {isConverting && progressDetails && (
              <div className="progress-details">
                <div className="progress-status-badge">
                  {progressStatus === "processing" && (
                    <>
                      <div className="spinner-small"></div>
                      <span>Processing...</span>
                    </>
                  )}
                  {progressStatus === "initializing" && (
                    <>
                      <div className="spinner-small"></div>
                      <span>Initializing...</span>
                    </>
                  )}
                </div>
                {progressDetails.message && (
                  <p className="progress-message">{progressDetails.message}</p>
                )}
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
                "Convert to PDF"
              )}
            </button>

            {message && (
              <div
                className={`message ${
                  message.startsWith("error:") ? "error" : "success"
                }`}
              >
                {message.replace(/^(error:|success:)\s*/, "")}
              </div>
            )}

            {conversionResult && (
              <div className="download-card">
                <div className="download-card-header">
                  <svg
                    className="success-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3>Conversion Complete!</h3>
                    <p>Your PDF is ready to download</p>
                  </div>
                </div>

                <div className="download-card-details">
                  <div className="detail-item">
                    <span className="detail-label">Title:</span>
                    <span className="detail-value">
                      {conversionResult.title || "YouTube Video"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">File:</span>
                    <span className="detail-value">
                      {conversionResult.filename}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value success-text">
                      ✓ Completed
                    </span>
                  </div>
                </div>

                <div className="download-card-actions">
                  <button
                    className="download-button"
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <div className="spinner-small"></div>
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="download-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                  <button
                    className="reset-button"
                    onClick={resetForm}
                    disabled={isDownloading}
                  >
                    Convert Another Video
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </header>

      <section className="content-section" aria-labelledby="why-ytglancer">
        <div className="glass-card">
          <h2 id="why-ytglancer" className="section-title">
            Why Choose YtGlancer for YouTube to PDF Conversion?
          </h2>
          <p className="lead">
            In today's fast-paced digital world, video content is king. But how
            often do you find yourself struggling to remember key points from
            educational videos, tutorials, or lectures? YtGlancer bridges the
            gap between video learning and traditional note-taking by
            transforming YouTube content into structured, searchable PDF
            documents that enhance knowledge retention and make study sessions
            more productive.
          </p>

          <section className="how-it-works" aria-labelledby="how-it-works">
            <h2 id="how-it-works" className="section-title">
              How to Convert YouTube Videos to PDF in 3 Simple Steps
            </h2>
            <p className="lead">
              Our intuitive platform makes it effortless to transform any
              YouTube video into comprehensive PDF notes. Here's how it works:
            </p>
            <ol>
              <li>
                <strong>Access the Website</strong> - Open your web browser and
                navigate to ytglancer.online.
              </li>
              <li>
                <strong>Enter the YouTube Video Link</strong> - Paste the
                YouTube video URL and click the 'Convert' button. YtGlancer will
                process the video content and extract key information.
              </li>
              <li>
                <strong>Generate PDF Notes</strong> - Our advanced algorithms
                analyze the video and create organized notes automatically.
              </li>
              <li>
                <strong>Preview and Customize</strong> - Preview the generated
                PDF notes to ensure accuracy. Customize by highlighting
                important points and adding annotations.
              </li>
              <li>
                <strong>Download and Save</strong> - Download the PDF file to
                your device and access it anytime, anywhere.
              </li>
            </ol>
          </section>

          <section className="features" aria-labelledby="key-features">
            <h2 id="key-features" className="section-title">
              Powerful Features for Enhanced Learning
            </h2>
            <p className="lead">
              YtGlancer is packed with intelligent features designed to maximize
              your learning potential and streamline your study process:
            </p>
            <ul>
              <li>
                <strong>Automated Summarization</strong> - Advanced algorithms
                analyze video content to extract key concepts, ensuring
                comprehensive and accurate PDF notes.
              </li>
              <li>
                <strong>Customization Options</strong> - Personalize your PDF
                notes by highlighting important points, adding notes, and
                adjusting formatting.
              </li>
              <li>
                <strong>Time-Stamped Notes</strong> - Navigate directly to
                specific points in the video from the PDF with embedded time
                stamps.
              </li>
              <li>
                <strong>Offline Learning</strong> - Access your summarized
                content offline, eliminating the need for a constant internet
                connection.
              </li>
              <li>
                <strong>Cross-Device Compatibility</strong> - Works seamlessly
                on laptops, tablets, and smartphones for on-the-go learning.
              </li>
              <li>
                <strong>Cloud Storage Integration</strong> - Save your PDF notes
                to popular cloud platforms for easy access anywhere.
              </li>
            </ul>
          </section>

          <section
            className="faq-section"
            itemScope
            itemType="https://schema.org/FAQPage"
            aria-labelledby="faq-heading"
          >
            <h2 id="faq-heading" className="section-title">
              Frequently Asked Questions
            </h2>
            <p className="lead">
              Find quick answers to common questions about our YouTube to PDF
              conversion service.
            </p>
            <div className="faq">
              <div className="faq-item">
                <h4>Is YtGlancer free to use?</h4>
                <p>
                  Yes, YtGlancer offers a basic version with free access to core
                  features. Premium plans are available for enhanced
                  functionalities.
                </p>
              </div>
              <div className="faq-item">
                <h4>What quality of PDF notes can I expect?</h4>
                <p>
                  Our algorithms strive to capture the essence of videos
                  accurately. The generated PDF notes offer comprehensive
                  summaries.
                </p>
              </div>
              <div className="faq-item">
                <h4>Can I convert videos from sources other than YouTube?</h4>
                <p>
                  Currently, YtGlancer supports YouTube videos exclusively.
                  We're exploring options to expand compatibility.
                </p>
              </div>
              <div className="faq-item">
                <h4>Are my converted videos and notes private?</h4>
                <p>
                  Yes, YtGlancer respects your privacy. Your converted videos
                  and notes are securely processed and not shared with third
                  parties.
                </p>
              </div>
              <div className="faq-item">
                <h4>Can I edit the notes after conversion?</h4>
                <p>
                  Absolutely. YtGlancer provides editing features to add
                  annotations, highlights, and make adjustments.
                </p>
              </div>
            </div>
          </section>

          <section className="cta" aria-labelledby="get-started">
            <div className="cta-content">
              <h2 id="get-started" className="cta-title">
                Ready to Transform Your Learning Experience?
              </h2>
              <p className="cta-text">
                Join thousands of students, educators, and professionals who are
                already using YtGlancer to enhance their learning journey. Our
                platform is completely free to start, with no registration
                required. Simply paste a YouTube link and get instant access to
                beautifully formatted, searchable PDF notes that help you retain
                information more effectively.
              </p>
              <div className="cta-benefits">
                <p>
                  <strong>Perfect for:</strong>
                </p>
                <ul>
                  <li>📚 Students creating study guides from lecture videos</li>
                  <li>
                    💼 Professionals capturing insights from tutorials and
                    webinars
                  </li>
                  <li>🧠 Lifelong learners documenting educational content</li>
                  <li>👨‍🏫 Educators preparing teaching materials</li>
                </ul>
              </div>
              <p className="cta-note">
                No credit card required • Convert up to 5 videos per day for
                free • Premium plans available for power users
              </p>
            </div>
          </section>
        </div>
      </section>
      <footer className="site-footer" role="contentinfo">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About YtGlancer</h3>
            <p>
              Transforming online learning by making video content more
              accessible and study-friendly since 2023.
            </p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="/privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms">Terms of Service</a>
              </li>
              <li>
                <a href="/contact">Contact Us</a>
              </li>
              <li>
                <a href="/blog">Blog</a>
              </li>
            </ul>
          </div>
          <div className="footer-legal">
            <p>
              &copy; {new Date().getFullYear()} YtGlancer. All rights reserved.
            </p>
            <p>Not affiliated with YouTube or Google LLC.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
