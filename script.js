function parseCSV() {
    const fileInput = document.getElementById("csv");
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        const csvData = event.target.result;
        const tablehtml = createtable(csvData);
        const tablecontainer = document.getElementById("showtable");
        tablecontainer.innerHTML = tablehtml;
    };
    reader.readAsText(file);
}

function createtable(csvData) {
    const rows = csvData.trim().split("\n");
    const headerRow = rows[0].split(",");
    const numrows = rows.length;
    const numcols = headerRow.length;
    let rowtotal = 0;
    let containsAlphabets = false;

    headerRow.unshift("Serial Number");

    let tableHTML = "<table class='table'>";
    tableHTML += "<thead><tr>";
    for (let i = 0; i < numcols + 2; i++) {
        if (i === numcols + 1) {
            tableHTML += `<th>Total</th>`;
        } else {
            tableHTML += `<th>${headerRow[i]}</th>`;
        }
    }
    tableHTML += "</tr></thead>";

    tableHTML += "<tbody>";
    console.log(rows);
    for (let i = 1; i < numrows; i++) {
        const cols = rows[i].split(",");
        console.log(cols);
        let rowSum = 0;
        tableHTML += "<tr>";
        tableHTML += `<td contentEditable>${i}</td>`;
        for (let j = 0; j < numcols; j++) {
            const cellValue = cols[j];
            if (isNaN(cellValue) && cellValue !== "") {
                containsAlphabets = true;
                window.alert("Presence of string value");
            }
            tableHTML += `<td contentEditable>${cols[j]}</td>`;
            rowSum += parseInt(cols[j], 10);
        }
        tableHTML += `<td>${rowSum.toFixed(2)}</td>`;
        rowtotal += rowSum;
        tableHTML += "</tr>";
    }
    tableHTML += "</tbody>";

    tableHTML += "</table>";

    const tablecontainer = document.getElementById("showtable");
    tablecontainer.innerHTML = tableHTML;

    // Add mx-auto class to center the table horizontally
    const table = tablecontainer.querySelector("table");
    table.classList.add("mx-auto");

    const addRowBtn = document.getElementById("add-row-btn");
    addRowBtn.addEventListener("click", addRow);

    const deleteRowBtn = document.getElementById("delete-row-btn");
    deleteRowBtn.addEventListener("click", deleteRow);

    const cells = document.querySelectorAll('td[contentEditable="true"]');
    cells.forEach(cell => {
        cell.addEventListener("input", updateTotal);
    });

    function addRow() {
        let sum = 0;
        const tableBody = document.querySelector("tbody");
        const numRows = tableBody.querySelectorAll("tr").length;

        const newRow = document.createElement("tr");
        const newSerialNumberCell = document.createElement("td");
        newSerialNumberCell.setAttribute("contentEditable", "true");
        newSerialNumberCell.textContent = numRows + 1;
        newRow.appendChild(newSerialNumberCell);

        for (let i = 0; i < numcols; i++) {
            const newCell = document.createElement("td");
            newCell.setAttribute("contentEditable", "true");
            newCell.textContent = "1";
            sum += parseInt(newCell.textContent);
            newRow.appendChild(newCell);
        }
        const newTotalCell = document.createElement("td");
        newTotalCell.textContent = sum;
        newRow.appendChild(newTotalCell);

        tableBody.appendChild(newRow);
        updateTotal();
    }

    function deleteRow() {
        const tableBody = document.querySelector("tbody");
        const numRows = tableBody.querySelectorAll("tr").length;
        if (numRows > 0) {
            tableBody.removeChild(tableBody.lastChild);
        }
        updateTotal();
    }

    function updateTotal() {
        let total = 0;
        const rows = document.querySelectorAll("tbody tr");
        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            let rowSum = 0;
            for (let i = 1; i < cells.length; i++) {
                const cellValue = cells[i].textContent.trim();
                if (!isNaN(cellValue) && cellValue !== "") {
                    rowSum += parseInt(cellValue, 10);
                }
            }
            cells[cells.length - 1].textContent = rowSum.toFixed(2);
            total += rowSum;
        });
        const totalCell = document.querySelector("thead th:last-child");
        totalCell.textContent = total.toFixed(2);
    }

    return tableHTML;
}

function exportCSV() {
    const table = document.querySelector("table");
    const rows = Array.from(table.querySelectorAll("tr"));
    const headerCells = Array.from(rows[0].querySelectorAll("th"));
    const headerRow = headerCells.map(cell => cell.textContent).join(",");
    const dataCells = rows.slice(1).map(row => Array.from(row.querySelectorAll("td")).map(td => td.textContent));
    const dataRows = dataCells.map(row => row.join(","));
    const data = [headerRow, ...dataRows].join("\n");
    const dataUri = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
    const exportLink = document.createElement("a");
    exportLink.href = dataUri;
    exportLink.download = "updated.csv";
    document.body.appendChild(exportLink);
    exportLink.click();
    document.body.removeChild(exportLink);
}

function exportJSON() {
    const table = document.querySelector("table");
    const rows = Array.from(table.querySelectorAll("tr"));
    const headerCells = Array.from(rows[0].querySelectorAll("th"));
    const dataCells = rows.slice(1).map(row => Array.from(row.querySelectorAll("td")).map(td => td.textContent));
    const data = dataCells.map(row => Object.fromEntries(headerCells.map((cell, i) => [cell.textContent, row[i]])));
    const jsonData = JSON.stringify(data, null, null);
    const dataUri = "data:text/json;charset=utf-8," + encodeURIComponent(jsonData);
    const exportLink = document.createElement("a");
    exportLink.href = dataUri;
    exportLink.download = "data.json";
    document.body.appendChild(exportLink);
    exportLink.click();
    document.body.removeChild(exportLink);
}