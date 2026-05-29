function unlock() {
  const pass = document.getElementById("pass");
  const msg = document.getElementById("msg");
  const gate = document.getElementById("gate");
  const vault = document.getElementById("vault");

  if (pass.value === "bfkn23") {
    msg.innerText = "ACCESS GRANTED";
    msg.style.color = "lime";

    setTimeout(() => {
      gate.style.display = "none";
      vault.style.display = "block";
    }, 300);

  } else {
    msg.innerText = "INCORRECT CODE";
    msg.style.color = "red";
  }
}