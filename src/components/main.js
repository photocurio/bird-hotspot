import mapboxgl from 'mapbox-gl'

import { Popover } from 'bootstrap'

mapboxgl.accessToken = 'pk.eyJ1IjoicGhvdG9jdXJpbyIsImEiOiJja3FqeDF5M2UwNHZ4MnZydXB2dXcyMzFoIn0.pwFXFrly8A-FTseV_kBlVg'
const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/outdoors-v11',
	center: [-71, 42.7], // starting position [lng, lat]
	zoom: 9.5
})

const requestOptions = {
	method: 'GET',
	headers: {
		'Content-Type': 'application/json',
		// 'X-eBirdApiToken': process.env.EBIRD_TOKEN //'ouetpkd1ih6j'
	}
}

fetch(`/.netlify/functions/hotspots?regioncode=US-MA-009&back=8`, requestOptions)
	.then(response => response.json())
	.then(result => result.forEach(feature => {
		const el = document.createElement('div')
		el.className = 'marker'
		el.setAttribute('data-bs-toggle', 'popover')
		el.setAttribute('data-bs-content', feature.properties.locName)
		new mapboxgl.Marker(el)
			.setLngLat(feature.geometry.coordinates)
			.addTo(map)
	}))
	.then(() => {
		const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
		const popoverList = [...popoverTriggerList]
			.map(popoverTriggerEl => new Popover(popoverTriggerEl, {
				trigger: 'hover'
			}))
	})
	.catch(error => console.error('error', error))
