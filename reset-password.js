const resetPasswordForm =
    document.getElementById("resetPasswordForm");

const updateBtn =
    document.getElementById("updateBtn");

const message =
    document.getElementById("message");


// Check reset session
supabaseClient.auth.onAuthStateChange(
    async function(event, session) {

        console.log("Auth event:", event);

        if (event === "PASSWORD_RECOVERY") {

            console.log("Password recovery session detected.");

            message.innerText =
                "Please enter your new password.";

            message.style.color =
                "#ccffcc";
        }

    }
);


// Update password
resetPasswordForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        if (newPassword.length < 6) {

            message.innerText =
                "Password must be at least 6 characters.";

            message.style.color =
                "#ffcccc";

            return;
        }


        if (newPassword !== confirmPassword) {

            message.innerText =
                "Passwords do not match.";

            message.style.color =
                "#ffcccc";

            return;
        }


        updateBtn.disabled = true;

        updateBtn.innerText =
            "Updating...";


        const { error } =
            await supabaseClient.auth.updateUser({
                password: newPassword
            });


        if (error) {

            console.error(error);

            message.innerText =
                error.message;

            message.style.color =
                "#ffcccc";

            updateBtn.disabled = false;

            updateBtn.innerText =
                "Update Password";

            return;
        }


        message.innerText =
            "Password updated successfully!";

        message.style.color =
            "#ccffcc";


        setTimeout(function() {

            window.location.href =
                "index.html";

        }, 1500);

    }
);