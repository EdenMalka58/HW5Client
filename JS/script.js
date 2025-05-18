// detect if running in localhost or live server
const isLocalHost = location.hostname === "localhost" || location.hostname === "127.0.0.1"
const SERVER_PORT = 7007;
const SERVER_PATH = isLocalHost ?
    `https://localhost:${SERVER_PORT}/api/` :
    'https://proj.ruppin.ac.il/cgroup3/Test2/tar1/api/';
// End points
const MOVIES_LIST_PATH = 'Movies';
const MOVIES_LIST_FILTERED_PATH = 'Movies?Page={page}&PageSize={pageSize}';
const MOVIES_ADD_PATH = 'Movies';
const MOVIES_ADD_LIST_PATH = 'Movies/addMovies';
const MOVIES_DELETE_PATH = 'Movies/{movieId}';
const MOVIES_SEARCH_BY_TITLE_PATH = 'Movies/search?title={title}';
const MOVIES_SEARCH_BY_DATES_PATH = 'Movies/from/{startDate}/until/{endDate}';
const MOVIES_LANGUAGES_PATH = 'Movies/languages';
const MOVIES_GENRES_PATH = 'Movies/genres';
const MOVIES_RENTED_LIST_PATH = 'Movies/user/{userId}';
const MOVIES_RENT_PATH = 'Movies/rent/{movieId}';
const MOVIES_PASS_PATH = 'Movies/passRented/{movieId}';
const MOVIES_RENT_DELETE_PATH = 'Movies/rent/{id}';
const USERS_LIST_PATH = 'Users?includeInActive={includeInActive}';
const USERS_UPDATE_ACTIVE_PATH = 'Users/active/{id}';


const LOGIN_PATH = 'Users/login';
const REGISTER_PATH = 'Users/register';
const UPDATE_PROFILE_PATH = 'Users/{id}';
// Element's IDs
const CARDS_CONTAINER_ID = 'cardsContainer';
const MOVIES_CONTAINER_ID = 'moviesContainer';
// Local storage keys
const LOGGED_IN_USER_STORAGE_KEY = 'loggedInUser';

// Default page size
const PAGE_SIZE = 20;

function ajaxCall(method, api, data, successCB, errorCB) {
    $.ajax({
        type: method,
        url: SERVER_PATH + api,
        data: data,
        cache: false,
        contentType: "application/json",
        dataType: "json",
        success: successCB,
        error: function (error) {
            notifyError(`Server error - ${error.statusText}`);
            if (errorCB) errorCB();
        }
    });
}

function renderMovies(moviesList, containerId, withAddBtn, withRemoveBtn, doClear = true) {
    const container = getElement(containerId);
    if (doClear) container.innerHTML = '';
    moviesList.forEach(movie => {
        createMovieCard(container, movie, withAddBtn, withRemoveBtn)
    });
}

function createMovieCard(container, movie, withAddBtn, withRemoveBtn) {
    const card = createDiv('card', null, `card_${movie.id}`);
    container.appendChild(card);
    const rating = createDiv('rating');
    card.appendChild(rating);
    const ratingIcon = createIcon('star');
    rating.appendChild(ratingIcon);
    const ratingText = createSpan(null, movie.averageRating);
    rating.appendChild(ratingText);

    if (withAddBtn) {
        const addButton = createButton('btn', null, "Rent me", function () { openRentMovieDialog(movie) }, 'Rent this movie');
        card.appendChild(addButton);
    }
    if (withRemoveBtn) {
        const removeButton = createButton('btn delBtn', null, "Delete", function () { confirmDeleteRentedMovie(movie) }, 'Remove this movie from your movie list');
        card.appendChild(removeButton);
        const passButton = createButton('btn', null, "Pass", function () { openPassRentedMovieDialog(movie) }, 'Pass this movie to another user');
        card.appendChild(passButton);

    }

    const img = createImage(movie.primaryImage);
    card.appendChild(img);
    const content = createDiv('content');
    card.appendChild(content);
    const title = document.createElement('h4');
    title.innerText = movie.primaryTitle;
    content.appendChild(title);
    if (withRemoveBtn) {
        const rentDuration = createDiv('duration');
        rentDuration.innerText = `Renting ends in ${calculateDays(movie.rentStart, movie.rentEnd)} days`;
        content.appendChild(rentDuration);
    }
    const topDiv = createDiv('top');
    content.appendChild(topDiv);
    const year = movie.year;
    const yearSpan = createSpan(null, year);
    topDiv.appendChild(yearSpan);
    const runtimeMinutesSpan = createSpan(null, `${movie.runtimeMinutes} min`);
    topDiv.appendChild(runtimeMinutesSpan);
    const languageSpan = createSpan(null, movie.language);
    topDiv.appendChild(languageSpan);
    if (movie.isAdult) {
        const isAdultSpan = createSpan('adult-badge', '18+');
        topDiv.appendChild(isAdultSpan);
    }
    if (movie.url) {
        const urlLink = createLink('link', null, null, movie.url, '_blank', 'Open link to website');
        const urlIcon = createIcon('up-right-from-square');
        urlLink.appendChild(urlIcon);
        topDiv.appendChild(urlLink);
    }
    const descriptionSpan = createSpan('description', movie.description);
    content.appendChild(descriptionSpan);
    let genres = movie.genres;
    if (genres) {
        const genresDiv = createDiv('genres');
        content.appendChild(genresDiv);
        if (!$.isArray(genres)) {
            genres = genres.split(',');
        }
        genres.forEach(genre => {
            const genreBadge = createSpan(null, genre);
            genresDiv.appendChild(genreBadge)
        })
    }
    const spliter = document.createElement('hr');
    content.appendChild(spliter);

    const bottomDiv = createDiv('bottom');
    content.appendChild(bottomDiv);

    [
        { caption: 'Budget', data: `${formatCurrency(movie.budget / 1000000)}M` },
        { caption: 'Box office', data: formatCurrency(movie.grossWorldwide) },
        { caption: 'Votes', data: `${(movie.numVotes / 1000000).toFixed(2)}M` }
    ].forEach(item => {
        const box = createDiv();
        bottomDiv.appendChild(box);
        const label = createSpan('caption', item.caption);
        box.appendChild(label);
        const data = createSpan('data', item.data);
        box.appendChild(data);
    })
}

function renderMoviesFromDB() {
    ajaxCall("GET", MOVIES_LIST_PATH, '',
        function (result) {
            if (result && result.movies.length > 0)
                renderMovies(result.movies, CARDS_CONTAINER_ID, true, false);
            else
                noMoviesFoundMessage(CARDS_CONTAINER_ID, 'You have no movies in your list!');
        })
    // NOT IN USE ANYMORE !!! renderMovies(movies, CARDS_CONTAINER_ID, true, false);
}

function convertToMovieObj(movie) {
    const movieObj = {};
    movieObj.id = 0; // parseInt(movie.id.replace(/\D/g, ""));
    movieObj.url = movie.url;
    movieObj.primaryTitle = movie.primaryTitle;
    movieObj.description = movie.description;
    movieObj.primaryImage = movie.primaryImage;
    movieObj.year = movie.startYear;
    movieObj.releaseDate = movie.releaseDate;
    movieObj.language = movie.language ?? 'English';
    movieObj.budget = movie.budget ?? 0;
    movieObj.grossWorldwide = movie.grossWorldwide ?? 0;
    movieObj.genres = movie.genres ? movie.genres.join(',') : null;
    movieObj.isAdult = movie.isAdult;
    movieObj.runtimeMinutes = movie.runtimeMinutes;
    movieObj.averageRating = movie.averageRating;
    movieObj.numVotes = movie.numVotes;
    return movieObj;
}

function addMovieToCart(movie, onSuccess) {
    if (!checkLoggedInUser()) return;

    ajaxCall("POST", MOVIES_ADD_PATH, JSON.stringify(movie),
        function (result) {

            if (result == 1) {
                if (onSuccess)
                    onSuccess();
                notifySuccess('Movie added successfully!');
            } else {
                notifyInfo('Movie\'s already added!');
            }
        })
}

function deleteMovieFromCart(movie) {
    ajaxCall("DELETE", MOVIES_DELETE_PATH.replace('{movieId}', movie.id), '',
        function (result) {
            if (result == 1) {
                removeMovieCardFromList(movie.id);
                notifySuccess('Movie removed successfully!');
            }
            else notifyError('Failed to delete movie!');
        })
}

function removeMovieCardFromList(movieId) {
    const cardToDelete = getElement(`card_${movieId}`);
    const moviesContainer = getElement(MOVIES_CONTAINER_ID);
    moviesContainer.removeChild(cardToDelete);
    if (moviesContainer.children.length == 0)
        noMoviesFoundMessage(MOVIES_CONTAINER_ID, 'You have no movies in your list!');
}


//let pageNum = 1;
const scrollPaginationState = {
    pageNum: 1,
    loadingPageNum: 0,
    title: null,
    startDate: null,
    endDate: null
}
function loadMoviesFromServer(title, startDate, endDate) {
   
    
    function handleScroll() {
        if (scrollPaginationState.loadingPageNum == scrollPaginationState.pageNum) return;
        const scrollTop = window.scrollY;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        if (scrollTop + viewportHeight >= fullHeight - 100) {
            loadNextPage();
        }
    }

    function loadNextPage() {
        scrollPaginationState.loadingPageNum = scrollPaginationState.pageNum;
        let url = MOVIES_LIST_FILTERED_PATH.replace('{page}', scrollPaginationState.pageNum).replace('{pageSize}', PAGE_SIZE);
        if (scrollPaginationState.title) url += `&Title=${scrollPaginationState.title}`;
        if (scrollPaginationState.startDate) url += `&From=${scrollPaginationState.startDate}`;
        if (scrollPaginationState.endDate) url += `&To=${scrollPaginationState.endDate}`;
        ajaxCall("GET", url, '',
            function (result) {
                if (result && result.movies.length > 0) {
                    renderMovies(result.movies, CARDS_CONTAINER_ID, true, false, false);
                    if (result.hasMore) {
                        scrollPaginationState.pageNum++;
                    } else {
                        window.removeEventListener('scroll', handleScroll);
                    }
                }
                else noMoviesFoundMessage(CARDS_CONTAINER_ID, 'You have no movies in your list!');
            })
    }

    window.removeEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);
    resetScrollPagination();

    scrollPaginationState.title = title;
    scrollPaginationState.startDate = startDate;
    scrollPaginationState.endDate = endDate;

    loadNextPage();
}

function resetScrollPagination() {
    scrollPaginationState.pageNum = 1;
    scrollPaginationState.loadingPageNum = 0;
    scrollPaginationState.title = null;
    scrollPaginationState.startDate = null;
    scrollPaginationState.endDate = null;
    const container = getElement(CARDS_CONTAINER_ID);
    container.innerHTML = '';
}

function loadRentedMoviesFromServer() {
    const loggedInUser = getLoggedInUser();
    ajaxCall("GET", MOVIES_RENTED_LIST_PATH.replace('{userId}', loggedInUser.id), '',
        function (result) {
            if (result && result.length > 0)
                renderMovies(result, MOVIES_CONTAINER_ID, false, true);
            else
                noMoviesFoundMessage(MOVIES_CONTAINER_ID, 'You have no movies in your list!');
        })
}

function refreshMyMovies() {
    getElement('titleInput').value = '';
    getElement('startDateInput').value = '';
    getElement('endDateInput').value = '';
    loadMoviesFromServer();
}

function getMoviesByDates(startDate, endDate) {

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!startDate || isNaN(start)) {
        notifyInfo('Please enter a valid start date');
        return;
    }
    if (!endDate || isNaN(end)) {
        notifyInfo('Please enter a valid end date');
        return;
    }
    if (end < start) {
        notifyInfo('Start date must be earlier than the end date!');
        return;
    }
    ajaxCall("GET", MOVIES_SEARCH_BY_DATES_PATH.
        replace('{startDate}', startDate).
        replace('{endDate}', endDate), '',
        function (result) {
            if (result && result.length > 0)
                renderMovies(result, MOVIES_CONTAINER_ID, false, true);
            else
                noMoviesFoundMessage(MOVIES_CONTAINER_ID,
                    `No movies with a release date from ${formatDate(startDate)} to ${formatDate(endDate)} found!`);
        })
}

function getMoviesByTitle(title) {
    if (!title) {
        notifyInfo('Please enter a title');
        return;
    }
    ajaxCall("GET", MOVIES_SEARCH_BY_TITLE_PATH.replace('{title}', title), '',
        function (result) {
            if (result && result.length > 0)
                renderMovies(result, MOVIES_CONTAINER_ID, false, true);
            else
                noMoviesFoundMessage(MOVIES_CONTAINER_ID, `No movies with title '${title}' found!`);
        })
}

function noMoviesFoundMessage(containerId, message) {
    const container = getElement(containerId);
    container.innerHTML = '';
    const h3 = document.createElement('h3');
    h3.innerText = message;
    container.appendChild(h3);
}

function handleTitleButtonClick() {
    loadMoviesFromServer(getElement('titleInput').value);
}

function handleDatesButtonClick() {
    const startDate = $('#startDateInput').val();
    const endDate = $('#endDateInput').val();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!startDate || isNaN(start)) {
        notifyInfo('Please enter a valid start date');
        return;
    }
    if (!endDate || isNaN(end)) {
        notifyInfo('Please enter a valid end date');
        return;
    }
    if (end < start) {
        notifyInfo('Start date must be earlier than the end date!');
        return;
    }

    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    if (startYear < 1800 || startYear > 2040) {
        notifyInfo('Start year must be between 1800 to 2040!');
        return;
    }
    if (endYear < 1800 || endYear > 2040) {
        notifyInfo('End year must be between 1800 to 2040!');
        return;
    }

    const fromDateISO = dateToISOStr(start);
    const toDateISO = dateToISOStr(end);
    loadMoviesFromServer(null, fromDateISO, toDateISO);
}

function loginUser() {
    lockSubmitBtn();
    const user = {
        email: getElement('userEmailInput').value,
        password: getElement('userPasswordInput').value
    }
    ajaxCall("POST", LOGIN_PATH, JSON.stringify(user),
        function (result) {
            if (result.error == 0) {
                setLocalStorage(LOGGED_IN_USER_STORAGE_KEY, result.user);
                window.location.href = 'index.html';
            } else {
                notifyError('User not found!');
            }
            unlockSubmitBtn();
        })
    return false;
}

function registerUser() {
    lockSubmitBtn();
    const user = {
        id: 0,
        name: getElement('nameInput').value,
        email: getElement('emailInput').value,
        password: getElement('passwordInput').value,
        active: true
    }
    ajaxCall("POST", REGISTER_PATH, JSON.stringify(user),
        function (result) {
            if (result == 1) {
                notifySuccess('User registered successfully!');
                showLoginSection();
            }
            else if (result == -1) {
                notifyWarning('Email already exists! please select another email');
            }
            else {
                notifyError('Failed to register user!');
            }
            unlockSubmitBtn();
        })

    return false;
}

function logoutUser() {
    delLocalStorage(LOGGED_IN_USER_STORAGE_KEY);
    window.location.href = 'login.html';
}

function getLoggedInUser() {
    return getLocalStorage(LOGGED_IN_USER_STORAGE_KEY);
}

function checkLoggedInUser() {
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) {
        logoutUser();
        return false;
    }
    return true;
}

function displayLoggedInUserName() {
    const loggedInUser = getLoggedInUser();
    if (loggedInUser) {
        $('#userNameDiv').text(loggedInUser.name);

        if (!loggedInUser.isNotified) {
            notifyInfo(`Welcome ${loggedInUser.name}!`);
            loggedInUser.isNotified = true;
            setLocalStorage(LOGGED_IN_USER_STORAGE_KEY, loggedInUser);
        }
    }
    else {
        getElement('userMenu').style.display = 'none';
    }
}

function checkAdminMenuItem() {
    const loggedInUser = getLoggedInUser();
    if (loggedInUser) {
        if (loggedInUser.admin) {
            removeClass(getElement('adminItem'), 'hide');
        }
    }
}

function handleNameChange() {
    const name = $(this).val().trim();
    if (!isValidName(name)) {
        this.validity.valid = false;
        this.setCustomValidity('Name must have letters only and contain at least 2 letters!');
    }
    else {
        this.validity.valid = true;
        this.setCustomValidity('');
    }
}

function handlePasswordChange() {
    const password = $(this).val().trim();
    if (!isValidPassword(password)) {
        this.validity.valid = false;
        this.setCustomValidity('Password must be at least 8 characters, include an uppercase letter and a number!');
    }
    else {
        this.validity.valid = true;
        this.setCustomValidity('');
    }
}
function handleReleaseDateChange() {
    const today = new Date();
    const date = new Date($(this).val().trim());
    if (!date || isNaN(date)) {
        this.validity.valid = false;
        this.setCustomValidity('Please select a valid date!');
    }
    else if (date > today) {
        this.validity.valid = false;
        this.setCustomValidity('Date can not be greater than today!');
    }
    else {
        this.validity.valid = true;
        this.setCustomValidity('');
    }
}

function showRegistrationSection() {
    $('#nameInput').val('');
    $('#emailInput').val('');
    $('#passwordInput').val('');
    $('#loginDiv').hide();
    $('#registerDiv').show();
}

function showLoginSection() {
    $('#loginDiv').show();
    $('#registerDiv').hide();
}

function fillLanguagesDatalist() {
    const dataList = getElement('languages');

    ajaxCall("GET", MOVIES_LANGUAGES_PATH, '',
        function (result) {
            if (result && result.length > 0)
                result.forEach((language) => {
                    addOption(dataList, language, language);
                });
        })
}

let genresMultiList = null;
function fillGenresDatalist() {
    const genresSelect = getElement('genresSelect');
    ajaxCall("GET", MOVIES_GENRES_PATH, '',
        function (result) {
            if (result && result.length > 0)
                result.forEach((genre) => {
                    addOption(genresSelect, genre, genre);
                });
            genresMultiList = new SlimSelect({
                select: '#genresSelect',
                settings: {
                    placeholderText: 'Add genres'
                }
            });
        })
}

function addMovie() {
    const movie = {
        id: 0,
        url: getInputValueStr('urlInput'),
        primaryTitle: getInputValueStr('primaryTitleInput'),
        description: getInputValueStr('descriptionInput'),
        primaryImage: getInputValueStr('primaryImageInput'),
        year: getInputValueInt('yearInput'),
        releaseDate: dateToISOStr(getInputValueDate('releaseDateInput')),
        language: getInputValueStr('languageInput'),
        budget: getInputValueFloat('budgetInput'),
        grossWorldwide: getInputValueFloat('grossWorldwideInput'),
        genres: genresMultiList.getSelected().join(','),
        isAdult: getElement('isAdultInput').checked,
        runtimeMinutes: getInputValueInt('runtimeMinutesInput'),
        averageRating: getInputValueFloat('averageRatingInput'),
        numVotes: getInputValueFloat('numVotesInput')
    }
    addMovieToCart(movie, resetAddMovieForm);
    return false;
}

function resetAddMovieForm() {
    const addMovieForm = getElement('addMoviesForm');
    addMovieForm.reset();
    genresMultiList.setSelected([]);
}


// THIS FUNCTION IS NOT IN USE ANYMORE
//function loadMoviesToDB(btn) {
//    btn = $(btn);
//    btn.text('Uploading...');
//    btn.prop('disabled', true);
//    const DBMovies = movies.map((movie) => convertToMovieObj(movie));
    
//    ajaxCall("POST", MOVIES_ADD_LIST_PATH, JSON.stringify(DBMovies),
//        function (result) {
//            if (result > 0) {
//                notifySuccess(`${result} movies added successfully!`);
//            } else {
//                notifyInfo('Falied to upload movies!');
//            }
//            btn.text('Upload movies');
//            btn.prop('disabled', false);
//        })
//}

function updateProfile() {
    lockSubmitBtn();
    let password = getInputValueStr('passwordInput');
    if (password == "********")
        password = '';
    const user = {
        id: getInputValueInt('idHiddenInput'),
        name: getInputValueStr('nameInput'),
        email: getInputValueStr('emailInput'),
        password: password,
        active: true
    };
    ajaxCall("PUT", UPDATE_PROFILE_PATH.replace('{id}', user.id), JSON.stringify(user),
        function (result) {
            if (result == 1) {
                setLocalStorage(LOGGED_IN_USER_STORAGE_KEY, user);
                displayLoggedInUserName();
                notifySuccess('Profile details updated successfully!');
            } else {
                notifyWarning('Falied to update details in profile!');
            }
            unlockSubmitBtn();
        })
    return false;
}

function lockSubmitBtn() {
    $(':submit').prop('disabled', true);
}
function unlockSubmitBtn() {
    $(':submit').prop('disabled', false);
}

let rentMovieDialog = null;
let removeRentMovieDialog = null;
let currentRentingMovie = null;
let passRentMovieDialog = null;

function openRentMovieDialog(movie) {
    if (!checkLoggedInUser()) return;
    currentRentingMovie = movie;
    getElement('dialogTitle').innerHTML = `For renting <b>"${movie.primaryTitle}"</b> please fill the following fields`;
    rentMovieDialog.dialog("open");
    rentMovieDialog.find('#rentStartDate').blur();
}

function closeRentMovieDialog() {
    rentMovieDialog.dialog("close");
}

function rentMovie() {
    if (!checkLoggedInUser()) return;

    const loggedInUser = getLoggedInUser();
    const fromDate = new Date($("#rentStartDate").val());
    const toDate = new Date($("#rentEndDate").val());

    const movieToRent = {
        userId: loggedInUser.id,
        rentStart: fromDate,
        rentEnd: toDate,
        totalPrice: calculateRentTotalPrice(fromDate, toDate)
    }

    ajaxCall("POST", MOVIES_RENT_PATH.replace('{movieId}', currentRentingMovie.id), JSON.stringify(movieToRent),
        function (result) {
            if (result == 1) {
                closeRentMovieDialog();
                notifySuccess(`The movie "${currentRentingMovie.primaryTitle}" got rented successfully!`);
            } else {
                notifyInfo('Failed to rent movie!');
            }
        })
    return false;
}


function calculateRentTotalPrice(fromDate, toDate) {
    fromDate = new Date(fromDate);
    toDate = new Date(toDate);
    let totalPrice = 0;
    if (isValidDate(fromDate) && isValidDate(toDate) && fromDate <= toDate) {
        const days = calculateDays(fromDate, toDate);
        totalPrice = currentRentingMovie.priceToRent * days;
    }
    return totalPrice;
}

function updateRentTotalPrice(fromDate, toDate) {
    getElement('rentTotalPrice').innerText = `Total price: ${calculateRentTotalPrice(fromDate, toDate)}$`;
}


function getUsersFromServer(includeInActive, onSuccess) {
    ajaxCall("GET", USERS_LIST_PATH.replace('{includeInActive}', includeInActive), '',
        function (result) {
            if (result && result.length > 0) onSuccess(result);
        })
}

function passRentedMovie() {
    const movieId = currentRentingMovie.id;
    const toUserId = parseInt(getElement('passUserSelect').value);
    const loggedInUser = getLoggedInUser();

    const passToUser = {
        fromUserId: loggedInUser.id,
        toUserId: toUserId
    }
    ajaxCall("PUT", MOVIES_PASS_PATH.replace('{movieId}', movieId), JSON.stringify(passToUser),
        function (result) {
            if (result == 1) {
                removeMovieCardFromList(movieId);
                closePassMovieDialog();
                notifySuccess('Movie passed successfully!');
            } else {
                notifyWarning('Falied to pass movie!');
            }
        })
    return false;
}

function deleteRentedMovie(movie) {
    ajaxCall("DELETE", MOVIES_RENT_DELETE_PATH.replace('{id}', movie.rentedId), '',
        function (result) {
            if (result == 1) {
                removeMovieCardFromList(movie.id);
                notifySuccess('Movie removed successfully!');
            }
            else notifyError('Failed to delete movie!');
        })
}

function confirmDeleteRentedMovie(movie) {
    currentRentingMovie = movie;
    getElement('removeRentDialogTitle').innerHTML = `You are going to delete the movie <b>"${movie.primaryTitle}"</b> from your list. Are you sure?`;
    removeRentMovieDialog.dialog("open");
}

function openPassRentedMovieDialog(movie) {
    currentRentingMovie = movie;
    getUsersFromServer(false, function (result) {
        const passUserSelect = getElement('passUserSelect');
        const loggedInUser = getLoggedInUser();
        result.forEach((user) => {
            if (user.id !== loggedInUser.id)
                addOption(passUserSelect, user.id, user.name);
        })
        getElement('passDialogTitle').innerHTML = `Please select to which user you want to pass the movie <b>"${movie.primaryTitle}"</b> to:`;
        passRentMovieDialog.dialog("open");
    });
    
}

function closePassMovieDialog() {
    passRentMovieDialog.dialog("close");
}



function renderUsers() {

    getUsersFromServer(true, function (result) {
        const loggedInUser = getLoggedInUser();
        const users = result;
        const userTableBody = getElement('userTable').getElementsByTagName('tbody')[0];

        userTableBody.innerHTML = ''; // Clear existing rows

        users.forEach((user, index) => {
            if (user.id != loggedInUser.id) {
                const row = userTableBody.insertRow();

                const idCell = row.insertCell();
                idCell.textContent = user.id;
                idCell.style.width = '5%';

                const nameCell = row.insertCell();
                nameCell.textContent = user.name;
                nameCell.style.width = '43%';

                const emailCell = row.insertCell();
                emailCell.textContent = user.email;
                emailCell.style.width = '43%';

                const statusCell = row.insertCell();
                statusCell.style.width = '9%';
                const statusSpan = document.createElement('span');
                statusSpan.classList.add('status');
                if (user.active) {
                    statusSpan.textContent = 'Active';
                    statusSpan.classList.add('status-active');
                } else {
                    statusSpan.textContent = 'Inactive';
                    statusSpan.classList.add('status-inactive');
                }

                statusSpan.addEventListener('click', () => {
                    updateUserActive(user.id, !user.active, function () {
                        if (user.active) {
                            statusSpan.textContent = 'Inactive';
                            statusSpan.classList.remove('status-active')
                            statusSpan.classList.add('status-inactive');
                        }
                        else {
                            statusSpan.textContent = 'Active';
                            statusSpan.classList.remove('status-inactive');
                            statusSpan.classList.add('status-active');
                        }
                        user.active = !user.active;
                    });
                });
                statusCell.appendChild(statusSpan);
            }
        });
    });
}

function updateUserActive(id, active, onSuccess) {

    const request = {
        active: active
    }

    ajaxCall("PUT", USERS_UPDATE_ACTIVE_PATH.replace('{id}', id), JSON.stringify(request),
        function (result) {
            if (result == 1) {
                onSuccess();
                notifySuccess('Active status updated successfully!');
            } else {
                notifyWarning('Falied to update active status!');
            }
            unlockSubmitBtn();
        })
    return false;
}