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
      updateRankViewer();
    }, 300);

  } else {
    msg.innerText = "INCORRECT CODE";
    msg.style.color = "red";
  }
}

const rankProfiles = [
  { pfp: "pfp1.png", name: "Daquavion Rangateti", role: "President", phone: "022 764 0431" },
  { pfp: "pfp2.png", name: "Denero Rangateti", role: "Vice President", phone: "021 344 0513" },
  { pfp: "pfp3.png", name: "Weston Kopara", role: "SGT of Arms", phone: "(insert)" },
  { pfp: "pfp4.png", name: "Danehura Rangateti", role: "Treasurer", phone: "022 990 0359" },
  { pfp: "pfp5.png", name: "Rangi Tatoe", role: "Road Captain", phone: "021 148 2254" },
  { pfp: "pfp6.png", name: "Queenie Rangateti", role: "Queen", phone: "022 990 0359" },
  { pfp: "pfp7.png", name: "Rayy Ping", role: "Life Member", phone: "027 308 1383" },
  { pfp: "pfp8.png", name: "Uncle Rangi", role: "Life Member", phone: "(insert)" },
  { pfp: "pfp9.png", name: "Tama TeRangi", role: "Life Member", phone: "022 708 7922" },
  { pfp: "pfp10.png", name: "Wiremu Kaimoana", role: "Member", phone: "027 490 1777" },
  { pfp: "pfp11.png", name: "TeAroha Rangimiri", role: "Prospect", phone: "021 206 9288" },
  { pfp: "pfp12.png", name: "Tui TeRangi", role: "Prospect", phone: "027 215 3803" },
  { pfp: "pfp13.png", name: "Dum Fucq", role: "Prospect", phone: "(insert)" },
  { pfp: "pfp14.png", name: "Hemi Pareha", role: "Prospect", phone: "027 091 2342" },
  { pfp: "pfp15.png", name: "Rawiri Tatoe", role: "Prospect", phone: "(insert)" },
  { pfp: "pfp16.png", name: "HemiRangi Tewhamatu", role: "Prospect", phone: "020 376 3681" }
];

let rankIndex = 0;

function updateRankViewer() {
  const p = rankProfiles[rankIndex];

  document.getElementById("rank-pfp").src = "assets/images/" + p.pfp;
  document.getElementById("rank-name").innerHTML = "<b>" + p.name + "</b>";
  document.getElementById("rank-role").textContent = p.role;
  document.getElementById("rank-phone").textContent = p.phone;
}

function nextProfile() {
  rankIndex = (rankIndex + 1) % rankProfiles.length;
  updateRankViewer();
}

function prevProfile() {
  rankIndex = (rankIndex - 1 + rankProfiles.length) % rankProfiles.length;
  updateRankViewer();
}

/* ⭐ REQUIRED FIX: make functions global so HTML buttons can call them */
window.nextProfile = nextProfile;
window.prevProfile = prevProfile;