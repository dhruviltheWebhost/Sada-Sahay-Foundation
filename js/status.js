import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const sevaForm =
    document.getElementById(
        "sevaForm"
    );


const referenceForm =
    document.getElementById(
        "referenceForm"
    );


const statusMessage =
    document.getElementById(
        "statusMessage"
    );


const result =
    document.getElementById(
        "result"
    );


const resultTitle =
    document.getElementById(
        "resultTitle"
    );


const resultReference =
    document.getElementById(
        "resultReference"
    );


const resultSevaId =
    document.getElementById(
        "resultSevaId"
    );


const resultAmount =
    document.getElementById(
        "resultAmount"
    );


const resultDate =
    document.getElementById(
        "resultDate"
    );


const resultStatus =
    document.getElementById(
        "resultStatus"
    );


// ========================================
// Clear result
// ========================================

function clearResult() {

    result.hidden = true;

    statusMessage.textContent = "";

}


// ========================================
// Display result
// ========================================

function showResult(data, reference) {

    resultReference.textContent =
        reference;


    resultSevaId.textContent =
        data.sevaId || "હજુ આપવામાં આવેલ નથી";


    resultAmount.textContent =
        Number(
            data.amount || 0
        ).toLocaleString("en-IN");


    resultStatus.textContent =
        getGujaratiStatus(data.status);


    resultStatus.className =
        "status-value " +
        getStatusClass(data.status);


    if (data.updatedAt) {

        const date =
            data.updatedAt.toDate();


        resultDate.textContent =
            date.toLocaleDateString(
                "gu-IN",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );

    } else {

        resultDate.textContent =
            "-";

    }


    result.hidden = false;

}


function getGujaratiStatus(status) {

    if (status === "CONFIRMED") {

        return "પુષ્ટિ થયેલ";

    }

    if (status === "PENDING") {

        return "ચકાસણી બાકી";

    }

    if (status === "REJECTED") {

        return "પુષ્ટિ થઈ નથી";

    }

    return status;

}


function getStatusClass(status) {

    if (status === "CONFIRMED") {

        return "status-confirmed";

    }

    if (status === "PENDING") {

        return "status-pending";

    }

    if (status === "REJECTED") {

        return "status-rejected";

    }

    return "";

}

// ========================================
// Seva ID lookup
// ========================================

sevaForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearResult();


        const sevaId =
            document.getElementById(
                "sevaIdInput"
            )
            .value
            .trim()
            .toUpperCase();


        if (
            !/^BP26-S[A-Z0-9]+$/.test(
                sevaId
            )
        ) {

            statusMessage.textContent =
                "યોગ્ય Seva ID દાખલ કરો.";

            return;

        }


        statusMessage.textContent =
            "સેવા તપાસવામાં આવી રહી છે...";


        try {

            const sevaRef =
                doc(
                    db,
                    "publicDonations",
                    sevaId
                );


            const snapshot =
                await getDoc(
                    sevaRef
                );


            if (!snapshot.exists()) {

                statusMessage.textContent =
                    "આ Seva ID મળ્યો નથી.";

                return;

            }


            const data =
                snapshot.data();


            resultTitle.textContent =
                "✓ સેવા સહયોગની પુષ્ટિ થઈ છે";


            showResult(
                {
                    ...data,
                    status: "CONFIRMED",
                    sevaId: sevaId
                },
                data.donationReference ||
                "-"
            );


            statusMessage.textContent = "";


        } catch (error) {

            console.error(
                "Seva lookup error:",
                error
            );


            statusMessage.textContent =
                "માહિતી મેળવી શકાઈ નથી.";

        }

    }
);


// ========================================
// Donation Reference lookup
// ========================================

referenceForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearResult();


        const reference =
            document.getElementById(
                "referenceInput"
            )
            .value
            .trim()
            .toUpperCase();


        if (
            !/^BP26-P[A-Z0-9]+$/.test(
                reference
            )
        ) {

            statusMessage.textContent =
                "યોગ્ય સેવા સંદર્ભ દાખલ કરો.";

            return;

        }


        statusMessage.textContent =
            "ચુકવણીની સ્થિતિ તપાસવામાં આવી રહી છે...";


        try {

            const referenceRef =
                doc(
                    db,
                    "donationStatus",
                    reference
                );


            const snapshot =
                await getDoc(
                    referenceRef
                );


            if (!snapshot.exists()) {

                statusMessage.textContent =
                    "આ સેવા સંદર્ભ મળ્યો નથી.";

                return;

            }


            const data =
                snapshot.data();


            if (
                data.status ===
                "PENDING"
            ) {

                resultTitle.textContent =
                    "🟡 ચુકવણીની ચકાસણી બાકી છે";

            } else if (
                data.status ===
                "CONFIRMED"
            ) {

                resultTitle.textContent =
                    "🟢 સેવા સહયોગની પુષ્ટિ થઈ છે";

            } else if (
                data.status ===
                "REJECTED"
            ) {

                resultTitle.textContent =
                    "ચુકવણીની પુષ્ટિ થઈ નથી";

            }


            showResult(
                data,
                reference
            );


            statusMessage.textContent = "";


        } catch (error) {

            console.error(
                "Reference lookup error:",
                error
            );


            statusMessage.textContent =
                "માહિતી મેળવી શકાઈ નથી.";

        }

    }
);