/* =========================================================
   PAINEL PRIVADO — SUPABASE
========================================================= */

const supabaseClient =
    window.supabase && window.SUPABASE_CONFIG
        ? window.supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.publishableKey
        )
        : null;


const loginCard =
    document.getElementById("login-card");

const dashboard =
    document.getElementById("dashboard");

const loginForm =
    document.getElementById("login-form");

const loginFeedback =
    document.getElementById("login-feedback");

const loginButton =
    document.getElementById("login-button");

const adminFeedback =
    document.getElementById("admin-feedback");

const adminEmail =
    document.getElementById("admin-email");

const messageCount =
    document.getElementById("message-count");

const adminMessages =
    document.getElementById("admin-messages");

const adminEmpty =
    document.getElementById("admin-empty");

const refreshButton =
    document.getElementById("refresh-button");

const logoutButton =
    document.getElementById("logout-button");


function setLoginFeedback(text, type = "") {

    loginFeedback.textContent = text;
    loginFeedback.className =
        `feedback ${type}`.trim();

}


function setAdminFeedback(text, type = "") {

    adminFeedback.textContent = text;
    adminFeedback.className =
        `admin-feedback ${type}`.trim();

}


/* =========================================================
   LOGIN
========================================================= */

async function login(event) {

    event.preventDefault();

    if (!supabaseClient) {

        setLoginFeedback(
            "Configure primeiro o supabase-config.js.",
            "error"
        );

        return;
    }


    const email =
        document.getElementById("email")
            .value
            .trim();

    const password =
        document.getElementById("password")
            .value;


    loginButton.disabled = true;
    loginButton.textContent = "⏳ Entrando...";
    setLoginFeedback("");


    const { error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });


    if (error) {

        console.error(error);

        setLoginFeedback(
            "E-mail ou senha inválidos.",
            "error"
        );

        loginButton.disabled = false;
        loginButton.textContent = "🔑 Entrar";

        return;
    }


    await showDashboard();

}


/* =========================================================
   MOSTRAR DASHBOARD
========================================================= */

async function showDashboard() {

    const {
        data: {
            user
        }
    } =
        await supabaseClient.auth.getUser();


    if (!user) {

        showLogin();
        return;

    }


    loginCard.hidden = true;
    dashboard.hidden = false;

    adminEmail.textContent =
        user.email || "";

    loginButton.disabled = false;
    loginButton.textContent = "🔑 Entrar";

    await loadMessages();

}


/* =========================================================
   VERIFICAR SESSÃO
========================================================= */

async function checkSession() {

    if (!supabaseClient) {
        return;
    }


    const {
        data: {
            session
        }
    } =
        await supabaseClient.auth.getSession();


    if (session) {

        await showDashboard();

    } else {

        showLogin();

    }

}


function showLogin() {

    loginCard.hidden = false;
    dashboard.hidden = true;

}


/* =========================================================
   CARREGAR MENSAGENS
========================================================= */

async function loadMessages() {

    if (!supabaseClient) {
        return;
    }


    refreshButton.disabled = true;
    refreshButton.textContent = "⏳ Atualizando...";

    setAdminFeedback("");


    const {
        data,
        error
    } =
        await supabaseClient
            .from("birthday_messages")
            .select("id, name, message, created_at")
            .order("created_at", {
                ascending: false
            });


    refreshButton.disabled = false;
    refreshButton.textContent = "🔄 Atualizar";


    if (error) {

        console.error(error);

        setAdminFeedback(
            "Não foi possível carregar as mensagens. Verifique o usuário administrador e as políticas RLS.",
            "error"
        );

        return;
    }


    renderMessages(data || []);

}


/* =========================================================
   RENDERIZAR MENSAGENS
========================================================= */

function renderMessages(messages) {

    adminMessages.innerHTML = "";

    messageCount.textContent =
        messages.length;


    if (messages.length === 0) {

        adminEmpty.hidden = false;
        return;

    }


    adminEmpty.hidden = true;


    messages.forEach(
        (item) => {

            const card =
                document.createElement("article");

            card.className =
                "admin-message";


            const top =
                document.createElement("div");

            top.className =
                "admin-message-top";


            const info =
                document.createElement("div");


            const name =
                document.createElement("h2");

            name.textContent =
                `💚 ${item.name}`;


            const date =
                document.createElement("time");

            date.dateTime =
                item.created_at;

            date.textContent =
                formatDate(item.created_at);


            info.appendChild(name);
            info.appendChild(date);


            const deleteButton =
                document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className =
                "delete-button";

            deleteButton.textContent =
                "🗑️ Excluir";


            deleteButton.addEventListener(
                "click",
                () => deleteMessage(item.id)
            );


            top.appendChild(info);
            top.appendChild(deleteButton);


            const message =
                document.createElement("p");

            message.textContent =
                item.message;


            card.appendChild(top);
            card.appendChild(message);

            adminMessages.appendChild(card);

        }
    );

}


/* =========================================================
   DATA
========================================================= */

function formatDate(value) {

    const date =
        new Date(value);


    return date.toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );

}


/* =========================================================
   EXCLUIR
========================================================= */

async function deleteMessage(id) {

    const confirmed =
        window.confirm(
            "Tem certeza que deseja excluir esta mensagem?"
        );


    if (!confirmed) {
        return;
    }


    setAdminFeedback("Excluindo...");


    const {
        error
    } =
        await supabaseClient
            .from("birthday_messages")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(error);

        setAdminFeedback(
            "Não foi possível excluir a mensagem.",
            "error"
        );

        return;
    }


    setAdminFeedback(
        "Mensagem excluída com sucesso.",
        "success"
    );


    await loadMessages();

}


/* =========================================================
   SAIR
========================================================= */

async function logout() {

    await supabaseClient.auth.signOut();

    showLogin();

    loginForm.reset();

    setLoginFeedback(
        "Você saiu do painel.",
        "success"
    );

}


/* =========================================================
   EVENTOS
========================================================= */

loginForm.addEventListener(
    "submit",
    login
);

refreshButton.addEventListener(
    "click",
    loadMessages
);

logoutButton.addEventListener(
    "click",
    logout
);


document.addEventListener(
    "DOMContentLoaded",
    checkSession
);
