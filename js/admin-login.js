import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    message.textContent = "Logging in...";


    try {

        // Step 1: Firebase Authentication
        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user = userCredential.user;


        // Step 2: Check admin document
        const adminRef =
            doc(db, "admins", user.uid);

        const adminSnapshot =
            await getDoc(adminRef);


        if (!adminSnapshot.exists()) {

            message.textContent =
                "This account is not authorized as an admin.";

            return;
        }


        const adminData =
            adminSnapshot.data();


        if (adminData.active !== true ||
            adminData.role !== "admin") {

            message.textContent =
                "Admin access is disabled.";

            return;
        }


        // Step 3: Login successful
        message.textContent =
            "Login successful!";

        console.log("Admin:", user.email);

    } catch (error) {

        console.error(error);

        message.textContent =
            "Login failed. Check your email and password.";

    }

});