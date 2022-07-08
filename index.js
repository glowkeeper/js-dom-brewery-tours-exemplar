/**
 * This solution scales to as many brewery types as required
 */

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
  types: [],
  breweries: {},
  filters: {
    type: '',
    names: {
      key: 'name',
      values: []
    },
    cities: {
      key: 'city',
      values: []
    }
  }
}

function render() {
  renderTypeOptions()
  renderBreweries()
  renderCityFilters()
}

function renderTypeOptions() {
  filterByType.innerHTML = ''
  const selectType =  document.createElement('option')
  selectType.innerText = 'Select a type...'
  filterByType.append(selectType)
  state.types.forEach(type => {
    const newType = document.createElement('option')
    newType.value = type
    newType.innerText = type

    filterByType.append(newType)
  })
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
  const cities = [...new Set(breweries.map(brewery => brewery.city))] // unique cities

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
        state.filters.cities.values.push(city)
      } else {
        const newCities = state.filters.cities.filter(filterCity => filterCity !== city)
        state.filters.cities.values = newCities
      }

      renderBreweries()
    })

    filterByCityForm.append(input, label)
  })
}

function doFiltering ( filterKey, breweryKey, breweries ) {
  
  if (state.filters[filterKey].values.length) {
    breweries = breweries.filter(brewery => {
      const breweryValue = brewery[breweryKey].toLowerCase();
      return state.filters[filterKey].values.find((searchTerm) => {
        const searchValue = searchTerm.toLowerCase();
        return breweryValue.includes(searchValue);
      });
    })
  }

  return breweries
}

function applyFilters() {

  let breweries
  if (state.filters.type) {
    breweries = state.breweries[state.filters.type]
  } else {
    breweries = Object.keys(state.breweries).map(breweryType => state.breweries[breweryType]).flat()
  }

  Object.keys(state.filters).forEach(filter => {
    if (filter !== 'type') { // type is a special case, and we've already filtered for that
      // all other filters are of the same form (key name, array of terms we need to search for), so we can use doFiltering to help us
      breweries = doFiltering(filter, state.filters[filter].key, breweries)
    }
  })

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

        state.types = [...new Set(data.map(brewery => brewery.brewery_type))] // unique types
        state.types.forEach(type => {
          state.breweries[type] = data.filter(brewery => brewery.brewery_type === type)
        })

        render()
      })
  })

  // drop down select options
  filterByType.addEventListener('change', event => {
    state.filters.type = event.target.value

    render()
  })

  // text input
  filterByName.addEventListener('input', event => {
    state.filters.names.values[0] = event.target.value

    render()
  })

  // checkbox
  filterByCityClearBtn.addEventListener('click', event => {
    state.filters.cities.value = []
    filterByCityForm.reset()

    render()
  })

}

addListeners()