function unlock() {
  const pass = document.getElementById("pass");
  const msg = document.getElementById("msg");

  if (pass.value === "bfkn23") {
    msg.innerText = "ACCESS GRANTED";
    msg.style.color = "lime";
    msg.style.marginTop = "10px";

    setTimeout(() => {
      document.getElementById("gate").style.display = "none";
      document.getElementById("vault").style.display = "block";
    }, 400);
  } else {
    msg.innerText = "INCORRECT CODE";
    msg.style.color = "red";
    msg.style.marginTop = "10px";
  }
}
