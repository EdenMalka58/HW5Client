function getElement(id) {
    return document.getElementById(id);
}

function addClass(elem, className) {
    if (!className) return;
    const classNameSplit = className.split(" ");
    classNameSplit.forEach((_class) => {
        elem.classList.add(_class);
    });
}

function removeClass(elem, className) {
    elem.classList.remove(className);
}
function hasClass(elem, className) {
    return elem.classList.contains(className);
}

function createDiv(className, text, id) {
    const div = document.createElement('div');
    if (id) div.setAttribute('id', id);
    if (className) addClass(div, className);
    if (text) div.innerText = text;
    return div;
}

function createImage(src, className, id) {
    const img = document.createElement('img');
    img.src = src;
    if (id) img.setAttribute('id', id);
    if (className) addClass(img, className);
    return img;
}

function createButton(className, id, text, onClick, title) {
    const button = document.createElement('button');
    button.innerText = text;
    if (id) button.setAttribute('id', id);
    if (className) addClass(button, className);
    if (title) button.setAttribute('title', title);
    button.addEventListener('click', function () { onClick(); })
    return button;
}

function createLink(className, id, text, url, target, title) {
    const link = document.createElement('a');
    link.innerText = text;
    if (id) link.setAttribute('id', id);
    if (className) addClass(link, className);
    if (url) link.setAttribute('href', url);
    if (target) link.setAttribute('target', target);
    if(title) link.setAttribute('title', title);
    return link;
}

function createSpan(className, text, id) {
    const span = document.createElement('span');
    if (id) span.setAttribute('id', id);
    if (className) addClass(span, className);
    if (text) span.innerText = text;
    return span;
}


function formatCurrency(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD', minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(price)
}

function formatDate(date, locale = 'en-US') {
    return new Date(date).toLocaleDateString(locale);
}

function dateToISOStr(date, withTime) {
    try {
        if (date) {
            const dateUTC = new Date(
                Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
            )
            if (dateUTC)
                return withTime
                    ? dateUTC.toISOString()
                    : dateUTC.toISOString().substring(0, 10)
        }
    } catch (e) {
        console.log(e)
    }
    return null
}


function createIcon(className) {
    const icon = document.createElement("i");
    addClass(icon, `fa-solid fa-${className}`);
    return icon;
}

function notifySuccess(message) {
    notif({
        'type': 'success',
        'msg': message,
        'position': 'center'
    })
}

function notifyError(message) {
    notif({
        'type': 'error',
        'msg': message,
        'position': 'center'
    })
}

function notifyInfo(message) {
    notif({
        'type': 'info',
        'msg': message,
        'position': 'center'
    })
}

function notifyWarning(message) {
    notif({
        'type': 'warning',
        'msg': message,
        'position': 'center'
    })
}

// Add an option to an element
function addOption(element, optionValue, optionText, selected) {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionText;
    if (selected) // If selected is true (Ensure non null values)
        option.selected = selected;
    // Add the option to the select element
    element.appendChild(option);
    return option;
}

function getInputValueStr(inputId, defVal = '') {
    const val = document.getElementById(inputId).value;
    if (!val)
        return defVal;
    return String(val).trim();
}
function getInputValueDate(inputId) {
    return new Date(document.getElementById(inputId).value);
}
function getInputValueFloat(inputId, defVal = 0) {
    const val = document.getElementById(inputId).value;
    if (!val)
        return defVal;
    return parseFloat(val);
}
function getInputValueInt(inputId, defVal = 0) {
    const val = document.getElementById(inputId).value;
    if (!val)
        return defVal;
    return parseInt(val);
}

function isValidName(name) {
    const trimmed = name.trim();
    const regex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

    // Remove all spaces to count only the letters
    const letterCount = trimmed.replace(/ /g, '').length;

    return regex.test(trimmed) && letterCount >= 2;
}

function isValidPassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

function isValidDate(date) {
    return date && !isNaN(date)
}

function getLocalStorage(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function delLocalStorage(key) {
    localStorage.removeItem(key);
}

function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end - start;
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return daysDifference;
}