import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    collection,
    query,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// ========================================
// CAMPAIGN DATA
// ========================================

async function loadCampaign() {

    const status =
        document.getElementById("status");

    const campaignBox =
        document.getElementById("campaign");


    // These elements may not exist on index.html
    // So safely stop if this page doesn't use them.

    if (!status || !campaignBox) {
        return;
    }


    try {

        const campaignRef =
            doc(db, "campaign", "2026");


        const campaignSnapshot =
            await getDoc(campaignRef);


        if (!campaignSnapshot.exists()) {

            status.textContent =
                "Campaign document not found.";

            return;
        }


        const campaign =
            campaignSnapshot.data();


        console.log(
            "Campaign data:",
            campaign
        );


        status.textContent =
            "Firebase + Firestore connected successfully!";


        campaignBox.innerHTML = `

            <h2>
                ${escapeHTML(campaign.name)}
            </h2>

            <p>
                Organization:
                ${escapeHTML(campaign.organization)}
            </p>

            <p>
                Location:
                ${escapeHTML(campaign.location)}
            </p>

            <p>
                Seva Sankalp:
                ${Number(campaign.targetPeople || 0)}+
                પદયાત્રિકો
            </p>

            <p>
                Tea:
                ₹${Number(campaign.teaCost || 0)}
                પ્રતિ વ્યક્તિ
            </p>

            <p>
                Nasta Packet:
                ₹${Number(campaign.foodPacketCostMin || 0)}
                -
                ₹${Number(campaign.foodPacketCostMax || 0)}
            </p>

        `;


    } catch (error) {

        console.error(
            "Firestore campaign error:",
            error
        );


        status.textContent =
            "Firebase/Firestore connection error.";
    }
}


// Run safely
loadCampaign();


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ========================================
// LOAD RECENT DONORS
// ========================================

async function loadRecentDonors() {

    const donorBox =
        document.getElementById(
            "recentDonors"
        );


    // This page may not have the donor section
    if (!donorBox) {
        return;
    }


    try {

        const donorsQuery =
            query(
                collection(
                    db,
                    "publicDonations"
                ),

                orderBy(
                    "confirmedAt",
                    "desc"
                ),

                limit(10)
            );


        const snapshot =
            await getDocs(
                donorsQuery
            );


        donorBox.innerHTML = "";


        if (snapshot.empty) {

            donorBox.innerHTML = `
                <p>
                    હજુ કોઈ સેવા સહયોગ ઉપલબ્ધ નથી.
                </p>
            `;

            return;
        }


        snapshot.forEach(
            (donorSnapshot) => {

                const donor =
                    donorSnapshot.data();


                const card =
                    document.createElement("div");


                card.className =
                    "supporter-card";


                const displayName =
                    donor.displayName ||
                    "Anonymous";


                const amount =
                    Number(
                        donor.amount || 0
                    ).toLocaleString(
                        "en-IN"
                    );


                const sevaId =
                    donor.sevaIdMasked ||
                    "";


                card.innerHTML = `

                    <strong>
                        ${escapeHTML(displayName)}
                    </strong>

                    <span class="amount">
                        ₹${amount}
                    </span>

                    <small>
                        ${escapeHTML(sevaId)}
                    </small>

                `;


                donorBox.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Recent donors error:",
            error
        );


        donorBox.innerHTML = `
            <p>
                માહિતી લોડ થઈ શકી નથી.
            </p>
        `;

    }
}


// Run
loadRecentDonors();


// ========================================
// TOTAL CONFIRMED COLLECTION
// ========================================

async function loadTotalCollected() {

    const totalElement =
        document.getElementById(
            "totalCollected"
        );


    if (!totalElement) {
        return;
    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "publicDonations"
                )
            );


        let total = 0;


        snapshot.forEach(
            (donorSnapshot) => {

                const donor =
                    donorSnapshot.data();


                total += Number(
                    donor.amount || 0
                );

            }
        );


        totalElement.textContent =
            `₹${total.toLocaleString("en-IN")}`;


    } catch (error) {

        console.error(
            "Total collection error:",
            error
        );


        totalElement.textContent =
            "₹0";
    }
}


// Run
loadTotalCollected();


// ========================================
// SUPPORTER COUNT
// ========================================

async function loadSupporterCount() {

    const countElement =
        document.getElementById(
            "supporterCount"
        );


    if (!countElement) {
        return;
    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "publicDonations"
                )
            );


        countElement.textContent =
            snapshot.size;


    } catch (error) {

        console.error(
            "Supporter count error:",
            error
        );


        countElement.textContent =
            "0";
    }
}


// Run
loadSupporterCount();