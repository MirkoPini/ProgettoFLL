const API_URL = "https://6943fb2a7dd335f4c35ed2e8.mockapi.io/ArchivioFoto"

const show = document.getElementById("show");
const imageUrl = document.getElementById("imageUrl");
const personName = document.getElementById("personName");
const imageName = document.getElementById("imageName");
const form = document.getElementById("form");
const divToggle = document.getElementById("switch");

let editingId = null;
let dati = [];
let toggle = false;
// Caricamento dell'API
async function loadApi() {
    try {
        let response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Errore nel caricamento");
        }
        dati = await response.json();
        generate(dati);
    } catch (error) {
        console.log("Errore: " + error)
    }
}

// Generazione delle Task
function generate(data) {
    let html = "";
    // Set è una lista che esclude i duplicati
    let setNomi = new Set();
    for (let p of data) {
        setNomi.add(`${p.personName}`)
    }
    let arrayNomi = Array.from(setNomi);
    arrayNomi.sort();

    for (let i of arrayNomi) {
        html += `
            <section class="sectionPersone"> <p>${i}</p> </section>
                <section class="sectionCards">
        `;
        for (let p of data) {
            if (p.personName === i) {
                html += `
                    <div class="card" data-id="${p.id}">
                        <div>${p.imageName}</div>
                        <div>
                            <img src="${p.imageURL}" alt="image">
                        </div>
                        <div>
                            <button class="edit">Edit</button>
                            <button class="delete">Delete</button>
                        </div>
                    </div>                
                `;
            }
        }
        html += `</section>`;
    }
    show.innerHTML = html;
}

// Controllo i click su modifica o elimina
show.addEventListener("click", e => {
    const card = e.target.closest(".card");
    if (!card) return;

    const id = card.dataset.id;
    if (e.target.closest('.edit')) {
        disableResearch();
        editImage(id);
    }
    if (e.target.closest('.delete')) {
        deleteImage(id);
    }
});

// Modificare un'immagine
function editImage(id) {
    const image = dati.find(s => s.id === String(id));
    if (!image) return;

    personName.value = image.personName;
    imageName.value = image.imageName;
    imageUrl.value = image.imageURL;

    editingId = String(id);
}

// Submit dell'immagine modificata o creata
form.addEventListener("click", async (e) => {

    if (e.target.closest("button") == null) return;

    e.preventDefault();

    const payload = {
        personName: personName.value,
        imageName: imageName.value,
        imageURL: imageUrl.value,
    };

    if (payload.personName == "" || imageName == "") return;
    if (payload.imageURL == "") payload.imageURL = "https://picsum.photos/seed/ZVpBsj6t/1261/704";

    try {
        if (editingId) {
            await updateImage(editingId, payload);
        } else {
            await createImage(payload);
        }

        editingId = null;
        form.reset();
        loadApi();

    } catch (error) {
        console.log("Errore: " + error);
    }
});

// Creazione immagine
async function createImage(payload) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Errore creazione!");
}

// Modifica immagine
async function updateImage(id, payload) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Errore update!");
}

// Elimina immagine
async function deleteImage(id) {
    const confirmdelete = confirm("Sicuro?");
    if (!confirmdelete) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error("Errore eliminazione!");
        loadApi();
    } catch (error) {
        console.log(error);
    }
}

/* Cerca una persona o una immagine */
function cercaPersona() {
    if (!toggle) return;
    let valorePersona = personName.value.trim().toLowerCase();
    let valoreImage = imageName.value.trim().toLowerCase();
    console.log()
    if (valorePersona === "") {
        generate(dati);
        return;
    }

    const filtrati = dati.filter(p =>
        p.personName.toLowerCase().includes(valorePersona)
    );

    if (valoreImage === "") {
        generate(filtrati);
        return;
    }

    const filtraImmagini = filtrati.filter(p =>
        p.imageName.toLowerCase().includes(valoreImage)
    )
    console.log(filtraImmagini);

    generate(filtraImmagini);
}

personName.addEventListener("input", cercaPersona);
imageName.addEventListener("input", cercaPersona);

/* Mette la ricerca a true/false */
function toggleSearch() {
    if (toggle) {
        toggle = false;
        loadApi();
    } else {
        toggle = true;
    }
}

// Disattiva la ricerca
function disableResearch() {
    if (!toggle) return;
    divToggle.innerHTML = "";
    toggle = false;
    divToggle.innerHTML = `
        <input type="checkbox" style="padding: 30px;" onclick="toggleSearch()">
        <span class="slider round"></span>
    `;
}

loadApi();
