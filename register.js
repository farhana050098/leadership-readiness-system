// ==========================================
// REGISTER SYSTEM
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const registerForm =
        document.getElementById("registerForm");

    const registerBtn =
        document.getElementById("registerBtn");

    const message =
        document.getElementById("message");


    // ==========================================
    // FORM SUBMIT
    // ==========================================

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ==========================================
            // GET INPUT VALUES
            // ==========================================

            const staffID =
                document
                    .getElementById("staff_id")
                    .value
                    .trim();

            const fullName =
                document
                    .getElementById("full_name")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            // ==========================================
            // CLEAR MESSAGE
            // ==========================================

            message.innerText = "";
            message.style.color = "";


            // ==========================================
            // CHECK PASSWORD
            // ==========================================

            if (password !== confirmPassword) {

                message.innerText =
                    "Passwords do not match.";

                message.style.color = "red";

                return;

            }


            // ==========================================
            // PASSWORD LENGTH
            // ==========================================

            if (password.length < 6) {

                message.innerText =
                    "Password must be at least 6 characters.";

                message.style.color = "red";

                return;

            }


            // ==========================================
            // LOADING
            // ==========================================

            registerBtn.disabled = true;

            registerBtn.innerText =
                "Registering...";


            try {

                // ==========================================
                // CREATE SUPABASE ACCOUNT
                // ==========================================

                const {
                    data,
                    error
                } = await supabaseClient.auth.signUp({

                    email: email,

                    password: password,

                    options: {

                        data: {

                            staff_id: staffID,

                            full_name: fullName

                        }

                    }

                });


                // ==========================================
                // REGISTER ERROR
                // ==========================================

                if (error) {

                    console.error(
                        "Registration error:",
                        error
                    );

                    message.innerText =
                        error.message;

                    message.style.color =
                        "red";

                    registerBtn.disabled = false;

                    registerBtn.innerText =
                        "Register";

                    return;

                }


                // ==========================================
                // SUCCESS
                // ==========================================

                message.innerText =
                    "Registration successful! You can now login.";

                message.style.color =
                    "green";


                // ==========================================
                // GO LOGIN PAGE
                // ==========================================

                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 1500);


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

                message.innerText =
                    "Registration failed: " +
                    error.message;

                message.style.color =
                    "red";

                registerBtn.disabled = false;

                registerBtn.innerText =
                    "Register";

            }

        }
    );

});