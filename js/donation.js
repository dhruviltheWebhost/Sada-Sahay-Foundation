import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    setDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const donationForm =
    document.getElementById("donationForm");

const amountSelect =
    document.getElementById("amount");

const customAmountBox =
    document.getElementById("customAmountBox");

const customAmount =
    document.getElementById("customAmount");

const formMessage =
    document.getElementById("formMessage");


// ========================================
// Show / hide custom amount
// ========================================

amountSelect.addEventListener("change", () => {

    if (amountSelect.value === "other") {

        customAmountBox.hidden = false;
        customAmount.required = true;

    } else {

        customAmountBox.hidden = true;
        customAmount.required = false;

    }

});


// ========================================
// Generate Donation Reference
// ========================================

function generateDonationReference() {

    const randomPart =
        crypto.randomUUID()
            .replaceAll("-", "")
            .substring(0, 8)
            .toUpperCase();

    return `BP26-P${randomPart}`;
}


// ========================================
// Generate Private Payment Token
// ========================================

function generatePaymentToken() {

    return crypto.randomUUID()
        .replaceAll("-", "");

}


// ========================================
// Submit Donation
// ========================================

donationForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    formMessage.textContent =
        "સેવા સંદર્ભ બનાવવામાં આવી રહ્યો છે...";


    try {

        // --------------------------------
        // Get amount
        // --------------------------------

        let amount;

        if (amountSelect.value === "other") {

            amount =
                Number(customAmount.value);

        } else {

            amount =
                Number(amountSelect.value);

        }


        // --------------------------------
        // Validate amount
        // --------------------------------

        if (!amount || amount <= 0) {

            throw new Error(
                "યોગ્ય રકમ દાખલ કરો."
            );

        }


        // --------------------------------
        // Get donor information
        // --------------------------------

        const name =
            document.getElementById("name")
                .value
                .trim();

        const mobile =
            document.getElementById("mobile")
                .value
                .trim();

        const email =
            document.getElementById("email")
                .value
                .trim();

        const showPublicName =
            document.getElementById("showPublicName")
                .checked;


        // --------------------------------
        // Validate mobile
        // --------------------------------

        if (!/^[6-9]\d{9}$/.test(mobile)) {

            throw new Error(
                "યોગ્ય 10 અંકનો મોબાઇલ નંબર દાખલ કરો."
            );

        }


        // --------------------------------
        // Generate references
        // --------------------------------

        const donationReference =
            generateDonationReference();

        const paymentToken =
            generatePaymentToken();


        console.log(
            "Creating donation:",
            {
                donationReference,
                amount,
                paymentToken
            }
        );


        // --------------------------------
        // Donation data
        // --------------------------------

        const donationData = {

            donationReference: donationReference,

            paymentToken: paymentToken,

            name: name,

            mobile: mobile,

            email: email,

            amount: amount,

            publicVisibility: showPublicName,

            paymentStatus: "PENDING",

            upiTransactionId: null,

            sevaId: null,

            createdAt: serverTimestamp(),

            confirmedAt: null,

            paymentSubmittedAt: null

        };


        // --------------------------------
        // Save to Firestore
        // --------------------------------

        const donationDoc =
            await addDoc(
                collection(db, "donations"),
                donationData
            );

        // ========================================
        // Create public-safe donation status
        // ========================================

        await setDoc(
            doc(
                db,
                "donationStatus",
                donationReference
            ),
            {

                donationReference:
                    donationReference,

                status:
                    "PENDING",

                amount:
                    amount,

                sevaId:
                    null,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }
        );

        console.log(
            "Donation created:",
            donationDoc.id
        );


        // --------------------------------
        // Save reference locally
        // --------------------------------

        localStorage.setItem(
            "lastDonationReference",
            donationReference
        );


        // --------------------------------
        // Create payment URL
        // --------------------------------

        const paymentURL =
            `payment.html?id=${encodeURIComponent(
                donationDoc.id
            )}&ref=${encodeURIComponent(
                donationReference
            )}&amount=${encodeURIComponent(
                amount
            )}&token=${encodeURIComponent(
                paymentToken
            )}`;


        console.log(
            "Payment URL:",
            paymentURL
        );


        // --------------------------------
        // Go to payment page
        // --------------------------------

        window.location.href =
            paymentURL;


    } catch (error) {

        console.error(
            "Donation error:",
            error
        );

        formMessage.textContent =
            error.message ||
            "કંઈક ખોટું થયું. ફરી પ્રયાસ કરો.";

    }

});