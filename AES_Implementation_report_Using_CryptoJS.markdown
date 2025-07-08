# Card Vault System Report

## Overview
Card Vault is a client-side web application designed to securely manage multiple credit card entries using AES encryption. Built with HTML, CSS, and JavaScript, it allows users to input, validate, encrypt, store, and decrypt credit card details entirely in the browser, ensuring sensitive data remains unencrypted only on the client side.

## Functionality
- **Input**: Users enter credit card details (number, holder, expiry, CVV) via a form. The encryption passphrase is generated internally.
- **Input Validation**:
  - **Card Number**: Validated using the Luhn algorithm, ensuring 13-19 digits and a valid checksum.
  - **Expiry Date**: Checked for MM/YY format and ensured it’s not expired based on the current date.
  - **CVV**: Validated as 3-4 digits.
- **Encryption**: The application uses CryptoJS (v4.1.1) to perform AES encryption client-side. Card details are serialized to JSON and encrypted with a randomly generated passphrase, which is itself encrypted with a master key.
- **Storage**: Encrypted card data and the encrypted passphrase are stored in an IndexedDB database, supporting multiple card entries with unique keys.
- **Card Listing and Decryption**: Users can list stored cards (displayed by last four digits), view the ciphertext via a "Show Ciphertext" button, or decrypt a selected card’s details using a "Decrypt" button, which automatically uses the stored passphrase decrypted with the master key.
- **Security**: AES encryption ensures data confidentiality. The passphrase is encrypted with a 256-bit master key (stored in memory), and all operations are performed client-side.

## Technical Details
- **Framework**: HTML5, CSS, and JavaScript, with JavaScript logic separated into `card-vault.js` for modularity. CryptoJS is used for AES encryption.
- **Database**: IndexedDB, initialized with a single object store ("CardStore") using unique keys (e.g., `card_timestamp_random`). Each entry stores encrypted card data, the encrypted passphrase, and the card’s last four digits.
- **DB Connection**: The application opens an IndexedDB database ("CardVaultDB") on page load, creating the object store if needed during the `onupgradeneeded` event.
- **Encryption**:
  - Card details are encrypted with a 128-bit random passphrase using AES.
  - The passphrase is encrypted with a 256-bit master key (generated at runtime and stored in memory) using AES.
  - CryptoJS handles key derivation and encryption/decryption.
- **Error Handling**: Validates inputs, handles database errors, and manages decryption failures.

## Limitations
- IndexedDB is client-side and tied to the browser, limiting data persistence across devices or browsers.
- The master key is stored in memory and lost on page refresh, requiring users to restart the application to generate a new key, which prevents decryption of previously stored cards. Best strategy would be to store the files using Cloud Key Manegemnt such AWS Key or Harshicorp Vault.
- No card deletion or editing functionality is included in this prototype.
- Cardholder name validation is minimal (only checks for non-empty input).

## Future Improvements
- Add card deletion and editing features in IndexedDB.
- Integrate a cloud database (e.g., Firebase) for cross-device access, storing only encrypted data.
- Implement a secure method to persist the master key (e.g., user-provided master passphrase or secure storage).
- Add session-based authentication to restrict access.
- Enhance UI with frameworks like React for improved usability.
- Implement stronger cardholder name validation (e.g., alphabetic characters only).

## Conclusion
Card Vault demonstrates secure client-side AES encryption and decryption with IndexedDB storage for multiple card entries, enhanced with input validation (Luhn algorithm and expiry checks), explicit "Decrypt" and "Show Ciphertext" buttons, internal passphrase generation, and passphrase encryption using a master key stored in memory. The JavaScript logic is modularized in `card-vault.js`. While suitable for a prototype, production use would require a secure master key persistence mechanism and cloud integration.