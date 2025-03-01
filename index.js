document.getElementById("boolForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let input = document.getElementById("inputField").value.trim();
    let outputDiv = document.getElementById("output");

    if (/^[01]+$/.test(input) && (input.length & (input.length - 1)) === 0) {
        let minimized = minimizeBooleanFunction(input.split("").map(Number));
        outputDiv.innerHTML = "Минимизированное выражение: " + minimized;
        outputDiv.style.color = "black";
    } else {
        outputDiv.innerHTML = "Ошибка: Введите корректный вектор (длина должна быть степенью 2)";
        outputDiv.style.color = "red";
    }
});

// Логика для клавиатуры
document.getElementById("toggleKeyboard").addEventListener("click", function() {
    let keyboard = document.getElementById("keyboard");
    if (keyboard.style.display === "none") {
        keyboard.style.display = "grid";
        this.innerText = "Скрыть клавиатуру";
    } else {
        keyboard.style.display = "none";
        this.innerText = "Показать клавиатуру";
    }
});

document.querySelectorAll(".key").forEach(button => {
    button.addEventListener("click", function() {
        document.getElementById("inputField").value += this.innerText;
    });
});