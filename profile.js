const profileForm =
    document.getElementById("profileForm");

const logoutBtn =
    document.getElementById("logoutBtn");

const message =
    document.getElementById("message");


// ==========================================
// CHECK LOGIN
// ==========================================

async function checkUser() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {

        window.location.href = "index.html";

        return;
    }

    loadProfile(user);

}


// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile(user) {

    const { data, error } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();


    if (error) {

        console.error(error);

        return;
    }


    if (data) {

        document.getElementById("staff_id").value =
            data.staff_id || "";

        document.getElementById("title").value =
            data.title || "";

        document.getElementById("full_name").value =
            data.full_name || "";

        document.getElementById("gender").value =
            data.gender || "";

        document.getElementById("age").value =
            data.age || "";

        document.getElementById("email").value =
            data.email || user.email || "";

        document.getElementById("phone").value =
            data.phone || "";

        document.getElementById("service_years").value =
            data.service_years ?? "";

    }

}


// ==========================================
// SAVE / UPDATE PROFILE
// ==========================================

profileForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const {
            data: { user }
        } = await supabaseClient.auth.getUser();


        if (!user) {

            window.location.href = "index.html";

            return;
        }


        const profileData = {

            id: user.id,

            staff_id:
                document.getElementById("staff_id").value.trim(),

            title:
                document.getElementById("title").value.trim(),

            full_name:
                document.getElementById("full_name").value.trim(),

            gender:
                document.getElementById("gender").value,

            age:
                Number(document.getElementById("age").value),

            email:
                document.getElementById("email").value.trim(),

            phone:
                document.getElementById("phone").value.trim(),

            service_years:
                Number(document.getElementById("service_years").value),

            updated_at:
                new Date().toISOString()

        };


        const { error } =
            await supabaseClient
                .from("profiles")
                .upsert(
                    profileData,
                    {
                        onConflict: "id"
                    }
                );


        if (error) {

            console.error(error);

            message.innerText =
                "Failed to save information.";

            message.style.color =
                "red";

            return;
        }


        message.innerText =
            "Personal information saved successfully!";

        message.style.color =
            "green";

    }
);


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener(
    "click",
    async function() {

        await supabaseClient.auth.signOut();

        window.location.href = "index.html";

    }
);


// ==========================================
// START
// ==========================================

checkUser();