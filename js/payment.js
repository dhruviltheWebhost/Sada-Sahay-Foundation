import { db } from "./firebase.js";

import {
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// ========================================
// READ URL PARAMETERS
// ========================================

const params =
    new URLSearchParams(
        window.location.search
    );


const documentId =
    params.get("id");

const donationReference =
    params.get("ref");

const amount =
    Number(
        params.get("amount")
    );

const paymentToken =
    params.get("token");


// ========================================
// ELEMENTS
// ========================================

const referenceElement =
    document.getElementById(
        "donationReference"
    );

const amountElement =
    document.getElementById(
        "amount"
    );

const qrElement =
    document.getElementById(
        "qrcode"
    );

const upiLink =
    document.getElementById(
        "upiLink"
    );

const paymentForm =
    document.getElementById(
        "paymentForm"
    );

const transactionInput =
    document.getElementById(
        "upiTransactionId"
    );

const paymentMessage =
    document.getElementById(
        "paymentMessage"
    );

const submitButton =
    document.getElementById(
        "submitPaymentButton"
    );


// ========================================
// DEBUG
// ========================================

console.log(
    "Payment parameters:",
    {
        documentId,
        donationReference,
        amount,
        paymentToken
    }
);


// ========================================
// VALIDATE PARAMETERS
// ========================================

if (
    !documentId ||
    !donationReference ||
    !amount ||
    !paymentToken
) {

    paymentMessage.textContent =
        "ચુકવણીની માહિતી મળી નથી. કૃપા કરીને ફરીથી પ્રયાસ કરો.";

    paymentForm.style.display =
        "none";


} else {


    // ====================================
    // SHOW DONATION INFORMATION
    // ====================================

    referenceElement.textContent =
        donationReference;


    amountElement.textContent =
        `₹${amount.toLocaleString("en-IN")}`;


    // ====================================
    // YOUR REAL UPI ID
    // ====================================

    const upiId =
        "9316599182@okbizaxis";


    const merchantName =
        "Chandubhai Store";


    // ====================================
    // CREATE UPI URL
    // ====================================

    const upiURL =
        `upi://pay?pa=${encodeURIComponent(
            upiId
        )}` +
        `&pn=${encodeURIComponent(
            merchantName
        )}` +
        `&am=${encodeURIComponent(
            amount.toFixed(2)
        )}` +
        `&cu=INR`;


    console.log(
        "UPI URL:",
        upiURL
    );


    // ====================================
    // GENERATE QR
    // ====================================

    if (
        typeof QRCode ===
        "function"
    ) {

        new QRCode(
            qrElement,
            {
                text: upiURL,

                width: 260,

                height: 260,

                correctLevel:
                    QRCode.CorrectLevel
                        .M
            }
        );

    } else {

        console.error(
            "QRCode library not loaded."
        );

        paymentMessage.textContent =
            "QR Code લોડ થઈ શક્યો નથી.";

    }


    // ====================================
    // MOBILE UPI BUTTON
    // ====================================

    upiLink.href =
        upiURL;


    // ====================================
    // IMPORTANT:
    // NOTHING IS SUBMITTED AUTOMATICALLY
    // ====================================

    paymentForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // --------------------------------
            // Get transaction ID
            // --------------------------------

            const transactionId =
                transactionInput
                    .value
                    .trim();


            // --------------------------------
            // Validate
            // --------------------------------

            if (
                transactionId.length < 6
            ) {

                paymentMessage.textContent =
                    "યોગ્ય Transaction ID દાખલ કરો.";

                transactionInput.focus();

                return;

            }


            // --------------------------------
            // Disable button
            // --------------------------------

            submitButton.disabled =
                true;

            submitButton.textContent =
                "માહિતી સાચવાઈ રહી છે...";


            paymentMessage.textContent =
                "";


            try {

                // ----------------------------
                // Donation document
                // ----------------------------

                const donationRef =
                    doc(
                        db,
                        "donations",
                        documentId
                    );


                // ----------------------------
                // Update ONLY payment details
                // ----------------------------

                await updateDoc(
                    donationRef,
                    {

                        // Keep the original private token.
                        // Firestore Rules will verify that it
                        // matches the stored token.

                        paymentToken:
                            paymentToken,

                        upiTransactionId:
                            transactionId,

                        paymentSubmittedAt:
                            serverTimestamp()

                    }
                );


                // ----------------------------
                // Success
                // ----------------------------

                paymentForm.style.display =
                    "none";


                paymentMessage.innerHTML = `

                    <strong>
                        ✓ ચુકવણીની માહિતી મળી ગઈ છે.
                    </strong>

                    <br><br>

                    તમારો સેવા સંદર્ભ:

                    <strong>
                        ${donationReference}
                    </strong>

                    <br><br>

                    તમારી ચુકવણી અમારી ટીમ દ્વારા
                    ચકાસવામાં આવશે.

                    <br><br>

                    ચુકવણી Confirm થયા બાદ
                    તમને Seva ID આપવામાં આવશે.

                `;


                // ----------------------------
                // Save reference locally
                // ----------------------------

                localStorage.setItem(
                    "lastDonationReference",
                    donationReference
                );


            } catch (error) {

                console.error(
                    "Payment submission error:",
                    error
                );


                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "મેં ચુકવણી કરી છે";


                paymentMessage.textContent =
                    "ચુકવણીની માહિતી સાચવી શકાઈ નથી. ફરી પ્રયાસ કરો.";

            }

        }
    );

}