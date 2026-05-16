let isLogin = true;

let events = [
  { name: "Comedy Show", img: "https://images.unsplash.com/photo-1541534401786-2077eed87a74", seats: 200 },
  { name: "Music Concert", img: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2", seats: 200 },
  { name: "Dance Performance", img: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e", seats: 200 },
  { name: "Art Workshop", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f", seats: 200 },
  { name: "Kids Event", img: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9", seats: 200 },
  { name: "Cricket Match", img: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6", seats: 200 },
  { name: "Exhibition", img: "https://images.unsplash.com/photo-1492724441997-5dc865305da7", seats: 200 },
  { name: "Conference", img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df", seats: 200 },
  { name: "VR Gaming", img: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620", seats: 200 },
  { name: "Festival", img: "https://images.unsplash.com/photo-1506157786151-b8491531f063", seats: 200 }
];
let currentTicket = "";

const loginPage = document.getElementById("loginPage");
const homePage = document.getElementById("homePage");
const ticketPage = document.getElementById("ticketPage");
const historyPage = document.getElementById("historyPage");

const username = document.getElementById("username");
const password = document.getElementById("password");
const formTitle = document.getElementById("formTitle");

const eventsContainer = document.getElementById("eventsContainer");
const ticketDetails = document.getElementById("ticketDetails");
const historyContainer = document.getElementById("historyContainer");

function toggleForm() {
  isLogin = !isLogin;
  formTitle.innerText = isLogin ? "Login" : "Create Account";
}

async function handleAuth() {
  const user = username.value.trim();
  const pass = password.value.trim();

  if (!user || !pass) {
    alert("Enter username and password");
    return;
  }

  const url = isLogin ? "/login" : "/register";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass })
    });

    const data = await res.json();

    if (isLogin) {
      if (data.success) {
        loginPage.style.display = "none";
        homePage.style.display = "block";
        loadEvents();
      } else {
        alert("Invalid credentials");
      }
    } else {
      alert("Account created! Please login.");
      toggleForm();
    }
  } catch {
    alert("Server error. Try again later.");
  }
}

function logout() {
  location.reload();
}

function loadEvents() {
  eventsContainer.innerHTML = "";
  events.forEach((e, i) => {
    eventsContainer.innerHTML += `
      <div class="eventCard">
        <img src="${e.img}" />
        <h3>${e.name}</h3>
        <p class="ticketCount">Seats left: ${e.seats}/200</p>
        <button onclick="book(${i})">Book</button>
      </div>
    `;
  });
}

async function book(i) {
  if (events[i].seats > 0) {
    events[i].seats--;

    const ticket = {
      name: events[i].name,
      ticketId: Math.floor(Math.random() * 100000),
      date: new Date().toLocaleString()
    };

    try {
      await fetch("/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticket)
      });

      currentTicket = ticket;

      homePage.style.display = "none";
      ticketPage.style.display = "block";

      ticketDetails.innerText = `Event: ${ticket.name}\nTicket ID: ${ticket.ticketId}\nDate: ${ticket.date}`;
    } catch {
      alert("Booking failed");
    }
  } else {
    alert("Sold Out");
  }
}

function goHome() {
  ticketPage.style.display = "none";
  historyPage.style.display = "none";
  homePage.style.display = "block";
  loadEvents();
}

async function showHistory() {
  homePage.style.display = "none";
  historyPage.style.display = "block";

  try {
    const res = await fetch("/history");
    const data = await res.json();

    historyContainer.innerHTML = "";

    if (data.length === 0) {
      historyContainer.innerHTML = "<p style='color:white;'>No bookings yet</p>";
      return;
    }

    data.forEach(h => {
      historyContainer.innerHTML += `
        <div class="historyCard">
          <h3>${h.name}</h3>
          <p>Ticket ID: ${h.ticketId}</p>
          <p>${h.date}</p>
        </div>
      `;
    });
  } catch {
    historyContainer.innerHTML = "<p style='color:red;'>Failed to load history</p>";
  }
}

function downloadTicket() {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();

  doc.setFillColor(255, 46, 99);
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Eventora Ticket", 65, 20);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);

  doc.text(`Event: ${currentTicket.name}`, 20, 50);
  doc.text(`Ticket ID: ${currentTicket.ticketId}`, 20, 60);
  doc.text(`Date: ${currentTicket.date}`, 20, 70);
  doc.text("Status: Confirmed", 20, 90);

  doc.save("Eventora_Ticket.pdf");
}
