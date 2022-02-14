let state = {}

const filterBreweries = (breweries) => {
  const validBreweries = ['micro', 'regional', 'brewpub']
  return breweries.filter((brewery) =>
    validBreweries.includes(brewery.brewery_type)
  )
}

const getBreweries = () => {
  let filters = `?by_state=${state.state}&per_page=50`
  if (state.type !== '') {
    filters += `&by_type=${state.type}`
  }
  if(!state.state) {
      return
  }
  fetch(`https://api.openbrewerydb.org/breweries/${filters}`)
    .then((res) => res.json())
    .then((res) => {
      state.breweries = filterBreweries(res)
      render()
    })
}

const initBreweryStateForm = () => {
  const form = document.querySelector('#select-state-form')
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const desiredState = document.querySelector('#select-state').value
    state.state = desiredState
    getBreweries()
  })
}

const initFilterForm = () => {
  const filter = document.querySelector('#filter-by-type')
  filter.addEventListener('change', (event) => {
    state.type = event.target.value
    getBreweries()
  })
}

const initState = () => {
  state = {
    state: '',
    breweries: [],
    type: ''
  }
}

const initPage = () => {
  // reset state
  initState()
  initBreweryStateForm()
  initFilterForm()
}

/*   Brewery list functions   */

const createBreweryEntryLink = (link) => {
  const section = document.createElement('section')
  section.className = 'link'
  const anchor = document.createElement('a')
  anchor.href = link
  anchor.target = '_blank'
  anchor.innerText = 'Visit Website'
  section.append(anchor)
  return section
}

const createBreweryEntryPhone = (phone) => {
  const number = phone ? `+${phone}` : 'N/A'
  const section = document.createElement('section')
  section.className = 'phone'
  const phoneTitle = document.createElement('h3')
  phoneTitle.innerText = 'Phone:'
  const phoneNumber = document.createElement('p')
  phoneNumber.innerText = number
  section.append(phoneTitle, phoneNumber)
  return section
}

const createBreweryEntryAddress = (brewery) => {
  const section = document.createElement('section')
  section.className = 'address'
  const addressTitle = document.createElement('h3')
  addressTitle.innerText = 'Address:'
  const address2 = document.createElement('p')
  address2.innerText = brewery.street
  const address3 = document.createElement('p')
  const address3Strong = document.createElement('strong')
  address3Strong.innerText = `${brewery.city}, ${brewery.postal_code}`
  address3.append(address3Strong)
  section.append(addressTitle, address2, address3)
  return section
}

const createBreweryEntryType = (type) => {
  const typeContainer = document.createElement('div')
  typeContainer.className = 'type'
  typeContainer.innerText = type
  return typeContainer
}

const createBreweryEntryTitle = (title) => {
  const titleEl = document.createElement('h2')
  titleEl.innerText = title
  return titleEl
}

const createBreweryEntry = (brewery) => {
  const container = document.createElement('li')

  container.append(
    createBreweryEntryTitle(brewery.name),
    createBreweryEntryType(brewery.brewery_type),
    createBreweryEntryAddress(brewery),
    createBreweryEntryPhone(brewery.phone),
    createBreweryEntryLink(brewery.website_url)
  )

  return container
}

const renderBreweryList = () => {
  const breweryList = document.querySelector('#breweries-list')
  const breweries = state.breweries.map((brewery) =>
    createBreweryEntry(brewery)
  )
  breweryList.append(...breweries)
}

const render = () => {
  clear()
  renderBreweryList()
}

const clearBreweryList = () => {
    const breweryList = document.querySelector('#breweries-list')
    const breweries = Array.from(breweryList.children)
    breweries.forEach(brewery => brewery.remove())
}

const clear = () => {
  clearBreweryList()
}

initPage()
