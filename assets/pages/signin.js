import { getUsersData } from "../api/signinApi.js";
import showNotification from "../utils/notification.js";
let users = [];
let valid = 0;
//form inputs..
let email = document.getElementById("emailInput");
let pass = document.getElementById("passInput");
let check = document.getElementById("check-me");
let siginbtn = document.getElementById("sign-in");
// get users data
getUsersData().then((data) => {
  users = data.data;
});

// validating and sign in ...
siginbtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (check.checked) {
    localStorage.setItem("flag", 0);
  }

  if (email.validity.typeMismatch) {
    showNotification("error", "Please enter a valid Email Address");
  } else if (email.validity.valueMissing) {
    showNotification("error", "Please enter Email Address");
  } else if (pass.validity.valueMissing) {
    showNotification("error", "Please enter Password");
  } else {
    users.forEach((person) => {
      if (person.email == email.value && person.password == pass.value) {
        valid = 1;
        showNotification(
          "success",
          `Welcome on board ${person.role} ${person.name}`,
        );
        setTimeout(function () {
          window.location.href = "../../index.html";
        }, 1000);
      }
    });
    // in case the data is not valid ..
    if (!valid)
      showNotification("error", "Please enter valid Email and Password");
  }
});
