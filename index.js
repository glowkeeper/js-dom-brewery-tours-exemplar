const stateForm = document.querySelector('#select-state-form')
const breweriesList = document.querySelector('#breweries-list')
const filterByType = document.querySelector('#filter-by-type')
const filterByName = document.querySelector("#search-breweries")
const filterByCityForm = document.querySelector('#filter-by-city-form')
const filterByCityClearBtn = document.querySelector('.clear-all-btn')

const state = {
  types: ["micro", "regional", "brewpub"],
  breweries: [],
  filterByType: "",
  filterByName: "",
  filterByCities: []
}

stateForm.addEventListener("submit", event => {
  event.preventDefault()
  const byState = event.target[0].value
  fetch(`https://api.openbrewerydb.org/breweries?by_state=${byState}&per_page=50`)
    .then(res => res.json())
    .then(data => {
      state.breweries = data.filter(brewery => state.types.includes(brewery.brewery_type))

      render()
    })
})

filterByType.addEventListener('change', event => {
  state.filterByType = event.target.value

  render()
})

filterByName.addEventListener('input', event => {
  state.filterByName = event.target.value

  render()
})

filterByCityClearBtn.addEventListener('click', event => {
  state.filterByCities = []
  filterByCityForm.reset()

  render()
})

function render() {
  renderBreweries()
  renderCityFilters()
}

function renderBreweries() {
  breweriesList.innerHTML = ""
  const breweries = applyFilters()
  breweries.forEach(renderBreweryCard)
}

function renderCityFilters() {
  const breweries = applyFilters()
  // find unique cities
  const cities = []
  breweries.forEach(brewery => {
    if (!cities.includes(brewery.city)) {
      cities.push(brewery.city)
    }
  })

  // render the city filters
  filterByCityForm.innerHTML = ""
  cities.forEach(city => {
    const input = document.createElement("input")
    input.setAttribute("type", "checkbox")
    input.setAttribute("name", city)
    input.setAttribute("value", city)
    // if (state.filterByCities.includes(city)) {
    //   input.setAttribute("checked", true)
    // }
    input.addEventListener("change", event => {
      // add and remove cities from the filter
      if (event.target.checked) {
        // add
        state.filterByCities.push(city)
      } else {
        // remove
        const foundCity = state.filterByCities.find(filterCity => filterCity === city)
        state.filterByCities.splice(state.filterByCities.indexOf(foundCity), 1)
      }

      renderBreweries()
    })

    const label = document.createElement("label")
    label.setAttribute("for", city)
    label.innerText = city

    filterByCityForm.append(input, label)
  })
}

function applyFilters() {
  let filteredBreweries = state.breweries

  if (state.filterByType !== "") {
    filteredBreweries = filteredBreweries.filter(brewery => brewery.brewery_type === state.filterByType)
  }
  if (state.filterByName !== "") {
    filteredBreweries = filteredBreweries.filter(brewery => brewery.name.includes(state.filterByName))
  }
  if (state.filterByCities.length !== 0) {
    filteredBreweries = filteredBreweries.filter(brewery => state.filterByCities.includes(brewery.city))
  }
  return filteredBreweries
}

function renderBreweryCard(brewery) {
  const li = document.createElement("li")

  const h2 = document.createElement("h2")
  h2.innerText = brewery.name

  const div = document.createElement("div")
  div.setAttribute("class", "type")
  div.innerText = brewery.brewery_type

  const section1 = document.createElement("section")
  section1.setAttribute("class", "address")
  const h3address = document.createElement("h3")
  h3address.innerText = "Address:"
  const p1 = document.createElement("p")
  p1.innerText = brewery.street
  const p2 = document.createElement("p")
  p2.innerText = `${brewery.city}, ${brewery.postal_code}`
  section1.append(h3address, p1, p2)

  const section2 = document.createElement("section")
  section2.setAttribute("class", "phone")
  const h3phone = document.createElement("h3")
  h3phone.innerText = "Phone:"
  const p3 = document.createElement("p")
  p3.innerText = brewery.phone
  section1.append(h3phone, p3)

  const section3 = document.createElement("section")
  section3.setAttribute("class", "link")
  const link = document.createElement('a')
  link.setAttribute("href", brewery.website_url)
  link.setAttribute("target", "_blank")
  link.innerText = "Visit Website"
  section3.append(link)

  li.append(h2, div, section1, section2, section3)
  breweriesList.append(li)
}
