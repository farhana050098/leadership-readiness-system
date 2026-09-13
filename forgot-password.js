const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const resetBtn =
    document.getElementById("resetBtn");

const message =
    document.getElementById("message");


forgotPasswordForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        resetBtn.disabled = true;
        resetBtn.innerText = "Sending...";
        message.innerText = "";

        const { error } =
            await supabaseClient.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo:
                        "http://10.163.124.13:5500/reset-password.html"
                }
            );

        if (error) {

            console.error(error);

            message.innerText = error.message;
            message.style.color = "#ffcccc";

            resetBtn.disabled = false;
            resetBtn.innerText = "Send Reset Link";

            return;
        }

        message.innerText =
            "Password reset link has been sent to your email.";

        message.style.color = "#ccffcc";

        resetBtn.innerText = "Email Sent";
    }
);