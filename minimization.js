// Генерация последовательности Грея для заданного числа бит
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

// Преобразование числа в Грея (целочисленно)
function toGray(n) {
    return n ^ (n >> 1);
}

// Преобразование числа в строку Грея с заполнением нулями до указанной длины
function toGrayString(n, bits) {
    let gray = toGray(n);
    return gray.toString(2).padStart(bits, '0');
}

// Построение карты Карно: разбиение входного вектора на ячейки,
// каждая ячейка содержит: значение (0/1), двоичное представление и номер минтерма.
function buildKarnaughMap(vector, n) {
    let rowBits = Math.ceil(n / 2);
    let colBits = Math.floor(n / 2);
    let rowCount = 1 << rowBits;
    let colCount = 1 << colBits;
    let rowGray = generateGrayCodes(rowBits);
    let colGray = generateGrayCodes(colBits);
    let map = Array.from({ length: rowCount }, () => Array(colCount).fill(null));

    for (let i = 0; i < vector.length; i++) {
        let bin = i.toString(2).padStart(n, '0');
        // Разбиваем: первые rowBits бит – для строки, остаток – для столбца.
        let rowPart = bin.slice(0, rowBits);
        let colPart = colBits > 0 ? bin.slice(rowBits) : "";
        let rowLabel = toGrayString(parseInt(rowPart, 2), rowBits);
        let colLabel = colBits > 0 ? toGrayString(parseInt(colPart, 2), colBits) : "";
        let rowIndex = rowGray.indexOf(rowLabel);
        let colIndex = colBits > 0 ? colGray.indexOf(colLabel) : 0;
        map[rowIndex][colIndex] = { value: vector[i], bin: bin, index: i };
    }
    return { map, rowCount, colCount };
}

// Генерация всех кандидатов на группы (прямоугольники 2^a x 2^b)
// с учётом тороидального (циклического) перехода по строкам и столбцам.
function generateCandidateGroups(mapData, n) {
    let { map, rowCount, colCount } = mapData;
    let groups = [];
    let possibleHeights = [];
    for (let h = 1; h <= rowCount; h *= 2) {
        possibleHeights.push(h);
    }
    let possibleWidths = [];
    for (let w = 1; w <= colCount; w *= 2) {
        possibleWidths.push(w);
    }
    // Перебираем все возможные позиции и размеры группы.
    for (let h of possibleHeights) {
        for (let w of possibleWidths) {
            for (let r = 0; r < rowCount; r++) {
                for (let c = 0; c < colCount; c++) {
                    let cells = [];
                    let allOnes = true;
                    for (let i = 0; i < h; i++) {
                        for (let j = 0; j < w; j++) {
                            let rr = (r + i) % rowCount;
                            let cc = (c + j) % colCount;
                            let cell = map[rr][cc];
                            if (!cell || cell.value !== 1) {
                                allOnes = false;
                                break;
                            }
                            cells.push(cell);
                        }
                        if (!allOnes) break;
                    }
                    if (allOnes) {
                        // Формируем множество покрытых минтермов.
                        let cellIndices = new Set(cells.map(cell => cell.index));
                        // Определяем общий шаблон: если во всех ячейках на позиции бит одинаков, оставляем его, иначе '-'
                        let implicantPattern = "";
                        for (let pos = 0; pos < n; pos++) {
                            let bit = cells[0].bin[pos];
                            let same = true;
                            for (let k = 1; k < cells.length; k++) {
                                if (cells[k].bin[pos] !== bit) { same = false; break; }
                            }
                            implicantPattern += same ? bit : "-";
                        }
                        groups.push({ cells: cellIndices, pattern: implicantPattern });
                    }
                }
            }
        }
    }
    return groups;
}

// Проверка, что два множества равны
function isEqualSet(a, b) {
    if (a.size !== b.size) return false;
    for (let x of a) {
        if (!b.has(x)) return false;
    }
    return true;
}

// Проверка, что множество set является надмножеством subset
function isSuperset(set, subset) {
    for (let elem of subset) {
        if (!set.has(elem)) return false;
    }
    return true;
}

// Фильтрация кандидатов: оставляем только уникальные и те, которые не содержатся
// в другой группе с таким же шаблоном.
function filterPrimeImplicants(candidateGroups) {
    let unique = [];
    for (let group of candidateGroups) {
        if (!unique.some(g => g.pattern === group.pattern && isEqualSet(g.cells, group.cells))) {
            unique.push(group);
        }
    }
    let primes = unique.filter(group => {
        return !unique.some(other => other !== group && other.pattern === group.pattern && isSuperset(other.cells, group.cells));
    });
    return primes;
}

// Жадный алгоритм выбора покрытия всех единиц (минтермов)
// При равенстве количества покрытых минтермов выбирается импликанта с меньшим числом литералов.
function selectCover(primeImplicants, vector) {
    let minterms = new Set();
    for (let i = 0; i < vector.length; i++) {
        if (vector[i] === 1) minterms.add(i);
    }
    let cover = [];
    while (minterms.size > 0) {
        let best = null;
        let bestCoverCount = -1;
        let bestLiteralCount = Infinity;
        for (let implicant of primeImplicants) {
            let count = 0;
            for (let m of implicant.cells) {
                if (minterms.has(m)) count++;
            }
            // Количество литералов – число фиксированных бит (не '-')
            let literalCount = implicant.pattern.split('').filter(ch => ch !== '-').length;
            if (count > bestCoverCount || (count === bestCoverCount && literalCount < bestLiteralCount)) {
                bestCoverCount = count;
                bestLiteralCount = literalCount;
                best = implicant;
            }
        }
        if (best === null) break;
        cover.push(best);
        for (let m of best.cells) {
            minterms.delete(m);
        }
    }
    return cover;
}

// Форматирование импликанты: из шаблона, где '1' означает переменную, '0' – отрицание,
// '-' – переменная не участвует.
function formatImplicant(pattern) {
    let variables = ['x', 'y', 'z', 'w', 'v', 'u']; // при необходимости можно расширить
    let term = "";
    for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] === '1') term += variables[i];
        else if (pattern[i] === '0') term += "¬" + variables[i];
    }
    return term === "" ? "1" : term;
}

// Основная функция минимизации через карты Карно
function minimizeBooleanFunction(vector) {
    let n = Math.log2(vector.length);
    if (!Number.isInteger(n)) {
        return "Ошибка: Длина вектора должна быть степенью 2";
    }
    if (vector.every(val => val === 0)) return "0";
    if (vector.every(val => val === 1)) return "1";

    let mapData = buildKarnaughMap(vector, n);
    let candidateGroups = generateCandidateGroups(mapData, n);
    let primeImplicants = filterPrimeImplicants(candidateGroups);
    let cover = selectCover(primeImplicants, vector);
    return cover.map(imp => formatImplicant(imp.pattern)).join(" + ");
}

