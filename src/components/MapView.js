import React, { useState } from 'react'
import Map from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'


const mapboxApiKey = 'pk.eyJ1IjoicGhvdG9jdXJpbyIsImEiOiJja3FqeDF5M2UwNHZ4MnZydXB2dXcyMzFoIn0.pwFXFrly8A-FTseV_kBlVg'

function MapView() {
	const [viewState, setViewState] = useState({
		longitude: -73.58781,
		latitude: 45.50884,
		zoom: 7
	})

	return (
		<Map
			{...viewState}
			mapboxAccessToken={mapboxApiKey}
			mapStyle="mapbox://styles/mapbox/outdoors-v11"
			onMove={evt => setViewState(evt.viewState)}
		>
		</Map>
	)
}


export default MapView
