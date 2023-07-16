const fileInput = document.getElementById('csv');
const fileLabel = document.querySelector('.custom-file-label');

fileInput.addEventListener('change', e => {
    const fileName = e.target.files[0].name;
    fileLabel.textContent = fileName;
});

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

    let tableHTML = "<table class='table' id='mytable'>";
    tableHTML += "<thead><tr>";
    for (let i = 0; i < numcols + 2; i++) {
        if (i === 0) {
            tableHTML += `<th>${headerRow[i]}</th>`;
        } else if (i === numcols + 1) {
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
            tableHTML += `<td contentEditable>${cols[j]}</td>`;
            rowSum += parseFloat(cols[j]);
        }
        tableHTML += `<td>${rowSum.toFixed(2)}</td>`;
        rowtotal += rowSum;
        tableHTML += "</tr>";
    }
    tableHTML += "</tbody>";

    tableHTML += "</table>";

    const tablecontainer = document.getElementById("showtable");
    tablecontainer.innerHTML = tableHTML;

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
        const tableBody = document.querySelector("tbody");
        const numRows = tableBody.querySelectorAll("tr").length;
        const index = parseInt(document.getElementById("custom-number-input").value) - 1;
        if (index > numRows - 1 || index < 0) {
            alert("Invalid index");
            return;
        }
        const newRow = document.createElement("tr");
        const newSerialNumberCell = document.createElement("td");
        newSerialNumberCell.setAttribute("contentEditable", "true");
        newSerialNumberCell.textContent = index + 1;
        newRow.appendChild(newSerialNumberCell);

        for (let i = 0; i < numcols; i++) {
            const newCell = document.createElement("td");
            newCell.setAttribute("contentEditable", "true");
            newCell.textContent = "1";
            newRow.appendChild(newCell);
        }
        const newTotalCell = document.createElement("td");
        newTotalCell.textContent = "0";
        newRow.appendChild(newTotalCell);

        if (index === numRows - 1) {
            tableBody.appendChild(newRow);
        } else {
            const refNode = tableBody.querySelectorAll("tr")[index + 1];
            tableBody.insertBefore(newRow, refNode);
            for (let i = index + 1; i < numRows + 1; i++) {
                const serialNumberCell = tableBody.querySelectorAll("tr")[i].querySelectorAll("td")[0];
                serialNumberCell.textContent = i + 1;
            }
        }
        updateTotal();
    }

    function deleteRow() {
        const tableBody = document.querySelector("tbody");
        const numRows = tableBody.querySelectorAll("tr").length;

        const index = parseInt(document.getElementById("custom-number-input-two").value) - 1;

        if (isNaN(index) || index < 0 || index >= numRows) {
            alert("Invalid index");
            return;
        }

        const rowToRemove = tableBody.querySelectorAll("tr")[index];
        tableBody.removeChild(rowToRemove);

        for (let i = index; i < numRows - 1; i++) {
            const serialNumberCell = tableBody.querySelectorAll("tr")[i].querySelectorAll("td")[0];
            serialNumberCell.textContent = i + 1;
        }

        updateTotal();
    }

    function updateTotal() {
        const rows = document.querySelectorAll("tbody tr");
        rows.forEach((row, index) => {
            const cells = row.querySelectorAll("td");
            let rowSum = 0;
            let containsAlphabets = false;
            for (let i = 1; i < cells.length - 1; i++) {
                const cellValue = cells[i].textContent.trim();
                if (!isNaN(cellValue) && cellValue !== "") {
                    rowSum += parseFloat(cellValue);
                } else {
                    containsAlphabets = true;
                    cells[i].classList.add("non-numeric");
                    cells[i].onfocus = function () {
                        this.classList.remove("non-numeric");
                    };
                }
            }
            cells[cells.length - 1].textContent = rowSum.toFixed(2);
            if (containsAlphabets) {
                alert("Non-numeric values in the Cell");
            }
        });
    }

    const updateTotalBtn = document.getElementById("update-total-btn");
    updateTotalBtn.addEventListener("click", updateTotal);

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
