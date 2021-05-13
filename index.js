// MODIFY THIS TO SUIT YOUR DISTRICTS
const districts = [
  { name: "Hooghly", districtId: "720" },
  { name: "Howrah", districtId: "721" },
  { name: "N24P", districtId: "730" },
  { name: "Pune", districtId: "363"},
  // Uncomment below district to check correctness of script
  // { name: "ChengalPet", districtId: "565"}
];

// DO NOT CHANGE THIS
let haveIRun = false;

function handleResult(result) {
  console.log(result);
}

function getUrl(district, date) {
  return `https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=${district}&date=${date}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createListElement(text) {
  const liElement = document.createElement("li");
  liElement.key = Date.now();
  liElement.innerText = text;
  return liElement;
}

function createSpanElement(text) {
  const spanElement = document.createElement("span");
  spanElement.innerText = text;
  return spanElement;
}

function clearDiv(){
  const divEl = document.getElementById("main");
  divEl.innerHTML = ``;
}

function buildBasicHtmlStructure() {
  const divEl = document.getElementById("main");
  const ulEl = document.createElement('ul');
  ulEl.id = "availabilityList";
  const h3 = document.createElement('h3');
  h3.id = "vaccineStatus";
  divEl.appendChild(ulEl);
  divEl.appendChild(h3);
}

function markElementRed(element) {
  element.classList.add("redBackground");
  element.classList.add("whiteFont");
  return element;
}

function markElementGreen(element) {
  element.classList.add("greenBackground");
  element.classList.add("blackFont");
  return element;
}

function markElementBlack(element){
  element.classList.add("blackBackground");
  element.classList.add("whiteFont");
  return element;
}

function openYoutube() {
  if (haveIRun){
    return null;
  }

  haveIRun = true;
  console.log(`SS: ${window}`);
  window.open(`https://www.youtube.com/watch?v=BubwLnPcQjc`);
};

function handleData(data, district, date) {
  const ulElement = document.getElementById("availabilityList");

  if (data === "API_FAILED"){
    const text = `API call failed for ${district} for week starting from ${date}`;
    return ulElement.appendChild(markElementBlack(createListElement(text)));
  }

  const { centers } = data;
  let flag = false;
  centers.forEach((center) => {
    const { sessions } = center;
    sessions.forEach((session) => {
      const { available_capacity } = session;
      if (available_capacity === 0) {
        return;
      }
      if (available_capacity > 2) {
        flag = true;
      }
    });
  });

  if (!flag) {
    const text = `Unavailable in ${district} for a week starting from ${date}`;
    ulElement.appendChild(markElementRed(createListElement(text)));
  } else {
    const foundText = `Available in ${district} for a week starting from ${date}`;
    ulElement.appendChild(markElementGreen(createListElement(foundText)));
    openYoutube();
  }

  return flag;
}

async function main(date) {
  let available = false;

  for (let district of districts) {
    const formattedDate = moment(date).format("DD-MM-YYYY");
    const url = getUrl(district.districtId, formattedDate);
    try {
      const response = await fetch(url);
      const body = await response.json();
      available ||= handleData(body, district.name, formattedDate);
      console.log(
        `Successful in fetching for ${formattedDate} for ${district.name}`
      );
    } catch (e) {
      console.log(
        `Error in fetching for ${formattedDate} for ${district.name}`
      );
      handleData("API_FAILED", district.name, formattedDate);
    }
    console.log(`Sleeping for 2 seconds`);
    await sleep(2000);
  }

  return available;
}

async function runMe() {
  // Modify this to suit your desired no of weeks
  const WEEKS = 6;
  let date = new Date();
  const h4 = document.getElementById("vaccineStatus");

  let isVaccineAvailable = false;

  let i = 0;
  while (i < WEEKS) {
    isVaccineAvailable ||= await main(date);
    date.setDate(date.getDate() + 7);
    i++;
  }

  if (!isVaccineAvailable) {
    let text = `VACCINE NOT AVAILABLE IN ${districts.map(
      (dis) => dis.name
    )} FOR NEXT ${WEEKS} WEEKS`;
    h4.appendChild(markElementRed(createSpanElement(text)));
  } else {
    let text = `VACCINE AVAILABLE`;
    h4.appendChild(markElementGreen(createSpanElement(text)));
  }
}

(async () => {
  buildBasicHtmlStructure();
  await runMe();
  setInterval(async () => {
    clearDiv();
    buildBasicHtmlStructure();
    await runMe();
    // 10 minutes
  }, 600000);
})();
