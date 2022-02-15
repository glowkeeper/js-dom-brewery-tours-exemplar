const selectStateForm = document.getElementById('select-state-form');
const selectState = document.getElementById('select-state');
const breweryList = document.getElementById('breweries-list');
const filterByTypeForm = document.getElementById('filter-by-type-form');
const filterByType = document.getElementById('filter-by-type');

const breweryGenerator = (data) => {
  return `  <li>
  <h2>${data.name}</h2>
  <div class="type">${data.brewery_type}</div>
  <section class="address">
    <h3>Address:</h3>
    <p>${data.street}</p>
    <p><strong>${data.city}, ${data.postal_code}</strong></p>
  </section>
  <section class="phone">
    <h3>Phone:</h3>
    <p>${data.phone}</p>
  </section>
  <section class="link">
    <a href='${data.website_url}' target="_blank">Visit Website</a>
  </section>
</li>`;
};

const types = ['micro', 'regional', 'brewpub'];
let breweriesList = [];

const getBrewieries = (filter) => {
  const queryString = filter ? `&by_type=${filter}` : '';
  fetch(
    `https://api.openbrewerydb.org/breweries?by_state=${selectState.value}${queryString}`
  ).then((res) =>
    res
      .json()
      .then((list) => (breweriesList = list))
      .then(() => {
        renderBreweries(breweriesList);
      })
  );
};

const submitState = (e) => {
  e.preventDefault();
  getBrewieries();
};

const filterType = (e) => {
  e.preventDefault();
  const filter = filterByType.value;
  getBrewieries(filter);
};

const renderBreweries = (breweries) => {
  const brewerysHtml = breweries
    .filter((brewery) => types.includes(brewery.brewery_type))
    .map((brewery) => {
      return breweryGenerator(brewery);
    });
  breweryList.innerHTML = brewerysHtml;
};

selectStateForm.addEventListener('submit', submitState);
filterByTypeForm.addEventListener('change', filterType);
