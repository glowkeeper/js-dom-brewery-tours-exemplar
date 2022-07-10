/**
 * This solution scales to as many brewery types as required
 */

const stateForm = document.querySelector('#select-state-form')
const breweriesList = document.querySelector('#breweries-list')
const filterByType = document.querySelector('#filter-by-type')
const filterByName = document.querySelector('#search-breweries')
const filterByCityForm = document.querySelector('#filter-by-city-form')
const filterByCityClearBtn = document.querySelector('.clear-all-btn')

const nextPage = document.querySelector("#next")
const prevPage = document.querySelector("#prev")
const pageNumber = document.querySelector("#page-number")

const url = 'https://api.openbrewerydb.org/breweries'
const perPage = 50

const address = 'Address:'
const phone = 'Phone:'
const visit = 'Visit Website'

const state = {
  types: [],
  breweries: {},
  page: 1,
  hasFetched: false,
  filters: {
    USState: '',
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



function doFiltering ( filterKey, breweryKey, breweries ) {

  //console.log('doing', filterKey, breweryKey, breweries)
  
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

  if (state.filters.USState) {
    breweries = breweries.filter(brewery => {
      const thisState = brewery.state ? brewery.state.toLowerCase() : ''
      return thisState === state.filters.USState.toLowerCase()
    })
  }

  Object.keys(state.filters).forEach(filter => {
    if (filter !== 'type' && filter !== 'USState') { // type and state are special cases
      // all other filters are of the same form (key name, array of terms we need to search for), so we can use doFiltering to help us
      breweries = doFiltering(filter, state.filters[filter].key, breweries)
    }
  })

  return breweries
}

function renderTypes() {
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

function renderCities(breweries) {
  const cities = [...new Set(breweries.map(brewery => brewery.city))].sort() // unique cities

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
        const newCities = state.filters.cities.values.filter(filterCity => filterCity !== city)
        state.filters.cities.values = newCities
      }

      render()
    })

    filterByCityForm.append(input, label)
  })
}

function renderBreweries(breweries) {
  breweriesList.innerHTML = ''
  breweries.forEach(brewery => {
    renderBreweryCard(brewery)
  })
}

function renderPaging(breweries) {
  
  const pageEnd = Math.ceil(breweries.length / perPage)

  pageNumber.innerText = `${state.page} of ${pageEnd}`
  
  const start = (state.page - 1) * perPage
  let end = (state.page) * perPage
  
  if ( end >= breweries.length) {
    end = breweries.length
    nextPage.disabled = true
  } else {
    nextPage.disabled = false
  }
  start === 0 ? prevPage.disabled = true : prevPage.disabled = false
  
  //console.log('end', state.page, end, breweries.length, start)
  breweries = breweries.slice(start, end)
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

function render(needCitiesList = false) {
  if(state.hasFetched) {
    let breweries = applyFilters()
    renderTypes()
    if(needCitiesList) {
      renderCities(breweries)
    }
    breweries = renderPaging(breweries)
    renderBreweries(breweries)
  }
}

const addListeners = () => {

  // form submit
  stateForm.addEventListener('submit', event => {
    event.preventDefault()
    state.filters.USState = event.target[0].value

    state.page = 1

    const needCitiesList = true
    render(needCitiesList)
  })

  // drop down select options
  filterByType.addEventListener('change', event => {
    state.filters.type = event.target.value
    state.page = 1

    render()
  })

  // text input
  filterByName.addEventListener('input', event => {
    state.filters.names.values[0] = event.target.value
    state.page = 1

    render()
  })

  // checkbox
  filterByCityClearBtn.addEventListener('click', event => {
    state.filters.cities.value = []
    filterByCityForm.reset()
    state.page = 1

    render()
  })

  nextPage.addEventListener("click", function () {
    state.page++

    render()
  })

  prevPage.addEventListener("click", function () {
    state.page--
    
    render()
  })

}

const typeFetchedData = (breweries) => {
  //console.log('all', breweries)

  state.types = [...new Set(breweries.map(brewery => brewery.brewery_type))] // unique types
  state.types.forEach(type => {
    state.breweries[type] = breweries.filter(brewery => brewery.brewery_type === type)
  })

  //console.log('types', state.types)
  //console.log('data', state.breweries)

  const needCitiesList = true
  render(needCitiesList)
}

const doFetch = async (url, pageNumber) => {

  const thisURL = `${url}?page=${pageNumber}&per_page=${perPage}`
  //console.log('url', thisURL)
  const result = await fetch(thisURL)
  const data = await result.json()
  return data
}

const fetchData = async () => {
  let pageNumber = 1
  let fetchData = []
  let allData = []
  let firstFetch = true

  do {

    if ( state.hasFetched ) {
      allData = [...allData, fetchData].flat()
      if(firstFetch) {
        firstFetch = false
        typeFetchedData(allData)
      }
    } else { 
      state.hasFetched = true
    }

    pageNumber++
    fetchData = await doFetch(url, pageNumber)    
    //console.log('fetched', fetchData, pageNumber)

  } while (fetchData.length);
  
  //console.log('all', allData)
  typeFetchedData(allData)
}

addListeners()
fetchData()