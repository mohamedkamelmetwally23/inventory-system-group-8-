//generating main Modal
// import { apiRequest } from "../api/apiClient.js";
import { generateId } from "../utils/helpers.js";
import { getSuppliers } from "../api/ordersApi.js";

let categoryData = ["CategoryName", "Description"];
//done..
let OrderData = [
  "Supplier",
  "Expected Delivery Date",
  "Total Items",
  "Total Amount($)",
];

let ProductData = [
  "Product Name",
  "SKU",
  "Category",
  "Supplier",
  "Quantity",
  "Reorder Level",
  "Price",
];
let SupplierData = ["Supplier Name", "Contact Name", "Email", "Phone"];

let stockAdjustmentData = ["Product", "Adjustment Type", "Quantity", "Reason"];

export async function generateModal(headername, dataType) {
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
  closeButton.setAttribute("type", "button");
  closeButton.setAttribute("class", "btn-close");
  closeButton.setAttribute("data-bs-dismiss", "modal");
  closeButton.setAttribute("aria-label", "Close");

  let modal_body = await generateModalBody(dataType);
  console.log(typeof modal_body);
  let save = document.createElement("button");
  save.setAttribute("type", "button");
  save.setAttribute("class", `btn btn-primary main-bg `);
  save.setAttribute("id", `save${headername}`);
  save.textContent = `Save ${headername}`;

  let close = document.createElement("button");
  close.setAttribute("type", "button");
  close.setAttribute("class", "btn btn-secondary");
  close.setAttribute("data-bs-dismiss", "modal");
  close.textContent = "close";

  let modal_footer = document.createElement("div");
  modal_footer.setAttribute("class", "modal-footer");
  modal_footer.appendChild(close);
  modal_footer.appendChild(save);

  modalHeader.appendChild(header);
  modalHeader.appendChild(closeButton);

  ModalContent.appendChild(modalHeader);
  ModalContent.appendChild(modal_body);
  ModalContent.appendChild(modal_footer);
  modalDialog.appendChild(ModalContent);
  modalDiv.appendChild(modalDialog);
  mainDiv.appendChild(modalDiv);

  document.body.appendChild(mainDiv);
  new bootstrap.Modal(modalDiv).show();

  return save;
}
//generate Modal body with input and labels
export async function generateModalBody(dataType) {
  let body;
  if (dataType == "category") {
    generateId("CAT");
    body = await form_text_Input(categoryData);
  } else if (dataType == "purchase_order") {
    generateId("ORD");
    body = await form_text_Input(OrderData);
  } else if (dataType == "product") {
    generateId("PRD");
    body = await form_text_Input(ProductData);
  } else if (dataType == "stock adjustment") {
    generateId("STK");
    body = await form_text_Input(stockAdjustmentData);
  } else if (dataType == "suppliers") {
    generateId("SUP");
    body = await form_text_Input(SupplierData);
  } else {
    console.error(`Unknown dataType: "${dataType}"`);
    body = document.createElement("div");
    body.setAttribute("class", "modal-body");
    body.textContent = `Unknown type: ${dataType}`;
  }
  return body;
}

export async function form_text_Input(dataArray) {
  let modalBody = document.createElement("div");
  modalBody.setAttribute("class", "modal-body");
  let form = document.createElement("form");
  for (const key of dataArray) {
    //label
    let inputLabel = document.createElement("label");
    inputLabel.setAttribute("for", `${key}`);
    inputLabel.setAttribute("class", "form-label my-2");
    inputLabel.textContent = `${key}`;

    let input;
    if (key == "Description") {
      console.log(key, "textarea");
      input = input_type("textarea");
    } else if (key == "Supplier" || key == "Category") {
      console.log(key, "selection");
      input = await Selection(key);
    } else if (/Date/i.test(key)) {
      console.log(key, "date");
      input = input_type("date");
    } else if (/Total/i.test(key)) {
      console.log(key, "total");
      input = input_type("number", key);
    } else {
      input = input_type("text", key);
    }
    form.appendChild(inputLabel);
    form.appendChild(input);
  }
  modalBody.appendChild(form);
  return modalBody;
}

function input_type(type, key) {
  let input = document.createElement("input");
  input.setAttribute("type", type);
  input.setAttribute("class", "form-control");
  input.setAttribute("id", `${key}`);
  input.setAttribute("placeholder", `Add ${key}`);
  return input;
}

async function Selection(key) {
  let data;
  let select = document.createElement("select");
  select.setAttribute("class", "form-select");
  select.setAttribute("aria-label", "Default select example");
  let defaultOption = document.createElement("option");
  defaultOption.setAttribute("value", "default");
  defaultOption.textContent = `Select ${key}`;
  select.appendChild(defaultOption);
  if (key == "Supplier") {
    data = await getSuppliers();
  }

  data.forEach((elm) => {
    let option = document.createElement("option");
    option.setAttribute("value", `${elm.supplier_name}`);
    option.textContent = `${elm.supplier_name}`;
    select.appendChild(option);
  });
  return select;
}

export function getFormData() {
  let arrayofInputs = {};
  if (document.querySelector(".modal-body")) {
    document
      .querySelector(".modal-body")
      .querySelectorAll("input")
      .forEach((elm) => {
        arrayofInputs[elm.id] = elm.value;
      });
  }
  console.log(arrayofInputs);
}
