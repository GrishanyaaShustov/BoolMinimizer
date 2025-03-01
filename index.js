document.getElementById("boolForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let input = document.getElementById("inputField").value.trim();
    let outputDiv = document.getElementById("output");

    if (!/^[01∨∧¬⊕→↔↓↑()X₁X₂X₃X₄X₅X₆\s]+$/.test(input)) {
        outputDiv.innerHTML = "Ошибка: Некорректный ввод";
        outputDiv.style.color = "red";
        return;
    }

    outputDiv.innerHTML = "Введённая функция: " + input;
    outputDiv.style.color = "black";
});

// Логика для клавиатуры
document.getElementById("toggleKeyboard").addEventListener("click", function() {
    let keyboard = document.getElementById("keyboard");
    if (keyboard.style.display === "none" || keyboard.style.display === "") {
        keyboard.style.display = "flex";
        this.innerText = "Скрыть клавиатуру";
    } else {
        keyboard.style.display = "none";
        this.innerText = "Показать клавиатуру";
    }
});

document.querySelectorAll(".key").forEach(button => {
    button.addEventListener("click", function() {
        let inputField = document.getElementById("inputField");
        inputField.value += this.innerText;
        inputField.focus();
    });
});
