# Card Vault: Secure Credit Card Management 🔒💳

## Overview 📋
Card Vault is a client-side web application designed to securely manage credit card information using AES encryption. Built with HTML, CSS, and JavaScript, it enables users to input, validate, encrypt, store, and decrypt credit card details entirely within the browser, ensuring sensitive data remains protected. The application leverages IndexedDB for storage and CryptoJS for encryption, with a focus on security and usability. 🛡️✨

## Features 🌟
- **Automated Passphrase Generation** 🔑: Generates unique, random passphrases for each card, eliminating the need for user-provided keys.
- **Robust Encryption** 🔐: Utilizes AES encryption via CryptoJS, with passphrases encrypted using a 256-bit master key stored in memory.
- **Input Validation** ✅:
  - Card numbers are validated using the Luhn algorithm (13-19 digits).
  - Expiry dates are checked for MM/YY format and validity (not expired).
  - CVV codes are validated for 3-4 digits.
- **Secure Storage** 💾: Stores encrypted card data and passphrases in IndexedDB, with each entry identified by a unique key and displaying the last four digits of the card.
- **User Interface** 🖥️: Provides options to list stored cards, view ciphertext, and decrypt card details with a clean, intuitive design.
- **Modular Design** 🧩: JavaScript logic is separated into `card-vault.js` for maintainability.

## Setup Instructions 🚀
1. **Save Files** 📂:
   - Save `index.html` and `card-vault.js` in a project directory (e.g., `card-vault/`).
2. **Set Up a Local Web Server** 🌐:
   - **Node.js**: Install Node.js, run `npm install -g http-server`, navigate to the directory (`cd card-vault`), and start the server with `http-server`. Access at `http://localhost:8080/index.html`. 🖱️
   - **Python**: Navigate to the directory and run `python -m http.server 8000` (Python 3). Access at `http://localhost:8000/index.html`. 🐍
   - **VS Code**: Open the directory, install the "Live Server" extension, and select "Open with Live Server" on `index.html`. 💻
3. **Test the Application** 🧪:
   - Open the application in a browser (e.g., Chrome, Firefox). 🌍
   - Enter valid credit card details (e.g., Card Number: `4532015112830366`, Card Holder: `Jane Doe`, Expiry: `12/26`, CVV: `123`). 💳
   - Click "Encrypt & Store" to save the encrypted card. 🔒
   - Use "List Stored Cards" to view cards, "Show Ciphertext" to display encrypted data, or "Decrypt" to retrieve card details. 👀
   - Test invalid inputs (e.g., card number `1234`, expiry `13/25`, CVV `12`) to verify validation. 🚫

## Technical Details 🛠️
- **Technologies**: HTML5, CSS, JavaScript, CryptoJS (v4.1.1) for AES encryption. 🧑‍💻
- **Storage**: IndexedDB with a single object store ("CardStore") using unique keys (e.g., `card_timestamp_random`). 🗄️
- **Encryption**:
  - Card details are encrypted with a 128-bit random passphrase. 🔐
  - Passphrases are encrypted with a 256-bit in-memory master key using AES. 🔑
- **Error Handling**: Includes validation for inputs, database operations, and decryption errors. ⚠️

## Limitations ⚠️
- Data is stored in IndexedDB, limiting persistence to the browser and device. 📍
- The master key is stored in memory and lost on page refresh, preventing decryption of previously stored cards. 🔄
- No support for card editing or deletion in this prototype. ✂️
- Minimal validation for cardholder names (only checks for non-empty input). 📝

## Future Enhancements 🔮
- Implement card editing and deletion functionality. ✍️
- Integrate a cloud-based storage solution for cross-device access. ☁️
- Persist the master key securely (e.g., via a user-provided master passphrase). 🗝️
- Enhance the UI with a framework like React for improved user experience. 🎨
- Add authentication to restrict access to authorized users. 🔐

## Conclusion 🎉
Card Vault provides a secure, client-side solution for managing credit card information, with robust AES encryption, automated passphrase generation, and IndexedDB storage. Its modular design and comprehensive validation make it a strong foundation for further development. Ideal for prototyping, it can be extended for production use with additional security and persistence features. 🚀

*Developed with CryptoJS and IndexedDB for secure credit card management.* 💻
