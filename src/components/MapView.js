import React, { useState, useEffect } from 'react'
import defaultLocations from '../data/defaultLocations'
import stateCodes from '../data/state-codes'
import Map, { Layer, Source, NavigationControl, useMap, Marker } from 'react-map-gl'
import { uniq, difference } from 'underscore'
import 'mapbox-gl/dist/mapbox-gl.css'

const mapboxApiKey = 'pk.eyJ1IjoicGhvdG9jdXJpbyIsImEiOiJja3FqeDF5M2UwNHZ4MnZydXB2dXcyMzFoIn0.pwFXFrly8A-FTseV_kBlVg'

function getCoords () {
	return new Promise( ( resolve, reject ) => {
		navigator.geolocation.getCurrentPosition(
			pos => resolve( {
				longitude: pos.coords.longitude,
				latitude: pos.coords.latitude,
				zoom: 9.5
			} ),
			err => reject( err )
		)
	} )
}

// Random interger between 0 and 9.
// Used to pick one of ten default locations.
const int = Math.floor( Math.random() * 10 )

// Style definition for transparent county boundaries.
const countyLayer = {
	id: 'countyLayer',
	type: 'fill',
	source: 'countySource',
	'source-layer': 'original',
	paint: {
		'fill-outline-color': 'rgba(0,0,0,0.5)',
		'fill-color': 'rgba(0,0,0,0)'
	}
}

export default function MapView () {

	// Initialize viewState (map center position and zoom value) as null.
	// If viewState is null, the map will not render.
	const [viewState, setViewState] = useState( null )
	const [markers, setMarkers] = useState( {} )

	// Make a reference to the Map, so we can call map methods.
	const { birdMap } = useMap()


	useEffect( () => {
		getPosition()
	}, [] )

	// Gets initial position from the browser. 
	// This function is called in a useEffect.
	// Uses a default position if the browser does not have permission.
	async function getPosition () {
		try {
			const coords = await getCoords()
			setViewState( coords )
		}
		catch ( err ) {
			console.log( err.message )
			setViewState( {
				longitude: defaultLocations[int][0],
				latitude: defaultLocations[int][1],
				zoom: 9.5
			} )
		}
	}

	// Redraws the hotspots 
	// 1) when the county boundary map is loaded
	// 2) when the map move event fires.
	useEffect( () => {
		if ( !birdMap ) return
		birdMap.on( 'sourcedata', async e => {
			if ( e.sourceId !== 'countySource' || !e.isSourceLoaded || !e.hasOwnProperty( 'tile' ) ) return

			await redrawHotspots()
			// set loading to false
		} )
		birdMap.on( 'move', async () => {
			await redrawHotspots()
		} )
	}, [birdMap] )

	async function redrawHotspots () {
		const countiesPresent = getCounties()

		const countiesToRemove = difference( Object.keys( markers ), countiesPresent )

		const countiesToAdd = difference( countiesPresent, Object.keys( markers ) )

		if ( countiesToRemove.length ) {
			countiesToRemove.forEach( ( countyCode ) => {
				removeHotspots( countyCode )
			} )
		}

		if ( countiesToAdd.length ) {
			await Promise.all(
				countiesToAdd.map( async ( countyCode ) => {
					await getHotspots( countyCode )
				} )
			)
		}
	}

	// Gets the birding hotspots for a county from eBird. Uses a serverless function.
	// Hotspots are saved to state in an array, keyed to the county code.
	// All saved hotspots are applied to the map.
	async function getHotspots ( countyCode ) {
		if ( markers.hasOwnProperty( countyCode ) ) {
			console.log( 'duplicate', countyCode )
			return
		}
		const countyThreeDigit = countyCode.slice( -3 )
		const stateTwoDigit = countyCode.slice( 0, 2 )
		const stateTwoChar = stateCodes[stateTwoDigit]
		const regionCode = `US-${stateTwoChar}-${countyThreeDigit}`
		const res = await fetch( `/.netlify/functions/hotspots?regioncode=${regionCode}&back=7` )
		if ( !res.ok ) {
			console.log( `Error: ${res.status}, ${res.statusText}` )
		} else {
			const hotspots = await res.json()
			if ( hotspots.length ) {
				const markersCopy = markers
				markersCopy[countyCode] = hotspots
				setMarkers( markersCopy )
			}
		}
	}

	// Remove unneeded hotspots. This removed hotspots one county at a time.
	// Remove sets of hotspots that are in counties longer present on the map.
	function removeHotspots ( county ) {
		if ( !markers.hasOwnProperty( [county] ) ) return

		const markersCopy = markers
		delete markersCopy[county]
		setMarkers( markersCopy )
	}

	// Get an array of 5 digit county FIPS codes, and add to state. 
	// These are the counties that are present on the visible portion of the map.
	function getCounties () {
		const countiesPresent = birdMap.queryRenderedFeatures( {
			layers: ['countyLayer']
		} )

		// We only want the FIPS code for each county.
		const countyCodes = countiesPresent.map( c => c.properties.FIPS.toString() )

		// Remove duplicates and return the counties.
		const uniqCounties = uniq( countyCodes )
		return uniqCounties
	}

	// Early return if viewState is falsey.
	if ( !viewState ) return

	else return (
		<Map
			{ ...viewState }
			id="birdMap"
			mapboxAccessToken={ mapboxApiKey }
			mapStyle="mapbox://styles/mapbox/outdoors-v11"
			onMove={ evt => setViewState( evt.viewState ) }
		>
			<NavigationControl />
			{ Object.values( markers ).map( county => {
				return county.map( m => {
					return <Marker longitude={ m.geometry.coordinates[0] }
						latitude={ m.geometry.coordinates[1] }
						key={ m['properties']['locId'] } />
				} )
			} ) }
			<Source type="vector" url="mapbox://mapbox.82pkq93d" id="countySource">
				<Layer { ...countyLayer } />
			</Source>
		</Map >
	)
}
