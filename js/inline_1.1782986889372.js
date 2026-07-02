
function shareFacebook() {
    console.log("Facebook CLICKED!");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
}

function shareInsta() {
    console.log("Instagram CLICKED!");
    if (navigator.share) {
        navigator.share({
            title: document.title,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied! Paste it into Instagram.");
    }
}

function shareTwitter() {
    console.log("Twitter CLICKED!");
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("Check this out!");
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
}
