const PageSize = 50

const validTypes = ["micro", "brewpub", "regional"]

const state = {
  breweries: [],
  cities: [],

  page: 1,
  hasMorePages: false,

  filterType: "",
  filterState: "",
  filterCities: {},
}

function clearCitiesFilter() {
  state.filterCities = {}
}

function filterByCity(city, include) {
  if (include) {
    state.filterCities[city] = true
  } else {
    delete state.filterCities[city]
  }
}

function shouldShowBrewery(brewery) {
  if (Object.keys(state.filterCities).length === 0) {
    return true
  }
  return state.filterCities[brewery.city] === true
}

function setBreweries(breweries) {
  state.breweries = breweries.filter(function (brewery) {
    return validTypes.includes(brewery.brewery_type)
  })

  state.hasMorePages = breweries.length === 50

  const cities = {}
  for (const brewery of state.breweries) {
    cities[brewery.city] = true
  }

  state.cities = Object.keys(cities)
}

function fetchBreweries() {
  if (state.filterState === "") {
    return
  }

  let url = createUrl()

  fetch(url)
    .then(function (response) {
      return response.json()
    })
    .then(function (breweries) {
      setBreweries(breweries)
      render()
    })
}

function createUrl() {
  let url = `https://api.openbrewerydb.org/breweries?per_page=${PageSize}&page=${state.page}&by_state=${state.filterState}`
  if (state.filterType) {
    url += `&by_type=${state.filterType}`
  }

  return url
}

function initFormListener() {
  const formEl = document.querySelector("#select-state-form")
  const inputEl = document.querySelector("#select-state")

  formEl.addEventListener("submit", function (e) {
    state.filterState = inputEl.value
    e.preventDefault()
    state.page = 1
    fetchBreweries()
  })
}

function initFilterListener() {
  const filterEl = document.querySelector("#filter-by-type")
  filterEl.addEventListener("change", function () {
    state.filterType = filterEl.value
    state.page = 1
    fetchBreweries()
  })
}

function initClearCitiesListener() {
  const clearEl = document.querySelector("#clear-cities")
  clearEl.addEventListener("click", function () {
    clearCitiesFilter()
    render()
  })
}

function initPagingListeners() {
  const nextEl = document.querySelector("#next")
  nextEl.addEventListener("click", function () {
    state.page++
    fetchBreweries()
  })

  const prevEl = document.querySelector("#prev")
  prevEl.addEventListener("click", function () {
    state.page--
    fetchBreweries()
  })
}

function initEventListeners() {
  initFormListener()
  initFilterListener()
  initClearCitiesListener()
  initPagingListeners()
}

function render() {
  renderBreweryList()
  renderCitiesList()
  renderPaging()
}

function renderPaging() {
  const pageEl = document.querySelector("#page-number")
  pageEl.innerText = renderPageNumber()

  const nextEl = document.querySelector("#next")
  nextEl.disabled = !state.hasMorePages

  const prevEl = document.querySelector("#prev")
  prevEl.disabled = state.page === 1
}

function renderPageNumber() {
  const pageStart = 1 + (state.page - 1) * PageSize
  
  let pageEnd = state.page * PageSize
  if (!state.hasMorePages) {
    pageEnd = pageEnd - PageSize + state.breweries.length
  }

  return `Viewing ${pageStart} to ${pageEnd}`
}

function renderCitiesList() {
  const formEl = document.querySelector("#filter-by-city-form")
  formEl.innerHTML = ""
  for (const city of state.cities) {
    const cityCheckboxEl = document.createElement("input")
    cityCheckboxEl.checked = state.filterCities[city] === true
    cityCheckboxEl.setAttribute("type", "checkbox")
    cityCheckboxEl.setAttribute("id", city)
    cityCheckboxEl.setAttribute("value", city)
    cityCheckboxEl.addEventListener("change", function () {
      filterByCity(city, cityCheckboxEl.checked)
      render()
    })

    const cityLabelEl = document.createElement("label")
    cityLabelEl.innerText = city
    cityLabelEl.setAttribute("for", city)

    formEl.append(cityCheckboxEl, cityLabelEl)
  }
}

function renderBreweryList() {
  const breweriesListEl = document.querySelector("#breweries-list")
  breweriesListEl.innerHTML = ""

  for (const brewery of state.breweries) {
    if (shouldShowBrewery(brewery)) {
      renderBrewery(brewery, breweriesListEl)
    }
  }
}

function renderBrewery(brewery, breweriesListEl) {
  const breweryEl = document.createElement("li")
  breweryEl.innerHTML = `
    <h2>${brewery.name}</h2>
    <div class="type">${brewery.brewery_type}</div>
    <section class="address">
      <h3>Address:</h3>
      <p>${brewery.street}</p>
      <p><strong>${brewery.city}, ${brewery.postal_code}</strong></p>
    </section>
    <section class="phone">
      <h3>Phone:</h3>
      <p>${renderPhoneNumber(brewery.phone)}</p>
    </section>
    <section class="link">
      <a href="${brewery.website_url}" target="_blank">Visit Website</a>
    </section>`

  breweriesListEl.append(breweryEl)
}

function renderPhoneNumber(phoneNumber) {
  if (phoneNumber === null) {
    return "N/A"
  }
  return phoneNumber
}

initEventListeners()
