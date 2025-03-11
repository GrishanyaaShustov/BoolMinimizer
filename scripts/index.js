document.getElementById("boolForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let input = document.getElementById("inputField").value.trim();
    let outputDiv = document.getElementById("output");

    if (/^[01]+$/.test(input) && (input.length & (input.length - 1)) === 0) {
        let minimized = minimizeBooleanFunction(input.split("").map(Number));
        outputDiv.innerHTML = "<h3>Минимизированное выражение:</h3><p>" + minimized + "</p>";

        let truthTable = generateTruthTable(input);
        let karnaughMap = generateKarnaughMap(input);

        outputDiv.innerHTML += "<h3>Таблица истинности:</h3>" + truthTable;
        outputDiv.innerHTML += "<h3>Карта Карно:</h3>" + karnaughMap;
        outputDiv.style.color = "black";
    } else {
        outputDiv.innerHTML = "Ошибка: Введите корректный вектор (длина должна быть степенью 2)";
        outputDiv.style.color = "red";
    }
});

// Функция генерации таблицы истинности
function generateTruthTable(vector) {
    let n = Math.log2(vector.length);
    let variables = ["x", "y", "z", "w", "v", "u"].slice(0, n);
    let tableHTML = "<table class='truth-table'><tr>";

    // Заголовки столбцов
    for (let v of variables) {
        tableHTML += `<th>${v}</th>`;
    }
    tableHTML += "<th>F</th></tr>";

    // Генерация строк таблицы
    for (let i = 0; i < vector.length; i++) {
        let bin = i.toString(2).padStart(n, '0');
        tableHTML += "<tr>";
        for (let bit of bin) {
            tableHTML += `<td>${bit}</td>`;
        }
        tableHTML += `<td>${vector[i]}</td></tr>`;
    }

    tableHTML += "</table>";
    return tableHTML;
}

// Функция генерации карты Карно
function generateKarnaughMap(vector) {
    let n = Math.log2(vector.length);
    let rowBits = Math.ceil(n / 2);
    let colBits = Math.floor(n / 2);
    let rowCount = 1 << rowBits;
    let colCount = 1 << colBits;

    let rowGray = generateGrayCodes(rowBits);
    let colGray = generateGrayCodes(colBits);

    let tableHTML = "<table class='karnaugh-map'><tr><th></th>";

    // Заголовки столбцов (Коды Грея)
    for (let col of colGray) {
        tableHTML += `<th>${col}</th>`;
    }
    tableHTML += "</tr>";

    // Заполнение карты
    for (let r = 0; r < rowCount; r++) {
        tableHTML += `<tr><th>${rowGray[r]}</th>`; // Заголовок строки (Код Грея)
        for (let c = 0; c < colCount; c++) {
            let binIndex = parseInt(rowGray[r] + colGray[c], 2);
            let value = vector[binIndex];
            let cellClass = value === 1 ? "one" : "zero"; // Подсветка ячеек
            tableHTML += `<td class="${cellClass}">${value}</td>`;
        }
        tableHTML += "</tr>";
    }

    tableHTML += "</table>";
    return tableHTML;
}

// Генерация последовательности Грея
function generateGrayCodes(bits) {
    if (bits === 0) return [""];
    if (bits === 1) return ["0", "1"];
    let prev = generateGrayCodes(bits - 1);
    let result = [];
    for (let code of prev) {
        result.push("0" + code);
    }
    for (let code of prev.slice().reverse()) {
        result.push("1" + code);
    }
    return result;
}

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

document.getElementById("helpButton").addEventListener("click", function() {
    let supportText = document.getElementById("supportText");
    if (supportText.style.display === "none") {
        supportText.style.display = "block";
    } else {
        supportText.style.display = "none";
    }
});