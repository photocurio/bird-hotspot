import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = 'pk.eyJ1IjoicGhvdG9jdXJpbyIsImEiOiJja3FqeDF5M2UwNHZ4MnZydXB2dXcyMzFoIn0.pwFXFrly8A-FTseV_kBlVg'
// mapboxgl.accessToken = process.env.MAPBOX_TOKEN
const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/outdoors-v11',
	center: [-71, 42.7], // starting position [lng, lat]
	zoom: 9.5,
	projection: 'globe'
})
// const regionCode = 'US-MA-009'

// const requestOptions = {
// 	method: 'GET',
// 	headers: {
// 		'Content-Type': 'application/json',
// 		'X-eBirdApiToken': process.env.EBIRD_TOKEN //'ouetpkd1ih6j'
// 	}
// }

// fetch(`https://api.ebird.org/v2/data/obs/${regionCode}/recent/?fmt=json&back=8`, requestOptions)
// 	.then(response => response.json())
// 	.then(result => console.log(result))
// 	.catch(error => console.error('error', error))
