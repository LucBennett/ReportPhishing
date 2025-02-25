/**
 * Logs messages to the console with a custom prefix for better identification.
 * Used for debug and informational messages related to ReportPhishing's background.js.
 * @param {...any} args - The arguments to log to the console.
 */
function console_log(...args) {
  console.log('[ReportPhishing][background.js]', ...args);
}

/**
 * Logs error messages to the console with a custom prefix.
 * This is useful for clear and specific error reporting during development and debugging.
 * @param {...any} args - The error arguments to log to the console.
 */
function console_error(...args) {
  console.error('[ReportPhishing][background.js]', ...args);
}

messenger.runtime.onMessage.addListener(async (messageFromPopup) => {
  if (!messageFromPopup.messageId) {
    console_log('Unknown action', messageFromPopup);
    return false;
  }

  const messageId = parseInt(messageFromPopup.messageId);

  try {
    const messageHeader = await messenger.messages.get(messageId);
    const rawMessage = await messenger.messages.getRaw(messageId);

    let rawMessageFile;
    if (rawMessage instanceof File) {
      rawMessageFile = rawMessage;
    } else {
      rawMessageFile = new File([rawMessage], 'AttachedMessage.eml', {
        type: 'message/rfc822',
        lastModified: messageHeader.date,
      });
    }

    // Attach the imported message
    let attachment = {
      file: rawMessageFile,
      name: 'AttachedMessage.eml', // The name of the attached message file
    };

    let details = {
      to: messageFromPopup.selectedEmails,
      subject: 'Report Phishing',
      body: 'Please see attached.',
      identityId: (await retrieveIdentity(messageHeader)).id,
      attachments: [attachment],
    };

    console_log(details);

    const composeTab = await messenger.compose.beginNew(details);

    await messenger.compose.sendMessage(composeTab.id, { mode: 'sendNow' });
  } catch (error) {
    console_error('Error during unsubscribe email:', error);
  }
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
