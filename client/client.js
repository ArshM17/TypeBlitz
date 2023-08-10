var userName, room;
const form = document.getElementById("form");
const userNameInput = document.getElementById("username");
const roomInput = document.getElementById("roomId");
const btn = document.getElementById("subbtn");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  userName = userNameInput.value;
  room = roomInput.value;
  if (userName === "" || room === "") return;
  localStorage.setItem("userName", userName);
  localStorage.setItem("roomId", room);
  window.location = `${window.origin}/race`;
});
