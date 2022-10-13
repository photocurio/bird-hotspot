import React, { useState, useEffect } from 'react'
import defaultLocations from '../data/defaultLocations'
import Map, { Layer, Source, NavigationControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'


const mapboxApiKey = 'pk.eyJ1IjoicGhvdG9jdXJpbyIsImEiOiJja3FqeDF5M2UwNHZ4MnZydXB2dXcyMzFoIn0.pwFXFrly8A-FTseV_kBlVg'

function getCoords() {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			pos => resolve({
				longitude: pos.coords.longitude,
				latitude: pos.coords.latitude,
				zoom: 9.5
			}),
			err => reject(err)
		)
	})
}

function MapView() {
	// choose 1 of ten default locations
	const int = Math.floor(Math.random() * 10)

	const [viewState, setViewState] = useState(null)

	async function getPosition() {
		try {
			const coords = await getCoords()
			setViewState(coords)
		}
		catch (err) {
			console.log(err.message)
			setViewState({
				longitude: defaultLocations[int][0],
				latitude: defaultLocations[int][1],
				zoom: 9.5
			})
		}
	}

	useEffect(() => {
		getPosition()
	}, [])

	const countyLayer = {
		id: 'counties',
		type: 'fill',
		source: 'counties',
		'source-layer': 'original',
		paint: {
			'fill-outline-color': 'rgba(0,0,0,0.5)',
			'fill-color': 'rgba(0,0,0,0)'
		}
	}
	// early return is viewState has no coordinates
	if (!viewState) return

	else return (
		<Map
			{...viewState}
			mapboxAccessToken={mapboxApiKey}
			mapStyle="mapbox://styles/mapbox/outdoors-v11"
			onMove={evt => setViewState(evt.viewState)}
		>
			<NavigationControl />
			<Source type="vector" url="mapbox://mapbox.82pkq93d">
				<Layer {...countyLayer} />
			</Source>
		</Map>
	)
}


export default MapView
