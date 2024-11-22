let currentJoke = "";
let jokeHistory = []; // Массив для хранения истории анекдотов
let currentJokeIndex = -1; // Индекс текущего анекдота
let userVotes = {}; // Хранилище голосов (имитируем по IP с localStorage)

// Функция для получения анекдота с JokeAPI
function fetchJoke() {
    fetch("https://v2.jokeapi.dev/joke/Any?lang=en&format=json")
        .then(response => response.json())
        .then(data => {
            let joke;
            if (data.type === "single") {
                joke = data.joke; // Однострочный анекдот
            } else if (data.type === "twopart") {
                joke = `${data.setup} ${data.delivery}`; // Двухчастный анекдот
            }

            // Если анекдота нет в истории, добавляем его
            if (!jokeHistory.some(item => item.joke === joke)) {
                jokeHistory.push({ joke, likes: 0, dislikes: 0 });
            }

            // Устанавливаем текущий индекс на последний
            currentJokeIndex = jokeHistory.length - 1;
            displayJoke(jokeHistory[currentJokeIndex]); // Показываем анекдот
        })
        .catch(error => handleError("Error loading a joke:", error));
}

// Функция для отображения анекдота на странице
function displayJoke(jokeObj) {
    document.getElementById("joke").innerText = jokeObj.joke;
    document.getElementById("like-count").innerText = `Likes: ${jokeObj.likes}`;
    document.getElementById("dislike-count").innerText = `Dislikes: ${jokeObj.dislikes}`;
    currentJoke = jokeObj;
}

// Функция для перехода к предыдущему анекдоту
function fetchPreviousJoke() {
    if (currentJokeIndex > 0) { // Проверка, если есть предыдущий анекдот
        currentJokeIndex--; // Переход к предыдущему анекдоту
        displayJoke(jokeHistory[currentJokeIndex]); // Показываем предыдущий анекдот
    } else {
        alert("This is the first joke.");
    }
}

// Функция для перехода к следующему анекдоту
function fetchNextJoke() {
    if (currentJokeIndex < jokeHistory.length - 1) {
        currentJokeIndex++; // Переход к следующему анекдоту
        displayJoke(jokeHistory[currentJokeIndex]); // Показываем следующий анекдот
    } else {
        fetchJoke(); // Загружаем новый анекдот, если достигли конца
    }
}

// Проверка, голосовал ли пользователь за текущий анекдот
function hasUserVoted(jokeId, type) {
    const votes = JSON.parse(localStorage.getItem("votes") || "{}");
    if (votes[jokeId]?.includes(type)) {
        return true; // Пользователь уже голосовал
    }
    return false;
}

// Сохранение голоса пользователя
function saveVote(jokeId, type) {
    const votes = JSON.parse(localStorage.getItem("votes") || "{}");
    if (!votes[jokeId]) {
        votes[jokeId] = [];
    }
    votes[jokeId].push(type);
    localStorage.setItem("votes", JSON.stringify(votes));
}

// Функция для лайка анекдота
function likeJoke() {
    const jokeObj = jokeHistory[currentJokeIndex];
    const jokeId = jokeObj.joke;

    if (hasUserVoted(jokeId, "like")) {
        alert("You have already liked this joke.");
        return;
    }

    saveVote(jokeId, "like");
    jokeObj.likes++;
    displayJoke(jokeObj);
    updateTopJokes(); // Обновляем Топ-10
}

// Функция для дизлайка анекдота
function dislikeJoke() {
    const jokeObj = jokeHistory[currentJokeIndex];
    const jokeId = jokeObj.joke;

    if (hasUserVoted(jokeId, "dislike")) {
        alert("You have already disliked this joke.");
        return;
    }

    saveVote(jokeId, "dislike");
    jokeObj.dislikes++;
    displayJoke(jokeObj);
    updateTopJokes(); // Обновляем Топ-10
}

// Обновление списка Топ-10 анекдотов
function updateTopJokes() {
    const topJokesList = document.getElementById("top-jokes-list");
    topJokesList.innerHTML = "";

    // Сортируем анекдоты по лайкам и берём топ-10
    const topJokes = [...jokeHistory]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 10);

    topJokes.forEach((joke, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${index + 1}. ${joke.joke} — Likes: ${joke.likes}, Dislikes: ${joke.dislikes}`;
        topJokesList.appendChild(listItem);
    });
}

// Обработка ошибок
function handleError(message, error) {
    console.error(message, error);
    alert(`${message} ${error?.message || "An error occurred."}`);
}

// Загрузка анекдота при открытии страницы
document.addEventListener("DOMContentLoaded", () => {
    fetchJoke();
});

// Анимация глаз для слежения за курсором
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

const moveEyes = debounce((x, y) => {
    const eyes = document.querySelectorAll(".eye");
    eyes.forEach((eye) => {
        const pupil = eye.querySelector(".pupil");
        const eyeRect = eye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;

        const angle = Math.atan2(y - eyeCenterY, x - eyeCenterX);
        const maxOffset = eyeRect.width / 4;
        const pupilX = Math.cos(angle) * maxOffset;
        const pupilY = Math.sin(angle) * maxOffset;

        pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
    });
}, 10);

document.addEventListener("mousemove", (event) => moveEyes(event.clientX, event.clientY));













