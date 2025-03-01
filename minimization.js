function minimizeBooleanFunction(vector) {
    let n = Math.log2(vector.length);
    if (!Number.isInteger(n)) {
        return "Ошибка: Длина вектора должна быть степенью 2";
    }

    // Определяем количество переменных
    let numVars = n;

    // Проверяем крайние случаи
    if (vector.every(val => val === 0)) return "0"; // Все нули
    if (vector.every(val => val === 1)) return "1"; // Все единицы

    // Создаем карту Карно
    let karnaughMap = createKarnaughMap(vector, numVars);

    // Находим группы единиц
    let groups = findGroups(karnaughMap, numVars);

    // Формируем минимальную ДНФ
    return groups.map(group => formatGroup(group, numVars)).join(" + ");
}

function createKarnaughMap(vector, numVars) {
    let rows = 1 << Math.ceil(numVars / 2); // Количество строк
    let cols = 1 << Math.floor(numVars / 2); // Количество столбцов
    let map = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (let i = 0; i < vector.length; i++) {
        let row = grayCode(i, Math.ceil(numVars / 2));
        let col = grayCode(i >> Math.ceil(numVars / 2), Math.floor(numVars / 2));
        map[row][col] = vector[i];
    }

    return map;
}

function grayCode(n, bits) {
    return (n ^ (n >> 1)) & ((1 << bits) - 1);
}

function findGroups(map, numVars) {
    let rows = map.length;
    let cols = map[0].length;
    let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    let groups = [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (map[r][c] === 1 && !visited[r][c]) {
                let group = findLargestGroup(map, visited, r, c, rows, cols);
                groups.push(group);
            }
        }
    }

    return groups;
}

function findLargestGroup(map, visited, startRow, startCol, rows, cols) {
    let directions = [
        { dr: 0, dc: 1 }, // Вправо
        { dr: 1, dc: 0 }, // Вниз
        { dr: 0, dc: -1 }, // Влево
        { dr: -1, dc: 0 } // Вверх
    ];

    let queue = [[startRow, startCol]];
    let group = [];
    visited[startRow][startCol] = true;

    while (queue.length > 0) {
        let [r, c] = queue.shift();
        group.push([r, c]);

        directions.forEach(({ dr, dc }) => {
            let nr = (r + dr + rows) % rows;
            let nc = (c + dc + cols) % cols;

            if (map[nr][nc] === 1 && !visited[nr][nc]) {
                visited[nr][nc] = true;
                queue.push([nr, nc]);
            }
        });
    }

    return group;
}

function formatGroup(group, numVars) {
    let rowVars = Math.ceil(numVars / 2);
    let colVars = Math.floor(numVars / 2);

    let rowBits = Array(rowVars).fill(null);
    let colBits = Array(colVars).fill(null);

    group.forEach(([r, c]) => {
        let rowGray = grayCode(r, rowVars);
        let colGray = grayCode(c, colVars);

        for (let i = 0; i < rowVars; i++) {
            let bit = (rowGray >> i) & 1;
            if (rowBits[i] === null || rowBits[i] === bit) {
                rowBits[i] = bit;
            } else {
                rowBits[i] = "-";
            }
        }

        for (let i = 0; i < colVars; i++) {
            let bit = (colGray >> i) & 1;
            if (colBits[i] === null || colBits[i] === bit) {
                colBits[i] = bit;
            } else {
                colBits[i] = "-";
            }
        }
    });

    let variables = ["x", "y", "z", "w"];
    let result = [];
    rowBits.concat(colBits).forEach((bit, i) => {
        if (bit !== "-") {
            result.push(`${bit === 1 ? "" : "¬"}${variables[i]}`);
        }
    });

    return result.join("");
}