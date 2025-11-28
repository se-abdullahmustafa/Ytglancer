import React, { useState } from 'react'
import Instructions from '../components/instructions/instructions';
import { ApiService } from '../services/apiService';
import ActivityIndicator from '../components/activityIndicator/activityIndicator';
import { CommonService } from '../services/commonService';
import './home.css';

const Home = () => {
    const [videoLink, setVideoLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('')

    const showMessage = (msg, type = 'error') => {
        setMessage(`${type}: ${msg}`)
        setTimeout(() => {
            setMessage('')
        }, 3000)
    }
    const fetchPdf = async (event) => {
        event.preventDefault();
        if (!videoLink) {
            showMessage('Please enter a youtube video link', 'error')
        } else {
            try {
                setLoading(true);
                ApiService.fetchPdf(videoLink).then(async (response) => {
                    const result = await response.json();
                    if (result.pdf) {

                        const link = document.createElement('a');
                        link.href = `data:application/pdf;base64,${result.pdf}`;
                        link.download = `${CommonService.getTimestamp()}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                    }
                    setLoading(false);
                    setVideoLink('');
                    showMessage("Pdf file downloaded successfully.", 'success')
                }).catch((error) => {
                    console.log("error during fetching pdf", error)
                    setVideoLink('')
                    showMessage("Failed to convert video to PDF. Please try again.", 'error')
                })
            } catch (error) {
                console.log("error during fetching api", error)
                showMessage("An unexpected error occurred. Please try again.", 'error')
            }
        }
    }

    return (
        <div className="home-container">
            {/* Animated background */}
            <div className="bg-gradient"></div>

            {/* Hero Section */}
            <div className="hero-section">
                <div className="glass-card">
                    <div className="badge">
                        <span className="badge-icon">🎬</span>
                        <span>YouTube to PDF Converter</span>
                    </div>

                    <h1 className="hero-title">
                        Transform YouTube Videos
                        <span className="gradient-text"> Into Smart PDFs</span>
                    </h1>

                    <p className="hero-subtitle">
                        Convert any YouTube video into organized, searchable PDF notes in seconds
                    </p>

                    <form className="converter-form" onSubmit={fetchPdf}>
                        <div className="input-wrapper">
                            <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <input
                                type="text"
                                className="url-input"
                                placeholder="Paste YouTube video link here..."
                                value={videoLink}
                                onChange={(e) => setVideoLink(e.target.value)}
                            />
                        </div>

                        {message && (
                            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                                {message.split(': ')[1] || message}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="convert-button">
                            {loading && videoLink ? (
                                <ActivityIndicator title={"Converting your video"} />
                            ) : (
                                <>
                                    <span>Convert to PDF</span>
                                    <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Features Grid */}
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">⚡</div>
                            <span>Lightning Fast</span>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🔒</div>
                            <span>100% Secure</span>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">💯</div>
                            <span>Free Forever</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="content-section">
                <div className="intro-card">
                    <h2 className="section-title">Why YtGlancer?</h2>
                    <p className="section-text">
                        In the digital age, learning through online videos has become a popular way to acquire knowledge. However, retaining the information from these videos can be challenging. YtGlancer is a revolutionary tool designed to convert YouTube videos into easily accessible PDF notes, empowering you to transform your favorite video content into comprehensive, portable, and visually appealing documents.
                    </p>
                </div>

                <Instructions
                    heading={"How to Use YtGlancer"}
                    description={"Using YtGlancer is a straightforward process that anyone can follow:"}
                    points={[
                        { step: "Access the Website", desc: "Open your web browser and navigate to ytglancer.online." },
                        { step: "Enter the YouTube Video Link", desc: "Paste the YouTube video URL and click the 'Convert' button. YtGlancer will process the video content and extract key information." },
                        { step: "Generate PDF Notes", desc: "Our advanced algorithms analyze the video and create organized notes automatically." },
                        { step: "Preview and Customize", desc: "Preview the generated PDF notes to ensure accuracy. Customize by highlighting important points and adding annotations." },
                        { step: "Download and Save", desc: "Download the PDF file to your device and access it anytime, anywhere." },
                    ]}
                />

                <Instructions
                    heading={"Features of YtGlancer"}
                    description={"YtGlancer stands out with features tailored to enhance your learning experience:"}
                    points={[
                        { step: "Automated Summarization", desc: "Advanced algorithms analyze video content to extract key concepts, ensuring comprehensive and accurate PDF notes." },
                        { step: "Customization Options", desc: "Personalize your PDF notes by highlighting important points, adding notes, and adjusting formatting." },
                        { step: "Time-Stamped Notes", desc: "Navigate directly to specific points in the video from the PDF with embedded time stamps." },
                        { step: "Offline Learning", desc: "Access your summarized content offline, eliminating the need for a constant internet connection." },
                        { step: "Cross-Device Compatibility", desc: "Works seamlessly on laptops, tablets, and smartphones for on-the-go learning." },
                        { step: "Cloud Storage Integration", desc: "Save your PDF notes to popular cloud platforms for easy access anywhere." }
                    ]}
                />

                <Instructions
                    separateLine={true}
                    heading={"Frequently Asked Questions"}
                    description={""}
                    points={[
                        { step: "Is YtGlancer free to use?", desc: "Yes, YtGlancer offers a basic version with free access to core features. Premium plans are available for enhanced functionalities." },
                        { step: "What quality of PDF notes can I expect?", desc: "Our algorithms strive to capture the essence of videos accurately. The generated PDF notes offer comprehensive summaries." },
                        { step: "Can I convert videos from sources other than YouTube?", desc: "Currently, YtGlancer supports YouTube videos exclusively. We're exploring options to expand compatibility." },
                        { step: "Are my converted videos and notes private?", desc: "Yes, YtGlancer respects your privacy. Your converted videos and notes are securely processed and not shared with third parties." },
                        { step: "Can I edit the notes after conversion?", desc: "Absolutely. YtGlancer provides editing features to add annotations, highlights, and make adjustments." },
                    ]}
                />

                <div className="conclusion-card">
                    <h2 className="section-title">Start Converting Today</h2>
                    <p className="section-text">
                        YtGlancer revolutionizes the way we consume online video content by offering a seamless and efficient solution for converting YouTube videos into comprehensive PDF notes. With its user-friendly interface, customization options, and innovative features, YtGlancer empowers learners to retain information effectively. Whether you're a student, a professional, or a lifelong learner, YtGlancer makes it easier than ever to capture the essence of your favorite YouTube videos.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
