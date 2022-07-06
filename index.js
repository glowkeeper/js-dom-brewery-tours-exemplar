const stateForm = document.querySelector('#select-state-form')
const breweriesList = document.querySelector('#breweries-list')
const filterByType = document.querySelector('#filter-by-type')
const filterByName = document.querySelector('#search-breweries')
const filterByCityForm = document.querySelector('#filter-by-city-form')
const filterByCityClearBtn = document.querySelector('.clear-all-btn')

const url = 'https://api.openbrewerydb.org/breweries'
const perPage = 50

const address = 'Address:'
const phone = 'Phone:'
const visit = 'Visit Website'

const state = {
  types: ['micro', 'regional', 'brewpub', 'planning'],
  breweries: {},
  filterByType: '',
  filterByName: '',
  filterByCities: []
}

function render() {
  renderBreweries()
  renderCityFilters()
}

function renderBreweries() {
  breweriesList.innerHTML = ''
  const breweries = applyFilters()
  breweries.forEach(brewery => {
    renderBreweryCard(brewery)
  })
}

function renderCityFilters() {
  const breweries = applyFilters()
  const cities = [...new Set(breweries.map(brewery => brewery.city))]

  filterByCityForm.innerHTML = ''
  cities.forEach(city => {
    const input = document.createElement('input')
    input.setAttribute('type', 'checkbox')
    input.setAttribute('name', city)
    input.setAttribute('value', city)

    const label = document.createElement('label')
    label.setAttribute('for', city)
    label.innerText = city
    
    input.addEventListener('change', event => {
      if (event.target.checked) {
        state.filterByCities.push(city)
      } else {
        const newCities = state.filterByCities.filter(filterCity => filterCity !== city)
        state.filterByCities = newCities
      }

      renderBreweries()
    })

    filterByCityForm.append(input, label)
  })
}

function applyFilters() {
  
  breweries = Object.keys(state.breweries).map(breweryType => state.breweries[breweryType]).flat()
  
  if (state.filterByType) {
    breweries = state.breweries[state.filterByType]
  }

  if (state.filterByName) {
    breweries = breweries.filter(brewery => brewery.name.toLowerCase().includes(state.filterByName.toLowerCase()))
  }

  if (state.filterByCities.length !== 0) {
    breweries = breweries.filter(brewery => state.filterByCities.includes(brewery.city))
  }

  return breweries
}

function renderBreweryCard(brewery) {
  const li = document.createElement('li')

  const h2 = document.createElement('h2')
  h2.innerText = brewery.name

  const div = document.createElement('div')
  div.setAttribute('class', 'type')
  div.innerText = brewery.brewery_type

  const section1 = document.createElement('section')
  section1.setAttribute('class', 'address')
  const h3Address = document.createElement('h3')
  h3Address.innerText = address
  const p1 = document.createElement('p')
  p1.innerText = brewery.street
  const p2 = document.createElement('p')
  p2.innerText = `${brewery.city}, ${brewery.postal_code}`
  section1.append(h3Address, p1, p2)

  const section2 = document.createElement('section')
  section2.setAttribute('class', 'phone')
  const h3phone = document.createElement('h3')
  h3phone.innerText = phone
  const p3 = document.createElement('p')
  p3.innerText = brewery.phone
  section1.append(h3phone, p3)

  const section3 = document.createElement('section')
  section3.setAttribute('class', 'link')
  const link = document.createElement('a')
  link.setAttribute('href', brewery.website_url)
  link.setAttribute('target', '_blank')
  link.innerText = visit
  section3.append(link)

  li.append(h2, div, section1, section2, section3)
  breweriesList.append(li)
}

const addListeners = () => {

  // form submit
  stateForm.addEventListener('submit', event => {
    event.preventDefault()
    const byState = event.target[0].value
    fetch(`${url}?by_state=${byState}&per_page=${perPage}`)
      .then(res => res.json())
      .then(data => {
        state.types.forEach(type => {
          state.breweries[type] = data.filter(brewery => brewery.brewery_type === type)
        })
        render()
      })
  })

  // Drop down
  filterByType.addEventListener('change', event => {
    state.filterByType = event.target.value
    
    render()
  })

  // text input
  filterByName.addEventListener('input', event => {
    state.filterByName = event.target.value

    render()
  })

  // checkbox
  filterByCityClearBtn.addEventListener('click', event => {
    state.filterByCities = []
    filterByCityForm.reset()

    render()
  })

}

addListeners()