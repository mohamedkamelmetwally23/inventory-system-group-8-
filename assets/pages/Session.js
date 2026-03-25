// time out after 15 minutes
let logOutTime = 900000;
let flag = localStorage.getItem("flag");
function logoutTimer() {
  setTimeout(function () {
    window.location.href = "/views/SignIn.html";
  }, logOutTime);
}
if (flag) logoutTimer();
