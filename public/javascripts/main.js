/**
 * Created by Nejc on 22. 10. 2016.
 */

let heroImage;

function init() {
    console.log("It's not safe here, go back!");

    heroImage = document.getElementById('header-image');

    window.addEventListener('scroll', animateHeroImage);
}

function getStyle(id, name) {
    let element = document.getElementById(id);
    return element.currentStyle ? element.currentStyle[name] : window.getComputedStyle ? window.getComputedStyle(element, null).getPropertyValue(name) : null;
}

function animateHeroImage(event) {
    console.log(event.pageY);
    
    heroImage.style.opacity = (200 - event.pageY) / 200;
    heroImage.style.boxShadow = `0 0 ${event.pageY}px rgba(0,0,0,0.9) inset`;
}

function changeLanguage(language) {
    if (language === 'sl') {
        language = 'en';
    }
    else {
        language = 'sl';
    }
    console.log(language);
    setCookie('lang', language);

    location.reload();
}

function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var user = getCookie("username");
    if (user != "") {
        alert("Welcome again " + user);
    } else {
        user = prompt("Please enter your name:", "");
        if (user != "" && user !== null) {
            setCookie("username", user, 365);
        }
    }
}