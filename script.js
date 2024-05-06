'use strict';

let urlRickAndMorty = 'https://rickandmortyapi.com/api/character';

let totalPages = null;

const bodyElement = document.querySelector('body');
const themeElement = document.querySelector('#theme');

if (localStorage.getItem('rickMortyTheme') === 'night') {
	themeElement.innerHTML = '🌛';
	bodyElement.classList.toggle('night');
} else {
	themeElement.innerHTML = '🌞';
}

const ulElement = document.querySelector('ul');
const menuElement = document.querySelector('menu');
const pElement = document.querySelector('.page');

themeElement.addEventListener('click', () => {
	bodyElement.classList.toggle('night');
	if (bodyElement.classList.contains('night')) {
		themeElement.innerHTML = '🌛';
		localStorage.setItem('rickMortyTheme', 'night');
	} else {
		themeElement.innerHTML = '🌞';
		localStorage.removeItem('rickMortyTheme');
	}
});

// Función asincrona que devuelve un objeto con info(objeto) y results(array)
const getPersonajes = async () => {
	try {
		console.log('Fetch iniciado 🚀');

		// Espera a que la petición fetch se resuelva
		const response = await fetch(urlRickAndMorty);

		if (!response.ok) {
			throw new Error('Error en la petición');
		}

		// Espera a que el json se resuelva
		const data = await response.json();

		const { info, results } = data;

		return { info, results };
	} catch (error) {
		console.error(error.message);
	} finally {
		console.log('Fetch finalizado 🛑');
	}
};

const createUlContent = async () => {
	ulElement.innerHTML = '';

	// Coger la url
	const url = window.location.href;

	// Crear Fragment
	const fragment = document.createDocumentFragment();

	// Pedir los personajes
	const { info, results: personajes } = await getPersonajes();

	totalPages = info.pages;

	// Crear los li y meterlos en el fragment
	personajes.forEach((personaje) => {
		const liElement = document.createElement('li');
		liElement.innerHTML = `
      <article>
				<img
					src="${personaje.image}"
					alt="Image ${personaje.name}"
					title="${personaje.name}"
				/>
				<h2>${personaje.name}</h2>
				<div>
					<p class="status">${personaje.status}</p>
					<p class="species">${personaje.species}</p>
					<p class="gender">${personaje.gender}</p>
				</div>
			</article>
    `;
		fragment.append(liElement);
	});

	// Insertar el fragment en la ul
	ulElement.append(fragment);

	// Crear los botones
	pElement.textContent = `${getPageNumber(url)}/${totalPages}`;
};

// Funcion para obtener la pagina actual
const getPageNumber = (url) => {
	try {
		const urlObject = new URL(url);

		const pageNumber = parseInt(urlObject.searchParams.get('page'));

		return pageNumber || 1;
	} catch (error) {
		console.log(error.message);
	}
};

// evento click en el menu
menuElement.addEventListener('click', async (event) => {
	// Coger la url de la página actual
	const url = new URL(window.location.href);
	// Clonar la url para Rick and Morty API
	const rickAndMortyUrl = new URL(urlRickAndMorty);

	// Coger el número de página actual
	const pageNumber = getPageNumber(url);

	if (event.target.classList.contains('first')) {
		goToPage(1);
	} else if (event.target.classList.contains('prev')) {
		if (pageNumber > 1) {
			goToPage(pageNumber - 1);
		}
	} else if (event.target.classList.contains('next')) {
		if (pageNumber < totalPages) {
			goToPage(pageNumber + 1);
		}
	} else if (event.target.classList.contains('last')) {
		goToPage(totalPages);
	}

	async function goToPage(page) {
		if (page >= 1 && page <= totalPages) {
			// Modificar la url para la página actual
			url.searchParams.set('page', page);
			// Modificar la url para Rick and Morty API
			rickAndMortyUrl.searchParams.set('page', page);
			// Guardar la url de Rick and Morty API modificada para
			urlRickAndMorty = rickAndMortyUrl.toString();
			window.history.pushState({}, '', url.toString());
			await createUlContent();
		}
	}
});

window.addEventListener('load', async () => {
	const url = window.location.href;
	const urlObject = new URL(url);
	urlObject.searchParams.delete('page');
	window.history.pushState({}, '', urlObject.toString());
	await createUlContent();
});
