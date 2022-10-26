import { useState, useRef } from 'react'
import stateCodes from '../data/state-codes'
import Map, { Layer, Source, NavigationControl, Marker } from 'react-map-gl'
import { uniq, difference } from 'lodash'
import 'mapbox-gl/dist/mapbox-gl.css'

const mapboxApiKey = process.env.MAPBOX_TOKEN

// Style definition for transparent county boundary layer.
const countyLayer = {
	id: 'countyLayer',
	type: 'fill',
	source: 'countySource',
	'source-layer': 'original',
	paint: {
		'fill-outline-color': 'rgba(0,0,0,0)',
		'fill-color': 'rgba(0,0,0,0)'
	}
}
export default function MapView ( props ) {
	const { viewState, setViewState, selectedMarker, setSelectedMarker, setMapLoaded, openModal } = props
	const [markers, setMarkers] = useState( {} )

	// Make a reference to the Map, so we can call map methods.
	// Used for map.queryRenderedFeatures
	const birdMap = useRef( null )

	// Gets an array of all counties visible on the map. If some counties are no longer present 
	// that had been there, delete those counties and thier markers.
	// If new counties are present, fetch the markers in those counties, and add them to state.
	async function redrawHotspots () {
		const countiesPresent = getCounties()
		if ( countiesPresent.length > 20 ) {
			return alert( 'Unable to fetch all the birding hotspots. Try zooming in.' )
		}
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
	// Hotspots are saved to state in an array in the markers object, keyed to the county code.
	async function getHotspots ( countyCode ) {
		if ( markers.hasOwnProperty( countyCode ) ) return

		// convert the countyCode to an eBird regionCode 
		const countyThreeDigit = countyCode.slice( -3 )
		const stateTwoDigit = countyCode.slice( 0, 2 )
		const stateTwoChar = stateCodes[stateTwoDigit]
		const regionCode = `US-${stateTwoChar}-${countyThreeDigit}`

		// fetch the hotspots for the region. These regions will all be counties.
		const res = await fetch( `/.netlify/functions/hotspots?regioncode=${regionCode}&back=7` )
		if ( !res.ok ) {
			console.log( `Error: ${res.status}, ${res.statusText}` )
		} else {
			const hotspots = await res.json()
			if ( hotspots.length ) {
				markers[countyCode] = hotspots
				setMarkers( { ...markers } )
			}
		}
	}

	// Remove a countyCode and all hotspots it contains
	function removeHotspots ( countyCode ) {
		if ( !markers.hasOwnProperty( countyCode ) ) return
		delete markers[countyCode]
		setMarkers( { ...markers } )
	}

	// Return an array of 5 digit county FIPS codes. 
	// These are the counties that are present on the visible portion of the map.
	function getCounties () {
		const countiesPresent = birdMap.current.queryRenderedFeatures( {
			layers: ['countyLayer']
		} )

		// We only want the FIPS code for each county.
		const countyCodes = countiesPresent.map( c => c.properties.FIPS.toString() )

		// Remove duplicates and return the counties.
		const uniqCounties = uniq( countyCodes )
		return uniqCounties.sort()
	}

	// Early return if viewState is falsey.
	if ( !viewState ) return
	else return (
		<Map
			{ ...viewState }
			ref={ birdMap }
			mapboxAccessToken={ mapboxApiKey }
			mapStyle="mapbox://styles/mapbox/outdoors-v11"
			onLoad={ () => setMapLoaded( true ) }
			onSourceData={ async e => {
				if ( e.sourceId !== 'countySource' || !e.isSourceLoaded || !e.hasOwnProperty( 'tile' ) ) return
				await redrawHotspots()
			} }
			onMoveEnd={ async e => {
				await setViewState( e.viewState )
				await redrawHotspots()
			} }
		>
			<NavigationControl />
			{ Object.values( markers ).map( county => {
				return county.map( m => {
					return <Marker key={ m.properties.locId }
						longitude={ m.geometry.coordinates[0] }
						latitude={ m.geometry.coordinates[1] }
						onClick={ () => setSelectedMarker( m.properties ) }
						style={ {
							backgroundColor: m.properties.locId === selectedMarker.locId ? 'MediumOrchid' : '',
							borderWidth: m.properties.locId === selectedMarker.locId ? '1.5px' : '',
							width: m.properties.locId === selectedMarker.locId ? '24px' : '',
							height: m.properties.locId === selectedMarker.locId ? '24px' : '',
							opacity: openModal ? 0 : 1
						} }
					><></></Marker>
				} )
			} ) }
			<Source type="vector" url="mapbox://mapbox.82pkq93d" id="countySource">
				<Layer { ...countyLayer } />
			</Source>
		</Map >
	)
}
