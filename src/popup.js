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

  // Retrieve and cache references to various DOM elements for later use.
  const emailText = document.getElementById('emailText');
  const reportButton = document.getElementById('reportButton');

  // Retrieve the message's author and parse it to extract name, sender, and domain information.
  const author = message.author;
  console_log(author);

  let name = undefined;
  let sender = undefined;
  let domain = undefined;

  // Regex to match and parse email addresses with optional name prefix.
  const addressRegex = new RegExp(
    '^("?([^"]+)"?\\s+)?<?([\\w._%+-]+)@([\\w.-]+\\.[a-zA-Z]{2,})>?$'
  );
  const match = author.match(addressRegex);
  if (match) {
    name = match[2] || ''; // Optional name fallback if not present.
    sender = match[3];
    domain = match[4];
    console_log(`Name: ${name}, Sender: ${sender}, Domain: ${domain}`);
  } else {
    console_error(`Invalid email format: ${author}`);
  }

  // Display the author's email in the UI.
  emailText.textContent = 'Would you like to report this email?';
  emailText.appendChild(document.createElement('br')); // Add a line break manually.
  emailText.appendChild(document.createTextNode(author)); // Add the author's email after the break.

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

    try {
      const rawMessage = await messenger.messages.getRaw(message.id);

      let rawMessageFile;
      if (rawMessage instanceof File) {
        rawMessageFile = rawMessage;
      } else {
        rawMessageFile = new File([rawMessage], 'AttachedMessage.eml', {
          type: 'message/rfc822',
          lastModified: message.date,
        });
      }

      // Attach the imported message
      let attachment = {
        file: rawMessageFile,
        name: 'AttachedMessage.eml', // The name of the attached message file
      };

      let details = {
        to: selectedEmails,
        subject: 'Report Phishing',
        identityId: (await retrieveIdentity(message)).id,
        attachments: [attachment],
      };

      console_log(details);

      await messenger.compose.beginNew(details);

      //await messenger.compose.sendMessage(composeTab.id);
    } catch (error) {
      console_error('Error during unsubscribe email:', error);
    }
  });
});

/**
 * Retrieves the MailIdentity associated with the given email's receiver.
 * @param {messenger.messages.MessageHeader} messageHeader - The message header to search for identities.
 * @returns {Promise<MailIdentity|null>} - The found MailIdentity, or null if no identity is found.
 */
async function retrieveIdentity(messageHeader) {
  let identity = await getIdentityReceiver(messageHeader);

  if (identity === null) {
    identity = await getIdentityForMessage(messageHeader);
    if (identity === null) {
      const identities = await messenger.identities.list();
      if (identities.length !== 0) {
        identity = identities[0];
      }
    }
  }

  if (!identity) {
    console_log('No identity found for', messageHeader);
  }

  return identity || null; // Return undefined if no identity is found
}

/**
 * Retrieves the MailIdentity associated with the given email headers receiver.
 * This function checks the BCC, CC, and recipient lists to find a matching identity.
 * @param {messenger.messages.MessageHeader} messageHeader - The MessageHeader associated with the message.
 * @returns {Promise<MailIdentity|null>} - The MailIdentity if found, otherwise null.
 */
async function getIdentityReceiver(messageHeader) {
  const allReceivers = new Set([
    ...messageHeader.bccList,
    ...messageHeader.ccList,
    ...messageHeader.recipients,
  ]);

  const identities = await messenger.identities.list();

  for (const identity of identities) {
    if (allReceivers.has(identity.email)) {
      return identity;
    }
  }

  return null; // Return null if no matching identity is found
}

/**
 * Retrieves the MailIdentity associated with the given message's folder.
 * This function iterates over accounts to match identities based on the folder's account ID.
 * @param {messenger.messages.MessageHeader} messageHeader - The MessageHeader associated with the message.
 * @returns {Promise<MailIdentity|null>} - The MailIdentity if found, otherwise null.
 */
async function getIdentityForMessage(messageHeader) {
  if (messageHeader.folder) {
    const folder = messageHeader.folder;
    const accounts = await messenger.accounts.list();

    for (const account of accounts) {
      for (const identity of account.identities) {
        if (folder.accountId === account.id) {
          return identity;
        }
      }
    }
  }
  return null; // No matching identity found
}
