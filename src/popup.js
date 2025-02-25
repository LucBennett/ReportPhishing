/**
 * Logs messages to the console with a custom prefix for better identification.
 * Used for debug and informational messages related to ReportPhishing's popup.js.
 * @param {...any} args - The arguments to log to the console.
 */
function console_log(...args) {
  console.log('[ReportPhishing][popup.js]', ...args);
}

/**
 * Logs error messages to the console with a custom prefix.
 * This is useful for clear and specific error reporting during development and debugging.
 * @param {...any} args - The error arguments to log to the console.
 */
function console_error(...args) {
  console.error('[ReportPhishing][popup.js]', ...args);
}

/**
 * Main event listener for the DOMContentLoaded event.
 * Responsible for retrieving the active tab and displayed message,
 * setting up button event listeners, and managing the unsubscribe logic.
 */
document.addEventListener('DOMContentLoaded', async () => {
  console_log('Loaded');

  // Retrieve the currently active tab in the current window and get displayed message details.
  const [tab] = await messenger.tabs.query({
    active: true,
    currentWindow: true,
  });

  const message = await messenger.messageDisplay.getDisplayedMessage(tab.id);
  console_log('Message', message.id);

  const reportButton = document.getElementById('reportButton');

  reportButton.addEventListener('click', async () => {
    console_log('Click');

    let selectedEmails = [];
    document
      .querySelectorAll("input[type='checkbox']:checked")
      .forEach((checkbox) => {
        selectedEmails.push(checkbox.value);
      });

    console_log(selectedEmails);

    if (selectedEmails.length === 0) {
      alert('Please select at least one recipient.');
      return;
    }

    messenger.runtime
      .sendMessage({ messageId: message.id, selectedEmails: selectedEmails })
      .then((r) => {
        console_log('Received', r);
      })
      .catch((err) => {
        console_error('Error', err);
      });
  });
});
