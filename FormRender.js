function generateModal(headername) {
  let mainDiv = document.createElement("div");
  let modalDiv = document.createElement("div");
  modalDiv.setAttribute("class", "modal fade");
  modalDiv.setAttribute("id", "exampleModal");
  modalDiv.setAttribute("tabindex", "-1");
  modalDiv.setAttribute("aria-labelledby", "exampleModalLabel");
  modalDiv.setAttribute("aria-hidden", "true");
  let modalDialog = document.createElement("div");
  modalDialog.setAttribute("class", "modal-dialog");
  let ModalContent = document.createElement("div");
  ModalContent.setAttribute("class", "modal-content");
  let modalHeader = document.createElement("div");
  modalHeader.setAttribute("class", "modal-header");
  let header = document.createElement("h5");
  header.setAttribute("class", "modal-title");
  header.setAttribute("id", "exampleModalLabel");
  header.textContent = `${headername} Info`;
  let closeButton = document.createElement("button");
  type = "button";
  closeButton.setAttribute("type", "button");
  closeButton.setAttribute("class", "btn-close");
  closeButton.setAttribute("data-bs-dismiss", "modal");
  closeButton.setAttribute("aria-label", "Close");

  modalHeader.appendChild(header);
  modalHeader.appendChild(closeButton);
  ModalContent.appendChild(modalHeader);

  modalDialog.appendChild(ModalContent);
  modalDiv.appendChild(modalDialog);
  mainDiv.appendChild(modalDiv);
}

function generateModalBody(data) {
  fetchData(data);
  let form = document.createElement("form");
  for (const [key, value] of Object.entries(data[0])) {
    let inputLabel = document.createElement("label");
    inputLabel.setAttribute("for", `${key}`);
    inputLabel.setAttribute("class", "form-label my-2");
    inputLabel.textContent = `${key}`;

    let input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("class", "form-control");
    input.setAttribute("id", `${key}`);
    input.setAttribute("placeholder", `e.g, ${value}`);
    input.required = true;
  }
}

async function fetchfirstElement(dataname) {
  return await fetch(`http://localhost:3000/${dataname}/id`)
    .then((response) => {
      return response.json;
    })
    .then((data) => {
      return data;
    });
}

// let addProductBtn = document.getElementById("add-product");
// addProductBtn.addEventListener("click", function () {
//   let sku = document.getElementById("SKU");
//   let productName = document.getElementById("p-name");
//   let supplierName = document.getElementById("supplier");
//   let quantity = document.getElementById("quantity");
//   let unitPrice = document.getElementById("price");
//   let Category = document.getElementById("category");
//   let expireDate = document.getElementById("expire-date");
//   let saveProduct = document.getElementById("save-product");

//   saveProduct.addEventListener("click", async function () {
//     let productData = {
//       // "product_id": ,
//       sku: sku.value,
//       product_name: productName.value,
//       category_id: Category,
//       quantity: quantity.value,
//       price: unitPrice.value,
//       expire_date: expireDate.value,
//       supplier_id: "SUP-017",
//       status: "in stock",
//     };
//     await fetch("http://localhost:3000/Products", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(productData),
//     }).then((res) => console.log(res.json()));
//   });
// });
