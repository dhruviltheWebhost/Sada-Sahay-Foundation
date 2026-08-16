import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// =========================================
// ELEMENTS
// =========================================

const adminInfo =
    document.getElementById("adminInfo");

const totalCollected =
    document.getElementById("totalCollected");

const supporterCount =
    document.getElementById("supporterCount");

const pendingCount =
    document.getElementById("pendingCount");

const pendingDonations =
    document.getElementById("pendingDonations");

const logoutBtn =
    document.getElementById("logoutBtn");


// New dashboard counters

const sidebarPendingCount =
    document.getElementById("sidebarPendingCount");

const pendingHeaderCount =
    document.getElementById("pendingHeaderCount");


// Mobile sidebar

const mobileSidebarBtn =
    document.getElementById("mobileSidebarBtn");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


// =========================================
// AUTHENTICATION
// =========================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        console.log(
            "Logged in user:",
            user.email
        );


        adminInfo.textContent =
            `Logged in as: ${user.email}`;


        await loadDashboard();

    }
);


// =========================================
// LOAD DASHBOARD
// =========================================

async function loadDashboard() {

    try {

        const donationsRef =
            collection(
                db,
                "donations"
            );


        const snapshot =
            await getDocs(
                donationsRef
            );


        let total = 0;

        let confirmed = 0;

        let pending = 0;


        pendingDonations.innerHTML =
            "";


        snapshot.forEach(
            (docSnapshot) => {

                const donation =
                    docSnapshot.data();


                // =================================
                // CONFIRMED
                // =================================

                if (
                    donation.paymentStatus ===
                    "CONFIRMED"
                ) {

                    total += Number(
                        donation.amount || 0
                    );

                    confirmed++;

                }


                // =================================
                // PENDING
                // =================================

                if (
                    donation.paymentStatus ===
                    "PENDING"
                ) {

                    pending++;


                    showPendingDonation(
                        docSnapshot.id,
                        donation
                    );

                }

            }
        );


        // =================================
        // UPDATE STATISTICS
        // =================================

        totalCollected.textContent =
            `₹${total.toLocaleString("en-IN")}`;


        supporterCount.textContent =
            confirmed;


        pendingCount.textContent =
            pending;


        // =================================
        // UPDATE PENDING BADGES
        // =================================

        if (sidebarPendingCount) {

            sidebarPendingCount.textContent =
                pending;

        }


        if (pendingHeaderCount) {

            pendingHeaderCount.textContent =
                pending;

        }


        // =================================
        // NO PENDING PAYMENTS
        // =================================

        if (pending === 0) {

            showEmptyPendingState();

        }


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        pendingDonations.innerHTML = `

            <div class="loading-card">

                <p>
                    Data load કરવામાં error આવ્યો.
                </p>

            </div>

        `;

    }

}


// =========================================
// PENDING DONATION CARD
// =========================================

function showPendingDonation(
    documentId,
    donation
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "pending-card";


    const name =
        escapeHTML(
            donation.name ||
            "Anonymous"
        );


    const amount =
        Number(
            donation.amount || 0
        ).toLocaleString(
            "en-IN"
        );


    const reference =
        escapeHTML(
            donation.donationReference ||
            documentId
        );


    const transactionId =
        escapeHTML(
            donation.upiTransactionId ||
            "Not submitted"
        );


    const mobile =
        escapeHTML(
            donation.mobile ||
            "-"
        );


    const email =
        escapeHTML(
            donation.email ||
            "-"
        );


    card.innerHTML = `

        <div class="pending-card-header">

            <div>

                <span class="pending-label">
                    PAYMENT VERIFICATION
                </span>

                <h3>
                    ${name}
                </h3>

            </div>

            <span class="pending-status">
                PENDING
            </span>

        </div>


        <div class="pending-amount">

            <span>
                સહયોગ રકમ
            </span>

            <strong>
                ₹${amount}
            </strong>

        </div>


        <div class="pending-details">


            <div class="detail-item">

                <span>
                    Donation Reference
                </span>

                <strong>
                    ${reference}
                </strong>

            </div>


            <div class="detail-item transaction-detail">

                <span>
                    UPI Transaction ID
                </span>

                <strong>
                    ${transactionId}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Mobile
                </span>

                <strong>
                    ${mobile}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Email
                </span>

                <strong>
                    ${email}
                </strong>

            </div>


        </div>


        <div class="verification-warning">

            <span>
                !
            </span>

            <p>
                Confirm કરતા પહેલાં GPay Merchant
                Account માં Transaction ID અને
                રકમ ચકાસો.
            </p>

        </div>


        <div class="pending-actions">

            <button
                type="button"
                class="confirm-btn"
            >
                ✓ Confirm Payment
            </button>


            <button
                type="button"
                class="reject-btn"
            >
                ✕ Reject Payment
            </button>

        </div>

    `;


    pendingDonations.appendChild(
        card
    );


    // =================================
    // BUTTONS
    // =================================

    const confirmButton =
        card.querySelector(
            ".confirm-btn"
        );


    const rejectButton =
        card.querySelector(
            ".reject-btn"
        );


    confirmButton.addEventListener(
        "click",
        () => {

            confirmPayment(
                documentId
            );

        }
    );


    rejectButton.addEventListener(
        "click",
        () => {

            rejectPayment(
                documentId
            );

        }
    );

}


// =========================================
// EMPTY STATE
// =========================================

function showEmptyPendingState() {

    pendingDonations.innerHTML = `

        <div class="loading-card">

            <div
                style="
                    font-size:32px;
                    margin-bottom:8px;
                "
            >
                ✓
            </div>

            <strong
                style="
                    color:#12304a;
                    font-size:15px;
                "
            >
                કોઈ પેમેન્ટ બાકી નથી
            </strong>

            <p>
                હાલમાં ચકાસણી માટે કોઈ
                payment ઉપલબ્ધ નથી.
            </p>

        </div>

    `;

}


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// =========================================
// CONFIRM PAYMENT
// =========================================

async function confirmPayment(
    documentId
) {

    const confirmed =
        confirm(
            "શું તમે GPay માં આ ચુકવણી ચકાસી છે અને Confirm કરવા માંગો છો?"
        );


    if (!confirmed) {

        return;

    }


    try {

        // =================================
        // GET DONATION
        // =================================

        const donationRef =
            doc(
                db,
                "donations",
                documentId
            );


        const donationSnapshot =
            await getDoc(
                donationRef
            );


        if (
            !donationSnapshot.exists()
        ) {

            alert(
                "Donation record મળ્યો નથી."
            );

            return;

        }


        const donation =
            donationSnapshot.data();


        // =================================
        // SAFETY CHECK
        // =================================

        if (
            donation.paymentStatus !==
            "PENDING"
        ) {

            alert(
                "આ donation પહેલેથી process થઈ ગઈ છે."
            );

            await loadDashboard();

            return;

        }


        // =================================
        // TRANSACTION CHECK
        // =================================

        if (
            !donation.upiTransactionId
        ) {

            alert(
                "UPI Transaction ID ઉપલબ્ધ નથી."
            );

            return;

        }


        // =================================
        // GENERATE SEVA ID
        // =================================

        const sevaId =
            generateSevaId();


        // =================================
        // PUBLIC NAME
        // =================================

        let displayName;


        if (
            donation.publicVisibility ===
            true
        ) {

            displayName =
                createPublicName(
                    donation.name
                );

        } else {

            displayName =
                "Anonymous";

        }


        // =================================
        // MASK SEVA ID
        // =================================

        const sevaIdMasked =
            maskSevaId(
                sevaId
            );


        // =================================
        // BATCH
        // =================================

        const batch =
            writeBatch(db);


        const statusRef =
            doc(
                db,
                "donationStatus",
                donation.donationReference
            );


        // =================================
        // UPDATE DONATION
        // =================================

        batch.update(
            donationRef,
            {

                paymentStatus:
                    "CONFIRMED",

                sevaId:
                    sevaId,

                confirmedAt:
                    serverTimestamp()

            }
        );


        // =================================
        // UPDATE STATUS
        // =================================

        batch.set(
            statusRef,
            {

                donationReference:
                    donation.donationReference,

                status:
                    "CONFIRMED",

                amount:
                    Number(
                        donation.amount
                    ),

                sevaId:
                    sevaId,

                updatedAt:
                    serverTimestamp()

            },
            {
                merge: true
            }
        );


        // =================================
        // PUBLIC DONATION
        // =================================

        const publicDonationRef =
            doc(
                db,
                "publicDonations",
                sevaId
            );

        batch.set(
            publicDonationRef,
            {

                displayName:
                    displayName,

                amount:
                    Number(
                        donation.amount
                    ),

                donationReference:
                    donation.donationReference,

                sevaIdMasked:
                    sevaIdMasked,

                confirmedAt:
                    serverTimestamp(),

                type:
                    "recent"

            }
        );


        // =================================
        // COMMIT
        // =================================

        await batch.commit();


        // =================================
        // SUCCESS
        // =================================

        alert(
            `Payment Confirmed!\n\nSeva ID: ${sevaId}`
        );


        await loadDashboard();

    } catch (error) {

        console.error(
            "Confirm payment error:",
            error
        );


        alert(
            "Payment confirm કરી શકાયું નથી."
        );

    }

}


// =========================================
// RANDOM SEVA ID
// =========================================

function generateSevaId() {

    const randomPart =
        crypto.randomUUID()
            .replaceAll(
                "-",
                ""
            )
            .substring(
                0,
                8
            )
            .toUpperCase();


    return `BP26-S${randomPart}`;

}


// =========================================
// PUBLIC NAME
// =========================================

function createPublicName(
    fullName
) {

    if (!fullName) {

        return "Anonymous";

    }


    const parts =
        fullName
            .trim()
            .split(
                /\s+/
            );


    if (
        parts.length === 1
    ) {

        return parts[0];

    }


    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;

}


// =========================================
// MASK SEVA ID
// =========================================

function maskSevaId(
    sevaId
) {

    if (!sevaId) {

        return "";

    }


    return `${sevaId.substring(0, 6)}****${sevaId.slice(-3)}`;

}


// =========================================
// REJECT PAYMENT
// =========================================

async function rejectPayment(
    documentId
) {

    const confirmed =
        confirm(
            "શું તમે આ payment reject કરવા માંગો છો?"
        );


    if (!confirmed) {

        return;

    }


    try {

        // =================================
        // GET DONATION
        // =================================

        const donationRef =
            doc(
                db,
                "donations",
                documentId
            );


        const donationSnapshot =
            await getDoc(
                donationRef
            );


        if (
            !donationSnapshot.exists()
        ) {

            alert(
                "Donation record મળ્યો નથી."
            );

            return;

        }


        const donation =
            donationSnapshot.data();


        // =================================
        // STATUS
        // =================================

        const statusRef =
            doc(
                db,
                "donationStatus",
                donation.donationReference
            );


        const batch =
            writeBatch(db);


        // =================================
        // REJECT DONATION
        // =================================

        batch.update(
            donationRef,
            {

                paymentStatus:
                    "REJECTED",

                rejectedAt:
                    serverTimestamp()

            }
        );


        // =================================
        // UPDATE STATUS
        // =================================

        batch.set(
            statusRef,
            {

                donationReference:
                    donation.donationReference,

                status:
                    "REJECTED",

                amount:
                    Number(
                        donation.amount
                    ),

                sevaId:
                    null,

                updatedAt:
                    serverTimestamp()

            },
            {
                merge: true
            }
        );


        // =================================
        // COMMIT
        // =================================

        await batch.commit();


        alert(
            "Payment rejected."
        );


        await loadDashboard();


    } catch (error) {

        console.error(
            "Reject payment error:",
            error
        );


        alert(
            "Payment reject કરી શકાયું નથી."
        );

    }

}


// =========================================
// LOGOUT
// =========================================

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(
                auth
            );


            window.location.href =
                "login.html";


        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);


// =========================================
// MOBILE SIDEBAR
// =========================================

if (
    mobileSidebarBtn &&
    sidebar &&
    sidebarOverlay
) {

    mobileSidebarBtn.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

            sidebarOverlay.classList.toggle(
                "open"
            );

        }
    );


    sidebarOverlay.addEventListener(
        "click",
        closeMobileSidebar
    );


    sidebar
        .querySelectorAll("a")
        .forEach(
            (link) => {

                link.addEventListener(
                    "click",
                    () => {

                        closeMobileSidebar();

                    }
                );

            }
        );

}


function closeMobileSidebar() {

    sidebar.classList.remove(
        "open"
    );

    sidebarOverlay.classList.remove(
        "open"
    );

}