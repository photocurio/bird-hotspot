import { Dispatch, SetStateAction } from 'react'
import { selectedMarkerType, viewType } from '../types'

type StateLookup = { [key: string]: string }

type MapViewProps = {
	viewState: viewType,
	setViewState: Dispatch<SetStateAction<viewType>>,
	selectedMarker: selectedMarkerType,
	setSelectedMarker: Dispatch<SetStateAction<selectedMarkerType>>,
	setMapLoaded: Dispatch<SetStateAction<boolean>>,
	openModal: boolean
}

type MarkerType = {
	[key: string]: {
		geometry: {
			type: 'Point',
			coordinates: [number, number]
		},
		type: 'Feature',
		properties: {
			locId: string,
			locName: string,
			countryCode: string,
			subnational1Code: string,
			subnational2Code: string
		}
	}[]
}

import states from '../data/states'
import { useState, useRef } from 'react'
import Map, { Layer, Source, NavigationControl, Marker, MapRef, LayerProps, GeolocateControl } from 'react-map-gl'
import { uniq, difference } from 'lodash'
import 'mapbox-gl/dist/mapbox-gl.css'

const mapboxApiKey = process.env.MAPBOX_TOKEN

const stateCodes: StateLookup = states
// Style definition for transparent county boundary layer.
const countyLayer: LayerProps = {
	id: 'countyLayer',
	type: 'fill',
	source: 'countySource',
	'source-layer': 'original',
	paint: {
		'fill-outline-color': 'rgba(0,0,0,0)',
		'fill-color': 'rgba(0,0,0,0)'
	}
}

function getCoords(): Promise<viewType> {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			position => resolve({
				longitude: position.coords.longitude,
				latitude: position.coords.latitude,
				zoom: 9.5
			}),
			error => reject(error)
		)
	})
}

export default function MapView(props: MapViewProps) {
	const { viewState, setViewState, selectedMarker, setSelectedMarker, setMapLoaded, openModal } = props

	// TODO type this!!!
	const [markers, setMarkers] = useState<MarkerType>({})

	// Make a reference to the Map, so we can call map methods.
	// Used for map.queryRenderedFeatures
	const birdMap = useRef<MapRef>(null)


	/* 
	 * Gets user's position from the browser. 
	*/
	async function getPosition() {
		try {
			const coords = await getCoords()
			setViewState(coords)
		}
		// Are errors always typed as any?
		catch (err: any) {
			if (err.message) console.log(err.message)
			else console.log('Could not get the browser geographic position.')
		}
	}

	// Gets an array of all counties visible on the map. If some counties are no longer present 
	// that had been there, delete those counties and thier markers.
	// If new counties are present, fetch the markers in those counties, and add them to state.
	async function redrawHotspots() {
		const countiesPresent: string[] = getCounties()
		if (countiesPresent.length > 20) {
			return alert('Unable to fetch all the birding hotspots. Try zooming in.')
		}
		const countiesToRemove: string[] = difference(Object.keys(markers), countiesPresent)
		const countiesToAdd: string[] = difference(countiesPresent, Object.keys(markers))

		if (countiesToRemove.length) {
			countiesToRemove.forEach((countyCode) => {
				removeHotspots(countyCode)
			})
		}

		if (countiesToAdd.length) {
			await Promise.all(
				countiesToAdd.map(async (countyCode) => {
					await getHotspots(countyCode)
				})
			)
		}
	}

	// Gets the birding hotspots for a county from eBird. Uses a serverless function.
	// Hotspots are saved to state in an array in the markers object, keyed to the county code.
	async function getHotspots(countyCode: string) {
		if (markers.hasOwnProperty(countyCode)) return

		// convert the countyCode to an eBird regionCode 
		const countyThreeDigit = countyCode.slice(-3)
		const stateTwoDigit = countyCode.slice(0, 2)
		const stateTwoChar: string = stateCodes[stateTwoDigit]
		const regionCode = `US-${stateTwoChar}-${countyThreeDigit}`

		// fetch the hotspots for the region. These regions will all be counties.
		const res = await fetch(`/.netlify/functions/hotspots?regioncode=${regionCode}&back=7`)
		if (!res.ok) {
			console.log(`Error: ${res.status}, ${res.statusText}`)
		} else {
			const hotspots = await res.json()
			if (hotspots.length) {
				markers[countyCode] = hotspots
				setMarkers({ ...markers })
			}
		}
	}

	// Remove a countyCode and all hotspots it contains
	function removeHotspots(countyCode: string) {
		if (!markers.hasOwnProperty(countyCode)) return
		delete markers[countyCode]
		setMarkers({ ...markers })
	}

	// Return an array of 5 digit county FIPS codes. 
	// These are the counties that are present on the visible portion of the map.
	function getCounties(): string[] {
		if (!birdMap.current) return ['map is not loaded']
		const countiesPresent = birdMap.current.queryRenderedFeatures({
			// @ts-ignore
			layers: ['countyLayer']
		})
		// We only want the FIPS code for each county.
		const countyCodes = countiesPresent.map(c => {
			return c.properties ? c.properties.FIPS.toString() : null
		})

		// Remove duplicates, sort, and return the counties.
		const uniqCounties = uniq(countyCodes)
		return uniqCounties.sort()
	}

	// Early return if viewState is falsey.
	if (!viewState) return <div></div>

	else return (
		<Map
			{...viewState}
			ref={birdMap}
			mapboxAccessToken={mapboxApiKey}
			mapStyle="mapbox://styles/mapbox/outdoors-v11"
			onLoad={() => setMapLoaded(true)}
			// Handler for the sourceData event.
			onSourceData={async e => {
				// This condition filters out the wrong events.
				if (e.sourceId !== 'countySource' || !e.isSourceLoaded || !e.hasOwnProperty('tile')) return
				// Draw the hotspots when the countySource is loaded and has a title.
				await redrawHotspots()
			}}
			// Handler for moving the map.
			onMoveEnd={async e => {
				await setViewState(e.viewState)
				await redrawHotspots()
			}}
		>
			<NavigationControl />
			{/* <GeolocateControl
				showUserLocation={false}
				fitBoundsOptions={{ maxZoom: 9.5 }}
				showAccuracyCircle={false}
			/> */}
			<div className="mapboxgl-control-container">
				<div className="mapboxgl-ctrl-top-right location">
					<div className="mapboxgl-ctrl mapboxgl-ctrl-group">
						<button className="mapboxgl-ctrl-geolocate" onClick={getPosition} aria-label="Find my location">
							<span className="mapboxgl-ctrl-icon" aria-hidden="true" title="Find my location"></span>
						</button>
					</div>
				</div>
			</div>
			{/* <button className="position-button">get position</button> */}
			{Object.values(markers).map(county => {
				return county.map(m => {
					return <Marker key={m.properties.locId}
						longitude={m.geometry.coordinates[0]}
						latitude={m.geometry.coordinates[1]}
						onClick={() => setSelectedMarker(m.properties)}
						// The Marker component does not supprt className.
						// So we have to use all these inline styles.
						style={{
							backgroundColor: m.properties.locId === selectedMarker.locId ? 'MediumOrchid' : '',
							borderWidth: m.properties.locId === selectedMarker.locId ? '2px' : '',
							width: m.properties.locId === selectedMarker.locId ? '22px' : '',
							height: m.properties.locId === selectedMarker.locId ? '22px' : '',
							opacity: openModal ? 0 : 1
						}}
					><></></Marker>
				})
			})}
			<Source type="vector" url="mapbox://mapbox.82pkq93d" id="countySource">
				<Layer {...countyLayer} />
			</Source>
		</Map >
	)
}
