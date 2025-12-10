/**
 * Download Configuration
 * Configure the two-step download process and ad URL
 *
 * @typedef {Object} DownloadConfig
 * @property {boolean} enableTwoStepDownload - Enable two-step download (visit ad first)
 * @property {string} adUrl - URL to open in new tab for step 1
 * @property {Object} adWindow - Window features for ad opening
 * @property {boolean} adWindow.openNewTab - Open in new tab (true) or current tab (false)
 * @property {Object} labels - Button labels for both steps
 * @property {Object} messages - User messages for both steps
 */

const defaultConfig = {
  // Enable/disable two-step download process
  enableTwoStepDownload: false,

  // Ad URL to open in new tab on first click
  adUrl: "https://example.com/ad",

  // Ad window configuration - opens in new tab (same window)
  adWindow: {
    openNewTab: true,
  },

  // Download configuration
  download: {
    // Delay in milliseconds before enabling the download button after ad click
    delayAfterAdClick: 1000,
    // Whether to require ad click before allowing download
    requireAdClick: true,
  },

  // Download button labels
  labels: {
    step1: "Visit Ad & Download",
    step1Short: "Step 1: Visit Ad",
    step2: "Download PDF",
    step2Short: "Step 2: Download",
  },

  // Messages
  messages: {
    step1: "Click to visit partner site and unlock your download",
    step2: "Click to download your PDF file",
    completed: "Download in progress...",
  },
};

// Mutable config object
export const downloadConfig = { ...defaultConfig };

/**
 * Update configuration by merging with current config
 * @param {Partial<DownloadConfig>} newConfig - New configuration values to merge
 * @returns {DownloadConfig} - Updated configuration
 */
export const updateDownloadConfig = (newConfig) => {
  if (!newConfig || typeof newConfig !== "object") {
    console.warn(
      "[DownloadConfig] updateDownloadConfig received invalid input:",
      newConfig
    );
    return downloadConfig;
  }
  Object.assign(downloadConfig, newConfig);
  return downloadConfig;
};

/**
 * Get current configuration (returns a copy to prevent external mutations)
 * @returns {DownloadConfig} - Current configuration
 */
export const getDownloadConfig = () => {
  return { ...downloadConfig };
};

/**
 * Reset configuration to defaults
 * @returns {DownloadConfig} - Reset configuration
 */
export const resetDownloadConfig = () => {
  Object.assign(downloadConfig, defaultConfig);
  return downloadConfig;
};
