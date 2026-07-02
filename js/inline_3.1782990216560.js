
// OPEN POPUP
document.getElementById("open-popup").addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("contact-popup").style.display = "flex";
});

document.getElementById("open-popup-2").addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("contact-popup").style.display = "flex";
});

// CLOSE POPUP
document.getElementById("close-popup").addEventListener("click", function() {
    document.getElementById("contact-popup").style.display = "none";
});

// CLOSE WHEN CLICKING OUTSIDE
window.addEventListener("click", function(e) {
    const popup = document.getElementById("contact-popup");
    if (e.target === popup) {
        popup.style.display = "none";
    }
});
