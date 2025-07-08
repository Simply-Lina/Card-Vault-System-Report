// Initialize IndexedDB and master key
        let db;
        const dbName = "CardVaultDB";
        const storeName = "CardStore";
        let masterKey = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex); // 256-bit master key

        function initDB() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName, 1);

                request.onupgradeneeded = (event) => {
                    db = event.target.result;
                    db.createObjectStore(storeName, { keyPath: "id" });
                };

                request.onsuccess = (event) => {
                    db = event.target.result;
                    resolve(db);
                };

                request.onerror = (event) => {
                    reject("Database error: " + event.target.errorCode);
                };
            });
        }

        // Luhn Algorithm for card number validation
        function validateCardNumber(cardNumber) {
            const cleaned = cardNumber.replace(/\D/g, '');
            if (!/^\d{13,19}$/.test(cleaned)) return false;

            let sum = 0;
            let isEven = false;
            for (let i = cleaned.length - 1; i >= 0; i--) {
                let digit = parseInt(cleaned[i]);
                if (isEven) {
                    digit *= 2;
                    if (digit > 9) digit -= 9;
                }
                sum += digit;
                isEven = !isEven;
            }
            return sum % 10 === 0;
        }

        // Validate expiry date (MM/YY format, not expired)
        function validateExpiry(expiry) {
            const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
            if (!regex.test(expiry)) return false;

            const [month, year] = expiry.split('/').map(Number);
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100; // Last two digits
            const currentMonth = currentDate.getMonth() + 1; // 1-12

            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                return false;
            }
            return true;
        }

        // Validate CVV (3-4 digits)
        function validateCVV(cvv) {
            return /^\d{3,4}$/.test(cvv);
        }

        // Generate unique ID for card entry
        function generateUniqueId() {
            return 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        // Generate random passphrase for encryption
        function generatePassphrase() {
            return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex); // 128-bit random key
        }

        // Encrypt passphrase with master key
        function encryptPassphrase(passphrase) {
            return CryptoJS.AES.encrypt(passphrase, masterKey).toString();
        }

        // Decrypt passphrase with master key
        function decryptPassphrase(encryptedPassphrase) {
            const decrypted = CryptoJS.AES.decrypt(encryptedPassphrase, masterKey);
            return decrypted.toString(CryptoJS.enc.Utf8);
        }

        // Encrypt and store card details in IndexedDB
        async function encryptAndStore() {
            try {
                const cardNumber = document.getElementById('cardNumber').value;
                const cardHolder = document.getElementById('cardHolder').value.trim();
                const expiry = document.getElementById('expiry').value;
                const cvv = document.getElementById('cvv').value;

                // Input validation
                if (!cardNumber || !cardHolder || !expiry || !cvv) {
                    alert('Please fill all fields');
                    return;
                }
                if (!validateCardNumber(cardNumber)) {
                    alert('Invalid card number');
                    return;
                }
                if (!validateExpiry(expiry)) {
                    alert('Invalid or expired date (use MM/YY format)');
                    return;
                }
                if (!validateCVV(cvv)) {
                    alert('Invalid CVV (3-4 digits required)');
                    return;
                }

                const cardDetails = {
                    cardNumber,
                    cardHolder,
                    expiry,
                    cvv
                };

                const passphrase = generatePassphrase();
                const jsonString = JSON.stringify(cardDetails);
                const encrypted = CryptoJS.AES.encrypt(jsonString, passphrase).toString();
                const encryptedPassphrase = encryptPassphrase(passphrase);

                // Initialize DB if not already done
                if (!db) {
                    await initDB();
                }

                // Store encrypted data and encrypted passphrase in IndexedDB
                const transaction = db.transaction([storeName], "readwrite");
                const store = transaction.objectStore(storeName);
                const data = { 
                    id: generateUniqueId(), 
                    encryptedData: encrypted, 
                    encryptedPassphrase: encryptedPassphrase, 
                    lastFour: cardNumber.slice(-4) 
                };

                const request = store.put(data);
                request.onsuccess = () => {
                    document.getElementById('output').innerText = 'Card details encrypted and stored successfully!';
                    listCards(); // Refresh card list
                };
                request.onerror = () => {
                    alert('Error storing data');
                };
            } catch (error) {
                alert('Error: ' + error);
            }
        }

        // List all stored cards with decrypt and show ciphertext options
        async function listCards() {
            try {
                if (!db) {
                    await initDB();
                }

                const transaction = db.transaction([storeName], "readonly");
                const store = transaction.objectStore(storeName);
                const request = store.getAll();

                request.onsuccess = (event) => {
                    const cards = event.target.result;
                    const cardList = document.getElementById('cardList');
                    cardList.innerHTML = '<h3>Stored Cards:</h3>';

                    if (cards.length === 0) {
                        cardList.innerHTML += '<p>No cards stored.</p>';
                        return;
                    }

                    cards.forEach(card => {
                        const cardDiv = document.createElement('div');
                        cardDiv.className = 'card-item';
                        cardDiv.innerHTML = `
                            Card ending in ${card.lastFour}
                            <div>
                                <button onclick="decryptAndDisplay('${card.id}')">Decrypt</button>
                                <button onclick="showCiphertext('${card.id}')">Show Ciphertext</button>
                            </div>
                            <div class="ciphertext" id="ciphertext-${card.id}">${card.encryptedData}</div>
                        `;
                        cardList.appendChild(cardDiv);
                    });
                };

                request.onerror = () => {
                    alert('Error retrieving cards');
                };
            } catch (error) {
                alert('Error: ' + error);
            }
        }

        // Show ciphertext for a specific card
        function showCiphertext(cardId) {
            const ciphertextDiv = document.getElementById(`ciphertext-${cardId}`);
            ciphertextDiv.style.display = ciphertextDiv.style.display === 'none' ? 'block' : 'none';
        }

        // Decrypt and display card details from IndexedDB
        async function decryptAndDisplay(cardId) {
            try {
                if (!db) {
                    await initDB();
                }

                // Retrieve encrypted data and encrypted passphrase from IndexedDB
                const transaction = db.transaction([storeName], "readonly");
                const store = transaction.objectStore(storeName);
                const request = store.get(cardId);

                request.onsuccess = (event) => {
                    const data = event.target.result;
                    if (!data) {
                        alert('Card data not found!');
                        return;
                    }

                    try {
                        const passphrase = decryptPassphrase(data.encryptedPassphrase);
                        const decrypted = CryptoJS.AES.decrypt(data.encryptedData, passphrase);
                        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

                        if (!decryptedText) {
                            throw new Error('Decryption failed.');
                        }

                        const cardDetails = JSON.parse(decryptedText);
                        document.getElementById('output').innerHTML = `
                            <h3>Decrypted Card Details:</h3>
                            <p><strong>Card Number:</strong> ${cardDetails.cardNumber}</p>
                            <p><strong>Card Holder:</strong> ${cardDetails.cardHolder}</p>
                            <p><strong>Expiry:</strong> ${cardDetails.expiry}</p>
                            <p><strong>CVV:</strong> ${cardDetails.cvv}</p>
                        `;
                    } catch (e) {
                        alert('Decryption failed: ' + e.message);
                        document.getElementById('output').innerText = '';
                    }
                };

                request.onerror = () => {
                    alert('Error retrieving data');
                };
            } catch (error) {
                alert('Error: ' + error);
            }
        }

        // Initialize DB on page load
        initDB().catch(error => console.error('DB initialization failed:', error));