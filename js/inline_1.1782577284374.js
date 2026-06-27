
    const logoArea = document.getElementById("logoArea");
    const logoEditor = document.getElementById("logoEditor");
    const saveBtn = document.getElementById("saveLogo");
    const cancelBtn = document.getElementById("cancelLogo");

    const bizName = document.getElementById("bizName");
    const bizSlogan = document.getElementById("bizSlogan");
    const fontSelect = document.getElementById("fontStyle");

    const nameWarn = document.getElementById("nameWarn");
    const sloganWarn = document.getElementById("sloganWarn");

    const MAX_NAME_CHARS = 18;
    const MAX_SLOGAN_CHARS = 25;

    logoArea.addEventListener("click", function(e) {
        logoEditor.style.display = "block";
        logoEditor.style.left = e.pageX + "px";
        logoEditor.style.top = e.pageY + "px";
    });

    cancelBtn.addEventListener("click", function() {
        logoEditor.style.display = "none";
    });

    // HARD LIMIT ENFORCEMENT
    function enforceLimit(input, max, warningBox) {
        if (input.value.length > max) {
            input.value = input.value.substring(0, max); // hard stop
        }

        if (input.value.length >= max) {
            input.classList.add("error");
            warningBox.style.display = "block";
        } else {
            input.classList.remove("error");
            warningBox.style.display = "none";
        }
    }

    bizName.addEventListener("input", () => {
        enforceLimit(bizName, MAX_NAME_CHARS, nameWarn);
    });

    bizSlogan.addEventListener("input", () => {
        enforceLimit(bizSlogan, MAX_SLOGAN_CHARS, sloganWarn);
    });

    saveBtn.addEventListener("click", function() {

        if (bizName.value.trim() === "" || bizSlogan.value.trim() === "") {
            return;
        }

        const name = bizName.value.toUpperCase();
        const slogan = bizSlogan.value.toUpperCase();
        const fontChoice = fontSelect.value;

        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 100;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, 300, 100);

        // MAIN TITLE
        ctx.font = "bold 32px " + fontChoice;
        ctx.fillStyle = "#000000";

        let nameWidth = ctx.measureText(name).width;
        let nameX = (300 - nameWidth) / 2;
        ctx.fillText(name, nameX, 40);

        // TAGLINE
        ctx.font = "16px " + fontChoice;
        ctx.fillStyle = "#2E7D32";

        let sloganWidth = ctx.measureText(slogan).width;
        let sloganX = (300 - sloganWidth) / 2;
        ctx.fillText(slogan, sloganX, 75);

        const pngURL = canvas.toDataURL("image/png");

        document.getElementById("logoArea").innerHTML =
            `<img src="${pngURL}" width="300" height="100" alt="Generated Logo">`;

        const footerLogo = document.getElementById("footerLogo");
        if (footerLogo) {
            footerLogo.src = pngURL;
            footerLogo.width = 300;
            footerLogo.height = 100;
        }

        logoEditor.style.display = "none";
    });
