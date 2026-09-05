/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const currentValue = 0;
const goalValue = 1000;

const pixKey = "[SUA CHAVE PIX AQUI]";


/* =========================================================
   SUPABASE
========================================================= */

const supabaseClient =
    window.supabase && window.SUPABASE_CONFIG
        ? window.supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.publishableKey
        )
        : null;


/* =========================================================
   FORMATAÇÃO DE DINHEIRO
========================================================= */

function formatCurrency(value) {

    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


/* =========================================================
   META DO PIX
========================================================= */

function updateGoal() {

    const currentValueElement =
        document.getElementById("current-value");

    const goalValueElement =
        document.getElementById("goal-value");

    const remainingValueElement =
        document.getElementById("remaining-value");

    const progressBar =
        document.getElementById("progress-bar");

    const progressPercent =
        document.getElementById("progress-percent");


    if (
        !currentValueElement ||
        !goalValueElement ||
        !remainingValueElement ||
        !progressBar ||
        !progressPercent
    ) {
        return;
    }


    let percentage = 0;


    if (goalValue > 0) {

        percentage =
            (currentValue / goalValue) * 100;

    }


    percentage =
        Math.min(
            Math.max(percentage, 0),
            100
        );


    const remaining =
        Math.max(
            goalValue - currentValue,
            0
        );


    currentValueElement.textContent =
        formatCurrency(currentValue);


    goalValueElement.textContent =
        formatCurrency(goalValue);


    remainingValueElement.textContent =
        formatCurrency(remaining);


    progressPercent.textContent =
        `${Math.round(percentage)}%`;


    progressBar.style.width =
        `${percentage}%`;

}


/* =========================================================
   COPIAR PIX
========================================================= */

function copyPix() {

    const pixElement =
        document.getElementById("pix-key");

    const feedback =
        document.getElementById("copy-feedback");


    if (!pixElement) {
        return;
    }


    const key =
        pixElement.textContent.trim();


    if (
        !key ||
        key === "[SUA CHAVE PIX AQUI]"
    ) {

        if (feedback) {
            feedback.textContent =
                "⚠️ Coloque sua chave Pix primeiro.";
        }

        return;
    }


    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        navigator.clipboard
            .writeText(key)
            .then(() => {

                showCopyFeedback();

            })
            .catch(() => {

                fallbackCopy(key);

            });

    } else {

        fallbackCopy(key);

    }

}


/* =========================================================
   FALLBACK PARA COPIAR PIX
========================================================= */

function fallbackCopy(text) {

    const temporaryInput =
        document.createElement("textarea");


    temporaryInput.value = text;

    temporaryInput.style.position =
        "fixed";

    temporaryInput.style.opacity =
        "0";


    document.body.appendChild(
        temporaryInput
    );


    temporaryInput.focus();

    temporaryInput.select();


    try {

        document.execCommand("copy");

        showCopyFeedback();

    } catch (error) {

        const feedback =
            document.getElementById(
                "copy-feedback"
            );

        if (feedback) {
            feedback.textContent =
                "Não foi possível copiar. Copie a chave manualmente.";
        }

    }


    temporaryInput.remove();

}


/* =========================================================
   FEEDBACK DO PIX
========================================================= */

function showCopyFeedback() {

    const feedback =
        document.getElementById(
            "copy-feedback"
        );


    if (!feedback) {
        return;
    }


    feedback.textContent =
        "✅ Chave Pix copiada!";


    setTimeout(() => {

        feedback.textContent = "";

    }, 3000);

}


/* =========================================================
   MENSAGENS — ENVIO PÚBLICO
   IMPORTANTE:
   Não fazemos SELECT aqui.
   O visitante só possui permissão de INSERT no banco.
========================================================= */

const messageForm =
    document.getElementById("message-form");

const messageFeedback =
    document.getElementById("message-feedback");

const sendMessageButton =
    document.getElementById("send-message-button");


function setMessageFeedback(text, type = "") {

    if (!messageFeedback) {
        return;
    }

    messageFeedback.textContent = text;
    messageFeedback.className =
        `message-feedback ${type}`.trim();

}


if (messageForm) {

    messageForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const nameInput =
                document.getElementById("name");

            const messageInput =
                document.getElementById("message");


            const name =
                nameInput.value.trim();

            const message =
                messageInput.value.trim();


            if (!name || !message) {

                setMessageFeedback(
                    "Preencha seu nome e sua mensagem.",
                    "error"
                );

                return;

            }


            if (!supabaseClient) {

                setMessageFeedback(
                    "O sistema de mensagens ainda não foi configurado.",
                    "error"
                );

                return;

            }


            if (sendMessageButton) {

                sendMessageButton.disabled = true;
                sendMessageButton.textContent =
                    "⏳ Enviando...";

            }


            setMessageFeedback("");


            const { error } =
                await supabaseClient
                    .from("birthday_messages")
                    .insert({
                        name,
                        message
                    });


            if (error) {

                console.error(
                    "Erro ao enviar mensagem:",
                    error
                );

                setMessageFeedback(
                    "Não foi possível enviar agora. Tente novamente.",
                    "error"
                );

            } else {

                messageForm.reset();

                setMessageFeedback(
                    "💚 Mensagem enviada com sucesso! Obrigado pelo carinho.",
                    "success"
                );

                createConfetti();

            }


            if (sendMessageButton) {

                sendMessageButton.disabled = false;
                sendMessageButton.textContent =
                    "💚 Enviar mensagem";

            }

        }
    );

}


/* =========================================================
   CONFETES
========================================================= */

function createConfetti() {

    const emojis = [
        "💚",
        "🤍",
        "💛",
        "🎉",
        "🎂",
        "🎁",
        "⚽",
        "⭐"
    ];


    for (
        let i = 0;
        i < 30;
        i++
    ) {

        const confetti =
            document.createElement(
                "div"
            );


        confetti.textContent =
            emojis[
                Math.floor(
                    Math.random() *
                    emojis.length
                )
            ];


        confetti.style.position =
            "fixed";


        confetti.style.top =
            "-40px";


        confetti.style.left =
            `${Math.random() * 100}%`;


        confetti.style.fontSize =
            `${15 + Math.random() * 20}px`;


        confetti.style.zIndex =
            "9999";


        confetti.style.pointerEvents =
            "none";


        confetti.style.animation =
            `fall ${
                2 + Math.random() * 3
            }s linear forwards`;


        document.body.appendChild(
            confetti
        );


        setTimeout(() => {

            confetti.remove();

        }, 5500);

    }

}


/* =========================================================
   ANIMAÇÃO DE ENTRADA
========================================================= */

function setupRevealAnimation() {

    const elements =
        document.querySelectorAll(
            ".about-card, .gift-card, .gallery-card, .message-form-card, .messages-list-card"
        );


    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    elements.forEach(
        (element) => {

            element.style.opacity = "0";

            element.style.transform =
                "translateY(25px)";

            element.style.transition =
                "opacity 0.6s ease, transform 0.6s ease";


            observer.observe(element);

        }
    );


    const revealStyle =
        document.createElement(
            "style"
        );


    revealStyle.textContent = `
        .about-card.visible,
        .gift-card.visible,
        .gallery-card.visible,
        .message-form-card.visible,
        .messages-list-card.visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;


    document.head.appendChild(
        revealStyle
    );

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateGoal();

        setupRevealAnimation();

    }
);
